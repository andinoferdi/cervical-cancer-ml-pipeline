import pandas as pd
import numpy as np
import os
import matplotlib
import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_classif
import base64
import io
import logging

# Disable matplotlib font debug messages
matplotlib_logger = logging.getLogger('matplotlib.font_manager')
matplotlib_logger.setLevel(logging.ERROR)

def step3_anova(path="dataset/risk_factors_cervical_cancer.csv", target="Biopsy", return_json=False):
    """
    Perform ANOVA feature selection on dataset
    
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

    # imputasi dan scaling
    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X)
    scaler = MinMaxScaler()
    X_scl = scaler.fit_transform(X_imp)

    # Seleksi fitur dengan ANOVA
    skb = SelectKBest(score_func=f_classif, k="all")
    skb.fit(X_scl, y)
    pvalues = skb.pvalues_

    mask = np.isfinite(pvalues) & (pvalues < 0.05)
    idx = np.where(mask)[0] if np.any(mask) else np.argsort(pvalues)[:10]
    selected_features = X.columns.to_numpy()[idx]
    
    if not return_json:
        # Original behavior - print to console
        print("=== Step 3: Seleksi Fitur (ANOVA) ===")
        print("Fitur terpilih:", list(selected_features))
    
    selected_data = pd.DataFrame(X_scl[:, idx], columns=selected_features)
    selected_data['target'] = y
    
    os.makedirs("output", exist_ok=True)
    
    csv_file = "output/3_selected_features.csv"
    selected_data.to_csv(csv_file, index=False)
    
    if not return_json:
        print(f"\nOutput CSV tersimpan di: {csv_file}")
    
    metrics_df = pd.DataFrame({
        'feature': X.columns,
        'p_value': skb.pvalues_,
        'f_score': skb.scores_,
        'selected': X.columns.isin(selected_features)
    }).sort_values('p_value')
    
    plt.figure(figsize=(12, 8))
    plt.subplot(2, 1, 1)
    plt.bar(range(len(metrics_df)), -np.log10(metrics_df['p_value']))
    plt.axhline(y=-np.log10(0.05), color='r', linestyle='--', label='p-value = 0.05')
    plt.xlabel('Feature Index')
    plt.ylabel('-log10(p-value)')
    plt.title('ANOVA P-values by Feature')
    plt.legend()
    
    plt.subplot(2, 1, 2)
    colors = ['red' if x else 'blue' for x in metrics_df['selected']]
    plt.bar(range(len(metrics_df)), metrics_df['f_score'], color=colors)
    plt.xlabel('Feature Index')
    plt.ylabel('F-Score')
    plt.title('ANOVA F-Scores by Feature (Red = Selected)')
    
    plt.tight_layout()
    png_file = "output/3_anova_selection.png"
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
        plt.figure(figsize=(12, 8))
        plt.subplot(2, 1, 1)
        plt.bar(range(len(metrics_df)), -np.log10(metrics_df['p_value']))
        plt.axhline(y=-np.log10(0.05), color='r', linestyle='--', label='p-value = 0.05')
        plt.xlabel('Feature Index')
        plt.ylabel('-log10(p-value)')
        plt.title('ANOVA P-values by Feature')
        plt.legend()
        
        plt.subplot(2, 1, 2)
        colors = ['red' if x else 'blue' for x in metrics_df['selected']]
        plt.bar(range(len(metrics_df)), metrics_df['f_score'], color=colors)
        plt.xlabel('Feature Index')
        plt.ylabel('F-Score')
        plt.title('ANOVA F-Scores by Feature (Red = Selected)')
        
        plt.tight_layout()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
        plt.close()
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        # Create feature analysis table
        feature_analysis_table = []
        for _, row in metrics_df.head(10).iterrows():
            feature_analysis_table.append({
                'feature': str(row['feature']),
                'p_value': convert_numpy_types(row['p_value']),
                'f_score': convert_numpy_types(row['f_score']),
                'selected': bool(row['selected']),
                'significance': 'Significant' if row['p_value'] < 0.05 else 'Not Significant'
            })
        
        # Create selected features summary
        selected_features_summary = []
        for i, feat in enumerate(selected_features):
            features_indices = metrics_df[metrics_df['feature'] == feat]
            if not features_indices.empty:
                row = features_indices.iloc[0]
                selected_features_summary.append({
                    'rank': i + 1,
                    'feature': str(feat),
                    'f_score': convert_numpy_types(row['f_score']),
                    'p_value': convert_numpy_types(row['p_value']),
                    'significance_level': 'p < 0.05' if row['p_value'] < 0.05 else 'p ≥ 0.05'
                })
        
        # Create sample output table for selected features
        sample_output_table = []
        for i in range(min(5, len(selected_data))):
            row_data = {'row': f'Row {i+1}'}
            for col in selected_features:
                row_data[str(col)] = convert_numpy_types(selected_data.iloc[i][col])
            row_data['target'] = convert_numpy_types(selected_data.iloc[i]['target'])
            sample_output_table.append(row_data)
        
        return {
            'message': 'ANOVA feature selection completed successfully',
            'output_file': csv_file,
            'chart_base64': f"data:image/png;base64,{img_base64}",
            'feature_analysis_table': feature_analysis_table,
            'selected_features_summary': selected_features_summary,
            'sample_output_table': sample_output_table,
            'summary_stats': {
                'total_features_analyzed': len(X.columns),
                'features_selected': len(selected_features),
                'selection_criteria': 'p-value < 0.05 or top 10',
                'target_column': target,
                'selection_rate': f"{(len(selected_features) / len(X.columns)) * 100:.1f}%"
            }
        }

if __name__ == "__main__":
    step3_anova()