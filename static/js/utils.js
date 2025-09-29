function showAlert(message, type = "info") {
  const alertContainer = document.getElementById("alertContainer");
  const alertId = "alert-" + Date.now();

  const bgColor =
    type === "error"
      ? "bg-red-500/90"
      : type === "success"
      ? "bg-emerald-500/90"
      : "bg-accent-500/90";

  const alertElement = createElement("div", {
    id: alertId,
    className: `${bgColor} backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl mb-4 flex items-center justify-between max-w-md animate-slide-in-left border border-white/20`,
    innerHTML: `
            <div class="flex items-center">
                <div class="w-5 h-5 mr-3">
                    ${
                      type === "error"
                        ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                        : type === "success"
                        ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                        : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    }
                </div>
                <span class="font-medium">${message}</span>
            </div>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-4 text-white/80 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `,
  });

  alertContainer.appendChild(alertElement);

  setTimeout(() => {
    const element = document.getElementById(alertId);
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateX(100%)";
      setTimeout(() => element.remove(), 300);
    }
  }, 5000);
}

function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  Object.keys(options).forEach((key) => {
    if (key === "innerHTML") {
      element.innerHTML = options[key];
    } else if (key === "textContent") {
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
    console.error("Request error:", error);
    throw error;
  }
}
