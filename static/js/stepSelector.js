let selectedStep = null;

class StepSelector {
    constructor() {
        this.processBtn = document.getElementById('processBtn');
        this.btnText = document.getElementById('btnText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
    }

    initialize() {
        this.setupStepClickHandlers();
    }

    setupStepClickHandlers() {
        this.setupStepClickEvents();
    }

    setupStepClickEvents() {
        document.querySelectorAll('[data-step]').forEach(element => {
            element.addEventListener('click', () => {
                const step = parseInt(element.getAttribute('data-step'));
                this.selectStep(step);
            });
        });
    }

    selectStep(step) {
        selectedStep = step;
        
        this.removePreviousSelection();
        this.highlightSelectedStep(step);
        this.updateProcessButton();
    }

    removePreviousSelection() {
        document.querySelectorAll('.border.border-gray-200.rounded-lg').forEach(el => {
            el.classList.remove('border-blue-500', 'bg-blue-50');
        });
    }

    highlightSelectedStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.add('border-blue-500', 'bg-blue-50');
        }
    }

    updateProcessButton() {
        if (this.processBtn) {
            this.processBtn.disabled = false;
        }
        if (this.btnText) {
            this.btnText.textContent = `Process Step ${selectedStep}`;
        }
    }

    setProcessingState(isProcessing) {
        if (this.processBtn) {
            this.processBtn.disabled = isProcessing;
        }
        if (this.btnText) {
            this.btnText.textContent = isProcessing ? 'Processing...' : `Process Step ${selectedStep}`;
        }
        if (this.loadingSpinner) {
            if (isProcessing) {
                this.loadingSpinner.classList.remove('hidden');
            } else {
                this.loadingSpinner.classList.add('hidden');
            }
        }
    }

    getSelectedStep() {
        return selectedStep;
    }
}

window.stepSelectorManager = new StepSelector();
