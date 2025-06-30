// Initialize the tabStateMap object.
chrome.storage.session.set({ tabStateMap: {} }).catch((error) => {
    console.error(`Failed to initialize yt-rplc state: ${error}`);
});

const regex = /^https:\/\/www\.youtube\.com(\/watch\?v=(?<video>[a-zA-Z0-9_-]+))?/;

// Listen for tab URL changes.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.session.get('tabStateMap').then((data) => {
            let state = data.tabStateMap[tabId] || {};

            // Update to the current URL.
            state.url = tab.url;

            // Update the state for this tab.
            data.tabStateMap[tabId] = state;
            chrome.storage.session.set(data).catch((error) => {
                console.error(`Failed to set yt-rplc state: ${error}`);
            });

            const match = regex.exec(tab.url);
            if (match) {
                const capturedVideoId = match.groups?.video; // Match the video ID.

                if (!capturedVideoId) {
                    setTimeout(() => {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            function: removeHomeAds,
                        }).catch((error) => {
                            console.error(`Failed to execute script: ${error}`);
                        });
                    }, 1200); // Remove ads after a short delay.

                    return; // If no video ID is captured, exit early.
                }

                const newUrl = `https://www.youtube.com/embed/${capturedVideoId}`; // Create the new URL.
                chrome.storage.sync.get('replacePlayer').then((data) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        function: data.replacePlayer ? replacePlayer : redirect,
                        args: [newUrl]
                    }).catch((error) => {
                        console.error(`Failed to execute script: ${error}`);
                    });
                });
            }
        }).catch((error) => {
            console.error(`Failed to get yt-rplc state: ${error}`);
        });
    }
});

// Helper to redirect the tab webpage.
function redirect(newUrl) {
    window.location.replace(newUrl);
}

// Helper to replace the player.
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

// Helper to remove ads from the home page.
function removeHomeAds() {
    if (window.ytRplcAdInterval) {
        console.log('Ad removal interval already created.');
        return; // Prevent multiple intervals.
    }

    window.ytRplcAdInterval = setInterval(() => {
        console.log('Removing home ads...');

        // Find the relevant elements.
        document
            .querySelectorAll('ytd-rich-item-renderer')
            .forEach(d => {
                if (d.querySelector('ytd-ad-slot-renderer')) {
                    console.log('Removing ad');
                    d.parentNode.removeChild(d); // Remove the ad element.
                }
            });
    }, 3000); // Check every few seconds.
}