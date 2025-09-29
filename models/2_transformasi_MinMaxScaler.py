import pandas as pd
import os
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler

def step2_minmax_scaler(path="dataset/risk_factors_cervical_cancer.csv", return_json=False):
    """
    Apply MinMax scaling to numeric features in dataset
    
    Args:
        path (str): Path to CSV file
        return_json (bool): If True, return structured data for web API
    
    Returns:
        dict or None: If return_json=True, returns structured data for JSON response
    """
    df = pd.read_csv(path, na_values=["?", "NA", "NaN", ""])
    df = df.dropna(axis=1, how="all")
    X = df.select_dtypes(include="number")

    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_imp)
    
    if not return_json:
        # Original behavior - print to console
        print("=== Step 2: Transformasi MinMaxScaler ===")
        print("Sebelum skala (5 baris):\n", X.head())
        print("\nSesudah skala (5 baris):\n", X_scaled[:5])
    
    scaled_df = pd.DataFrame(X_scaled, columns=X.columns)
    os.makedirs("output", exist_ok=True)
    output_file = "output/2_scaled_data.csv"
    scaled_df.to_csv(output_file, index=False)
    
    if not return_json:
        print(f"\nOutput tersimpan di: {output_file}")
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
            elif isinstance(obj, np.bool_):
                return bool(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif pd.isna(obj):
                return None
            return obj
        
        # Create table format for web display
        # Convert before scaling data to table format
        before_table = []
        for idx, (_, row) in enumerate(X.head(5).iterrows()):
            row_data = {'row': f'Row {idx+1}'}
            for col in X.columns:
                row_data[col] = convert_numpy_types(row[col])
            before_table.append(row_data)
        
        # Convert after scaling data to table format  
        after_table = []
        for i in range(5):
            row_data = {'row': f'Row {i+1}'}
            for j, col in enumerate(X.columns):
                row_data[col] = convert_numpy_types(X_scaled[i][j])
            after_table.append(row_data)
        
        # Create feature comparison summary
        feature_comparison = []
        for col in X.columns:
            min_val = float(X[col].min()) if not pd.isna(X[col].min()) else 0
            max_val = float(X[col].max()) if not pd.isna(X[col].max()) else 0
            min_scaled = float(X_scaled[:, X.columns.get_loc(col)].min())
            max_scaled = float(X_scaled[:, X.columns.get_loc(col)].max())
            
            feature_comparison.append({
                'feature': col,
                'original_min': convert_numpy_types(min_val),
                'original_max': convert_numpy_types(max_val),
                'scaled_min': convert_numpy_types(min_scaled),
                'scaled_max': convert_numpy_types(max_scaled),
                'range_reduction': f'{max_val - min_val:.2f} → {max_scaled - min_scaled:.2f}'
            })
        
        return {
            'message': 'MinMax scaling completed successfully',
            'output_file': output_file,
            'before_scaling_table': before_table,
            'after_scaling_table': after_table,
            'feature_comparison': feature_comparison,
            'summary_stats': {
                'total_rows': int(X_scaled.shape[0]),
                'numeric_features': len(X.columns),
                'feature_names': list(X.columns),
                'scaling_range': '0 to 1 (MinMax normalized)',
                'missing_values_handled': True,
                'data_types_normalized': 'All numeric features scaled'
            }
        }

if __name__ == "__main__":
    step2_minmax_scaler()