// Initialize the tabStateMap object.
chrome.storage.session.set({ tabStateMap: {} }).catch((error) => {
    console.error(`Failed to initialize yt-rplc state: ${error}`);
});

// Listen for tab URL changes.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.session.get('tabStateMap').then((data) => {
            let state = data.tabStateMap[tabId] || {};

            // Exit if the last completed URL on this tab was the current one.
            if (state.url === tab.url) {
                return;
            }

            // Update to the current URL.
            state.url = tab.url;

            // Update the state for this tab.
            data.tabStateMap[tabId] = state;
            chrome.storage.session.set(data);

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
    // Find the relevant elements.
    const div = document.querySelector('#primary-inner');
    let oldPlayer = div.querySelector('#player')

    // Construct the new embedded player.
    var iframe = document.createElement('iframe');
    iframe.id = 'player'; // Use the same ID as the original player.
    iframe.src = newUrl; // Embed the video ID in the URL.
    iframe.width = "100%"; // Use all the provided space.
    iframe.height = "480px"; // Set a reasonable default height.

    // Replace the old player with the embedded one.
    oldPlayer.replaceWith(iframe);
}