/**
 * TutorialManager - Manages tutorial lessons and progression
 * Coordinates lesson state, navigation, and completion tracking
 */

class TutorialManager {
    constructor(gameData, preferences) {
        this.gameData = gameData;
        this.preferences = preferences;
        this.currentLesson = 1;
        this.totalLessons = 13;
        this.listeners = new Map();
    }

    /**
     * Event system
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    /**
     * Navigate to lesson
     * @param {number} lessonNum
     */
    goToLesson(lessonNum) {
        if (lessonNum < 1 || lessonNum > this.totalLessons) {
            return;
        }

        // Mark previous lessons as completed when advancing
        if (lessonNum > this.currentLesson) {
            for (let i = this.currentLesson; i < lessonNum; i++) {
                this.completeLesson(i);
            }
        }

        this.currentLesson = lessonNum;
        this.emit('lessonChanged', {
            lesson: lessonNum,
            total: this.totalLessons
        });
    }

    /**
     * Go to next lesson
     */
    nextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.completeLesson(this.currentLesson);
            this.goToLesson(this.currentLesson + 1);
        }
    }

    /**
     * Go to previous lesson
     */
    previousLesson() {
        if (this.currentLesson > 1) {
            this.goToLesson(this.currentLesson - 1);
        }
    }

    /**
     * Mark lesson as completed
     * @param {number} lessonNum
     */
    completeLesson(lessonNum) {
        this.gameData.completeLesson(lessonNum);
        this.emit('lessonCompleted', {
            lesson: lessonNum,
            progress: this.getProgress()
        });
    }

    /**
     * Check if lesson is completed
     * @param {number} lessonNum
     * @returns {boolean}
     */
    isLessonCompleted(lessonNum) {
        return this.gameData.isLessonCompleted(lessonNum);
    }

    /**
     * Get current progress percentage
     * @returns {number}
     */
    getProgress() {
        return this.gameData.getCompletionPercentage(this.totalLessons);
    }

    /**
     * Get current lesson number
     * @returns {number}
     */
    getCurrentLesson() {
        return this.currentLesson;
    }

    /**
     * Get total number of lessons
     * @returns {number}
     */
    getTotalLessons() {
        return this.totalLessons;
    }

    /**
     * Reset all progress
     */
    reset() {
        const stats = this.gameData.getStats();
        stats.lessonsCompleted = [];
        this.gameData.saveStats(stats);
        this.currentLesson = 1;
        this.emit('progressReset', {});
    }

    /**
     * Get lesson metadata
     * @param {number} lessonNum
     * @returns {Object}
     */
    getLessonInfo(lessonNum) {
        const lessons = [
            { id: 1, title: 'Introduction to Mahjong', type: 'tutorial' },
            { id: 2, title: 'The Tiles: Suits', type: 'tutorial' },
            { id: 3, title: 'Honor Tiles', type: 'tutorial' },
            { id: 4, title: 'Building Sets', type: 'tutorial' },
            { id: 5, title: 'Winning Hand', type: 'tutorial' },
            { id: 6, title: 'Gameplay Basics', type: 'tutorial' },
            { id: 7, title: 'Practice: Identify Pairs', type: 'practice' },
            { id: 8, title: 'Practice: Find Pungs', type: 'practice' },
            { id: 9, title: 'Practice: Find Chows', type: 'practice' },
            { id: 10, title: 'Advanced: Scoring Basics', type: 'advanced' },
            { id: 11, title: 'Advanced: Special Hands', type: 'advanced' },
            { id: 12, title: 'Practice: Build Winning Hand', type: 'practice' },
            { id: 13, title: 'Advanced: Strategy', type: 'advanced' }
        ];

        return lessons.find(l => l.id === lessonNum) || null;
    }

    /**
     * Get all lessons info
     * @returns {Array}
     */
    getAllLessons() {
        const lessons = [];
        for (let i = 1; i <= this.totalLessons; i++) {
            const info = this.getLessonInfo(i);
            lessons.push({
                ...info,
                completed: this.isLessonCompleted(i),
                current: i === this.currentLesson
            });
        }
        return lessons;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorialManager };
}
