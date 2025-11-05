/**
 * Lesson navigation and management
 * Non-blocking script loaded with defer
 */

// Lesson navigation
let currentLesson = 1;
const totalLessons = 15;
const completedLessons = new Set();

// Lazy loading tracker
const loadedLessonResources = new Set();

function lazyLoadLessonResources(lessonNum) {
    // Skip if already loaded
    if (loadedLessonResources.has(lessonNum)) {
        return Promise.resolve();
    }

    // Mark as loaded
    loadedLessonResources.add(lessonNum);

    // Lazy load lesson-specific resources
    // This improves initial page load by deferring non-critical resources
    const promises = [];

    // Load lesson-specific resources dynamically
    if (lessonNum === 5) {
        // Lesson 5 - load strategy guide images
        const images = [
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23667eea" width="100" height="100"/%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23764ba2" width="100" height="100"/%3E%3C/svg%3E'
        ];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
            promises.push(new Promise(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }));
        });
    }

    if (lessonNum === 7 || lessonNum === 8 || lessonNum === 9 || lessonNum === 12) {
        // Practice lessons - preload tile images and helper resources
        const tileImages = [
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="80"%3E%3Crect fill="%23fff" width="60" height="80" rx="4"/%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="80"%3E%3Crect fill="%23f0f0f0" width="60" height="80" rx="4"/%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="80"%3E%3Crect fill="%23e0e0e0" width="60" height="80" rx="4"/%3E%3C/svg%3E'
        ];
        tileImages.forEach(src => {
            const img = new Image();
            img.src = src;
            promises.push(new Promise(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }));
        });
    }

    if (lessonNum === 14) {
        // Scenarios lesson - load scenario assets
        const scenarioImages = [
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%231e3c72" width="200" height="150" rx="8"/%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%232a5298" width="200" height="150" rx="8"/%3E%3C/svg%3E'
        ];
        scenarioImages.forEach(src => {
            const img = new Image();
            img.src = src;
            promises.push(new Promise(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }));
        });
    }

    return Promise.all(promises);
}

function updateProgress() {
    const progress = (completedLessons.size / totalLessons) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // Save progress
    localStorage.setItem('mahjong_progress', JSON.stringify({
        completed: Array.from(completedLessons),
        current: currentLesson
    }));
}

function switchLesson(lessonNum) {
    // Cleanup previous lesson resources to prevent memory leaks
    cleanupLessonResources();

    // Hide all lessons
    document.querySelectorAll('.lesson-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected lesson
    document.querySelector(`.lesson-content[data-lesson="${lessonNum}"]`).classList.add('active');

    // Update sidebar
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.lesson) === lessonNum) {
            item.classList.add('active');
        }
    });

    currentLesson = lessonNum;

    // Mark previous lessons as completed
    if (lessonNum > 1) {
        for (let i = 1; i < lessonNum; i++) {
            completedLessons.add(i);
            document.querySelector(`.lesson-item[data-lesson="${i}"]`)?.classList.add('completed');
        }
        updateProgress();
    }

    // Lazy load lesson-specific resources
    lazyLoadLessonResources(lessonNum).then(() => {
        // Load lesson-specific content after resources are ready
        if (lessonNum === 14) {
            loadScenarios();
        } else if (lessonNum === 15) {
            updateDashboard();
        }
    });

    // Track in learning system (optional - method doesn't exist yet)
    // Future: implement trackLessonStart in ProgressAnalyzer
}

// Cleanup function to prevent memory leaks during navigation
function cleanupLessonResources() {
    // Remove any dynamically created elements from previous lessons
    document.querySelectorAll('.dynamic-lesson-content').forEach(el => el.remove());

    // Clear any timers or intervals that might be running
    const highestId = window.setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
        const hasTimer = window.clearTimeout(i);
        if (hasTimer) {
            // Timer was cleared
        }
    }
}

function nextLesson() {
    if (currentLesson < totalLessons) {
        completedLessons.add(currentLesson);
        document.querySelector(`.lesson-item[data-lesson="${currentLesson}"]`)?.classList.add('completed');

        // Track completion using actual method
        if (window.learningSystem && window.learningSystem.progressAnalyzer) {
            window.learningSystem.progressAnalyzer.trackLessonAccuracy(`lesson_${currentLesson}`, 100, {
                timeSpent: 60000
            });
        }

        // Play success sound
        if (window.learningSystem && window.learningSystem.audioManager) {
            window.learningSystem.audioManager.play('success');
        }

        switchLesson(currentLesson + 1);
        updateProgress();
    }
}

function previousLesson() {
    if (currentLesson > 1) {
        switchLesson(currentLesson - 1);
    }
}

function completeLesson() {
    completedLessons.add(currentLesson);
    updateProgress();

    // Play achievement sound
    if (window.learningSystem && window.learningSystem.audioManager) {
        window.learningSystem.audioManager.play('achievement');
    }

    alert('Congratulations! You\'ve completed the Mahjong tutorial! 🎉\n\nYou now know:\n- The different types of tiles\n- How to build sets\n- What makes a winning hand\n- Basic gameplay rules\n- Strategy and tactics\n\nKeep practicing to become a Mahjong master!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLessonNavigation);
} else {
    initLessonNavigation();
}

function initLessonNavigation() {
    // Sidebar click handlers
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', function() {
            const lessonNum = parseInt(this.dataset.lesson);
            switchLesson(lessonNum);
        });
    });

    // Load saved progress
    try {
        const saved = JSON.parse(localStorage.getItem('mahjong_progress'));
        if (saved && saved.completed) {
            saved.completed.forEach(num => {
                completedLessons.add(num);
                document.querySelector(`.lesson-item[data-lesson="${num}"]`)?.classList.add('completed');
            });
            updateProgress();
        }
    } catch (e) {
        console.error('Error loading progress:', e);
    }
}

// Export functions for global use
window.nextLesson = nextLesson;
window.previousLesson = previousLesson;
window.switchLesson = switchLesson;
window.completeLesson = completeLesson;
