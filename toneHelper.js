/**
 * ToneHelper module for creating and managing audio riffs
 * Uses Tone.js for audio synthesis and effects
 */
const ToneHelper = (function() {
    // Audio elements and Tone.js components
    let synth;
    let reverb;
    let feedbackDelay;
    let phaser;
    let reverbAmount = 0;
    let echoAmount = 0;
    let phaserAmount = 0;
    let currentPattern;
    let playing = false;
    let currentMood;
    
    /**
     * Initialize the ToneHelper
     */
    function init() {
        // Create synth and effects
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
        
        // Create effects
        reverb = new Tone.Reverb(3).toDestination();
        feedbackDelay = new Tone.FeedbackDelay(0.25, 0.5).toDestination();
        phaser = new Tone.Phaser({
            frequency: 0.5,
            octaves: 5,
            baseFrequency: 1000
        }).toDestination();
        
        // Connect synth through effects
        synth.disconnect();
        synth.connect(reverb);
        synth.connect(feedbackDelay);
        synth.connect(phaser);
        synth.connect(Tone.Destination);
        
        // Set default effect wet values
        reverb.wet.value = 0;
        feedbackDelay.wet.value = 0;
        phaser.wet.value = 0;
    }
    
    /**
     * Create a new riff based on the mood
     * @param {string} moodName - The name of the mood
     */
    function createRiff(moodName) {
        // Stop any existing riff
        stopCurrentRiff();
        
        // Get the mood configuration
        const moods = Models.getMoods();
        const mood = moods[moodName];
        currentMood = mood;
        
        if (!mood) {
            console.error(`Mood ${moodName} not found`);
            return;
        }
        
        // Adjust synth based on mood
        synth.set({
            volume: mood.volume,
            detune: mood.detune || 0,
            portamento: mood.speedFactor < 1 ? 0.1 : 0.05
        });
        
        // Create a pattern based on the mood
        if (mood.isRandom) {
            createRandomPattern(mood);
        } else {
            createPatternForMood(mood);
        }
    }
    
    /**
     * Create a regular pattern for a mood
     * @param {Object} mood - The mood object
     */
    function createPatternForMood(mood) {
        // Base pattern notes
        const baseNotes = determineBaseNotes(mood);
        
        // Create a sequence
        const patternInterval = (1 / mood.speedFactor) * 0.5; // Adjust timing based on speed factor
        
        currentPattern = new Tone.Sequence((time, note) => {
            synth.triggerAttackRelease(note, "8n", time);
            
            // Trigger the visualizer update
            Visualizer.updateForNote(note);
        }, baseNotes, patternInterval).start(0);
        
        // Set the BPM based on the mood's speed factor
        Tone.Transport.bpm.value = 120 * mood.speedFactor;
    }
    
    /**
     * Create a random pattern for wild mood
     * @param {Object} mood - The mood object
     */
    function createRandomPattern(mood) {
        // Create a random sequence
        const minFreq = mood.baseFrequencyHz / 2;
        const maxFreq = mood.baseFrequencyHz * 2;
        
        // For random pattern, use callback approach
        currentPattern = new Tone.Loop(time => {
            // Generate a random frequency
            const randomFreq = minFreq + Math.random() * (maxFreq - minFreq);
            const note = Tone.Frequency(randomFreq).toNote();
            
            // Sometimes add a chord or just a note
            if (Math.random() > 0.7) {
                // Play a chord
                const chordNotes = [
                    note,
                    Tone.Frequency(randomFreq * 1.25).toNote(),
                    Tone.Frequency(randomFreq * 1.5).toNote()
                ];
                synth.triggerAttackRelease(chordNotes, "16n", time);
                
                // Update visualizer
                Visualizer.updateForChord(chordNotes);
            } else {
                // Play a single note
                synth.triggerAttackRelease(note, "8n", time);
                
                // Update visualizer
                Visualizer.updateForNote(note);
            }
        }, (1 / mood.speedFactor) * 0.25).start(0);
        
        // Set a faster BPM for random patterns
        Tone.Transport.bpm.value = 160 * mood.speedFactor;
    }
    
    /**
     * Determine the base notes for a mood
     * @param {Object} mood - The mood object
     * @returns {Array} Array of notes to use in the pattern
     */
    function determineBaseNotes(mood) {
        const baseFreq = mood.baseFrequencyHz;
        let notes = [];
        
        // Convert frequency to note
        const baseNote = Tone.Frequency(baseFreq).toNote();
        
        // For "CHILL" create a calming pattern
        if (mood.name === 'CHILL') {
            notes = [
                baseNote, 
                null, 
                Tone.Frequency(baseFreq * 1.25).toNote(), 
                null,
                baseNote,
                null,
                Tone.Frequency(baseFreq * 1.5).toNote(),
                null
            ];
        } 
        // For "HYPE" create an energetic pattern
        else if (mood.name === 'HYPE') {
            notes = [
                baseNote,
                Tone.Frequency(baseFreq * 1.5).toNote(),
                baseNote,
                Tone.Frequency(baseFreq * 1.25).toNote(),
                baseNote,
                Tone.Frequency(baseFreq * 2).toNote(),
                Tone.Frequency(baseFreq * 1.5).toNote(),
                baseNote
            ];
        }
        // For "CALM" create a slow, gentle pattern
        else if (mood.name === 'CALM') {
            notes = [
                baseNote,
                null,
                null,
                Tone.Frequency(baseFreq * 1.125).toNote(),
                null,
                baseNote,
                null,
                null
            ];
        }
        // Default pattern
        else {
            notes = [
                baseNote,
                null,
                Tone.Frequency(baseFreq * 1.25).toNote(),
                null,
                Tone.Frequency(baseFreq * 1.5).toNote(),
                null,
                Tone.Frequency(baseFreq * 1.25).toNote(),
                null
            ];
        }
        
        return notes;
    }
    
    /**
     * Play the current riff
     */
    function play() {
        if (!currentPattern) return;
        
        // Start the tone.js audio context if it's not started
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        
        // Start the transport
        Tone.Transport.start();
        playing = true;
    }
    
    /**
     * Pause the current riff
     */
    function pause() {
        Tone.Transport.pause();
        playing = false;
    }
    
    /**
     * Stop the current riff
     */
    function stopCurrentRiff() {
        if (currentPattern) {
            currentPattern.stop();
            currentPattern.dispose();
            currentPattern = null;
        }
        
        Tone.Transport.stop();
        playing = false;
    }
    
    /**
     * Check if a riff is currently playing
     * @returns {boolean} True if playing, false otherwise
     */
    function isPlaying() {
        return playing;
    }
    
    /**
     * Set the reverb amount
     * @param {number} amount - Value between 0 and 1
     */
    function setReverbAmount(amount) {
        reverbAmount = amount;
        reverb.wet.value = amount;
    }
    
    /**
     * Set the echo amount
     * @param {number} amount - Value between 0 and 1
     */
    function setEchoAmount(amount) {
        echoAmount = amount;
        feedbackDelay.wet.value = amount;
    }
    
    /**
     * Set the phaser amount
     * @param {number} amount - Value between 0 and 1
     */
    function setPhaserAmount(amount) {
        phaserAmount = amount;
        phaser.wet.value = amount;
    }
    
    /**
     * Get the current effects settings
     * @returns {Object} Object with effect amounts
     */
    function getEffectsSettings() {
        return {
            reverb: reverbAmount,
            echo: echoAmount,
            phaser: phaserAmount
        };
    }
    
    /**
     * Get the current mood
     * @returns {Object} The current mood object
     */
    function getCurrentMood() {
        return currentMood;
    }
    
    // Initialize on load
    init();
    
    // Public API
    return {
        createRiff,
        play,
        pause,
        stopCurrentRiff,
        isPlaying,
        setReverbAmount,
        setEchoAmount,
        setPhaserAmount,
        getEffectsSettings,
        getCurrentMood
    };
})();
