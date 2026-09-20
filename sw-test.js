console.log('sw-test.js')

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
    console.log('moved', tabId)
})

browser.tabs.onActivated.addListener(getCurrentTab);

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await browser.tabs.query(queryOptions);
    return tab;
}
