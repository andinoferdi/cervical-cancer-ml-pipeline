document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    try {
        // Initialize managers in dependency order
        window.fileUploadManager.initialize();
        window.stepSelectorManager.initialize();
        window.resultsDisplayManager = window.resultsDisplayManager || window.resultsDisplayManager; // Ensure it's available
        
        // Setup event handlers after all managers are initialized
        window.dataProcessor.setupEventHandlers();
        
        // Verify all managers are properly initialized
        console.log('Application initialized successfully');
        console.log('Available managers:', {
            fileUploadManager: !!window.fileUploadManager,
            stepSelectorManager: !!window.stepSelectorManager,
            resultsDisplayManager: !!window.resultsDisplayManager,
            dataProcessor: !!window.dataProcessor
        });
    } catch (error) {
        console.error('Error initializing application:', error);
        showAlert('Error initializing application', 'error');
    }
}
