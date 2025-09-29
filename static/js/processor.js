class DataProcessor {
    constructor() {
        this.stepSelector = null;
        this.resultsDisplay = null;
    }

    async processData() {
        const selectedFile = window.fileUploadManager.getSelectedFile();
        const selectedStep = window.stepSelectorManager.getSelectedStep();

        if (!selectedFile || !selectedStep) {
            showAlert('Please select a file and processing step', 'error');
            return;
        }

        // Ensure stepSelector is available for processing state
        if (!this.stepSelector) {
            this.stepSelector = window.stepSelectorManager;
        }
        
        this.stepSelector.setProcessingState(true);

        try {
            const result = await makeRequest('/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    step: selectedStep.toString()
                })
            });

            if (result.error) {
                showAlert(result.error, 'error');
            } else {
                showAlert(result.result.message, 'success');
                this.resultsDisplay.showProcessingResults(result.result, selectedStep);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error processing data', 'error');
        } finally {
            this.stepSelector.setProcessingState(false);
        }
    }

    setupEventHandlers() {
        this.stepSelector = window.stepSelectorManager;
        this.resultsDisplay = window.resultsDisplayManager;
        
        const processBtn = document.getElementById('processBtn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processData());
        }
    }
}

window.dataProcessor = new DataProcessor();
