let timerInterval;
let totalSeconds = 0;
let studyGoalInSeconds = 0;
let progressPercentage = 0;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const progressMessage = document.getElementById('progressMessage');
const studyGoalInput = document.getElementById('studyGoal');
const setGoalBtn = document.getElementById('setGoalBtn');
const goalStatus = document.getElementById('goalStatus');

// Start the timer and update the progress
function startTimer() {
    if (studyGoalInSeconds === 0) {
        alert('Please set a study goal first.');
        return;
    }

    timerInterval = setInterval(() => {
        totalSeconds++;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        timerDisplay.innerHTML = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        // Update progress
        updateProgress();
    }, 1000);

    startBtn.disabled = true;
    stopBtn.disabled = false;
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Set the study goal and reset the progress
function setGoal() {
    const studyGoal = parseInt(studyGoalInput.value);

    if (isNaN(studyGoal) || studyGoal <= 0) {
        alert('Please enter a valid number of hours.');
        return;
    }

    studyGoalInSeconds = studyGoal * 3600; // Convert hours to seconds
    goalStatus.innerHTML = `Goal set to ${studyGoal} hour(s).`;
    progressMessage.innerHTML = '';
    resetProgress();
}

// Update the progress bar
function updateProgress() {
    if (studyGoalInSeconds === 0) return;

    progressPercentage = (totalSeconds / studyGoalInSeconds) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // If goal is reached
    if (progressPercentage >= 100) {
        clearInterval(timerInterval);
        progressMessage.innerHTML = 'Congratulations! You have reached your goal!';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// Reset the progress bar and totalSeconds
function resetProgress() {
    totalSeconds = 0;
    progressPercentage = 0;
    progressBar.style.width = '0%';
}

// Pad function to format time
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
setGoalBtn.addEventListener('click', setGoal);
