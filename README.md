# Cervical Cancer Risk Analysis Platform

Platform web berbasis Flask untuk analisis risiko kanker serviks menggunakan machine learning pipeline preprocessing.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-scikit--learn-orange)

## Overview

Platform ini menyediakan **4-step preprocessing pipeline** untuk analisis data kanker serviks:

1. **Missing Value Analysis** - Deteksi dan analisis missing values
2. **MinMax Scaling** - Normalisasi data menggunakan MinMax scaler  
3. **ANOVA Feature Selection** - Seleksi fitur menggunakan statistik ANOVA
4. **RUS Data Balancing** - Balancing dataset menggunakan Random Under Sampling

## Quick Start

### Prerequisites

Pastikan Anda memiliki:
- **Python 3.8 atau lebih baru**
- **pip** (package manager Python)

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/cervical-cancer-analysis.git
cd cervical-cancer-analysis
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run aplikasi:**
```bash
python app.py
```

4. **Buka browser:**
```
http://localhost:5000
```

**Selamat!** Platform sudah siap digunakan!

## Struktur Proyek

```
cervical-cancer-analysis/
├── app.py                       # Flask main application
├── requirements.txt             # Python dependencies
├── models/                      # Processing modules
│   ├── 1_cek_missing_value.py         # Step 1: Missing values
├── 2_transformasi_MinMaxScaler.py     # Step 2: Scaling
│   ├── 3_seleksi_fitur_anova.py       # Step 3: Feature selection
│   └── 4_immbalance_data_rus.py       # Step 4: Data balancing
├── templates/
│   └── index.html              # Web interface
├── static/js/                  # JavaScript modules
│   ├── utils.js                # Helper functions
│   ├── fileUpload.js           # File upload handler
│   ├── dataPreview.js          # Data preview display
│   ├── stepSelector.js         # Step selection
│   ├── processor.js            # Data processor
│   ├── resultsDisplay.js       # Results visualization
│   └── main.js                 # Application initialization
├── uploads/                    # Uploaded files storage
├── output/                     # Processing results
└── dataset/
    └── risk_factors_cervical_cancer.csv  # Sample dataset
```

## Cara Menggunakan

### 1. Upload Dataset
- Drag & drop file CSV atau klik "Choose CSV file"
- Sistem mendukung format CSV dengan header
- File akan disimpan di folder `uploads/`

### 2. Preview Data
- Lihat summary dataset: ukuran, kolom, missing values
- Sample data ditampilkan untuk review awal
- Informasi data types dan format

### 3. Pilih Processing Step
Klik pada step yang ingin dijalankan:

| Step | Deskripsi | Output |
|------|-----------|--------|
| **1** | Missing Value Analysis | List kolom dengan missing values |
| **2** | MinMax Scaling | Data yang sudah dinormalisasi [0-1] |
| **3** | ANOVA Feature Selection | Fitur terpilih berdasarkan statistik |
| **4** | RUS Data Balancing | Dataset yang sudah seimbang |

### 4. Lihat Hasil
- Tabel hasil processing
- Grafik visualisasi (untuk Step 3 & 4)
- Download hasil dalam format CSV

## Technical Details

### Dependencies

```
Flask==3.0.0              # Web framework
pandas==2.1.4             # Data manipulation
numpy==1.26.2             # Numerical computation
scikit-learn==1.3.2       # Machine learning algorithms
imbalanced-learn==0.11.0  # RUS functionality
matplotlib==3.8.2         # Data visualization
Werkzeug==3.0.1           # Web utilities
```

### API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Main web interface |
| `/upload` | POST | Upload CSV file |
| `/process` | POST | Run processing step |
| `/results/<step>` | GET | Get processing results |
| `/download/<filename>` | GET | Download results file |
| `/status` | GET | Check processing status |

### Data Processing Pipeline

```
Raw CSV → Missing Analysis → MinMax Scaling → ANOVA Selection → RUS Balancing
```

**Parameter Konstan:**
- Target column: `Biopsy`
- Imputation strategy: `median`
- Scaling range: `[0-1]`
- ANOVA criteria: `p-value < 0.05`
- RUS random state: `42`

## Development

### Module Architecture

**JavaScript Modules:**
- **Modular Design**: Setiap function dalam file terpisah
- **Class-based**: Menggunakan ES6 classes
- **Event-driven**: Proper event handling dan delegation

**Python Modules:**
- **Dual-mode**: Console output dan JSON API responses
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Debug-level logging untuk monitoring

### Adding New Features

1. **Tambah Processing Step:**
```python
# models/5_new_step.py
def step5_new_processing(path="dataset/data.csv", return_json=False):
    # Your processing logic here
    pass
```

2. **Update Frontend:**
```javascript
// static/js/newStep.js
class NewStepProcessor {
    // Your frontend logic here
}
```

3. **Update Routes:**
```python
# app.py
@app.route('/process', methods=['POST'])
def process_data():
    # Add new step handling
```

## Troubleshooting

### Common Issues

**"Module not found"**
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**"Port 5000 already in use"**
```bash
# Solution: Use different port
python app.py --port 5001
```

**"File upload failed"**
- Pastikan file format CSV
- Cek ukuran file (max 16MB)
- Validasi header CSV

**"Processing error"**
- Cek console browser untuk JavaScript errors
- Lihat Flask logs di terminal
- Validasi format data CSV

### Debug Mode

```bash
# Enable debug logging
export FLASK_DEBUG=1
python app.py
```

## Sample Dataset

Dataset included: `risk_factors_cervical_cancer.csv`
- **858 rows** dengan 36 feature kolom
- Target variable: `Biopsy` (0: Normal, 1: Cancer)
- Missing values dalam beberapa kolom
- Mix data types: numeric dan categorical

### Dataset Preview
| Age | Partners | First Intercourse | Pregnancies | ... | Biopsy |
|-----|----------|-------------------|-------------|-----|---------|
| 18  | 4.0      | 15.0              | 1.0         | ... | 0       |
| 15  | 1.0      | 14.0              | 1.0         | ... | 0       |
| ... | ...      | ...               | ...         | ... | ...     |

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

## Acknowledgments

- Dataset: Cervical Cancer Risk Factors Dataset
- Libraries: Flask, scikit-learn, pandas, matplotlib
- Icons: Heroicons, Tailwind CSS
- Font: Poppins Google Font

## Support

Having issues? 

- Email: andinoferdiansah@gmail.com
- Issues: [GitHub Issues](https://github.com/andinoferdi)

---

**Star this repository** jika platform ini membantu penelitian atau pembelajaran Anda!
