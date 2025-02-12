const VIDEOS_LIST_SELECTOR = "[data-e2e='recommend-list-item-container'], [data-e2e='search-card-container']";
const NEXT_VIDEO_ARROW = "[data-e2e='arrow-right']";
const VIDEO_SELECTOR = "video";
const CHECK_FULLSCREEN_SELCECTOR = NEXT_VIDEO_ARROW;

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
// -------
let applicationIsOn = false;
let fullscreen = false;
let removeComments = false;

(async function initiate() {
    await chrome.storage.sync.get(["applicationIsOn"], (result) => {
        if (result.applicationIsOn == null) {
            startAutoScrolling();
            return;
        }
        if (result.applicationIsOn) {
            startAutoScrolling();
        } else {
            showStatusIndicator(false);
        }
    });

    await chrome.storage.sync.get(["removeComments"], (result) => {
        removeComments = !!result.removeComments;
    });
})();

document.addEventListener("keydown", (e) => {
    if (!e.isTrusted)
        return;
    if (e.key.toLowerCase() === "s" && e.shiftKey) {
        applicationIsOn ? stopAutoScrolling() : startAutoScrolling();
    }
    else if (e.key.toLowerCase() === "f" && e.shiftKey) {
        removeComments = !removeComments;
        chrome.storage.sync.set({ removeComments: removeComments });
    }
});
chrome.runtime.onMessage.addListener(async ({ toggle }) => {
    if (toggle) {
        await chrome.storage.sync.get(["applicationIsOn"], (result) => {
            if (!result.applicationIsOn) startAutoScrolling();
            if (result.applicationIsOn) stopAutoScrolling();

        });
    }
});
function startAutoScrolling() {
    fullscreen = !!document.querySelector(CHECK_FULLSCREEN_SELCECTOR);
    if (!applicationIsOn) {
        applicationIsOn = true;
        chrome.storage.sync.set({ applicationIsOn: true });
        
        // Add visual indicator
        showStatusIndicator(true);
    }
}
async function endVideoEvent() {
    // First try to handle fullscreen mode
    if (fullscreen) {
        const nextButton = document.querySelector(NEXT_VIDEO_ARROW);
        if (nextButton) {
            nextButton.click();
            return;
        }
    }

    // Handle both feed and search results
    const VIDEOS_LIST = document.querySelectorAll(VIDEOS_LIST_SELECTOR);
    if (!VIDEOS_LIST.length) {
        console.log("No videos found in list");
        return;
    }

    let currentVideo = document.querySelector(VIDEO_SELECTOR);
    if (!currentVideo) {
        console.log("No current video found");
        return;
    }

    // Find the current video's container
    let currentContainer = Array.from(VIDEOS_LIST).find(container => {
        return container.contains(currentVideo);
    });

    if (!currentContainer) {
        console.log("Current video container not found");
        return;
    }

    // Find the index of the current container
    let index = Array.from(VIDEOS_LIST).indexOf(currentContainer);
    
    // Get next video container
    let nextVideo = Array.from(VIDEOS_LIST)[index + 1];
    if (nextVideo) {
        nextVideo.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "center",
        });
    }
}

function stopAutoScrolling() {
    applicationIsOn = false;
    chrome.storage.sync.set({ applicationIsOn: false });
    
    // Remove visual indicator
    showStatusIndicator(false);
}

// Update the video detection and event listener attachment
function attachVideoEndListener() {
    const currentVideo = document.querySelector(VIDEO_SELECTOR);
    if (currentVideo && applicationIsOn) {
        // Remove existing listener to prevent duplicates
        currentVideo.removeEventListener("ended", endVideoEvent);
        // Add new listener
        currentVideo.addEventListener("ended", endVideoEvent);
        
        // Also handle loop attribute as some videos might be set to loop
        currentVideo.loop = false;
    }
}

// Update the loop function to be more aggressive in checking for videos
(function loop() {
    if (applicationIsOn) {
        (function getCurrentVideoAndFullscreenStatus() {
            fullscreen = !!document.querySelector(CHECK_FULLSCREEN_SELCECTOR);
            attachVideoEndListener();
        })();
    }
    (function appendShortCutHelp() {
        const ShortCutHelp = [
            `<div class="tiktok-drf9az-DivKeyboardShortcutContentItem e1l04njg3 autoTikTok">Toggle On/Off Auto Scroller <h2>shift + s</h2></div>`,
            `<div class="tiktok-drf9az-DivKeyboardShortcutContentItem e1l04njg3 autoTikTok">Toggle Fullscreen Comments <h2>shift + f</h2></div>`,
        ];
        const element = document.querySelector("[class*='DivKeyboardShortcutContent']");
        if (element && !element.querySelector(".autoTikTok")) {
            ShortCutHelp.forEach((htmlString) => {
                let divEle = new DOMParser().parseFromString(htmlString, "text/html");
                element.append(...divEle.body.children);
            });
        }
    })();
    (function removeCommentsFromDom() {
        const comments = Array.from(document.querySelectorAll("[class*='DivContentContainer']")).find((ele) => ele.querySelector("[class*='DivCommentListContainer']"));
        const commentsList = comments?.querySelector("[class*='DivCommentListContainer']");
        if (removeComments && fullscreen) {
            try {
                if (comments) {
                    if (commentsList)
                        commentsList.style.overflow = "hidden auto";
                    comments.style.display = "none";
                }
            }
            catch { () => { } }
        }
        else {
            try {
                if (comments) {
                    if (commentsList)
                        commentsList.style.overflow = "hidden auto";
                    comments.style.display = "";
                }
            }
            catch { }
        }
    })();
    sleep(100).then(loop);
})();

function showStatusIndicator(isOn) {
    let indicator = document.getElementById('tiktok-autoscroll-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'tiktok-autoscroll-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            z-index: 9999;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            backdrop-filter: blur(8px);
        `;
        document.body.appendChild(indicator);
    }
    
    if (isOn) {
        indicator.style.backgroundColor = 'rgba(0, 200, 83, 0.9)';
        indicator.style.color = 'white';
        indicator.textContent = 'Auto-Scroll: ON';
    } else {
        indicator.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
        indicator.style.color = '#888';
        indicator.textContent = 'Auto-Scroll: OFF';
    }
}