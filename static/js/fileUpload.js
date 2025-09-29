let selectedFile = null;

class FileUpload {
    constructor() {
        this.fileInput = document.getElementById('csvFile');
        this.uploadArea = document.getElementById('uploadArea');
        this.listenersSetup = false;
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Prevent multiple event listeners
        if (this.listenersSetup) {
            return;
        }
        
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.uploadArea.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        
        this.uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.click();
        });
        
        this.listenersSetup = true;
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.name.toLowerCase().endsWith('.csv')) {
            selectedFile = file;
            this.uploadFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('border-blue-500', 'bg-blue-50');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('border-blue-500', 'bg-blue-50');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('border-blue-500', 'bg-blue-50');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.csv')) {
                selectedFile = file;
                this.uploadFile(file);
            } else {
                showAlert('Please select a CSV file', 'error');
            }
        }
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('Uploading file:', file.name, 'Size:', file.size);

        try {
            const data = await makeRequest('/upload', {
                method: 'POST',
                body: formData
            });

            console.log('Upload response:', data);

            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                showAlert(data.message, 'success');
                this.showFileInfo(data.filename);
                
                if (data.preview) {
                    window.dataPreviewManager.showDataPreview(data.preview);
                } else {
                    console.warn('No preview data received');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            showAlert(`Error uploading file: ${error.message}`, 'error');
        }
    }

    showFileInfo(filename) {
        document.getElementById('fileName').textContent = filename;
        document.getElementById('fileInfo').classList.remove('hidden');
    }

    getSelectedFile() {
        return selectedFile;
    }
}

window.fileUploadManager = new FileUpload();
