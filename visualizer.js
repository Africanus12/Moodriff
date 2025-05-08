/**
 * Visualizer module for creating audio visualizations
 */
const Visualizer = (function() {
    let canvas;
    let ctx;
    let analyser;
    let dataArray;
    let visualizerType = 'bars'; // 'bars', 'waves', 'particles'
    let running = false;
    let animationId;
    let particles = [];
    let lastNoteTime = 0;
    let lastNoteValue = 0;
    
    const VISUALIZER_BG = '#E7E0EC'; // Surface variant
    const PRIMARY_COLOR = '#6750A4'; // Primary color
    
    /**
     * Initialize the visualizer
     */
    function init() {
        canvas = document.getElementById('visualizer');
        ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Create analyser if Web Audio API is available
        if (window.AudioContext || window.webkitAudioContext) {
            setupAudioAnalyser();
        }
    }
    
    /**
     * Resize the canvas to match its container
     */
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    
    /**
     * Set up the audio analyser
     */
    function setupAudioAnalyser() {
        // Create an analyser node
        analyser = Tone.getContext().createAnalyser();
        analyser.fftSize = 256;
        
        // Connect Tone.js master output to the analyser
        Tone.Destination.connect(analyser);
        
        // Create a data array to hold the frequency data
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    
    /**
     * Start the visualizer animation
     */
    function start() {
        if (running) return;
        
        running = true;
        
        // Create initial particles if using particle visualizer
        if (visualizerType === 'particles') {
            createParticles(50); // Start with 50 particles
        }
        
        // Start animation loop
        animate();
    }
    
    /**
     * Stop the visualizer animation
     */
    function stop() {
        running = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Clear the canvas
        clearCanvas();
    }
    
    /**
     * Clear the canvas
     */
    function clearCanvas() {
        ctx.fillStyle = VISUALIZER_BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    /**
     * Main animation loop
     */
    function animate() {
        if (!running) return;
        
        animationId = requestAnimationFrame(animate);
        
        // Clear canvas
        clearCanvas();
        
        // Get frequency data if we have an analyser
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }
        
        // Draw the appropriate visualization
        switch (visualizerType) {
            case 'bars':
                drawBars();
                break;
            case 'waves':
                drawWaves();
                break;
            case 'particles':
                updateParticles();
                drawParticles();
                break;
            default:
                drawBars();
        }
    }
    
    /**
     * Draw frequency bars visualization
     */
    function drawBars() {
        const barWidth = canvas.width / (dataArray ? dataArray.length : 32);
        const heightScale = canvas.height / 255;
        
        ctx.fillStyle = PRIMARY_COLOR;
        
        // Use dataArray if available, otherwise use a simulated one
        const data = dataArray || generateSimulatedData();
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const percent = value / 255;
            const barHeight = value * heightScale;
            
            // Calculate bar position
            const x = i * barWidth;
            const y = canvas.height - barHeight;
            
            // Draw the bar with rounded top
            ctx.beginPath();
            ctx.moveTo(x, canvas.height);
            ctx.lineTo(x, y + 3);
            ctx.arc(x + barWidth/2, y + 3, barWidth/2, Math.PI, 0, false);
            ctx.lineTo(x + barWidth, canvas.height);
            ctx.fill();
        }
    }
    
    /**
     * Draw wave visualization
     */
    function drawWaves() {
        ctx.strokeStyle = PRIMARY_COLOR;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Use dataArray if available, otherwise use a simulated one
        const data = dataArray || generateSimulatedData();
        
        // Draw a wave using the frequency data
        const sliceWidth = canvas.width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const percent = value / 255;
            const y = canvas.height - (canvas.height * percent);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        // Complete the path back to the end
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Add a second wave with different color and phase
        ctx.strokeStyle = 'rgba(103, 80, 164, 0.5)'; // Semi-transparent primary
        ctx.beginPath();
        x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const percent = value / 255;
            // Offset the y value slightly
            const y = canvas.height - (canvas.height * percent) - 10;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    /**
     * Create particles for particle visualization
     * @param {number} count - Number of particles to create
     */
    function createParticles(count) {
        particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 5 + 2,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1,
                color: PRIMARY_COLOR,
                alpha: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    /**
     * Update particle positions and properties
     */
    function updateParticles() {
        // Use dataArray if available to influence particles
        const data = dataArray || generateSimulatedData();
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        const energyFactor = average / 128; // 0-2 range approximately
        
        particles.forEach(p => {
            // Update position
            p.x += p.speedX * energyFactor;
            p.y += p.speedY * energyFactor;
            
            // Bounce off walls
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            // Add some randomness
            if (Math.random() > 0.95) {
                p.speedX = Math.random() * 2 - 1;
                p.speedY = Math.random() * 2 - 1;
            }
            
            // Respond to audio energy
            p.size = (Math.random() * 5 + 2) * energyFactor;
            p.alpha = Math.min(1, 0.5 + energyFactor * 0.5);
        });
        
        // Check if we need to add particles based on energy
        if (energyFactor > 1.5 && particles.length < 100) {
            // Add a few more particles
            for (let i = 0; i < 5; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 5 + 2,
                    speedX: Math.random() * 2 - 1,
                    speedY: Math.random() * 2 - 1,
                    color: PRIMARY_COLOR,
                    alpha: Math.random() * 0.5 + 0.5
                });
            }
        }
    }
    
    /**
     * Draw the particles
     */
    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw connections between close particles
            particles.forEach(p2 => {
                const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                if (distance < 50) {
                    ctx.globalAlpha = 0.1 * (1 - distance / 50);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        ctx.globalAlpha = 1;
    }
    
    /**
     * Generate simulated audio data when real data isn't available
     * @returns {Array} Simulated frequency data
     */
    function generateSimulatedData() {
        const now = Date.now();
        const timeFactor = Math.sin(now / 1000); // Oscillate every second
        const data = [];
        
        // Fade out effect for note values
        const timeSinceLastNote = now - lastNoteTime;
        const fadeOut = Math.max(0, 1 - timeSinceLastNote / 500);
        
        const noteBase = lastNoteValue * fadeOut;
        
        for (let i = 0; i < 32; i++) {
            // Create a nice frequency distribution
            let value = 0;
            
            // Add the note value with a curve
            if (i < 16) {
                value += noteBase * (i / 8);
            } else {
                value += noteBase * ((32 - i) / 16);
            }
            
            // Add some ambient movement
            value += 10 + 10 * Math.sin((i / 32) * Math.PI + now / 200);
            
            // Add some randomness
            value += Math.random() * 5;
            
            // Ensure value is in the right range
            data.push(Math.min(255, Math.max(0, value)));
        }
        
        return data;
    }
    
    /**
     * Update visualization based on a new note being played
     * @param {string} note - The note being played
     */
    function updateForNote(note) {
        // Convert note to frequency if it's a string
        let frequency;
        if (typeof note === 'string') {
            frequency = Tone.Frequency(note).toFrequency();
        } else {
            frequency = note;
        }
        
        // Store note data for simulated visualizations
        lastNoteTime = Date.now();
        lastNoteValue = Math.min(255, frequency / 4); // Scale to a reasonable range
        
        // If we're using particles, add a pulse
        if (visualizerType === 'particles' && running) {
            // Add a few particles at the center
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: canvas.width / 2 + (Math.random() * 40 - 20),
                    y: canvas.height / 2 + (Math.random() * 40 - 20),
                    size: Math.random() * 8 + 4,
                    speedX: Math.random() * 4 - 2,
                    speedY: Math.random() * 4 - 2,
                    color: PRIMARY_COLOR,
                    alpha: 0.8
                });
            }
        }
    }
    
    /**
     * Update visualization based on a chord being played
     * @param {Array} notes - Array of notes being played
     */
    function updateForChord(notes) {
        notes.forEach(note => {
            updateForNote(note);
        });
    }
    
    /**
     * Change the visualizer type
     * @param {string} type - Type of visualizer ('bars', 'waves', 'particles')
     */
    function setVisualizerType(type) {
        visualizerType = type;
        
        if (type === 'particles' && running) {
            createParticles(50);
        }
    }
    
    // Public API
    return {
        init,
        start,
        stop,
        updateForNote,
        updateForChord,
        setVisualizerType
    };
})();
