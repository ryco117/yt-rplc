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
    chrome.storage.session.set({ tabUrls: {} }).catch((error) => {
        console.error(`Failed to reset yt-rplc state: ${error}`);
    });

    chrome.storage.sync.set({replacePlayer: this.checked}).catch((error) => {
        console.error(`Failed to apply yt-rplc toggle change: ${error}`);
    });
});