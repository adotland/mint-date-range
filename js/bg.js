function onWebNav(details) {
    if (details.frameId === 0 && details.url.indexOf("transaction.event") !== -1) {
        chrome.pageAction.show(details.tabId);
    } else {
        chrome.pageAction.hide(details.tabId);
    }
}

var filter = {
    url: [{
        urlMatches: "https://wwws.mint.com/"
    }]
};

chrome.webNavigation.onCommitted.addListener(onWebNav, filter);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNav, filter);
