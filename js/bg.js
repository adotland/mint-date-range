function onWebNav(details) {
    if (details.frameId === 0) {
        // Top-level frame
        chrome.pageAction.show(details.tabId);
    }
}
var filter = {
    url: [{
        urlMatches: "wwws.mint.com/transaction.event"
    }]
};
chrome.webNavigation.onCommitted.addListener(onWebNav, filter);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNav, filter);