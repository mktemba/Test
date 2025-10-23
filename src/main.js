/**
 * Main application entry point
 * Initializes and coordinates all subsystems
 */

class MahjongApp {
    constructor() {
        this.controller = null;
        this.tutorialManager = null;
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        console.log('Initializing Mahjong application...');

        // Load preferences
        preferences.load();

        // Apply accessibility preferences
        this.applyAccessibilitySettings();

        // Initialize tutorial manager
        this.tutorialManager = new TutorialManager(GameData, preferences);

        // Setup tutorial event listeners
        this.tutorialManager.on('lessonChanged', (data) => {
            this.handleLessonChanged(data);
        });

        this.tutorialManager.on('lessonCompleted', (data) => {
            this.handleLessonCompleted(data);
        });

        this.tutorialManager.on('progressReset', () => {
            this.updateProgressUI();
        });

        // Initialize game controller (for practice games)
        this.controller = new MahjongController({
            playerCount: 4,
            enableAI: true,
            difficulty: preferences.get('aiDifficulty'),
            autoSave: true
        });

        // Load game engine
        if (typeof MahjongEngine !== 'undefined') {
            const engine = new MahjongEngine();
            this.controller.setEngine(engine);

            if (typeof MahjongAI !== 'undefined') {
                const ai = new MahjongAI(preferences.get('aiDifficulty'));
                this.controller.setAI(ai);
            }
        }

        // Setup controller event listeners
        this.controller.on('gameStarted', (data) => {
            console.log('Game started:', data);
        });

        this.controller.on('gameEnded', (data) => {
            this.handleGameEnded(data);
        });

        this.controller.on('stateChanged', (state) => {
            // Update UI based on state changes
            this.updateGameUI(state);
        });

        // Setup keyboard navigation
        this.setupKeyboardNav();

        // Setup UI event handlers
        this.setupUIHandlers();

        // Restore last session if exists
        this.restoreSession();

        this.initialized = true;
        console.log('Mahjong application initialized successfully');

        // Emit ready event
        this.emit('ready');
    }

    /**
     * Apply accessibility settings
     */
    applyAccessibilitySettings() {
        const body = document.body;

        // Reduced motion
        if (preferences.get('reducedMotion') || Utils.prefersReducedMotion()) {
            body.classList.add('reduced-motion');
        }

        // High contrast
        if (preferences.get('highContrast')) {
            body.classList.add('high-contrast');
        }

        // Font size
        const fontSize = preferences.get('fontSize');
        body.classList.add(`font-${fontSize}`);
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Don't interfere with form inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Arrow keys for lesson navigation
            if (e.key === 'ArrowRight') {
                this.tutorialManager.nextLesson();
            } else if (e.key === 'ArrowLeft') {
                this.tutorialManager.previousLesson();
            }

            // Number keys for quick lesson access (1-9, 0 for lesson 10)
            if (e.key >= '1' && e.key <= '9') {
                const lessonNum = parseInt(e.key);
                if (lessonNum <= this.tutorialManager.getTotalLessons()) {
                    this.tutorialManager.goToLesson(lessonNum);
                }
            } else if (e.key === '0') {
                this.tutorialManager.goToLesson(10);
            }

            // Escape key to close modals/overlays
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    /**
     * Setup UI event handlers
     */
    setupUIHandlers() {
        // Lesson navigation clicks
        document.querySelectorAll('.lesson-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const lessonNum = parseInt(item.dataset.lesson);
                this.tutorialManager.goToLesson(lessonNum);
            });
        });

        // Navigation buttons
        const navButtons = document.querySelectorAll('[onclick*="nextLesson"]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.tutorialManager.nextLesson();
            });
        });

        const prevButtons = document.querySelectorAll('[onclick*="previousLesson"]');
        prevButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.tutorialManager.previousLesson();
            });
        });

        // Preference changes
        preferences.watch('aiDifficulty', (newVal) => {
            if (this.controller.ai) {
                this.controller.ai.difficulty = newVal;
            }
        });

        preferences.watch('reducedMotion', (newVal) => {
            document.body.classList.toggle('reduced-motion', newVal);
        });

        preferences.watch('highContrast', (newVal) => {
            document.body.classList.toggle('high-contrast', newVal);
        });
    }

    /**
     * Handle lesson change
     * @param {Object} data
     */
    handleLessonChanged(data) {
        // Hide all lesson content
        document.querySelectorAll('.lesson-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected lesson
        const lessonContent = document.querySelector(`.lesson-content[data-lesson="${data.lesson}"]`);
        if (lessonContent) {
            lessonContent.classList.add('active');
        }

        // Update sidebar
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('active');
            const itemLesson = parseInt(item.dataset.lesson);

            if (itemLesson === data.lesson) {
                item.classList.add('active');
            }

            if (this.tutorialManager.isLessonCompleted(itemLesson)) {
                item.classList.add('completed');
            }
        });

        // Initialize lesson-specific features
        this.initializeLessonFeatures(data.lesson);

        // Update progress bar
        this.updateProgressUI();

        // Scroll to top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
    }

    /**
     * Handle lesson completion
     * @param {Object} data
     */
    handleLessonCompleted(data) {
        console.log(`Lesson ${data.lesson} completed! Progress: ${data.progress.toFixed(1)}%`);

        // Update UI
        const lessonItem = document.querySelector(`.lesson-item[data-lesson="${data.lesson}"]`);
        if (lessonItem) {
            lessonItem.classList.add('completed');
        }

        this.updateProgressUI();

        // Show completion animation if preferences allow
        if (!preferences.get('reducedMotion')) {
            this.showCompletionAnimation(data.lesson);
        }
    }

    /**
     * Initialize features specific to a lesson
     * @param {number} lessonNum
     */
    initializeLessonFeatures(lessonNum) {
        // These functions are defined in the main HTML file
        // This is the integration point between the modular architecture
        // and the existing tutorial code

        if (typeof initPractice !== 'undefined' && lessonNum === 7) {
            initPractice();
        }
        if (typeof initPungPractice !== 'undefined' && lessonNum === 8) {
            initPungPractice();
        }
        if (typeof initChowPractice !== 'undefined' && lessonNum === 9) {
            initChowPractice();
        }
        if (typeof initWinningHandPractice !== 'undefined' && lessonNum === 12) {
            initWinningHandPractice();
        }
    }

    /**
     * Update progress UI
     */
    updateProgressUI() {
        const progress = this.tutorialManager.getProgress();
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }

    /**
     * Show completion animation
     * @param {number} lessonNum
     */
    showCompletionAnimation(lessonNum) {
        // Subtle success indicator
        const lessonItem = document.querySelector(`.lesson-item[data-lesson="${lessonNum}"]`);
        if (lessonItem && !Utils.prefersReducedMotion()) {
            Utils.addTemporaryClass(lessonItem, 'just-completed', 2000);
        }
    }

    /**
     * Handle game ended
     * @param {Object} data
     */
    handleGameEnded(data) {
        const winner = this.controller.getPlayer(data.winner);
        const isHumanWinner = !winner.isAI;

        GameData.recordGame(isHumanWinner, data.score);

        console.log(`Game ended. Winner: ${winner.name}, Score: ${data.score}`);
    }

    /**
     * Update game UI
     * @param {Object} state
     */
    updateGameUI(state) {
        // This would update any active game UI elements
        // For now, just used in practice modes
    }

    /**
     * Restore previous session
     */
    restoreSession() {
        // Check if there's a saved lesson position
        const lastLesson = data.get('last_lesson', 1);
        if (lastLesson > 1 && lastLesson <= this.tutorialManager.getTotalLessons()) {
            this.tutorialManager.goToLesson(lastLesson);
        }

        // Update initial progress
        this.updateProgressUI();
    }

    /**
     * Save current session
     */
    saveSession() {
        data.set('last_lesson', this.tutorialManager.getCurrentLesson());
        data.set('last_save', Date.now());
    }

    /**
     * Close any open modals
     */
    closeModals() {
        document.querySelectorAll('.modal, .overlay').forEach(el => {
            el.classList.remove('active');
        });
    }

    /**
     * Simple event emitter
     * @param {string} event
     */
    emit(event) {
        const customEvent = new CustomEvent(`mahjong:${event}`, {
            bubbles: true,
            detail: { app: this }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Save session before cleanup
        this.saveSession();

        // Cleanup controller
        if (this.controller) {
            this.controller.destroy();
        }

        // Clear references
        this.tutorialManager = null;
        this.controller = null;
        this.initialized = false;
    }
}

// Initialize app when DOM is ready
let app = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MahjongApp();
        app.init();
    });
} else {
    app = new MahjongApp();
    app.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.saveSession();
    }
});

// Export for debugging in console
if (typeof window !== 'undefined') {
    window.MahjongApp = app;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MahjongApp };
}
