# Cervical Cancer Risk Analysis Platform

Platform web untuk analisis risiko kanker serviks dengan pipeline preprocessing machine learning.

## Features

- **Upload CSV**: Interface untuk mengunggah dataset CSV
- **Missing Value Analysis**: Deteksi dan analisis missing values
- **MinMax Scaling**: Normalisasi data menggunakan MinMax scaler
- **ANOVA Feature Selection**: Seleksi fitur menggunakan ANOVA statistical test
- **SMOTE Data Balancing**: Balancing dataset menggunakan SMOTE

## Installation

1. Clone atau download project ini
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Jalankan Flask server:
```bash
python app.py
```

2. Buka browser ke `http://localhost:5000`

3. Upload CSV file dan pilih processing step yang ingin dijalankan

## Project Structure

```
Machine Learning/
├── app.py                 # Flask main application
├── requirements.txt       # Python dependencies
├── models/
│   ├── processor.py      # Data processing class
│   ├── 1_cek_missing_value.py
│   ├── 2_transformasi_MinMaxScaler.py
│   ├── 3_seleksi_fitur_anova.py
│   └── 4_immbalance_data_smote.py
├── templates/
│   └── index.html        # Main web interface
├── static/
│   ├── css/              # CSS files
│   ├── js/
│   │   └── script.js     # JavaScript functionality
│   └── images/           # Image assets
├── uploads/              # Uploaded files storage
├── output/               # Processing results
└── dataset/
    └── risk_factors_cervical_cancer.csv
```

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload CSV file
- `POST /process` - Run processing step
- `GET /results/<step>` - Get processing results
- `GET /download/<filename>` - Download results file
- `GET /status` - Check processing status

## Processing Steps

1. **Missing Values**: Analisis kolom dengan missing values
2. **MinMax Scaling**: Normalisasi data ke range 0-1
3. **Feature Selection**: Seleksi fitur berdasarkan ANOVA test
4. **SMOTE**: Balancing dataset untuk mengatasi imbalanced classes
