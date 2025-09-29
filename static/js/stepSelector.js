let selectedStep = null;

class StepSelector {
    constructor() {
        this.processBtn = document.getElementById('processBtn');
        this.btnText = document.getElementById('btnText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        this.stepNames = {
            1: 'Missing Values Analysis',
            2: 'MinMax Scaling',
            3: 'Feature Selection (ANOVA)',
            4: 'SMOTE Data Balancing'
        };
    }

    initialize() {
        this.resetAllSteps();
        this.setupStepClickHandlers();
    }

    resetAllSteps() {
        // Reset all steps to unselected state
        document.querySelectorAll('[data-step]').forEach(el => {
            el.classList.remove('border-accent-500', 'shadow-accent-500/25', 'bg-accent-500/10', 'selected');
            el.classList.add('border-slate-600/50', 'unselected-step');
        });
        
        // Reset button state
        if (this.processBtn) {
            this.processBtn.disabled = true;
        }
        if (this.btnText) {
            this.btnText.textContent = 'Process Selected Step';
        }
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
        }
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
        // Remove active state from all step cards
        document.querySelectorAll('[data-step]').forEach(el => {
            el.classList.remove('border-accent-500', 'shadow-accent-500/25', 'bg-accent-500/10');
            el.classList.add('border-slate-600/50', 'unselected-step');
        });
    }

    highlightSelectedStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            // Remove unselected classes and add active styling
            stepElement.classList.remove('border-slate-600/50', 'unselected-step');
            stepElement.classList.add('border-accent-500', 'shadow-accent-500/25', 'bg-accent-500/10', 'selected');
            
            // Add visual feedback with scale animation
            stepElement.style.transform = 'scale(1.02)';
            stepElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                stepElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateProcessButton() {
        const stepName = this.stepNames[selectedStep] || `Step ${selectedStep}`;
        
        if (this.processBtn) {
            this.processBtn.disabled = false;
        }
        if (this.btnText) {
            this.btnText.textContent = `Process ${stepName}`;
        }
    }

    setProcessingState(isProcessing) {
        const stepName = this.stepNames[selectedStep] || `Step ${selectedStep}`;
        
        if (this.processBtn) {
            this.processBtn.disabled = isProcessing;
        }
        if (this.btnText) {
            this.btnText.textContent = isProcessing ? 'Processing...' : `Process ${stepName}`;
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

    // Method to get step name for external use
    getStepName(stepNumber) {
        return this.stepNames[stepNumber] || `Step ${stepNumber}`;
    }
}

window.stepSelectorManager = new StepSelector();
