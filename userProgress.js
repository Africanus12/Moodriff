/**
 * UserProgress module for handling user progress, streaks, levels, and challenges
 */
const UserProgress = (function() {
    // Constants for XP and leveling
    const XP_PER_RIFF = 10;
    const XP_PER_SHARE = 25;
    const XP_PER_CHALLENGE = 50;
    const XP_PER_LEVEL = 100;
    
    // User progress data
    let userProgress = {
        xp: 0,
        level: 1,
        streak: 0,
        lastRiffDate: null,
        moodHistory: {},
        challengesCompleted: 0
    };
    
    // Current daily challenge
    let dailyChallenge = {
        description: "",
        targetMood: "",
        xpReward: 0,
        completed: false,
        date: ""
    };
    
    // Level up detection
    let levelUpDetected = false;
    let newLevel = 0;
    let levelReward = "";
    
    /**
     * Load user progress from localStorage
     */
    function loadUserProgress() {
        const savedProgress = localStorage.getItem('userProgress');
        if (savedProgress) {
            userProgress = JSON.parse(savedProgress);
            
            // Check streak continuation
            checkStreakContinuation();
        }
        
        // Load or create daily challenge
        loadDailyChallenge();
        
        // Update UI elements
        updateUIElements();
    }
    
    /**
     * Save user progress to localStorage
     */
    function saveUserProgress() {
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
        updateUIElements();
    }
    
    /**
     * Check if the streak is still active or if it was broken
     */
    function checkStreakContinuation() {
        if (!userProgress.lastRiffDate) return;
        
        const today = new Date();
        const lastDate = new Date(userProgress.lastRiffDate);
        
        // Reset date parts to compare only the days
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            // Streak broken
            userProgress.streak = 0;
            saveUserProgress();
        }
    }
    
    /**
     * Update UI elements with current progress
     */
    function updateUIElements() {
        // Update streak counter
        const streakElement = document.getElementById('streak-count');
        if (streakElement) {
            streakElement.textContent = `${userProgress.streak} Days Streak`;
        }
        
        // Update level display
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = `Level ${userProgress.level}`;
        }
        
        // Update level screen if it exists
        const userLevelElement = document.getElementById('user-level');
        const currentXpElement = document.getElementById('current-xp');
        const nextLevelXpElement = document.getElementById('next-level-xp');
        const xpProgressFill = document.getElementById('xp-progress-fill');
        
        if (userLevelElement && currentXpElement && nextLevelXpElement && xpProgressFill) {
            userLevelElement.textContent = userProgress.level;
            currentXpElement.textContent = `${userProgress.xp} XP`;
            const nextLevelXp = userProgress.level * XP_PER_LEVEL;
            nextLevelXpElement.textContent = `${nextLevelXp} XP`;
            
            // Calculate progress percentage
            const prevLevelXp = (userProgress.level - 1) * XP_PER_LEVEL;
            const levelProgress = userProgress.xp - prevLevelXp;
            const levelProgressPercent = (levelProgress / XP_PER_LEVEL) * 100;
            
            xpProgressFill.style.width = `${levelProgressPercent}%`;
        }
    }
    
    /**
     * Record a riff creation
     * @returns {Object} Updated user progress
     */
    function recordRiffCreation(moodName) {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        // Add XP
        userProgress.xp += XP_PER_RIFF;
        
        // Track mood for history
        if (!userProgress.moodHistory) {
            userProgress.moodHistory = {};
        }
        
        if (!userProgress.moodHistory[moodName]) {
            userProgress.moodHistory[moodName] = 0;
        }
        
        userProgress.moodHistory[moodName]++;
        
        // Check streak
        if (userProgress.lastRiffDate === todayStr) {
            // Already created a riff today, streak stays the same
        } else if (!userProgress.lastRiffDate || isYesterday(userProgress.lastRiffDate)) {
            // First riff ever or continuation of streak
            userProgress.streak++;
            
            // Check for streak milestone (every 5 days)
            if (userProgress.streak % 5 === 0) {
                userProgress.xp += userProgress.streak / 5 * 25; // 25 XP per 5-day streak milestone
            }
        } else {
            // Streak broken, starting fresh
            userProgress.streak = 1;
        }
        
        // Update last riff date
        userProgress.lastRiffDate = todayStr;
        
        // Check for level up
        const previousLevel = userProgress.level;
        userProgress.level = 1 + Math.floor(userProgress.xp / XP_PER_LEVEL);
        
        if (userProgress.level > previousLevel) {
            // Level up!
            levelUpDetected = true;
            newLevel = userProgress.level;
            levelReward = getLevelReward(userProgress.level);
        }
        
        // Save progress
        saveUserProgress();
        
        return {
            xp: userProgress.xp,
            level: userProgress.level,
            streak: userProgress.streak
        };
    }
    
    /**
     * Record a riff share
     * @returns {Object} Updated user progress
     */
    function recordRiffShare() {
        // Add XP
        userProgress.xp += XP_PER_SHARE;
        
        // Check for level up
        const previousLevel = userProgress.level;
        userProgress.level = 1 + Math.floor(userProgress.xp / XP_PER_LEVEL);
        
        if (userProgress.level > previousLevel) {
            // Level up!
            levelUpDetected = true;
            newLevel = userProgress.level;
            levelReward = getLevelReward(userProgress.level);
        }
        
        // Save progress
        saveUserProgress();
        
        return {
            xp: userProgress.xp,
            level: userProgress.level,
            streak: userProgress.streak
        };
    }
    
    /**
     * Load or create the daily challenge
     */
    function loadDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if a challenge exists for today
        const savedChallenge = localStorage.getItem('dailyChallenge');
        if (savedChallenge) {
            const challenge = JSON.parse(savedChallenge);
            
            if (challenge.date === today) {
                // Use existing challenge for today
                dailyChallenge = challenge;
                return;
            }
        }
        
        // Generate a new challenge for today
        generateDailyChallenge(today);
    }
    
    /**
     * Generate a new daily challenge
     * @param {string} date - Today's date in YYYY-MM-DD format
     */
    function generateDailyChallenge(date) {
        // Get all moods
        const moods = Object.keys(Models.getMoods());
        
        // Pick a random mood
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        
        // Create challenge
        dailyChallenge = {
            description: `Create a ${Models.getMoods()[randomMood].displayName} Riff today!`,
            targetMood: randomMood,
            xpReward: XP_PER_CHALLENGE,
            completed: false,
            date: date
        };
        
        // Save to localStorage
        localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
    }
    
    /**
     * Get the current daily challenge
     * @returns {Object} The daily challenge
     */
    function getDailyChallenge() {
        return dailyChallenge;
    }
    
    /**
     * Complete the daily challenge
     */
    function completeDailyChallenge() {
        if (dailyChallenge.completed) return;
        
        // Mark as completed
        dailyChallenge.completed = true;
        
        // Award XP
        userProgress.xp += dailyChallenge.xpReward;
        userProgress.challengesCompleted = (userProgress.challengesCompleted || 0) + 1;
        
        // Check for level up
        const previousLevel = userProgress.level;
        userProgress.level = 1 + Math.floor(userProgress.xp / XP_PER_LEVEL);
        
        if (userProgress.level > previousLevel) {
            // Level up!
            levelUpDetected = true;
            newLevel = userProgress.level;
            levelReward = getLevelReward(userProgress.level);
        }
        
        // Save progress
        saveUserProgress();
        
        // Save updated challenge
        localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
    }
    
    /**
     * Get the mood history for the diary chart
     * @returns {Object} Mood history data
     */
    function getMoodHistory() {
        if (!userProgress.moodHistory) {
            return {
                dates: Object.keys(Models.getMoods()),
                counts: [0, 0, 0, 0]
            };
        }
        
        // Process mood history for chart
        const moodNames = Object.keys(Models.getMoods());
        const counts = moodNames.map(mood => userProgress.moodHistory[mood] || 0);
        
        return {
            dates: moodNames.map(mood => Models.getMoods()[mood].displayName),
            counts: counts
        };
    }
    
    /**
     * Check if a level up has been detected
     * @returns {Object} Level up information
     */
    function checkForLevelUp() {
        const result = {
            leveledUp: levelUpDetected,
            newLevel: newLevel,
            reward: levelReward
        };
        
        // Reset detection
        levelUpDetected = false;
        
        return result;
    }
    
    /**
     * Get the reward for a level
     * @param {number} level - The level number
     * @returns {string} The reward description
     */
    function getLevelReward(level) {
        switch (level) {
            case 2:
                return "Wild Mood Unlocked";
            case 3:
                return "Wave Visualizer Unlocked";
            case 5:
                return "Mood Mixer Unlocked";
            case 7:
                return "Echo Effect Unlocked";
            case 10:
                return "Master Riff Maker Badge";
            default:
                return "New Features Unlocked";
        }
    }
    
    /**
     * Check if a date is yesterday
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {boolean} True if the date is yesterday
     */
    function isYesterday(dateStr) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        yesterday.setHours(0, 0, 0, 0);
        
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);
        
        return yesterday.getTime() === checkDate.getTime();
    }
    
    // Public API
    return {
        loadUserProgress,
        recordRiffCreation,
        recordRiffShare,
        getDailyChallenge,
        completeDailyChallenge,
        getMoodHistory,
        checkForLevelUp
    };
})();
