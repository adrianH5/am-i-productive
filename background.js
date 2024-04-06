let websiteTime = {};
let trackedWebsites = {};

function getDomain(url) {
    return new URL(url).hostname;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "getWebsiteTime") {
        chrome.storage.local.get(['websiteTime'], function(result) {
            sendResponse({websiteTime: result.websiteTime});
        });
    } else if (request.type === "updateTrackedWebsites") {
        chrome.storage.local.get(['trackedWebsites'], function(result) {
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            trackedWebsites[request.domain] = request.isTracked;
            chrome.storage.local.set({trackedWebsites: trackedWebsites});
        });
    } else if (request.type === "deleteWebsite") {
        chrome.storage.local.get(['websiteTime', 'trackedWebsites'], function(result) {
            websiteTime = result.websiteTime ? result.websiteTime : {};
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            delete websiteTime[request.domain];
            delete trackedWebsites[request.domain];
            chrome.storage.local.set({websiteTime: websiteTime, trackedWebsites: trackedWebsites});
        });
    } else if (request.type === "addWebsite") {
        chrome.storage.local.get(['websiteTime', 'trackedWebsites'], function(result) {
            websiteTime = result.websiteTime ? result.websiteTime : {};
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            trackedWebsites[request.domain] = true;
            if (!websiteTime[request.domain]) {
                websiteTime[request.domain] = 0;
            }
            chrome.storage.local.set({websiteTime: websiteTime, trackedWebsites: trackedWebsites}, () => {
                // Send a response when the operation is completed
                sendResponse({status: "completed"});
            });
        });
    } else if (request.type === "toggleTracking") {
        chrome.storage.local.get(['trackedWebsites'], function(result) {
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            for (let domain in trackedWebsites) {
                trackedWebsites[domain] = request.isTracked;
            }
            chrome.storage.local.set({trackedWebsites: trackedWebsites});
        });
    }
    return true; // This is required to use sendResponse asynchronously
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        chrome.storage.local.get(['websiteTime', 'trackedWebsites'], function(result) {
            websiteTime = result.websiteTime ? result.websiteTime : {};
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            let domain = getDomain(tab.url);
            if (trackedWebsites[domain]) {
                if (websiteTime[domain]) {
                    websiteTime[domain] += 1;
                } else {
                    websiteTime[domain] = 1;
                }
                chrome.storage.local.set({websiteTime: websiteTime});
            }
        });
    }
});

setInterval(() => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let domain = getDomain(tabs[0].url);
        chrome.storage.local.get(['websiteTime', 'trackedWebsites'], function(result) {
            websiteTime = result.websiteTime ? result.websiteTime : {};
            trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            if (trackedWebsites[domain]) {
                if (websiteTime[domain]) {
                    websiteTime[domain] += 1;
                } else {
                    websiteTime[domain] = 1;
                }
                chrome.storage.local.set({websiteTime: websiteTime});
            }
        });
    });
}, 1000);

