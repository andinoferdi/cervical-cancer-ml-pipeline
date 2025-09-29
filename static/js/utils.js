function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    
    const alertElement = createElement('div', {
        id: alertId,
        className: `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex items-center justify-between max-w-md animate-slide-in-left`,
        innerHTML: `
            <span>${message}</span>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `
    });

    alertContainer.appendChild(alertElement);

    setTimeout(() => {
        const element = document.getElementById(alertId);
        if (element) {
            element.remove();
        }
    }, 5000);
}

function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach(key => {
        if (key === 'innerHTML') {
            element.innerHTML = options[key];
        } else if (key === 'textContent') {
            element.textContent = options[key];
        } else {
            element[key] = options[key];
        }
    });
    return element;
}

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}
