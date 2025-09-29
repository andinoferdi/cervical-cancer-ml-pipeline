import pandas as pd
import os
import numpy as np

def step1_missing_value(path="dataset/risk_factors_cervical_cancer.csv", return_json=False):
    """
    Analyze missing values in dataset
    
    Args:
        path (str): Path to CSV file
        return_json (bool): If True, return structured data for web API
    
    Returns:
        dict or None: If return_json=True, returns structured data for JSON response
    """
    df = pd.read_csv(path, na_values=["?", "NA", "NaN", ""])
    missing = df.isna().sum().sort_values(ascending=False)
    
    if not return_json:
        # Original behavior - print to console
        print("=== Step 1: Cek Missing Value ===")
        print(missing[missing > 0])
    
    missing_df = pd.DataFrame({
        'feature': missing.index,
        'missing_count': missing.values,
        'missing_percentage': (missing.values / len(df)) * 100
    })
    missing_df = missing_df[missing_df['missing_count'] > 0]
    
    os.makedirs("output", exist_ok=True)
    output_file = "output/1_missing_values_analysis.csv"
    missing_df.to_csv(output_file, index=False)
    
    if not return_json:
        print(f"\nOutput tersimpan di: {output_file}")
    else:
        # Return structured data for JSON API
        def convert_numpy_types(obj):
            """Convert numpy types to Python native types for JSON serialization"""
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.bool_):
                return bool(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif pd.isna(obj):
                return None
            return obj
        
        # Convert dataframes to JSON-compatible format
        missing_summary = []
        for _, row in missing_df.iterrows():
            missing_summary.append({
                'feature': str(row['feature']),
                'missing_count': convert_numpy_types(row['missing_count']),
                'missing_percentage': convert_numpy_types(row['missing_percentage'])
            })
        
        sample_output = []
        for _, row in missing_df.head(10).iterrows():
            sample_output.append({
                'feature': str(row['feature']),
                'missing_count': convert_numpy_types(row['missing_count']),
                'missing_percentage': convert_numpy_types(row['missing_percentage'])
            })
        
        return {
            'message': 'Missing value analysis completed',
            'output_file': output_file,
            'missing_summary': missing_summary,
            'total_missing_features': int(len(missing_df)),
            'sample_output': sample_output
        }

if __name__ == "__main__":
    step1_missing_value()
