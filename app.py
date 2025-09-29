from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, flash
import os
import pandas as pd
import numpy as np
from werkzeug.utils import secure_filename
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
# Import from original modified files
import sys
sys.path.append('models')
import importlib.util

# Import step1 from 1_cek_missing_value.py
spec = importlib.util.spec_from_file_location("step1", "models/1_cek_missing_value.py")
step1_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(step1_module)
step1_missing_value = step1_module.step1_missing_value

# Import step2 from 2_transformasi_MinMaxScaler.py
spec2 = importlib.util.spec_from_file_location("step2", "models/2_transformasi_MinMaxScaler.py")
step2_module = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(step2_module)
step2_minmax_scaled = step2_module.step2_minmax_scaler

# Import step3 from 3_seleksi_fitur_anova.py
spec3 = importlib.util.spec_from_file_location("step3", "models/3_seleksi_fitur_anova.py")
step3_module = importlib.util.module_from_spec(spec3)
spec3.loader.exec_module(step3_module)
step3_anova_features = step3_module.step3_anova

# Import step4 from 4_immbalance_data_rus.py
spec4 = importlib.util.spec_from_file_location("step4", "models/4_immbalance_data_rus.py")
step4_module = importlib.util.module_from_spec(spec4)
spec4.loader.exec_module(step4_module)
step4_rus_balancing = step4_module.step4_rus

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'csv'}

# Ensure uploads directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('output', exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    logger.info(f"Upload request received. Files: {list(request.files.keys())}")
    
    try:
        if 'file' not in request.files:
            logger.error("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        logger.info(f"File info: {file.filename}, size: {file.content_length}")
        
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type. Only CSV files allowed'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'current_data.csv')
        logger.info(f"Saving to: {filepath}")
        
        # Ensure directory exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save file
        file.save(filepath)
        logger.info(f"File saved successfully")
        
        # Check if file was saved successfully
        if not os.path.exists(filepath):
            logger.error(f"File not found after save: {filepath}")
            return jsonify({'error': 'Failed to save file'}), 500
        
        # Get data preview
        logger.info("Getting data preview...")
        preview_data = get_data_preview(filepath)
        if 'error' in preview_data:
            logger.error(f"Data preview error: {preview_data['error']}")
            return jsonify({'error': f'Data preview error: {preview_data["error"]}'}), 500
        
        logger.info("Upload completed successfully")
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'preview': preview_data
        })
    
    except Exception as e:
        logger.error(f"Upload exception: {str(e)}", exc_info=True)
        return jsonify({'error': f'Upload error: {str(e)}'}), 500

def get_data_preview(filepath):
    try:
        df = pd.read_csv(filepath, na_values=["?", "NA", "NaN", ""])
        
        # Convert numpy types to Python native types for JSON serialization
        def convert_numpy_types(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                if pd.isna(obj) or np.isnan(obj):
                    return None
                return float(obj)
            elif isinstance(obj, np.bool_):
                return bool(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif pd.isna(obj):
                return None
            elif isinstance(obj, float) and np.isnan(obj):
                return None
            return obj
        
        # Prepare sample data with proper type conversion
        sample_data = df.head(5)
        sample_records = []
        for _, row in sample_data.iterrows():
            sample_records.append({col: convert_numpy_types(row[col]) for col in df.columns})
        
        # Convert missing values counts to regular Python integers
        missing_values = {}
        for col in df.columns:
            missing_count = df.isnull().sum()[col]
            missing_values[col] = int(missing_count)
        
        # Convert dtypes to strings for JSON serialization
        dtypes = {}
        for col in df.columns:
            dtype_str = str(df[col].dtype)
            dtypes[col] = dtype_str
        
        # Ensure all values are JSON serializable - convert NaN to None
        def clean_json_data(data):
            if isinstance(data, dict):
                return {k: clean_json_data(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [clean_json_data(item) for item in data]
            elif pd.isna(data) or (isinstance(data, float) and np.isnan(data)):
                return None
            elif isinstance(data, np.integer):
                return int(data)
            elif isinstance(data, np.floating):
                return float(data)
            return data
        
        preview_data = {
            'shape': [int(df.shape[0]), int(df.shape[1])],
            'columns': list(df.columns),
            'sample_data': clean_json_data(sample_records),
            'dtypes': dtypes,
            'missing_values': missing_values
        }
        return preview_data
    except Exception as e:
        return {'error': str(e)}

@app.route('/process', methods=['POST'])
def process_data():
    data = request.get_json()
    process_step = data.get('step')
    
    if not process_step:
        return jsonify({'error': 'No process step specified'}), 400
    
    # Check if file exists
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'current_data.csv')
    if not os.path.exists(filepath):
        return jsonify({'error': 'No file uploaded'}), 400
    
    try:
        if process_step == '1':
            result = step1_missing_value(filepath, return_json=True)
        elif process_step == '2':
            result = step2_minmax_scaled(filepath, return_json=True)
        elif process_step == '3':
            result = step3_anova_features(filepath, return_json=True)
        elif process_step == '4':
            result = step4_rus_balancing(filepath, return_json=True)
        else:
            return jsonify({'error': 'Invalid process step'}), 400
        
        return jsonify({
            'success': True,
            'step': process_step,
            'result': result
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/results/<step>')
def get_results(step):
    try:
        if step == '1':
            csv_path = 'output/1_missing_values_analysis.csv'
            if os.path.exists(csv_path):
                return send_file(csv_path, as_attachment=True)
        elif step == '2':
            csv_path = 'output/2_scaled_data.csv'
            if os.path.exists(csv_path):
                return send_file(csv_path, as_attachment=True)
        elif step == '3':
            csv_path = 'output/3_selected_features.csv'
            if os.path.exists(csv_path):
                result = {'csv': csv_path}
                # Try to convert PNG to base64 for web display
                png_path = 'output/3_anova_selection.png'
                if os.path.exists(png_path):
                    with open(png_path, 'rb') as f:
                        img_data = base64.b64encode(f.read()).decode()
                    result['chart'] = f"data:image/png;base64,{img_data}"
                return jsonify(result)
        elif step == '4':
            csv_path = 'output/4_rus_cleaned_data.csv'
            if os.path.exists(csv_path):
                result = {'csv': csv_path}
                # Try to convert PNG to base64 for web display
                png_path = 'output/4_rus_balance.png'
                if os.path.exists(png_path):
                    with open(png_path, 'rb') as f:
                        img_data = base64.b64encode(f.read()).decode()
                    result['chart'] = f"data:image/png;base64,{img_data}"
                return jsonify(result)
        
        return jsonify({'error': 'No results found for this step'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join('output', filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
       	return jsonify({'error': str(e)}), 500

@app.route('/status')
def get_status():
    status = {}
    output_files = [
        ('1', '1_missing_values_analysis.csv'),
        ('2', '2_scaled_data.csv'),
        ('3', '3_selected_features.csv'),
        ('4', '4_rus_cleaned_data.csv')
    ]
    
    for step, filename in output_files:
        file_path = os.path.join('output', filename)
        status[f'step_{step}'] = {
            'completed': os.path.exists(file_path),
            'filename': filename
        }
    
    return jsonify(status)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
