//This code was created with the aid of Microsoft Copilot
//Reference: code generated December 1, 2024
// Function to handle timer creation
document.getElementById('createTimerForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const timerName = document.getElementById('timerName').value;
    const timerDate = document.getElementById('timerDate').value;

    const timers = JSON.parse(localStorage.getItem('timers')) || [];
    const newTimer = { id: Date.now(), timerName, timerDate };
    timers.push(newTimer);
    localStorage.setItem('timers', JSON.stringify(timers));
  
    loadTimers();
});

// Function to load all timers
function loadTimers() {
    const timers = JSON.parse(localStorage.getItem('timers')) || [];
    const timersDiv = document.getElementById('timers');
    timersDiv.innerHTML = '';
    timers.forEach(timer => {
        const timerElement = document.createElement('div');
        timerElement.className = 'timer-box';
        timerElement.id = `timer-${timer.id}`;
        timerElement.innerHTML = `
            <div class="timer-title">${timer.timerName}</div>
            <div class="timer-countdown" id="countdown-${timer.id}"></div>
            <button onclick="editTimer(${timer.id}, '${timer.timerName}', '${timer.timerDate}')">Edit</button>
            <button onclick="deleteTimer(${timer.id})">Delete</button>
        `;
        timersDiv.appendChild(timerElement);
        startCountdown(timer.id, timer.timerDate);
    });
}

// Function to start countdown
function startCountdown(timerId, endDate) {
    const countdownElement = document.getElementById(`countdown-${timerId}`);
    const endTime = new Date(endDate).getTime();
    
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            clearInterval(interval);
            countdownElement.innerHTML = "EXPIRED";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((distance % 1000) / 10); // Displaying two decimal places for milliseconds

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s ${milliseconds}`;
    }, 10); // Updating every 10 milliseconds
}

// Function to edit a timer
function editTimer(timerId, currentName, currentDate) {
    const newTimerName = prompt('Name your timer:', currentName);
    const newTimerDate = prompt('When will your event take place?:', currentDate);

    if (newTimerName && newTimerDate) {
        const timers = JSON.parse(localStorage.getItem('timers')) || [];
        const timerIndex = timers.findIndex(timer => timer.id === timerId);
        if (timerIndex > -1) {
            timers[timerIndex] = { id: timerId, timerName: newTimerName, timerDate: newTimerDate };
            localStorage.setItem('timers', JSON.stringify(timers));
            loadTimers();
        }
    }
}

// Function to delete a timer
function deleteTimer(timerId) {
    if (confirm('ATTENTION: You are about to delete this timer!')) {
        const timers = JSON.parse(localStorage.getItem('timers')) || [];
        const updatedTimers = timers.filter(timer => timer.id !== timerId);
        localStorage.setItem('timers', JSON.stringify(updatedTimers));
        loadTimers();
    }
}

// Load timers when the page loads
window.onload = loadTimers;
