class DataPreview {
    constructor() {
        this.dataPreview = null;
    }

    showDataPreview(preview) {
        const previewSection = document.getElementById('dataPreview');
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = this.generatePreviewHTML(preview);
        
        previewSection.classList.remove('hidden');
        this.dataPreview = preview;
    }

    generatePreviewHTML(preview) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-blue-800">Dataset Size</h3>
                    <p class="text-2xl font-bold text-blue-600">${preview.shape[0]} × ${preview.shape[1]}</p>
                    <p class="text-sm text-blue-600">rows × columns</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-800">Features</h3>
                    <p class="text-2xl font-bold text-green-600">${preview.shape[1]}</p>
                    <p class="text-sm text-green-600">total columns</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-yellow-800">Missing Values</h3>
                    <p class="text-2xl font-bold text-yellow-600">${Object.values(preview.missing_values).filter(v => v > 0).length}</p>
                    <p class="text-sm text-yellow-600">columns with missing data</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-purple-800">Data Types</h3>
                    <p class="text-xl font-bold text-purple-600">Mixed</p>
                    <p class="text-sm text-purple-600">numeric & categorical</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h3 class="font-semibold text-gray-800 mb-2">Column Names</h3>
                <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    ${preview.columns.map(col => `<span class="bg-gray-100 px-2 py-1 rounded text-sm">${col}</span>`).join('')}
                </div>
            </div>
            
            ${this.generateSampleDataTable(preview)}
        `;
    }

    generateSampleDataTable(preview) {
        return `
            <div class="mt-4">
                <h3 class="font-semibold text-gray-800 mb-2">Sample Data (First 5 rows)</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                ${preview.columns.slice(0, 8).map(col => 
                                    `<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">${col}</th>`
                                ).join('')}
                                ${preview.columns.length > 8 ? 
                                    '<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">...</th>' : ''}
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${preview.sample_data.slice(0, 5).map(row => `
                                <tr class="hover:bg-gray-50">
                                    ${preview.columns.slice(0, 8).map(col => 
                                        `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">${row[col] || '-'}</td>`
                                    ).join('')}
                                    ${preview.columns.length > 8 ? 
                                        '<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">...</td>' : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getDataPreview() {
        return this.dataPreview;
    }
}

window.dataPreviewManager = new DataPreview();
