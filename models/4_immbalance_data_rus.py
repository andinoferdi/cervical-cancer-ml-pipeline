import pandas as pd
import numpy as np
import os
import matplotlib
import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler
from imblearn.under_sampling import RandomUnderSampler
import base64
import io
import logging

# Disable matplotlib font debug messages
matplotlib_logger = logging.getLogger('matplotlib.font_manager')
matplotlib_logger.setLevel(logging.ERROR)

def step4_rus(path="dataset/risk_factors_cervical_cancer.csv", target="Biopsy", return_json=False):
    """
    Perform Random Under Sampling (RUS) balancing on dataset
    
    Args:
        path (str): Path to CSV file
        target (str): Target column name
        return_json (bool): If True, return structured data for web API
    
    Returns:
        dict or None: If return_json=True, returns structured data for JSON response
    """
    df = pd.read_csv(path, na_values=["?", "NA", "NaN", ""])
    df = df.dropna(axis=1, how="all")

    # X dan y
    X = df.drop(columns=[target], errors="ignore")
    y = df[target] if target in df.columns else df.iloc[:, -1]

    # imputasi + scaling
    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X)
    scaler = MinMaxScaler()
    X_scl = scaler.fit_transform(X_imp)

    # RUS (Random Under Sampling)
    rus = RandomUnderSampler(random_state=42)
    X_res, y_res = rus.fit_resample(X_scl, y)

    if not return_json:
        print("=== Step 4: Imbalanced Data (RUS) ===")
    
    uniq, cnt = np.unique(y, return_counts=True)
    uniq_res, cnt_res = np.unique(y_res, return_counts=True)
    
    if not return_json:
        print("Distribusi sebelum RUS:", dict(zip(uniq, cnt)))
        print("Distribusi sesudah RUS:", dict(zip(uniq_res, cnt_res)))
    
    os.makedirs("output", exist_ok=True)
    
    balanced_df = pd.DataFrame(X_res, columns=X.columns)
    balanced_df['target'] = y_res
    
    csv_file = "output/4_rus_cleaned_data.csv"
    balanced_df.to_csv(csv_file, index=False)
    
    if not return_json:
        print(f"\nOutput CSV tersimpan di: {csv_file}")
    
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    before_counts = dict(zip(['Class 0', 'Class 1'], cnt))
    plt.bar(before_counts.keys(), before_counts.values(), color=['skyblue', 'orange'])
    plt.title('Distribusi Sebelum RUS')
    plt.ylabel('Jumlah Sample')
    for i, v in enumerate(before_counts.values()):
        plt.text(i, v + 0.01*v, str(v), ha='center', va='bottom')
    
    plt.subplot(1, 2, 2)
    after_counts = dict(zip(['Class 0', 'Class 1'], cnt_res))
    plt.bar(after_counts.keys(), after_counts.values(), color=['skyblue', 'orange'])
    plt.title('Distribusi Sesudah RUS')
    plt.ylabel('Jumlah Sample')
    for i, v in enumerate(after_counts.values()):
        plt.text(i, v + 0.01*v, str(v), ha='center', va='bottom')
    
    plt.tight_layout()
    png_file = "output/4_rus_balance.png"
    plt.savefig(png_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    if not return_json:
        print(f"Grafik PNG tersimpan di: {png_file}")
    else:
        # Return structured data for JSON API
        def convert_numpy_types(obj):
            """Convert numpy types to Python native types for JSON serialization"""
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                if pd.isna(obj) or np.isnan(obj):
                    return None
                return float(obj)
            if isinstance(obj, np.bool_):
                return bool(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif pd.isna(obj):
                return None
            return obj
        
        # Generate base64 encoded chart for web display
        img_buffer = io.BytesIO()
        plt.figure(figsize=(12, 6))
        
        plt.subplot(1, 2, 1)
        before_counts = dict(zip(['Class 0', 'Class 1'], cnt))
        plt.bar(before_counts.keys(), before_counts.values(), color=['skyblue', 'orange'])
        plt.title('Distribusi Sebelum RUS')
        plt.ylabel('Jumlah Sample')
        for i, v in enumerate(before_counts.values()):
            plt.text(i, v + 0.01*v, str(v), ha='center', va='bottom')
        
        plt.subplot(1, 2, 2)
        after_counts = dict(zip(['Class 0', 'Class 1'], cnt_res))
        plt.bar(after_counts.keys(), after_counts.values(), color=['skyblue', 'orange'])
        plt.title('Distribusi Sesudah RUS')
        plt.ylabel('Jumlah Sample')
        for i, v in enumerate(after_counts.values()):
            plt.text(i, v + 0.01*v, str(v), ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
        plt.close()
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        # Create class distribution comparison table
        distribution_comparison = []
        for klass in [0, 1]:
            distribution_comparison.append({
                'class': f'Class {klass}',
                'before_rus': int(cnt[np.where(uniq == klass)[0][0]]) if klass in uniq else 0,
                'after_rus': int(cnt_res[np.where(uniq_res == klass)[0][0]]),
                'change': int(cnt_res[np.where(uniq_res == klass)[0][0]]) - (int(cnt[np.where(uniq == klass)[0][0]]) if klass in uniq else 0),
                'percentage_change': f"{((int(cnt_res[np.where(uniq_res == klass)[0][0]]) - (int(cnt[np.where(uniq == klass)[0][0]]) if klass in uniq else 0)) / (int(cnt[np.where(uniq == klass)[0][0]]) if klass in uniq else 1)) * 100:.1f}%" if (int(cnt[np.where(uniq == klass)[0][0]]) if klass in uniq else 0) > 0 else "New samples"
            })
        
        # Create sample output table for balanced data
        sample_output_table = []
        for i in range(min(10, len(balanced_df))):
            row_data = {'row': f'Row {i+1}'}
            # Add first few features
            for j, col in enumerate(X.columns[:8]):
                row_data[str(col)] = convert_numpy_types(balanced_df.iloc[i, j])
            row_data['target'] = convert_numpy_types(balanced_df.iloc[i]['target'])
            sample_output_table.append(row_data)
        
        # Calculate balancing metrics
        imbalance_ratio_before = max(cnt) / min(cnt) if len(cnt) > 1 else 1
        imbalance_ratio_after = max(cnt_res) / min(cnt_res) if len(cnt_res) > 1 else 1
        
        return {
            'message': 'RUS data balancing completed successfully',
            'output_file': csv_file,
            'chart_base64': f"data:image/png;base64,{img_base64}",
            'distribution_comparison': distribution_comparison,
            'sample_output_table': sample_output_table,
            'summary_stats': {
                'total_samples_before': int(np.sum(cnt)),
                'total_samples_after': int(np.sum(cnt_res)),
                'total_features': len(X.columns),
                'target_column': target,
                'classes': [str(cls) for cls in uniq_res],
                'imbalance_ratio_before': float(imbalance_ratio_before),
                'imbalance_ratio_after': float(imbalance_ratio_after),
                'balancing_status': 'Balanced' if imbalance_ratio_after <= 1.05 else f'Ratio: {imbalance_ratio_after:.2f}:1'
            }
        }

if __name__ == "__main__":
    step4_rus()