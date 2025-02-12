const errMsg = document.querySelector("#error");
const toggleBtn = document.querySelector(".toggleBtn");

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');

    // Get initial state
    chrome.storage.sync.get(['applicationIsOn'], function(result) {
        toggleButton.checked = result.applicationIsOn || false;
    });

    // Handle toggle changes
    toggleButton.addEventListener('change', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {toggle: true});
        });
    });

    // Add readme button handler
    const readmeButton = document.getElementById('readmeButton');
    if (readmeButton) {
        readmeButton.addEventListener('click', function() {
            chrome.tabs.create({
                url: chrome.runtime.getURL('readme.html')
            });
        });
    }
});

document.onclick = (e) => {
    if (e.target.classList.contains("toggleBtn"))
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, async (tabs) => {
            if (tabs[0]?.url?.includes("tiktok")) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    toggle: true
                });
            } else
                errMsg.innerText = "Only works on TikTok";
        });
};

chrome.storage.sync.get(["applicationIsOn"], (result) => {
    changeToggleButton(result["applicationIsOn"]);
});

chrome.storage.onChanged.addListener((result) => {
    if (result["applicationIsOn"]) {
        changeToggleButton(result["applicationIsOn"].newValue);
    }
});

function changeToggleButton(result) {
    if (result) {
        toggleBtn.classList.remove("btn-success");
        toggleBtn.classList.add("btn-danger");
        toggleBtn.innerHTML = `Stop <i class="bi bi-toggle-off"></i>`
    }
    if (!result) {
        toggleBtn.classList.add("btn-success");
        toggleBtn.classList.remove("btn-danger");
        toggleBtn.innerHTML = `Start <i class="bi bi-toggle-on"></i>`
    }
}