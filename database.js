/**
 * Database module for handling storage of riffs and user data
 * Uses IndexedDB for persistent storage
 */
const Database = (function() {
    const DB_NAME = 'MoodRiffMakerDB';
    const DB_VERSION = 1;
    const RIFFS_STORE = 'riffs';
    
    let db;
    
    /**
     * Initialize the database
     * @returns {Promise} Resolves when the database is ready
     */
    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject('Could not open database');
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Database opened successfully');
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create Riffs object store
                if (!db.objectStoreNames.contains(RIFFS_STORE)) {
                    const store = db.createObjectStore(RIFFS_STORE, { keyPath: 'id' });
                    store.createIndex('moodName', 'moodName', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    
                    console.log('Riffs object store created');
                }
            };
        });
    }
    
    /**
     * Save a new riff to the database
     * @param {Object} riff - Riff object to save
     * @returns {Promise} Resolves when the riff is saved
     */
    function saveRiff(riff) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readwrite');
            const store = transaction.objectStore(RIFFS_STORE);
            
            // Add the riff
            const request = store.add(riff);
            
            request.onerror = (event) => {
                console.error('Error saving riff:', event.target.error);
                reject('Error saving riff');
            };
            
            request.onsuccess = (event) => {
                console.log('Riff saved successfully');
                resolve(riff);
            };
        });
    }
    
    /**
     * Get all riffs from the database
     * @returns {Promise<Array>} Resolves with an array of riff objects
     */
    function getAllRiffs() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readonly');
            const store = transaction.objectStore(RIFFS_STORE);
            const index = store.index('timestamp');
            
            // Get all riffs, sorted by timestamp descending (newest first)
            const request = index.openCursor(null, 'prev');
            const riffs = [];
            
            request.onerror = (event) => {
                console.error('Error getting riffs:', event.target.error);
                reject('Error getting riffs');
            };
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    riffs.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(riffs);
                }
            };
        });
    }
    
    /**
     * Get a riff by its ID
     * @param {number} id - Riff ID to find
     * @returns {Promise<Object>} Resolves with the riff object
     */
    function getRiffById(id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readonly');
            const store = transaction.objectStore(RIFFS_STORE);
            
            const request = store.get(id);
            
            request.onerror = (event) => {
                console.error('Error getting riff:', event.target.error);
                reject('Error getting riff');
            };
            
            request.onsuccess = (event) => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    reject('Riff not found');
                }
            };
        });
    }
    
    /**
     * Delete a riff by its ID
     * @param {number} id - Riff ID to delete
     * @returns {Promise} Resolves when the riff is deleted
     */
    function deleteRiff(id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readwrite');
            const store = transaction.objectStore(RIFFS_STORE);
            
            const request = store.delete(id);
            
            request.onerror = (event) => {
                console.error('Error deleting riff:', event.target.error);
                reject('Error deleting riff');
            };
            
            request.onsuccess = (event) => {
                console.log('Riff deleted successfully');
                resolve();
            };
        });
    }
    
    /**
     * Count the total number of riffs
     * @returns {Promise<number>} Resolves with the count
     */
    function getRiffCount() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readonly');
            const store = transaction.objectStore(RIFFS_STORE);
            
            const request = store.count();
            
            request.onerror = (event) => {
                console.error('Error counting riffs:', event.target.error);
                reject('Error counting riffs');
            };
            
            request.onsuccess = (event) => {
                resolve(request.result);
            };
        });
    }
    
    /**
     * Get riffs by mood name
     * @param {string} moodName - Mood name to filter by
     * @returns {Promise<Array>} Resolves with an array of riff objects
     */
    function getRiffsByMood(moodName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([RIFFS_STORE], 'readonly');
            const store = transaction.objectStore(RIFFS_STORE);
            const index = store.index('moodName');
            
            const request = index.getAll(moodName);
            
            request.onerror = (event) => {
                console.error('Error getting riffs by mood:', event.target.error);
                reject('Error getting riffs by mood');
            };
            
            request.onsuccess = (event) => {
                resolve(request.result);
            };
        });
    }
    
    /**
     * Get riff count by mood
     * @returns {Promise<Object>} Resolves with an object mapping mood names to counts
     */
    function getRiffCountByMood() {
        return new Promise((resolve, reject) => {
            getAllRiffs()
                .then(riffs => {
                    const counts = {};
                    
                    // Initialize counts for all moods
                    const allMoods = Object.keys(Models.getMoods());
                    allMoods.forEach(mood => {
                        counts[mood] = 0;
                    });
                    
                    // Count riffs by mood
                    riffs.forEach(riff => {
                        if (counts[riff.moodName] !== undefined) {
                            counts[riff.moodName]++;
                        } else {
                            counts[riff.moodName] = 1;
                        }
                    });
                    
                    resolve(counts);
                })
                .catch(error => {
                    console.error('Error getting riff counts by mood:', error);
                    reject(error);
                });
        });
    }
    
    return {
        init,
        saveRiff,
        getAllRiffs,
        getRiffById,
        deleteRiff,
        getRiffCount,
        getRiffsByMood,
        getRiffCountByMood
    };
})();
