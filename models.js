/**
 * Models module for data structures and enums used in the app
 */
const Models = (function() {
    // Current selected mood
    let selectedMood = null;
    
    /**
     * Enum for moods - similar to the Kotlin enum in the original specs
     * Each mood has properties that affect how riffs are generated
     */
    const Moods = {
        CHILL: {
            name: 'CHILL',
            displayName: 'Chill',
            baseFrequencyHz: 440,
            speedFactor: 0.7,
            isRandom: false,
            volume: -10,
            detune: 0
        },
        HYPE: {
            name: 'HYPE',
            displayName: 'Hype',
            baseFrequencyHz: 880,
            speedFactor: 1.5,
            isRandom: false,
            volume: -8,
            detune: 200
        },
        CALM: {
            name: 'CALM',
            displayName: 'Calm',
            baseFrequencyHz: 220,
            speedFactor: 0.5,
            isRandom: false,
            volume: -12,
            detune: -100
        },
        WILD: {
            name: 'WILD',
            displayName: 'Wild',
            baseFrequencyHz: 440,
            speedFactor: 1.2,
            isRandom: true,
            volume: -10,
            detune: 0
        }
    };
    
    /**
     * Riff model structure - similar to RiffEntity in the Kotlin code
     * @typedef {Object} Riff
     * @property {number} id - Unique identifier
     * @property {string} moodName - Name of the mood
     * @property {number} timestamp - Creation time
     * @property {number} durationSeconds - Duration in seconds
     */
    
    /**
     * User progress model
     * @typedef {Object} UserProgress
     * @property {number} xp - Experience points
     * @property {number} level - User level
     * @property {number} streak - Current streak
     */
    
    /**
     * Challenge model
     * @typedef {Object} Challenge
     * @property {string} description - Challenge description
     * @property {string} targetMood - Target mood to create
     * @property {number} xpReward - XP reward for completion
     * @property {boolean} completed - Whether the challenge is completed
     * @property {string} date - Challenge date
     */
    
    /**
     * Set the selected mood
     * @param {string} moodName - Name of the mood
     */
    function setSelectedMood(moodName) {
        selectedMood = moodName;
    }
    
    /**
     * Get the selected mood
     * @returns {string} Name of the selected mood
     */
    function getSelectedMood() {
        return selectedMood;
    }
    
    /**
     * Get all moods
     * @returns {Object} Map of mood names to mood objects
     */
    function getMoods() {
        return Moods;
    }
    
    // Public API
    return {
        setSelectedMood,
        getSelectedMood,
        getMoods
    };
})();
