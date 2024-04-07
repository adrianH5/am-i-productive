let domainParagraphs = {};

function formatWebsiteTime(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = time % 60;
    let timeString = `You have spent `;
    if (hours > 0) {
        timeString += `${hours} hours, `;
    }
    if (minutes > 0 || hours > 0) {
        timeString += `${minutes} minutes and `;
    }
    timeString += `${seconds} seconds on `;
    return timeString;
}

function createParagraph(domain, timeString, trackedWebsites) {
    let p = document.createElement('p');
    p.className = 'fade-in';
    let domainSpan = document.createElement('span');
    domainSpan.className = 'domain';
    domainSpan.textContent = domain;
    p.appendChild(document.createTextNode(timeString));
    p.appendChild(domainSpan);
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = trackedWebsites[domain] ? trackedWebsites[domain] : false;
    checkbox.addEventListener('change', function() {
        chrome.runtime.sendMessage({type: "updateTrackedWebsites", domain: domain, isTracked: this.checked});
    });
    p.appendChild(checkbox);
    let deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    //deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({type: "deleteWebsite", domain: domain});
        p.remove();
        delete domainParagraphs[domain]; // Delete the reference to the paragraph element
    });
    p.appendChild(deleteButton);
    return p;
}

function updateParagraph(domain, timeString) {
    domainParagraphs[domain].childNodes[0].nodeValue = timeString;
}

function updateWebsiteTime() {
    chrome.runtime.sendMessage({type: "getWebsiteTime"}, response => {
        let websiteTimeDiv = document.getElementById('websiteTime');
        chrome.storage.local.get(['trackedWebsites'], function(result) {
            let trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};
            for (let domain in response.websiteTime) {
                let time = response.websiteTime[domain];
                let timeString = formatWebsiteTime(time);
                if (domain in domainParagraphs) {
                    updateParagraph(domain, timeString);
                } else {
                    let p = createParagraph(domain, timeString, trackedWebsites);
                    websiteTimeDiv.appendChild(p);
                    domainParagraphs[domain] = p;
                }
            }
        });
    });
}

updateWebsiteTime();
setInterval(updateWebsiteTime, 1000);