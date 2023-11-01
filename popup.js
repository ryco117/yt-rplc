// Get the checkbox element.
const checkbox = document.getElementById('toggle');

// Set the initial state of the checkbox.
chrome.storage.sync.get('replacePlayer').then((data) => {
    checkbox.checked = data.replacePlayer;
}).catch((error) => {
    console.error(`Failed to get yt-rplc toggle state: ${error}`);
});

// When the checkbox changes, save the state.
checkbox.addEventListener('change', function() {
    // Reset the tab state map so that changes can take effect for the same URL.
    chrome.storage.session.set({ tabStateMap: {} }).catch((error) => {
        console.error(`Failed to reset yt-rplc state: ${error}`);
    });

    // Save the new toggle state.
    chrome.storage.sync.set({replacePlayer: this.checked}).catch((error) => {
        console.error(`Failed to apply yt-rplc toggle change: ${error}`);
    });
});