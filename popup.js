
let addButton = document.createElement('button');
addButton.textContent = 'Add Current Website';
addButton.className = 'add-button'; // Apply the new class
document.body.appendChild(addButton);

// Add an event listener to the button
addButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let domain = new URL(tabs[0].url).hostname;
        chrome.runtime.sendMessage({type: "addWebsite", domain: domain}, (response) => {
            // Call the updateWebsiteTime function inside the callback function
            if (response.status === "completed") {
                updateWebsiteTime();
            }
        });
    });
});

function toggleTrackingStatus(trackButton, trackedWebsites) {
    let newIsTracked = trackButton.textContent === 'Track';

    chrome.runtime.sendMessage({type: "toggleTracking", isTracked: newIsTracked});

    for (let domain in trackedWebsites) {
        trackedWebsites[domain] = newIsTracked;

        if (domain in domainParagraphs) {
            let p = domainParagraphs[domain];
            let checkbox = p.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = newIsTracked;
            }
        }
    }

    trackButton.textContent = newIsTracked ? 'Untrack' : 'Track';
}

chrome.storage.local.get(['trackedWebsites'], function(result) {
    let trackedWebsites = result.trackedWebsites ? result.trackedWebsites : {};

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let domain = new URL(tabs[0].url).hostname;

        let p = document.createElement('p');
        p.className = 'fade-in';

        let trackButton = document.createElement('button');
        trackButton.className = 'track-button';
        trackButton.textContent = trackedWebsites[domain] ? 'Untrack' : 'Track';
        trackButton.addEventListener('click', () => toggleTrackingStatus(trackButton, trackedWebsites));
        p.appendChild(trackButton);

        document.body.appendChild(p);
    });
});

function openTab(tabId, elmnt) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    let tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    document.getElementById(tabId).style.display = "block";
    elmnt.style.backgroundColor = "#ccc";

    // Get the add button and track button
    let addButton = document.querySelector('.add-button');
    let trackButton = document.querySelector('.track-button');
    // Get downloadcsv button
    let downloadCSVButton = document.getElementById('downloadCSV');


    // If the tabId is 'studyTimer', hide the buttons, otherwise show them
    if (tabId === 'studyTimer') {
        let hoursInput = document.querySelector('#hours'); // Get the hours input field
        let minutesInput = document.querySelector('#minutes'); // Get the minutes input field
        let secondsInput = document.querySelector('#seconds'); // Get the seconds input field

        let hours = parseInt(hoursInput.value) || 0; // Get the hours from the input field
        let minutes = parseInt(minutesInput.value) || 0; // Get the minutes from the input field
        let seconds = parseInt(secondsInput.value) || 0; // Get the seconds from the input field

        let initialTimeInSeconds = hours * 3600 + minutes * 60 + seconds; // Convert the time to seconds
        let timerElement = document.getElementById('timer');
        timerElement.textContent = initialTimeInSeconds ? initialTimeInSeconds : '00:00:00'; // Use the initial time if it's set

        if (addButton) addButton.style.display = 'none';
        if (trackButton) trackButton.style.display = 'none';
        if (downloadCSVButton) downloadCSVButton.style.display = 'none';

    } else {
        if (addButton) addButton.style.display = 'block';
        if (trackButton) trackButton.style.display = 'block';
        if (downloadCSVButton) downloadCSVButton.style.display = 'inline-block';

    }
}

document.getElementById('websiteTimeButton').addEventListener('click', function() {
    openTab('websiteTime', this);
});

document.getElementById('studyTimerButton').addEventListener('click', function() {
    openTab('studyTimer', this);
});

// Hide all elements with class="tabcontent"
let tabcontent = document.getElementsByClassName("tabcontent");
for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
}

// Show the specific tab content you want to display first
document.getElementById('websiteTime').style.display = "block";

document.getElementById('downloadCSV').addEventListener('click', function() {
    // Get the websiteTime data from storage
    chrome.storage.local.get(['websiteTime'], function(result) {
        let websiteTime = result.websiteTime ? result.websiteTime : {};

        // Format the data for the CSV file
        let data = [['Website', 'Time Spent']];
        for (let domain in websiteTime) {
            let timeSpent = formatStudyTimer(websiteTime[domain]);
            data.push([domain, timeSpent]);
        }

        // Call the downloadCSV function
        downloadCSV(data, 'website_time.csv');
    });
});
