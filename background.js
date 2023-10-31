// Initialize the tabUrls object.
chrome.storage.session.set({ tabUrls: {} }).catch((error) => {
    console.error(`Failed to initialize yt-rplc state: ${error}`);
});

// Listen for tab URL changes.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.session.get('tabUrls').then((data) => {
            if (data.tabUrls[tabId] === tab.url) {
                return;
            }

            data.tabUrls[tabId] = tab.url;
            chrome.storage.session.set({ tabUrls: data.tabUrls });

            const regex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/; // Check if the URL is a YouTube video.
            const match = regex.exec(tab.url);
            if (match) {
                const capturedGroup = match[1]; // Match the video ID.
                const newUrl = 'https://www.youtube.com/embed/' + capturedGroup; // Create the new URL.
                chrome.storage.sync.get('replacePlayer').then((data) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        function: data.replacePlayer ? replacePlayer : redirect,
                        args: [newUrl]
                    });
                });
            }
        });
    }
});

// Helper to redirect the tab webpage.
function redirect(newUrl) {
    window.location.replace(newUrl);
}

// Helper to replace the YouTube player.
function replacePlayer(newUrl) {
    const allDivs = document.querySelectorAll('div.ytd-watch-flexy');
    for (const div of allDivs) {
        if (div.id === "player") {
            var iframe = document.createElement('iframe');
            iframe.src = newUrl; // Embed the video ID in the URL.
            iframe.width = "100%"; // Use all the provided space.
            iframe.height = "480px"; // Set a reasonable default height.
            div.parentNode.replaceChild(iframe, div);

            return;
        }
    }
}