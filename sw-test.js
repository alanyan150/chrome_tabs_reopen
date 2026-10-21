console.log('sw-test.js')

let isPrivate = browser.extension.inIncognitoContext
console.log('isPrivate', isPrivate)
const storagePrefix = isPrivate ? "incognito" : "regular"
const closedTabsKey = `${storagePrefix}ClosedTabs`
const tabMapKey = `${storagePrefix}TabMap`
const storageReady = browser.storage.local.remove(["closedTabs", "tabMap"])

browser.commands.onCommand.addListener(handleCommand)
async function handleCommand(command) {
    await storageReady
    if (command !== "reopen-tab") {
        return
    }

    console.log('[handleCommand]', command)
    const res = await browser.storage.local.get(closedTabsKey)
    const closedTabs = res[closedTabsKey] ?? []
    if (closedTabs && closedTabs.length !== 0) {
        browser.tabs.create({
            url: closedTabs.pop()
        })
    } else {
        console.log('[handleCommand] no closed tabs')
    }

    await browser.storage.local.set({
        [closedTabsKey]: closedTabs
    })
}

browser.tabs.onUpdated.addListener(handleUpdated)
async function handleUpdated(tabId, changeInfo, tab) {
    await storageReady
    // Note: this event is fired twice:
    // Once with `changeInfo.status` = "loading" and another time with "complete"
    const res = await browser.storage.local.get(tabMapKey)
    const tabMap = res[tabMapKey] ?? {}
    tabMap[tabId] = tab.url

    await browser.storage.local.set({
        [tabMapKey]: tabMap
    })
}

browser.tabs.onRemoved.addListener(handleRemoved)
async function handleRemoved(tabId, removeInfo) {
    await storageReady
    console.log(`Tab: ${tabId} is closing`);
    // console.log(`Window ID: ${removeInfo.windowId}`);
    // console.log(`Window is closing: ${removeInfo.isWindowClosing}`);
    const res1 = await browser.storage.local.get(tabMapKey)
    const tabMap = res1[tabMapKey] ?? {}
    const res2 = await browser.storage.local.get(closedTabsKey)
    const closedTabs = res2[closedTabsKey] ?? []
    const tabUrl = tabMap[tabId]
    if (tabUrl) {
        closedTabs.push(tabUrl);
        delete tabMap[tabId]
    } else {
        console.log('no url closed')
    }

    await browser.storage.local.set({
        [tabMapKey]: tabMap,
        [closedTabsKey]: closedTabs
    })
}
