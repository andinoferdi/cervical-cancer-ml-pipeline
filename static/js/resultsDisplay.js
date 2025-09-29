class ResultsDisplay {
    constructor() {
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContent = document.getElementById('resultsContent');
    }

    showProcessingResults(result, selectedStep) {
        let resultsHtml = this.generateSuccessMessage(result.message);
        
        resultsHtml += this.generateStepSpecificResults(result, selectedStep);
        
        resultsHtml += this.generateChartHTML('Chart', result.chart_base64 || '');
        
        resultsHtml += this.generateDownloadButton(result.output_file);
        
        this.displayResults(resultsHtml);
    }

    generateSuccessMessage(message) {
        return `
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                <div class="flex items-center">
                    <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-green-700 font-medium">${message}</span>
                </div>
            </div>
        `;
    }

    generateStepSpecificResults(result, selectedStep) {
        switch (selectedStep) {
            case 1:
                return this.generateMissingValuesResults(result);
            case 2:
                return this.generateScalingResults(result);
            case 3:
                return this.generateFeatureSelectionResults(result);
            case 4:
                return this.generateSMOTEResults(result);
            default:
                return '';
        }
    }

    generateMissingValuesResults(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Missing Values Summary</h3>
                <p class="text-sm text-gray-300 mb-2">Found ${result.total_missing_features} columns with missing values</p>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-600">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Feature</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Missing Count</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Missing %</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            ${result.missing_summary.slice(0, 10).map(item => `
                                <tr class="hover:bg-gray-800 transition-colors">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.feature}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.missing_count}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100">${item.missing_percentage.toFixed(2)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    generateScalingResults(result) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                ${this.generateScalingTables(result)}
            </div>
            ${this.generateScalingSummary(result)}`;
    }

    generateScalingSummary(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Summary Statistics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Total Rows</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.total_rows}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Features</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.numeric_features}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Scaling Range</h4>
                        <p class="text-lg font-bold text-gray-300">0 - 1</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Missing Values</h4>
                        <p class="text-lg font-bold text-gray-300">Handled</p>
                    </div>
                </div>
            </div>`;
    }

    generateScalingTables(result) {
        const beforeTable = this.generateTableHTML('Before Scaling', result.before_scaling_table);
        const afterTable = this.generateTableHTML('After Scaling', result.after_scaling_table);
        return beforeTable + afterTable;
    }

    generateFeatureSelectionResults(result) {
        return `
            ${this.generateFeatureSelectionSummary(result)}
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Selected Features List</h3>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${result.selected_features_summary.map(feat => `
                        <span class="bg-blue-100 text-white px-3 py-1 rounded-full text-sm">
                            ${feat.feature} (Rank: ${feat.rank})
                        </span>
                    `).join('')}
                </div>
            </div>
            ${result.chart_base64 ? this.generateChartHTML('ANOVA Analysis Chart', result.chart_base64) : ''}
            ${this.generateFeatureAnalysisTable(result)}
            ${this.generateSampleDataTable(result.sample_output_table, 'Sample Selected Data')}`;
    }

    generateSMOTEResults(result) {
        return `
            ${this.generateSMOTESummary(result)}
            ${this.generateClassDistributionTable(result)}
            ${result.chart_base64 ? this.generateChartHTML('SMOTE Balancing Visualization', result.chart_base64) : ''}
            ${this.generateImbalanceRatioAnalysis(result)}
            ${this.generateSampleDataTable(result.sample_output_table, 'Sample Balanced Data')}`;
    }

    generateDownloadButton(outputFile) {
        const filename = outputFile.split('/').pop();
        return `
            <div class="mt-6 text-center">
                <a href="/download/${filename}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download CSV Result
                </a>
            </div>`;
    }

    displayResults(html) {
        this.resultsContent.innerHTML = html;
        this.resultsSection.classList.remove('hidden');
    }

    generateTableHTML(title, tableData) {
        if (!tableData || tableData.length === 0) return '';
        
        const columns = Object.keys(tableData[0]).filter(key => key !== 'row');
        const displayColumns = columns.slice(0, 5);
        
        return `
            <div>
                <h3 class="font-semibold text-white mb-2">${title}</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-600 mb-4">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Row</th>
                                ${displayColumns.map(col => 
                                    '<th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">' + col + '</th>'
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            ${tableData.slice(0, 5).map(row => `
                                <tr class="hover:bg-gray-800 transition-colors">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${row.row}</td>
                                    ${displayColumns.map(key => 
                                        `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${typeof row[key] === 'number' ? row[key].toFixed(6) : row[key]}</td>` 
                                    ).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    generateFeatureSelectionSummary(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Selected Features Summary</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Total Features</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.total_features_analyzed}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Selected Features</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.features_selected}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Selection Rate</h4>
                        <p class="text-xl font-bold text-gray-300">${result.summary_stats.selection_rate}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Target Column</h4>
                        <p class="text-lg font-bold text-gray-300">${result.summary_stats.target_column}</p>
                    </div>
                </div>
            </div>`;
    }

    generateFeatureAnalysisTable(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Feature Analysis (Top 10)</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-600">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Rank</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Feature</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">F-Score</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">P-Value</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Significance</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Selected</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            ${result.feature_analysis_table.slice(0, 10).map((item, index) => `
                                <tr class="hover:bg-gray-800">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${index + 1}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.feature}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.f_score ? item.f_score.toFixed(4) : 'N/A'}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.p_value ? item.p_value.toExponential(2) : 'N/A'}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm border-r border-gray-600">
                                        <span class="px-2 py-1 rounded-full text-xs ${
                                            item.significance === 'Significant' 
                                                ? 'bg-green-100 text-white' 
                                                : 'bg-gray-100 text-white'
                                        }">
                                            ${item.significance}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100">
                                        ${item.selected ? 
                                            '<span class="text-gray-300">✓</span>' : 
                                            '<span class="text-gray-400">✗</span>'
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    generateSMOTESummary(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Data Balancing Summary</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Samples Before</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.total_samples_before}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Samples After</h4>
                        <p class="text-2xl font-bold text-gray-300">${result.summary_stats.total_samples_after}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Classes</h4>
                        <p class="text-lg font-bold text-gray-300">${result.summary_stats.classes.join(', ')}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold text-white">Balance Status</h4>
                        <p class="text-lg font-bold text-gray-300">${result.summary_stats.balancing_status}</p>
                    </div>
                </div>
            </div>`;
    }

    generateClassDistributionTable(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Class Distribution Comparison</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-600">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Class</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Before SMOTE</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">After SMOTE</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Added Samples</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Change %</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 compose-y divide-gray-700">
                            ${result.distribution_comparison.map((item, index) => `
                                <tr class="bover:bg-gray-800">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">
                                        <span class="px-2 py-1 rounded-full text-xs ${
                                            item.class === 'Class 0' 
                                                ? 'bg-blue-100 text-white' 
                                                : 'bg-orange-100 text-orange-800'
                                        }">
                                            ${item.class}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.before_smote}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${item.after_smote}</td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">
                                        ${item.change > 0 ? `<span class="text-gray-300 font-semibold">+${item.change}</span>` : 
                                          item.change < 0 ? `<span class="text-red-600 font-semibold">${item.change}</span>` : 
                                          '<span class="text-gray-300">0</span>'}
                                    </td>
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100">
                                        ${item.change > 0 ? `<span class="text-gray-300 font-semibold">${item.percentage_change}</span>` : 
                                          '<span class="text-gray-300">No change</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    generateImbalanceRatioAnalysis(result) {
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">Imbalance Ratio Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 class="font-semibold text-white mb-2">Before SMOTE</h4>
                        <p class="text-xl font-bold text-red-600">${result.summary_stats.imbalance_ratio_before.toFixed(2)}:1</p>
                        <p class="text-sm text-red-600 mt-1">Highly imbalanced</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 class="font-semibold text-white mb-2">After SMOTE</h4>
                        <p class="text-xl font-bold text-gray-300">${result.summary_stats.imbalance_ratio_after.toFixed(2)}:1</p>
                        <p class="text-sm text-gray-300 mt-1">${result.summary_stats.imbalance_ratio_after <= 1.05 ? 'Balanced!' : 'Improved'}</p>
                    </div>
                </div>
            </div>`;
    }

    generateSampleDataTable(tableData, title) {
        if (!tableData || tableData.length === 0) return '';
        
        const columns = Object.keys(tableData[0]).filter(key => key !== 'row');
        const displayColumns = columns.slice(0, 8);
        
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">${title}</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border border-gray-600">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">Row</th>
                                ${displayColumns.map(col => 
                                    '<th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-600">' + col + '</th>'
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            ${tableData.slice(0, 8).map(row => `
                                <tr class="hover:bg-gray-800">
                                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${row.row}</td>
                                    ${displayColumns.map(key => 
                                        `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-100 border-r border-gray-600">${typeof row[key] === 'number' ? row[key].toFixed(4) : row[key]}</td>`
                                    ).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    generateChartHTML(title, chartBase64) {
        if (!chartBase64) return '';
        return `
            <div class="mb-4">
                <h3 class="font-semibold text-white mb-2">${title}</h3>
                <img src="${chartBase64}" alt="Chart" class="w-full h-auto border border-gray-600 rounded">
            </div>`;
    }
}

window.resultsDisplayManager = new ResultsDisplay();