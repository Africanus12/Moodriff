document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp();
});

function initApp() {
    // Initialize navigation
    Navigation.init();
    
    // Initialize database
    Database.init();
    
    // Initialize user progress
    UserProgress.loadUserProgress();
    
    // Initialize the audio visualizer
    Visualizer.init();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load riffs from database
    loadSavedRiffs();
    
    // Initialize daily challenge
    initDailyChallenge();
    
    // Initialize mood diary chart
    initMoodDiaryChart();
    
    // Check if we need to show the level up modal
    checkForLevelUp();
}

function setupEventListeners() {
    // Home screen event listeners
    setupHomeScreenListeners();
    
    // Riff screen event listeners
    setupRiffScreenListeners();
    
    // Library screen event listeners
    setupLibraryScreenListeners();
    
    // Challenge screen event listeners
    document.getElementById('daily-challenge-button').addEventListener('click', () => {
        Navigation.navigateTo('challenge-screen');
    });
    
    // Level system screen event listeners
    document.getElementById('level-progress-button').addEventListener('click', () => {
        Navigation.navigateTo('level-screen');
    });
    
    // Back button event listener
    document.getElementById('back-button').addEventListener('click', () => {
        Navigation.goBack();
    });
    
    // Level up modal close button
    document.getElementById('close-level-modal').addEventListener('click', () => {
        document.getElementById('level-up-modal').classList.remove('show');
    });
}

function setupHomeScreenListeners() {
    // Mood selection buttons
    const moodButtons = document.querySelectorAll('.mood-button');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deselect all mood buttons
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Select the clicked button
            button.classList.add('selected');
            
            // Enable the "Make Riff" button
            document.getElementById('make-riff-button').disabled = false;
            
            // Store the selected mood
            const selectedMood = button.getAttribute('data-mood');
            Models.setSelectedMood(selectedMood);
        });
    });
    
    // Make riff button
    document.getElementById('make-riff-button').addEventListener('click', () => {
        // Navigate to the riff screen
        Navigation.navigateTo('riff-screen');
        
        // Start generating the riff
        const selectedMood = Models.getSelectedMood();
        if (selectedMood) {
            document.getElementById('selected-mood-name').textContent = Models.getMoods()[selectedMood].displayName;
            generateRiff(selectedMood);
        }
    });
}

function setupRiffScreenListeners() {
    // Play/Pause button
    const playPauseButton = document.getElementById('play-pause-button');
    
    playPauseButton.addEventListener('click', () => {
        if (ToneHelper.isPlaying()) {
            ToneHelper.pause();
            playPauseButton.innerHTML = '<i class="bi bi-play-fill"></i>';
            Visualizer.stop();
        } else {
            ToneHelper.play();
            playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
            Visualizer.start();
        }
    });
    
    // Save button
    document.getElementById('save-button').addEventListener('click', () => {
        saveCurrentRiff();
    });
    
    // Share button
    document.getElementById('share-button').addEventListener('click', () => {
        shareCurrentRiff();
    });
    
    // Effect controls
    document.getElementById('reverb-control').addEventListener('input', (e) => {
        ToneHelper.setReverbAmount(parseFloat(e.target.value));
    });
    
    document.getElementById('echo-control').addEventListener('input', (e) => {
        ToneHelper.setEchoAmount(parseFloat(e.target.value));
    });
    
    document.getElementById('phaser-control').addEventListener('input', (e) => {
        ToneHelper.setPhaserAmount(parseFloat(e.target.value));
    });
}

function setupLibraryScreenListeners() {
    // Each riff item will have event listeners added when they are created
    // See the updateLibraryUI function
}

function generateRiff(moodName) {
    // Reset the play/pause button
    const playPauseButton = document.getElementById('play-pause-button');
    playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
    
    // Create a new riff based on the selected mood
    ToneHelper.stopCurrentRiff();
    ToneHelper.createRiff(moodName);
    ToneHelper.play();
    
    // Start the visualizer
    Visualizer.start();
}

async function saveCurrentRiff() {
    const selectedMood = Models.getSelectedMood();
    if (!selectedMood) return;
    
    const mood = Models.getMoods()[selectedMood];
    
    // Create a new riff entity
    const riff = {
        id: Date.now(), // Use timestamp as ID
        moodName: selectedMood,
        timestamp: Date.now(),
        durationSeconds: 30
    };
    
    // Save to database
    try {
        await Database.saveRiff(riff);
        
        // Update user progress
        UserProgress.recordRiffCreation();
        
        // Show notification
        showNotification('Riff saved successfully!');
        
        // Update the library UI if we are on the library screen
        if (document.getElementById('library-screen').classList.contains('active')) {
            loadSavedRiffs();
        }
        
        // Check if this completes a daily challenge
        checkDailyChallengeCompletion(selectedMood);
    } catch (error) {
        console.error('Error saving riff:', error);
        showNotification('Error saving riff!', true);
    }
}

function shareCurrentRiff() {
    // In a web context, this might just copy a link to the clipboard
    // For demonstration, we'll just show a notification
    showNotification('Sharing feature would open native share UI');
    
    // Update user progress for sharing
    UserProgress.recordRiffShare();
}

async function loadSavedRiffs() {
    try {
        const riffs = await Database.getAllRiffs();
        updateLibraryUI(riffs);
    } catch (error) {
        console.error('Error loading riffs:', error);
        showNotification('Error loading your riffs!', true);
    }
}

function updateLibraryUI(riffs) {
    const riffList = document.getElementById('riff-list');
    const emptyState = document.getElementById('library-empty-state');
    
    // Clear the current list
    riffList.innerHTML = '';
    
    if (riffs.length === 0) {
        // Show empty state
        emptyState.style.display = 'flex';
        return;
    }
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Add each riff to the list
    riffs.forEach(riff => {
        const moodDisplayName = Models.getMoods()[riff.moodName]?.displayName || riff.moodName;
        const date = new Date(riff.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const listItem = document.createElement('li');
        listItem.className = 'riff-item';
        listItem.setAttribute('data-id', riff.id);
        
        listItem.innerHTML = `
            <div class="riff-item-info">
                <span class="riff-name">${moodDisplayName} Riff</span>
                <span class="riff-date">${formattedDate}</span>
            </div>
            <div class="riff-actions">
                <button class="riff-action-button play-riff">
                    <i class="bi bi-play-fill"></i>
                </button>
                <button class="riff-action-button share-riff">
                    <i class="bi bi-share"></i>
                </button>
                <button class="riff-action-button delete-riff">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        riffList.appendChild(listItem);
        
        // Add event listeners to the buttons
        listItem.querySelector('.play-riff').addEventListener('click', () => {
            playRiff(riff);
        });
        
        listItem.querySelector('.share-riff').addEventListener('click', () => {
            shareRiff(riff);
        });
        
        listItem.querySelector('.delete-riff').addEventListener('click', () => {
            deleteRiff(riff);
        });
    });
}

function playRiff(riff) {
    // Navigate to riff screen
    Navigation.navigateTo('riff-screen');
    
    // Set the selected mood
    Models.setSelectedMood(riff.moodName);
    document.getElementById('selected-mood-name').textContent = Models.getMoods()[riff.moodName].displayName;
    
    // Generate and play the riff
    generateRiff(riff.moodName);
}

function shareRiff(riff) {
    // For demonstration, just show a notification
    showNotification(`Sharing ${Models.getMoods()[riff.moodName].displayName} Riff`);
    
    // Update user progress for sharing
    UserProgress.recordRiffShare();
}

async function deleteRiff(riff) {
    try {
        await Database.deleteRiff(riff.id);
        
        // Update the UI
        loadSavedRiffs();
        
        // Show notification
        showNotification('Riff deleted successfully!');
    } catch (error) {
        console.error('Error deleting riff:', error);
        showNotification('Error deleting riff!', true);
    }
}

function showNotification(message, isError = false) {
    const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    
    messageElement.textContent = message;
    
    if (isError) {
        toast.style.backgroundColor = 'var(--md-error)';
    } else {
        toast.style.backgroundColor = 'var(--md-primary)';
    }
    
    toast.classList.add('show');
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function initDailyChallenge() {
    // Get the current challenge from local storage or create a new one
    const challenge = UserProgress.getDailyChallenge();
    
    // Update the UI
    document.getElementById('challenge-description').textContent = challenge.description;
    document.getElementById('challenge-reward').textContent = `+${challenge.xpReward} XP`;
    
    if (challenge.completed) {
        document.getElementById('challenge-status-text').textContent = 'Completed';
        document.getElementById('challenge-status-text').parentElement.style.backgroundColor = 'var(--mood-calm)';
    } else {
        document.getElementById('challenge-status-text').textContent = 'Not Completed';
        document.getElementById('challenge-status-text').parentElement.style.backgroundColor = 'var(--md-primary-container)';
    }
}

function checkDailyChallengeCompletion(moodName) {
    // Check if the current riff completes the daily challenge
    const challenge = UserProgress.getDailyChallenge();
    
    if (!challenge.completed && challenge.targetMood === moodName) {
        // Mark as completed
        UserProgress.completeDailyChallenge();
        
        // Show notification
        showNotification('Daily Challenge Completed! +' + challenge.xpReward + ' XP');
        
        // Update the challenge UI if we're on that screen
        if (document.getElementById('challenge-screen').classList.contains('active')) {
            initDailyChallenge();
        }
    }
}

function initMoodDiaryChart() {
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    // Get user mood history
    const moodData = UserProgress.getMoodHistory();
    
    // Prepare data for chart
    const labels = moodData.dates;
    const datasets = [
        {
            label: 'Mood',
            data: moodData.counts,
            backgroundColor: [
                'rgba(79, 195, 247, 0.5)', // Chill - Blue
                'rgba(255, 138, 101, 0.5)', // Hype - Orange
                'rgba(165, 214, 167, 0.5)', // Calm - Green
                'rgba(186, 104, 200, 0.5)'  // Wild - Purple
            ],
            borderColor: [
                'rgb(79, 195, 247)',
                'rgb(255, 138, 101)',
                'rgb(165, 214, 167)',
                'rgb(186, 104, 200)'
            ],
            borderWidth: 1
        }
    ];
    
    // Create chart
    const moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Riffs'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mood'
                    }
                }
            }
        }
    });
}

function checkForLevelUp() {
    const levelUpInfo = UserProgress.checkForLevelUp();
    
    if (levelUpInfo.leveledUp) {
        showLevelUpModal(levelUpInfo.newLevel, levelUpInfo.reward);
    }
}

function showLevelUpModal(level, reward) {
    const modal = document.getElementById('level-up-modal');
    const newLevelSpan = document.getElementById('new-level');
    const levelRewardSpan = document.querySelector('#level-reward span');
    
    // Set the text
    newLevelSpan.textContent = `Level ${level}`;
    levelRewardSpan.textContent = reward;
    
    // Show the modal
    modal.classList.add('show');
    
    // Play animation
    const animation = lottie.loadAnimation({
        container: document.getElementById('level-up-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets2.lottiefiles.com/packages/lf20_touohxv0.json' // Trophy/celebration animation
    });
}
