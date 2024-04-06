function formatStudyTimer(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;

    // Pad the hours, minutes, and seconds with leading zeros if they are less than 10
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds;
}

function startTimer(duration, display) {
    let time = duration;
    timer = setInterval(() => {
        display.textContent = formatStudyTimer(time);

        if (--time < 0) {
            clearInterval(timer);
            isBreak = !isBreak;
            if (isBreak) {
                startTimer(breakTime, display);
            } else {
                startTimer(studyTime, display);
            }
        }
    }, 1000);
}

// ... rest of your code ...
window.onload = function () {
    let display = document.querySelector('#timer');
    let startButton = document.querySelector('#startButton');
    let resetButton = document.querySelector('#resetButton');
    let hoursInput = document.querySelector('#hours'); // Get the hours input field
    let minutesInput = document.querySelector('#minutes'); // Get the minutes input field
    let secondsInput = document.querySelector('#seconds'); // Get the seconds input field

    startButton.onclick = function() {
        let hours = parseInt(hoursInput.value) || 0; // Get the hours from the input field
        let minutes = parseInt(minutesInput.value) || 0; // Get the minutes from the input field
        let seconds = parseInt(secondsInput.value) || 0; // Get the seconds from the input field
        let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds; // Convert the time to seconds

        startTimer(totalTimeInSeconds, display); // Start the timer with the total time
        this.disabled = true;
    };

    resetButton.onclick = function() {
        clearInterval(timer);
        let hours = parseInt(hoursInput.value) || 0; // Get the hours from the input field
        let minutes = parseInt(minutesInput.value) || 0; // Get the minutes from the input field
        let seconds = parseInt(secondsInput.value) || 0; // Get the seconds from the input field
        let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds; // Convert the time to seconds

        display.textContent = formatStudyTimer(totalTimeInSeconds); // Format the initial time and set it as the text content of the display
        startButton.disabled = false;
        isBreak = false;
    };
};