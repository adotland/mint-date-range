chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlPrefix: "https://wwws.mint.com/" }
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlPrefix: "https://mint.intuit.com/" }
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        css: ['a[href$="transaction.event"].selected']
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        css: [".TransactionPageView"]
                    })
                ],
                actions: [ new chrome.declarativeContent.ShowPageAction() ]
            }
        ]);
    });
});
