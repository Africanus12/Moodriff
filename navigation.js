/**
 * Navigation module for handling screen navigation
 */
const Navigation = (function() {
    // Keep track of navigation history
    const history = [];
    let currentScreen = 'home-screen';
    
    /**
     * Initialize the navigation
     */
    function init() {
        // Set up bottom navigation listeners
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.getAttribute('data-screen');
                navigateTo(screenId);
                
                // Update active state of nav items
                navItems.forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    }
    
    /**
     * Navigate to a specific screen
     * @param {string} screenId - ID of the screen to navigate to
     */
    function navigateTo(screenId) {
        // Add current screen to history if it's not the same as the target
        if (currentScreen !== screenId) {
            history.push(currentScreen);
        }
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            currentScreen = screenId;
            
            // Show back button if not on home screen
            const backButton = document.getElementById('back-button');
            if (screenId !== 'home-screen' && !isMainNavScreen(screenId)) {
                backButton.style.display = 'block';
            } else {
                backButton.style.display = 'none';
            }
            
            // Clean up any resources if needed when leaving a screen
            handleScreenTransition(screenId);
        }
    }
    
    /**
     * Go back to the previous screen
     */
    function goBack() {
        if (history.length > 0) {
            const previousScreen = history.pop();
            navigateTo(previousScreen);
        } else {
            // Default to home if history is empty
            navigateTo('home-screen');
        }
    }
    
    /**
     * Check if a screen is one of the main navigation screens
     * @param {string} screenId - ID of the screen to check
     * @returns {boolean} True if it's a main nav screen
     */
    function isMainNavScreen(screenId) {
        const mainScreens = ['home-screen', 'library-screen', 'diary-screen', 'level-screen'];
        return mainScreens.includes(screenId);
    }
    
    /**
     * Handle transitions between screens, cleanup resources
     * @param {string} screenId - ID of the screen being navigated to
     */
    function handleScreenTransition(screenId) {
        // Stop audio when navigating away from riff screen
        if (currentScreen === 'riff-screen' && screenId !== 'riff-screen') {
            ToneHelper.stopCurrentRiff();
            Visualizer.stop();
        }
        
        // Initialize or refresh screens as needed
        if (screenId === 'library-screen') {
            // Refresh library when navigating to it
            loadSavedRiffs();
        } else if (screenId === 'challenge-screen') {
            // Refresh challenge screen
            initDailyChallenge();
        } else if (screenId === 'diary-screen') {
            // Refresh the mood diary chart
            initMoodDiaryChart();
        }
    }
    
    // Public API
    return {
        init,
        navigateTo,
        goBack
    };
})();
