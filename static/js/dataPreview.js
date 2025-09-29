class DataPreview {
  constructor() {
    this.dataPreview = null;
  }

  showDataPreview(preview) {
    const previewSection = document.getElementById("dataPreview");
    const previewContent = document.getElementById("previewContent");

    previewContent.innerHTML = this.generatePreviewHTML(preview);

    previewSection.classList.remove("hidden");
    this.dataPreview = preview;
  }

  generatePreviewHTML(preview) {
    return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-xl backdrop-blur-sm">
                    <div class="flex items-center mb-2">
                        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                            </svg>
                        </div>
                        <h3 class="font-semibold text-blue-300">Dataset Size</h3>
                    </div>
                    <p class="text-3xl font-bold text-white mb-1">${
                      preview.shape[0]
                    } × ${preview.shape[1]}</p>
                    <p class="text-sm text-blue-200">rows × columns</p>
                </div>
                <div class="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 p-6 rounded-xl backdrop-blur-sm">
                    <div class="flex items-center mb-2">
                        <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 class="font-semibold text-emerald-300">Features</h3>
                    </div>
                    <p class="text-3xl font-bold text-white mb-1">${
                      preview.shape[1]
                    }</p>
                    <p class="text-sm text-emerald-200">total columns</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 p-6 rounded-xl backdrop-blur-sm">
                    <div class="flex items-center mb-2">
                        <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <h3 class="font-semibold text-amber-300">Missing Values</h3>
                    </div>
                    <p class="text-3xl font-bold text-white mb-1">${
                      Object.values(preview.missing_values).filter((v) => v > 0)
                        .length
                    }</p>
                    <p class="text-sm text-amber-200">columns with missing data</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-xl backdrop-blur-sm">
                    <div class="flex items-center mb-2">
                        <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                        </div>
                        <h3 class="font-semibold text-purple-300">Data Types</h3>
                    </div>
                    <p class="text-xl font-bold text-white mb-1">Mixed</p>
                    <p class="text-sm text-purple-200">numeric & categorical</p>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-semibold text-white mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Column Names
                </h3>
                <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    ${preview.columns
                      .map(
                        (col) =>
                          `<span class="bg-slate-700/50 border border-slate-600 text-slate-200 px-3 py-1 rounded-lg text-sm font-medium">${col}</span>`
                      )
                      .join("")}
                </div>
            </div>
            
            ${this.generateSampleDataTable(preview)}
        `;
  }

  generateSampleDataTable(preview) {
    return `
            <div class="mt-6">
                <h3 class="font-semibold text-white mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Sample Data (First 5 rows)
                </h3>
                <div class="overflow-x-auto rounded-xl border border-slate-600">
                    <table class="min-w-full">
                        <thead class="bg-slate-700/50">
                            <tr>
                                ${preview.columns
                                  .slice(0, 8)
                                  .map(
                                    (col) =>
                                      `<th class="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-r border-slate-600 last:border-r-0">${col}</th>`
                                  )
                                  .join("")}
                                ${
                                  preview.columns.length > 8
                                    ? '<th class="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">...</th>'
                                    : ""
                                }
                            </tr>
                        </thead>
                        <tbody class="bg-slate-800/30 divide-y divide-slate-600">
                            ${preview.sample_data
                              .slice(0, 5)
                              .map(
                                (row, index) => `
                                <tr class="hover:bg-slate-700/30 transition-colors">
                                    ${preview.columns
                                      .slice(0, 8)
                                      .map(
                                        (col) =>
                                          `<td class="px-4 py-3 whitespace-nowrap text-sm text-slate-200 border-r border-slate-600/50 last:border-r-0">${
                                            row[col] !== null &&
                                            row[col] !== undefined
                                              ? row[col]
                                              : '<span class="text-slate-500 italic">null</span>'
                                          }</td>`
                                      )
                                      .join("")}
                                    ${
                                      preview.columns.length > 8
                                        ? '<td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">...</td>'
                                        : ""
                                    }
                                </tr>
                            `
                              )
                              .join("")}
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
