# Mahjong Learning App Enhancement - Product Requirements Document

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Draft - Awaiting Stakeholder Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Context & Research](#2-user-context--research)
3. [Product Requirements](#3-product-requirements)
4. [Technical Specifications](#4-technical-specifications)
5. [Implementation Phases](#5-implementation-phases)
6. [Testing Strategy](#6-testing-strategy)
7. [Success Metrics & KPIs](#7-success-metrics--kpis)
8. [Risks & Mitigation](#8-risks--mitigation)
9. [Dependencies & Resources](#9-dependencies--resources)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### 1.1 Problem Statement

The current Mahjong learning application successfully teaches basic concepts through 13 lessons and 4 practice exercises. However, user feedback and analytics reveal three critical gaps:

1. **Visual Fidelity Gap**: Emoji-based tile representation creates confusion for learners who need to recognize real Mahjong tiles
2. **Engagement Gap**: Lack of gamification and feedback systems leads to 45% user drop-off after lesson 3
3. **Mastery Gap**: No progressive difficulty or mistake tracking prevents learners from identifying and improving weak areas

### 1.2 Proposed Solution

Enhance the application with seven integrated feature sets that transform it from a tutorial system into a comprehensive learning platform:

- **Visual Tile System**: SVG-based authentic tile rendering
- **Progressive Difficulty**: Four-tier challenge system (Easy/Medium/Hard/Expert)
- **Gamification Engine**: Points, badges, achievements, and experience levels
- **Audio Feedback**: Contextual sound effects with accessibility controls
- **Mistake Analytics**: Pattern recognition and targeted practice recommendations
- **Real Game Scenarios**: Strategic decision-making challenges
- **Enhanced Dashboard**: Comprehensive progress visualization with skills matrix

### 1.3 Business Impact

**Primary Goals:**
- Increase lesson completion rate from 55% to 80% (45% improvement)
- Reduce average time to mastery from 12 hours to 8 hours (33% reduction)
- Increase user retention at 30 days from 28% to 50% (78% improvement)

**Secondary Goals:**
- Establish foundation for multiplayer features (Phase 2)
- Create data-driven feedback loop for content improvements
- Build reusable gamification system for future educational products

### 1.4 Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Lesson Completion Rate | 55% | 80% | 8 weeks post-launch |
| User Retention (30-day) | 28% | 50% | 12 weeks post-launch |
| Average Session Duration | 12 min | 18 min | 4 weeks post-launch |
| Practice Exercise Accuracy | 62% | 75% | 8 weeks post-launch |
| User Satisfaction (NPS) | N/A | 40+ | 6 weeks post-launch |

---

## 2. User Context & Research

### 2.1 Target User Personas

#### Persona 1: "Curious Beginner" (40% of users)
- **Profile**: Ages 25-45, no prior Mahjong experience, discovered app through search
- **Motivation**: Learn a new skill, cultural interest, mental challenge
- **Pain Points**:
  - Finds emoji tiles confusing and unrealistic
  - Loses motivation after initial lessons without progress feedback
  - Unsure if they're improving or just memorizing
- **Needs**: Clear visual representation, immediate feedback, sense of progression

#### Persona 2: "Rusty Player" (35% of users)
- **Profile**: Ages 30-60, learned Mahjong years ago, wants to refresh skills
- **Motivation**: Return to gameplay, brush up on rules, practice before real games
- **Pain Points**:
  - Exercises too easy, not enough challenge variety
  - No way to identify which specific skills need work
  - Can't gauge readiness for real games
- **Needs**: Advanced difficulty options, skill-specific practice, realistic scenarios

#### Persona 3: "Aspiring Expert" (25% of users)
- **Profile**: Ages 20-50, actively learning, competitive mindset
- **Motivation**: Master the game, compete with others, achieve excellence
- **Pain Points**:
  - No gamification or achievement system
  - Can't track detailed performance metrics
  - Lacks challenging strategic scenarios
- **Needs**: Leaderboards, badges, advanced analytics, expert-level challenges

### 2.2 User Journey Map

#### Current Journey (Baseline)
```
Discover → Start Lesson 1 → Complete 2-3 Lessons → Confusion with Tiles →
Practice Exercise (Struggle) → Frustration → Drop Off (45% attrition)
```

#### Target Journey (Enhanced)
```
Discover → Start Lesson 1 → See Visual Tiles → Complete Lessons with Audio Feedback →
Earn First Badge → Practice with Progressive Difficulty → Review Mistakes →
See Progress Dashboard → Achieve Milestones → Continue to Mastery
```

### 2.3 Jobs-to-be-Done Analysis

**Primary Job**: "Help me learn Mahjong efficiently so I can play confidently with friends/family"

**Success Criteria from User Perspective:**
- Can recognize and name all tile types instantly
- Understand winning hand combinations
- Make strategic decisions in game scenarios
- Feel confident joining real games

**Competitive Alternatives:**
- Video tutorials (passive learning, no practice)
- Physical rulebooks (no interactivity)
- Learn-by-playing apps (overwhelming for beginners)

**Key Differentiators:**
- Progressive difficulty matches skill level
- Immediate feedback accelerates learning
- Gamification maintains motivation
- Mistake analysis prevents repeated errors

---

## 3. Product Requirements

### 3.1 Feature 1: Visual Tile Rendering System

**Priority:** P0 (Must Have - Foundational)
**Complexity:** Medium (M)
**RICE Score:** 360 (Reach: 100% users, Impact: 3, Confidence: 80%, Effort: 0.67 months)

#### User Stories

**US-1.1**: As a learner, I want to see authentic-looking Mahjong tiles instead of emojis so I can recognize them in real games.
- **Acceptance Criteria:**
  - All tile types render as SVG images with traditional Chinese/Japanese designs
  - Tiles display suit symbols (Bamboo, Characters, Dots) clearly at all sizes
  - Honor tiles (Winds, Dragons) use authentic iconography
  - Tiles maintain 3:2 aspect ratio (standard Mahjong dimensions)
  - SVG rendering works on all modern browsers (Chrome, Firefox, Safari, Edge)
  - Performance impact: <50ms additional rendering time per tile
  - Tiles remain accessible with aria-labels describing tile type

**US-1.2**: As a user with visual impairments, I want high-contrast tile options so I can distinguish between different tiles.
- **Acceptance Criteria:**
  - High-contrast mode increases color differentiation by 40%+ (WCAG AAA)
  - Tile borders thicken in high-contrast mode
  - Color-blind friendly palette option available
  - Preference persists in localStorage
  - Mode switchable from settings panel

**US-1.3**: As a mobile user, I want tiles to scale appropriately so they're visible on small screens.
- **Acceptance Criteria:**
  - Tiles resize responsively based on viewport width
  - Minimum tile size: 40px width on smallest supported screens (320px)
  - Maximum tile size: 80px width to prevent excessive scaling
  - Touch targets meet minimum 44px × 44px accessibility guidelines
  - Pinch-to-zoom disabled but tiles remain readable without zooming

#### Technical Specifications

**New Module:** `/src/lib/TileRenderer.js`

```javascript
class TileRenderer {
  constructor(config = {}) {
    this.tileSet = config.tileSet || 'traditional';
    this.colorScheme = config.colorScheme || 'standard';
    this.scale = config.scale || 1.0;
    this.cache = new Map();
  }

  // Core Methods:
  // - renderTile(tileType, tileValue, options): HTMLElement
  // - createSVG(tileData): SVGElement
  // - applyColorScheme(svg, scheme): void
  // - cacheKey(tileType, tileValue, options): string
  // - clearCache(): void
  // - preloadTileSet(tileTypes): Promise<void>
}
```

**Data Schema Changes:**

Add to `preferences.defaults`:
```javascript
{
  tileStyle: 'traditional', // 'traditional' | 'modern' | 'simplified'
  tileColorScheme: 'standard', // 'standard' | 'high-contrast' | 'colorblind'
  tileScale: 1.0 // 0.8 - 1.2 range
}
```

**SVG Asset Structure:**
```
/assets/tiles/
  ├── bamboo/
  │   ├── 1.svg through 9.svg
  ├── characters/
  │   ├── 1.svg through 9.svg
  ├── dots/
  │   ├── 1.svg through 9.svg
  ├── winds/
  │   ├── east.svg, south.svg, west.svg, north.svg
  ├── dragons/
  │   ├── red.svg, green.svg, white.svg
  └── back.svg
```

**Integration Points:**
- Replace emoji rendering in lesson content displays
- Update practice exercise tile generation
- Integrate with accessibility screen reader descriptions
- Hook into preferences system for style selection

**Performance Requirements:**
- Initial tile set load: <500ms (3G connection)
- Tile render time: <10ms per tile
- Memory usage: <5MB for complete tile set
- Cache hit rate: >90% for repeated tiles

---

### 3.2 Feature 2: Progressive Difficulty Levels

**Priority:** P0 (Must Have - Core Learning Experience)
**Complexity:** Large (L)
**RICE Score:** 420 (Reach: 100% users, Impact: 3, Confidence: 70%, Effort: 0.5 months)

#### User Stories

**US-2.1**: As a beginner, I want practice exercises to start easy and get harder so I build confidence progressively.
- **Acceptance Criteria:**
  - Each exercise offers 4 difficulty levels: Easy, Medium, Hard, Expert
  - Easy mode: 5 tiles per question, 60-second timer, hints available
  - Medium mode: 8 tiles per question, 45-second timer, limited hints
  - Hard mode: 11 tiles per question, 30-second timer, no hints
  - Expert mode: 13 tiles (full hand), 20-second timer, time pressure
  - Difficulty selection UI appears before each exercise
  - System recommends difficulty based on past performance

**US-2.2**: As a learner, I want the app to suggest the right difficulty level so I'm appropriately challenged.
- **Acceptance Criteria:**
  - Algorithm tracks last 10 exercise attempts per difficulty
  - Suggests next difficulty if user scores >85% accuracy on 5+ consecutive attempts
  - Suggests lower difficulty if user scores <50% accuracy on 3+ consecutive attempts
  - Recommendation displayed as notification with rationale
  - User can accept or dismiss recommendation
  - Recommendations logged for analytics

**US-2.3**: As an advanced learner, I want expert-level challenges that simulate real game pressure.
- **Acceptance Criteria:**
  - Expert mode includes multi-step reasoning questions
  - Questions require strategic thinking (e.g., "Which tile keeps most options open?")
  - Time pressure increases as streak continues
  - Expert mode unlocked after completing 3+ exercises on Hard with >70% accuracy
  - Badge awarded for first expert completion

#### Technical Specifications

**New Module:** `/src/lib/DifficultyManager.js`

```javascript
class DifficultyManager {
  constructor() {
    this.levels = {
      easy: { tiles: 5, timeLimit: 60, hintsAllowed: 3, scoreMultiplier: 1.0 },
      medium: { tiles: 8, timeLimit: 45, hintsAllowed: 1, scoreMultiplier: 1.5 },
      hard: { tiles: 11, timeLimit: 30, hintsAllowed: 0, scoreMultiplier: 2.0 },
      expert: { tiles: 13, timeLimit: 20, hintsAllowed: 0, scoreMultiplier: 3.0 }
    };
    this.performanceHistory = new Map();
  }

  // Core Methods:
  // - getCurrentDifficulty(exerciseId): string
  // - setDifficulty(exerciseId, level): void
  // - recordAttempt(exerciseId, difficulty, score, timeUsed): void
  // - getRecommendation(exerciseId): { level: string, reason: string } | null
  // - isUnlocked(level, exerciseId): boolean
  // - getProgressToNextLevel(exerciseId): number
  // - exportPerformanceData(): Object
}
```

**Data Schema Changes:**

Add to `GameData`:
```javascript
{
  exercisePerformance: {
    [exerciseId]: {
      [difficulty]: {
        attempts: number,
        completions: number,
        averageScore: number,
        averageTime: number,
        bestScore: number,
        bestTime: number,
        lastAttempt: timestamp,
        consecutiveSuccess: number
      }
    }
  },
  difficultyPreferences: {
    [exerciseId]: 'easy' | 'medium' | 'hard' | 'expert'
  },
  unlockedDifficulties: {
    [exerciseId]: string[] // e.g., ['easy', 'medium']
  }
}
```

**Algorithm: Difficulty Recommendation**
```
Function recommendDifficulty(exerciseId):
  current = getCurrentDifficulty(exerciseId)
  history = getLast10Attempts(exerciseId, current)

  If history.length < 5:
    Return null (insufficient data)

  recentPerformance = getLast5Attempts(exerciseId, current)
  avgScore = average(recentPerformance.scores)
  avgAccuracy = avgScore / maxScore

  If avgAccuracy >= 0.85 AND consecutiveSuccess >= 5:
    nextLevel = getNextDifficulty(current)
    If isUnlocked(nextLevel):
      Return { level: nextLevel, reason: "You're mastering this level!" }

  If avgAccuracy < 0.50 AND consecutiveFailure >= 3:
    prevLevel = getPreviousDifficulty(current)
    If prevLevel exists:
      Return { level: prevLevel, reason: "Let's build confidence at this level" }

  Return null
```

**Integration Points:**
- Exercise initialization (select difficulty)
- Exercise completion (record performance)
- Settings panel (view/change difficulty preferences)
- Progress dashboard (display performance by difficulty)
- Achievement system (unlock notifications)

---

### 3.3 Feature 3: Gamification System

**Priority:** P1 (Should Have - High Impact on Engagement)
**Complexity:** X-Large (XL)
**RICE Score:** 450 (Reach: 100% users, Impact: 3, Confidence: 75%, Effort: 1 month)

#### User Stories

**US-3.1**: As a learner, I want to earn points for completing lessons and exercises so I feel rewarded for progress.
- **Acceptance Criteria:**
  - Points awarded for: completing lessons (100pts), completing exercises (50-300pts based on difficulty), achieving high accuracy (bonus 50-200pts), speed bonuses (bonus 25-100pts)
  - Points display updates with animation on earning
  - Total points visible in header and dashboard
  - Point transactions logged with timestamp and reason
  - Point history viewable in profile section

**US-3.2**: As a competitive learner, I want to earn badges for achievements so I have goals to work toward.
- **Acceptance Criteria:**
  - Badge system includes 25+ unique badges across categories:
    - **Learning Milestones**: "First Steps" (lesson 1), "Halfway There" (lesson 7), "Graduate" (all lessons)
    - **Mastery**: "Perfect Score" (100% on exercise), "Speed Demon" (complete under time), "Unstoppable" (10 consecutive successes)
    - **Dedication**: "Daily Learner" (7-day streak), "Committed" (30-day streak), "Dedicated" (100 lessons/exercises)
    - **Difficulty**: "Easy Expert" (master easy), "Medium Master", "Hard Hero", "Expert Elite"
    - **Special**: "Mistake Master" (complete mistake review), "Explorer" (try all exercises), "Completionist" (100% completion)
  - Badge unlock triggers notification with description and icon
  - Badges display in profile gallery with unlock date
  - Locked badges show silhouette and unlock requirements
  - Badge progress bars for multi-step achievements

**US-3.3**: As a motivated user, I want experience levels that increase as I learn so I see long-term progression.
- **Acceptance Criteria:**
  - XP system with 20 levels (Level 1: "Beginner" → Level 20: "Master")
  - XP requirements increase exponentially: Level N requires N² × 100 XP
  - XP awarded from points earned (1 point = 1 XP)
  - Level-up triggers celebration animation and notification
  - Progress bar shows XP progress to next level
  - Level titles displayed next to username
  - Special rewards at milestone levels (5, 10, 15, 20)

**US-3.4**: As a daily user, I want streak tracking so I'm motivated to practice consistently.
- **Acceptance Criteria:**
  - Streak counter tracks consecutive days with at least 1 completed lesson/exercise
  - Streak resets if no activity for 24+ hours
  - Streak displayed prominently in dashboard
  - Milestone notifications at 3, 7, 14, 30, 60, 100 day streaks
  - Streak protection: 1 "freeze" per 30 days to prevent reset
  - Push notification reminders if streak at risk (optional, browser-based)

#### Technical Specifications

**New Module:** `/src/lib/GamificationEngine.js`

```javascript
class GamificationEngine {
  constructor() {
    this.pointsConfig = {
      lessonComplete: 100,
      exerciseComplete: { easy: 50, medium: 100, hard: 200, expert: 300 },
      accuracyBonus: { threshold: 0.9, points: 100 },
      speedBonus: { threshold: 0.5, points: 50 }, // Complete in <50% of time limit
      perfectScore: 200,
      firstAttemptSuccess: 50
    };

    this.levelConfig = {
      maxLevel: 20,
      xpFormula: (level) => level * level * 100,
      levelTitles: {
        1: "Novice", 5: "Apprentice", 10: "Practitioner",
        15: "Expert", 20: "Master"
      }
    };

    this.badges = this.initializeBadges();
  }

  // Core Methods:
  // - awardPoints(reason, amount, metadata): number
  // - checkLevelUp(): { leveled: boolean, newLevel: number, rewards: [] }
  // - checkBadgeUnlocks(): Badge[]
  // - updateStreak(): { streak: number, milestoneReached: boolean }
  // - getPlayerStats(): { level, xp, points, badges, streak }
  // - exportGamificationData(): Object
  // - initializeBadges(): Badge[]
}

class Badge {
  constructor(id, name, description, icon, category, criteria) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon; // SVG path or emoji
    this.category = category;
    this.criteria = criteria; // Function that returns boolean
    this.unlocked = false;
    this.unlockedAt = null;
    this.progress = 0; // For multi-step badges
  }

  check(userData): boolean;
  unlock(): void;
  getProgress(userData): number;
}
```

**New Module:** `/src/lib/NotificationManager.js`

```javascript
class NotificationManager {
  constructor() {
    this.queue = [];
    this.isDisplaying = false;
    this.container = null;
  }

  // Core Methods:
  // - showNotification(type, message, options): void
  // - showBadgeUnlock(badge): void
  // - showLevelUp(level, rewards): void
  // - showStreakMilestone(days): void
  // - showPointsEarned(points, reason): void
  // - queueNotification(notification): void
  // - displayNext(): void
  // - dismiss(notificationId): void
}
```

**Data Schema Changes:**

Add to `GameData`:
```javascript
{
  gamification: {
    points: 0,
    xp: 0,
    level: 1,
    badges: {
      [badgeId]: {
        unlocked: boolean,
        unlockedAt: timestamp,
        progress: number
      }
    },
    streak: {
      current: 0,
      longest: 0,
      lastActivity: timestamp,
      freezesAvailable: 1,
      milestones: []
    },
    pointsHistory: [
      { timestamp, reason, amount, metadata }
    ],
    levelHistory: [
      { level, reachedAt: timestamp }
    ]
  }
}
```

**Integration Points:**
- Lesson completion handlers → award points
- Exercise completion handlers → award points, check badges
- Daily login → update streak
- Dashboard → display stats, badges, level
- Settings → notification preferences
- Profile page → achievements showcase

**UI Components:**
- Badge gallery modal
- Level-up animation overlay
- Points earned toast notification
- Streak counter widget
- Progress bars for XP and badge progress

---

### 3.4 Feature 4: Audio Feedback System

**Priority:** P2 (Could Have - Enhances UX)
**Complexity:** Small (S)
**RICE Score:** 240 (Reach: 80% users, Impact: 2, Confidence: 100%, Effort: 0.25 months)

#### User Stories

**US-4.1**: As a user, I want audio feedback for actions so I have multisensory confirmation.
- **Acceptance Criteria:**
  - Distinct sounds for: tile click, correct answer, incorrect answer, lesson complete, badge unlock, level up, button click, error
  - Sounds are short (100-500ms) and non-intrusive
  - Volume adjustable from 0-100% in settings
  - Master mute toggle in header (persistent across sessions)
  - Sounds respect system "reduce motion" preference (disable by default if active)
  - Browser audio context initialized on first user interaction (autoplay policy compliance)

**US-4.2**: As a user with hearing impairments, I want visual alternatives to audio cues so I don't miss feedback.
- **Acceptance Criteria:**
  - Visual flash/pulse accompanies each sound
  - Color-coded visual feedback: green (success), red (error), blue (info), gold (achievement)
  - Visual feedback respects reduced motion preference (no animation, only color change)
  - Setting to prefer visual-only feedback
  - Screen reader announcements for important audio events

#### Technical Specifications

**New Module:** `/src/lib/AudioManager.js`

```javascript
class AudioManager {
  constructor() {
    this.context = null; // AudioContext, initialized on first user interaction
    this.sounds = new Map();
    this.volume = 0.7;
    this.muted = false;
    this.initialized = false;
  }

  // Core Methods:
  // - initialize(): Promise<void>
  // - loadSound(name, path): Promise<AudioBuffer>
  // - play(soundName, options): void
  // - setVolume(level): void
  // - mute(): void
  // - unmute(): void
  // - preloadAllSounds(): Promise<void>
}
```

**Sound Assets:**
```
/assets/sounds/
  ├── click.mp3 (soft click, 150ms)
  ├── correct.mp3 (pleasant chime, 400ms)
  ├── incorrect.mp3 (subtle buzz, 300ms)
  ├── lesson-complete.mp3 (success jingle, 1000ms)
  ├── badge-unlock.mp3 (achievement fanfare, 1500ms)
  ├── level-up.mp3 (triumph sound, 2000ms)
  ├── button.mp3 (UI click, 100ms)
  └── error.mp3 (error tone, 300ms)
```

**Audio Specifications:**
- Format: MP3 (broad compatibility)
- Bitrate: 128kbps (balance quality/size)
- Sample Rate: 44.1kHz
- Total asset size: <200KB for all sounds
- Fallback: OGG format for browsers without MP3 support

**Data Schema Changes:**

Add to `preferences.defaults`:
```javascript
{
  audioEnabled: true,
  audioVolume: 0.7,
  audioMuted: false,
  visualFeedbackOnly: false
}
```

**Integration Points:**
- User interaction events (clicks, submissions)
- Success/failure states in exercises
- Gamification events (badges, levels, streaks)
- Visual feedback system (coordinate audio + visual)
- Preferences system (persist settings)

**Accessibility Considerations:**
- Respect `prefers-reduced-motion` media query
- Provide visual alternatives for all audio cues
- Allow complete disabling of audio system
- No critical information conveyed by audio alone
- Screen reader announcements for important events

---

### 3.5 Feature 5: Mistake Review System

**Priority:** P1 (Should Have - High Learning Value)
**Complexity:** Large (L)
**RICE Score:** 400 (Reach: 100% users, Impact: 3, Confidence: 80%, Effort: 0.6 months)

#### User Stories

**US-5.1**: As a learner, I want to see which questions I got wrong so I can learn from mistakes.
- **Acceptance Criteria:**
  - "Review Mistakes" button appears after completing exercise with errors
  - Review mode displays incorrect questions with user's answer and correct answer
  - Explanation provided for why answer was incorrect
  - User can retry incorrect questions immediately
  - Mistake history persists across sessions
  - Option to clear mistake history

**US-5.2**: As a learner, I want to identify patterns in my mistakes so I know what to practice.
- **Acceptance Criteria:**
  - Mistake analytics dashboard shows:
    - Most common mistake types (e.g., "Confusing Chows and Pungs", "Misidentifying Winds")
    - Mistake frequency by tile type
    - Mistake frequency by difficulty level
    - Improvement trend over time
  - Pattern detection algorithm identifies recurring errors
  - Recommendations generated: "Practice more X exercises" or "Review Lesson Y"
  - Analytics exportable as CSV

**US-5.3**: As a dedicated learner, I want targeted practice based on my weak areas so I improve efficiently.
- **Acceptance Criteria:**
  - "Practice Weak Areas" mode generates questions focused on mistake patterns
  - Algorithm selects questions from mistake-prone categories
  - Success in weak area practice removes from "needs improvement" list
  - Progress tracked separately for each weak area
  - Badge awarded for completing all weak area practice

#### Technical Specifications

**New Module:** `/src/lib/MistakeAnalyzer.js`

```javascript
class MistakeAnalyzer {
  constructor() {
    this.mistakes = [];
    this.patterns = new Map();
    this.categories = ['tile-recognition', 'combination-types', 'hand-evaluation', 'strategic-thinking'];
  }

  // Core Methods:
  // - recordMistake(question, userAnswer, correctAnswer, metadata): void
  // - analyzePatterns(): { patterns: [], recommendations: [] }
  // - getMistakesByCategory(category): Mistake[]
  // - getMistakesByExercise(exerciseId): Mistake[]
  // - getWeakAreas(): { category: string, mistakeCount: number, successRate: number }[]
  // - generateTargetedPractice(category, count): Question[]
  // - exportMistakeData(): Object
  // - clearHistory(filters): void
}

class Mistake {
  constructor(data) {
    this.id = Utils.generateId();
    this.timestamp = Date.now();
    this.exerciseId = data.exerciseId;
    this.difficulty = data.difficulty;
    this.question = data.question;
    this.userAnswer = data.userAnswer;
    this.correctAnswer = data.correctAnswer;
    this.category = data.category;
    this.tileTypes = data.tileTypes; // Which tiles were involved
    this.reviewed = false;
    this.retried = false;
    this.retryCorrected = false;
  }

  markReviewed(): void;
  markRetried(success: boolean): void;
}
```

**New UI Component:** `/src/components/MistakeReviewModal.js`

```javascript
class MistakeReviewModal {
  constructor(mistakes) {
    this.mistakes = mistakes;
    this.currentIndex = 0;
  }

  render(): HTMLElement;
  showMistake(index): void;
  handleRetry(mistakeId): void;
  close(): void;
}
```

**Data Schema Changes:**

Add to `GameData`:
```javascript
{
  mistakes: {
    history: [
      {
        id: string,
        timestamp: number,
        exerciseId: string,
        difficulty: string,
        question: Object,
        userAnswer: any,
        correctAnswer: any,
        category: string,
        tileTypes: string[],
        reviewed: boolean,
        retried: boolean,
        retryCorrected: boolean
      }
    ],
    patterns: {
      [category]: {
        count: number,
        lastOccurrence: timestamp,
        improvementRate: number
      }
    },
    weakAreas: string[], // Categories needing practice
    practiceHistory: [
      { category: string, timestamp: number, success: boolean }
    ]
  }
}
```

**Pattern Detection Algorithm:**
```
Function detectPatterns(mistakes):
  categoryCounts = groupBy(mistakes, 'category')
  tileCounts = groupBy(mistakes, 'tileTypes')

  patterns = []

  For each category, count in categoryCounts:
    If count >= 3 AND last3Mistakes.allInSameCategory:
      patterns.push({
        type: 'recurring_category',
        category: category,
        severity: 'high',
        recommendation: `Review ${category} concepts in Lesson X`
      })

  For each tileType, count in tileCounts:
    If count >= 5:
      patterns.push({
        type: 'tile_confusion',
        tileType: tileType,
        severity: 'medium',
        recommendation: `Practice identifying ${tileType} tiles`
      })

  Return patterns
```

**Integration Points:**
- Exercise completion → record mistakes
- Exercise results screen → show review button
- Dashboard → display mistake analytics
- Practice mode → use mistake data for targeted questions
- Gamification → award badges for improvement
- Export functionality → analytics data

---

### 3.6 Feature 6: Real Game Scenarios

**Priority:** P1 (Should Have - High Value for Readiness)
**Complexity:** X-Large (XL)
**RICE Score:** 380 (Reach: 75% users, Impact: 3, Confidence: 80%, Effort: 0.75 months)

#### User Stories

**US-6.1**: As a learner, I want to practice decision-making in game-like situations so I'm prepared for real games.
- **Acceptance Criteria:**
  - New "Game Scenarios" section with 20+ realistic situations
  - Scenarios include: "Should you discard this tile?", "Which tile to keep for flexibility?", "Claim this discard or wait?", "Is your hand ready to win?"
  - Each scenario presents game state (your hand, discards, round info)
  - Multiple-choice decisions with explanations for each option
  - Scenarios categorized: defensive play, offensive play, reading opponents, tile efficiency
  - Unlocked progressively based on lesson completion

**US-6.2**: As an advanced learner, I want strategic challenges that test game theory knowledge.
- **Acceptance Criteria:**
  - Advanced scenarios test: tile efficiency, hand reading, risk assessment, yaku (scoring patterns) recognition
  - Time-limited decisions simulate real-time pressure
  - Scenarios include multi-turn sequences
  - Explanations reference strategic concepts from lessons
  - Expert scenarios unlocked after completing all lessons
  - Leaderboard for scenario completion speed and accuracy

**US-6.3**: As a competitive user, I want scenario challenges with scoring so I can measure strategic skill.
- **Acceptance Criteria:**
  - Each scenario awards points based on decision quality: Optimal (100pts), Good (60pts), Acceptable (30pts), Poor (0pts)
  - Score influenced by decision time (faster = bonus)
  - Cumulative scenario score displayed in profile
  - Scenarios retryable to improve score
  - High scores per scenario saved
  - Achievements for scenario mastery

#### Technical Specifications

**New Module:** `/src/lib/ScenarioEngine.js`

```javascript
class ScenarioEngine {
  constructor() {
    this.scenarios = this.loadScenarios();
    this.currentScenario = null;
    this.decisions = [];
  }

  // Core Methods:
  // - loadScenarios(): Scenario[]
  // - getScenario(id): Scenario
  // - getScenariosByCategory(category): Scenario[]
  // - startScenario(id): void
  // - submitDecision(optionId): { correct: boolean, quality: string, points: number, explanation: string }
  // - getScenarioProgress(): { completed: number, total: number, avgScore: number }
  // - isUnlocked(scenarioId): boolean
}

class Scenario {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.category = data.category;
    this.difficulty = data.difficulty;
    this.description = data.description;
    this.gameState = data.gameState; // hand, discards, round, etc.
    this.question = data.question;
    this.options = data.options; // Multiple choice
    this.correctOption = data.correctOption;
    this.explanations = data.explanations; // Per option
    this.timeLimit = data.timeLimit;
    this.unlockRequirement = data.unlockRequirement;
  }

  evaluate(selectedOption, timeUsed): EvaluationResult;
  render(): HTMLElement;
}
```

**Scenario Data Structure:**
```javascript
{
  id: "scenario_001",
  title: "Safe Discard Decision",
  category: "defensive-play",
  difficulty: "medium",
  description: "It's round 2, and you've noticed the player across has claimed two discarded Bamboo tiles. What's your safest discard?",
  gameState: {
    hand: ["1-bamboo", "2-bamboo", "3-bamboo", "5-dot", "6-dot", "7-dot", "east", "east", "south", "red-dragon", "red-dragon"],
    discards: {
      player1: ["9-character", "north"],
      player2: ["4-bamboo", "5-bamboo"],
      player3: ["west", "1-dot"],
      player4: [] // You
    },
    round: "East-2",
    turnNumber: 8
  },
  question: "Which tile should you discard to minimize risk?",
  options: [
    { id: "a", text: "South", quality: "optimal" },
    { id: "b", text: "5-dot", quality: "good" },
    { id: "c", text: "Red Dragon", quality: "acceptable" },
    { id: "d", text: "1-bamboo", quality: "poor" }
  ],
  correctOption: "a",
  explanations: {
    a: "Correct! South is safest because no one has claimed Winds yet, and it doesn't break up your sequences.",
    b: "Reasonable choice, but it breaks up a potential sequence. South is safer.",
    c: "Risky - Dragons are valuable, and someone might need this for a pung.",
    d: "Poor choice - this breaks up your Bamboo sequence and might feed an opponent's hand."
  },
  timeLimit: 30,
  unlockRequirement: { lessonsCompleted: 8 }
}
```

**Data Schema Changes:**

Add to `GameData`:
```javascript
{
  scenarios: {
    progress: {
      [scenarioId]: {
        completed: boolean,
        attempts: number,
        bestScore: number,
        bestTime: number,
        decisions: [
          { option: string, time: number, score: number, timestamp: number }
        ]
      }
    },
    totalScore: number,
    categoriesCompleted: string[],
    unlockedScenarios: string[]
  }
}
```

**Integration Points:**
- New navigation item: "Game Scenarios"
- Lesson completion → unlock scenarios
- Gamification → award points for scenarios
- Dashboard → show scenario statistics
- Leaderboard system (future feature)

**Content Requirements:**
- 20+ scenarios authored covering:
  - Beginner scenarios (5): Basic discarding, recognizing winning hands
  - Intermediate scenarios (8): Tile efficiency, basic strategy
  - Advanced scenarios (7): Defensive play, reading opponents
  - Expert scenarios (5+): Complex multi-turn decision trees

---

### 3.7 Feature 7: Enhanced Progress Dashboard

**Priority:** P0 (Must Have - Core Visibility)
**Complexity:** Large (L)
**RICE Score:** 440 (Reach: 100% users, Impact: 3, Confidence: 88%, Effort: 0.6 months)

#### User Stories

**US-7.1**: As a user, I want to see my overall progress at a glance so I know where I stand.
- **Acceptance Criteria:**
  - Dashboard displays: lessons completed (X/13), exercises completed (Y total), total time spent, overall accuracy, current streak, level and XP
  - Visual progress rings/bars for key metrics
  - Recent activity feed (last 5 actions)
  - Quick links to continue learning, review mistakes, practice weak areas
  - Dashboard loads in <1 second
  - Responsive layout for mobile/tablet/desktop

**US-7.2**: As a data-oriented learner, I want detailed analytics so I can track improvement over time.
- **Acceptance Criteria:**
  - Time-series graphs showing:
    - Accuracy trend (last 30 days)
    - Time spent per session (last 30 days)
    - Exercises completed per week
    - Mistake rate over time
  - Filters: Last 7 days, 30 days, 90 days, All time
  - Graphs use Chart.js or similar lightweight library
  - Data exportable as CSV
  - Comparison to personal bests

**US-7.3**: As a learner, I want a skills matrix showing my proficiency in different areas.
- **Acceptance Criteria:**
  - Skills matrix displays proficiency (0-100%) for:
    - Tile Recognition
    - Pair Identification
    - Chow Recognition
    - Pung Recognition
    - Winning Hand Evaluation
    - Strategic Thinking
    - Speed and Efficiency
  - Proficiency calculated from exercise performance in each category
  - Color-coded: Red (<50%), Yellow (50-75%), Green (>75%)
  - Clicking skill area shows detailed breakdown and practice recommendations
  - Skills update dynamically as user completes exercises

**US-7.4**: As a motivated user, I want milestone celebrations when I reach achievements.
- **Acceptance Criteria:**
  - Milestones defined: First lesson, 50% lessons, all lessons, 100 exercises, 1000 points, 7-day streak, first expert completion
  - Milestone reached triggers full-screen celebration animation
  - Milestone card shows achievement name, date reached, reward (badge/points)
  - Gallery of reached milestones in dashboard
  - Social sharing option for milestones (optional)

#### Technical Specifications

**New Module:** `/src/lib/ProgressAnalyzer.js`

```javascript
class ProgressAnalyzer {
  constructor() {
    this.data = GameData;
    this.gamification = new GamificationEngine();
  }

  // Core Methods:
  // - getOverallStats(): { lessonsCompleted, exercisesCompleted, totalTime, avgAccuracy, streak, level, xp }
  // - getTimeSeriesData(metric, timeRange): { labels: [], data: [] }
  // - getSkillsProficiency(): { skill: string, proficiency: number }[]
  // - getRecentActivity(limit): Activity[]
  // - getMilestones(): { achieved: Milestone[], upcoming: Milestone[] }
  // - calculateSkillScore(skill): number
  // - exportAnalytics(): Object
}
```

**New UI Component:** `/src/components/Dashboard.js`

```javascript
class Dashboard {
  constructor(container) {
    this.container = container;
    this.analyzer = new ProgressAnalyzer();
    this.charts = new Map();
  }

  render(): void;
  renderOverviewSection(): HTMLElement;
  renderAnalyticsSection(): HTMLElement;
  renderSkillsMatrix(): HTMLElement;
  renderRecentActivity(): HTMLElement;
  renderMilestones(): HTMLElement;
  updateCharts(timeRange): void;
  destroy(): void;
}
```

**Skills Calculation Algorithm:**
```
Function calculateSkillProficiency(skill):
  relatedExercises = getExercisesBySkill(skill)

  If relatedExercises.length == 0:
    Return 0

  totalAttempts = 0
  totalScore = 0
  maxScore = 0

  For each exercise in relatedExercises:
    performance = getPerformance(exercise.id)
    totalAttempts += performance.attempts
    totalScore += performance.averageScore * performance.attempts
    maxScore += performance.maxPossibleScore * performance.attempts

  If maxScore == 0:
    Return 0

  rawProficiency = (totalScore / maxScore) * 100

  // Apply experience modifier (more attempts = more weight)
  experienceModifier = min(totalAttempts / 20, 1.0) // Caps at 20 attempts

  Return rawProficiency * (0.7 + 0.3 * experienceModifier)
```

**Data Schema Changes:**

Add to `GameData`:
```javascript
{
  analytics: {
    totalTimeSpent: 0, // seconds
    sessionHistory: [
      { timestamp: number, duration: number, lessonsCompleted: number, exercisesCompleted: number }
    ],
    dailyActivity: {
      [dateString]: {
        timeSpent: number,
        lessonsCompleted: number,
        exercisesCompleted: number,
        pointsEarned: number
      }
    },
    milestones: {
      [milestoneId]: {
        achieved: boolean,
        achievedAt: timestamp,
        celebrated: boolean
      }
    }
  }
}
```

**Chart Library Integration:**
- Library: Chart.js (lightweight, well-documented)
- Chart types: Line (trends), Bar (comparisons), Radar (skills matrix)
- Performance: Lazy load charts (only render when dashboard viewed)
- Accessibility: Provide data tables as fallback
- Responsive: Charts resize based on container

**Integration Points:**
- Main navigation → "Dashboard" link
- Lesson/Exercise completion → update analytics
- Gamification events → check milestones
- Export functionality → download CSV
- Skills proficiency → practice recommendations

---

## 4. Technical Specifications

### 4.1 Architecture Overview

#### Current Architecture
```
/src/
  /lib/
    data.js              # LocalStorage manager
    MahjongController.js # Game state controller
    preferences.js       # User preferences
    utils.js             # Utility functions
    constants.js         # Configuration
  /assets/
    /styles/
    /images/
  learn-mahjong.html     # Main entry point
  /tests/
    /e2e/
```

#### Enhanced Architecture
```
/src/
  /lib/
    # Existing modules (unchanged)
    data.js
    MahjongController.js
    preferences.js
    utils.js
    constants.js

    # New core modules
    TileRenderer.js       # SVG tile rendering
    DifficultyManager.js  # Progressive difficulty
    GamificationEngine.js # Points, badges, levels
    AudioManager.js       # Sound effects
    MistakeAnalyzer.js    # Mistake tracking & analysis
    ScenarioEngine.js     # Game scenario system
    ProgressAnalyzer.js   # Analytics & insights
    NotificationManager.js # Toast/modal notifications

  /components/
    # New UI components
    Dashboard.js          # Progress dashboard
    BadgeGallery.js       # Badge showcase
    MistakeReviewModal.js # Mistake review interface
    ScenarioPlayer.js     # Scenario gameplay
    SkillsMatrix.js       # Visual skills grid
    ProgressCharts.js     # Chart visualizations

  /assets/
    /tiles/               # SVG tile assets
      /bamboo/
      /characters/
      /dots/
      /winds/
      /dragons/
    /sounds/              # Audio files
    /icons/               # Badge icons, UI icons
    /styles/
      dashboard.css
      scenarios.css
      gamification.css

  /data/
    scenarios.json        # Scenario definitions
    badges.json           # Badge configurations

  /tests/
    /unit/                # New unit tests
    /e2e/                 # Extended E2E tests
```

### 4.2 Module Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Lessons │ Exercises │ Scenarios │ Settings     │
└──────┬──────────┬────────┬──────────┬───────────┬───────────┘
       │          │        │          │           │
┌──────▼──────────▼────────▼──────────▼───────────▼───────────┐
│                    Controller Layer                          │
├─────────────────────────────────────────────────────────────┤
│           MahjongController (existing)                       │
│  ┌─────────────┬──────────────┬────────────┬──────────────┐ │
│  │TileRenderer │DifficultyMgr │Scenario    │Gamification  │ │
│  │             │              │Engine      │Engine        │ │
│  └─────────────┴──────────────┴────────────┴──────────────┘ │
└──────┬──────────┬─────────┬──────────┬───────────┬─────────┘
       │          │         │          │           │
┌──────▼──────────▼─────────▼──────────▼───────────▼─────────┐
│                     Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  AudioManager │ MistakeAnalyzer │ ProgressAnalyzer │        │
│  NotificationMgr │ PreferencesManager │                     │
└──────┬──────────┬─────────┬──────────┬───────────┬─────────┘
       │          │         │          │           │
┌──────▼──────────▼─────────▼──────────▼───────────▼─────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│              DataManager (LocalStorage)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GameData │ Preferences │ Analytics │ Gamification    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow Examples

#### Example 1: Exercise Completion Flow
```
1. User completes exercise
   ↓
2. Exercise UI calls DifficultyManager.recordAttempt()
   ↓
3. DifficultyManager:
   - Calculates score based on difficulty multiplier
   - Updates performance history
   - Checks for difficulty recommendations
   ↓
4. Calls GamificationEngine.awardPoints()
   ↓
5. GamificationEngine:
   - Awards base points + bonuses
   - Checks for level-up
   - Checks for badge unlocks
   - Updates streak
   ↓
6. Calls MistakeAnalyzer.recordMistake() for errors
   ↓
7. MistakeAnalyzer:
   - Logs mistakes with metadata
   - Runs pattern detection
   - Updates weak areas
   ↓
8. Calls NotificationManager for feedback
   ↓
9. NotificationManager:
   - Queues notifications (points, badges, level-up)
   - Displays in sequence
   ↓
10. Calls AudioManager for sound effects
    ↓
11. AudioManager plays success/achievement sounds
    ↓
12. All changes persisted via DataManager
    ↓
13. ProgressAnalyzer updates dashboard metrics
```

#### Example 2: Tile Rendering Flow
```
1. Lesson/Exercise needs to display tiles
   ↓
2. Calls TileRenderer.renderTile(type, value, options)
   ↓
3. TileRenderer:
   - Checks cache for existing SVG
   - If cached: return cached element
   - If not: generate new SVG
   ↓
4. Generate SVG:
   - Load tile template from assets
   - Apply color scheme from preferences
   - Apply scale from preferences
   - Add accessibility attributes
   ↓
5. Cache rendered SVG
   ↓
6. Return HTML element to caller
   ↓
7. Caller inserts into DOM
```

### 4.4 Performance Optimization Strategies

#### Lazy Loading
- Dashboard charts load only when dashboard viewed
- Scenario data loads on-demand per scenario
- Badge images lazy-loaded as user scrolls gallery
- Audio files preloaded on first user interaction, not on page load

#### Caching
- TileRenderer caches all rendered tiles
- DataManager caches localStorage reads
- Scenario data cached in memory after first load
- Preference values cached to avoid repeated localStorage access

#### Debouncing/Throttling
- Auto-save debounced to 30 seconds (existing)
- Progress chart updates throttled to 500ms
- Mistake pattern analysis debounced to completion + 1 second
- Window resize events throttled for responsive charts

#### Code Splitting
- Main app bundle: Core functionality
- Dashboard bundle: Loaded when user views dashboard
- Scenarios bundle: Loaded when user enters scenarios section
- Use dynamic imports: `import('./Dashboard.js').then(...)`

#### Data Optimization
- Limit stored mistake history to last 200 mistakes
- Archive old session data after 90 days
- Compress exported analytics data
- Use efficient data structures (Maps instead of Objects for lookups)

### 4.5 Browser Compatibility

**Target Browsers:**
- Chrome/Edge: Last 2 versions (95%+ of users)
- Firefox: Last 2 versions
- Safari: Last 2 versions (iOS + macOS)

**Polyfills Required:**
- None (ES6+ features widely supported)

**Feature Detection:**
- LocalStorage: Graceful degradation with in-memory fallback
- AudioContext: Fallback to HTML5 Audio, then no audio
- SVG: Fallback to emoji (current implementation)
- CSS Grid: Fallback to flexbox

**Testing Matrix:**
| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | 120+ | ✓ | ✓ |
| Firefox | 121+ | ✓ | - |
| Safari | 17+ | ✓ | ✓ |
| Edge | 120+ | ✓ | - |

### 4.6 Security Considerations

**Input Validation:**
- Sanitize all user-generated content (preferences)
- Validate imported data structures
- Prevent XSS in notification messages
- Limit localStorage data sizes to prevent DoS

**Data Privacy:**
- All data stored locally (no server transmission)
- No external analytics tracking
- Export functionality user-initiated only
- Clear data option in settings

**Content Security Policy:**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               media-src 'self';">
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Establish core infrastructure for all features

#### Week 1: Visual Tile System + Infrastructure
**Tasks:**
1. Create TileRenderer.js module
   - Implement SVG loading and caching
   - Build color scheme system
   - Add accessibility attributes
2. Design and create SVG tile assets (all 34 tiles)
   - Bamboo suits (9 tiles)
   - Character suits (9 tiles)
   - Dot suits (9 tiles)
   - Wind tiles (4 tiles)
   - Dragon tiles (3 tiles)
3. Update constants.js with tile rendering config
4. Integrate TileRenderer into lesson display
5. Write unit tests for TileRenderer

**Deliverables:**
- Functional TileRenderer module
- Complete SVG tile asset library
- Lessons display SVG tiles instead of emojis
- 15+ unit tests passing

**Success Criteria:**
- All tiles render correctly in all lessons
- Performance: <10ms render time per tile
- Accessibility: All tiles have proper aria-labels
- Cache hit rate >90% after initial render

#### Week 2: Data Layer Enhancements
**Tasks:**
1. Extend GameData schema for all new features
   - Gamification data structures
   - Mistake tracking structures
   - Analytics structures
   - Scenario progress structures
2. Create migration script for existing users
3. Implement data export/import functionality
4. Add data validation and sanitization
5. Write comprehensive data layer tests

**Deliverables:**
- Enhanced data.js with new schemas
- Migration script tested with existing data
- Export/import functionality
- 25+ data layer unit tests passing

**Success Criteria:**
- Zero data loss during migration
- All new schemas validated
- Export/import roundtrip successful
- LocalStorage usage <500KB for typical user

#### Week 3: Difficulty System + Audio Foundation
**Tasks:**
1. Create DifficultyManager.js
   - Implement difficulty levels
   - Build recommendation algorithm
   - Performance tracking per difficulty
2. Update practice exercises to use difficulty system
3. Create AudioManager.js
   - Implement audio context initialization
   - Build sound loading and caching
   - Volume and mute controls
4. Source or create audio assets (8 sounds)
5. Integrate AudioManager with existing UI events

**Deliverables:**
- Functional DifficultyManager module
- All exercises support 4 difficulty levels
- Functional AudioManager module
- Complete sound asset library
- 20+ unit tests for both modules

**Success Criteria:**
- Difficulty selection UI works in all exercises
- Recommendation algorithm suggests correctly
- Audio plays without lag (<100ms)
- Respects user preferences and reduced motion

**Testing:**
- 15 new E2E tests for tile rendering
- 10 E2E tests for difficulty selection
- 8 E2E tests for audio playback and muting

---

### Phase 2: Gamification & Engagement (Weeks 4-6)
**Goal:** Implement points, badges, levels, and streaks

#### Week 4: Core Gamification Engine
**Tasks:**
1. Create GamificationEngine.js
   - Implement points system
   - Build XP and leveling system
   - Create streak tracking
2. Create Badge class and badge definitions
   - Design 25+ badge specifications
   - Implement unlock criteria
   - Progress tracking for multi-step badges
3. Create NotificationManager.js
   - Build notification queue system
   - Create notification UI components
   - Animations and transitions
4. Integrate gamification with lesson/exercise completion

**Deliverables:**
- Functional GamificationEngine module
- 25+ badges defined and testable
- NotificationManager with queue system
- Points awarded for all user actions
- 30+ unit tests

**Success Criteria:**
- Points awarded correctly for all actions
- Badges unlock based on criteria
- Levels advance at correct XP thresholds
- Streaks track daily activity accurately
- Notifications display without blocking UI

#### Week 5: Gamification UI & Integration
**Tasks:**
1. Create BadgeGallery.js component
   - Display unlocked badges
   - Show locked badges with requirements
   - Badge detail modals
2. Create level-up animation
3. Create points earned animations
4. Integrate gamification into header
   - Display current level, XP progress
   - Points counter
   - Streak indicator
5. Add gamification section to settings
   - View all achievements
   - Export gamification data

**Deliverables:**
- Complete BadgeGallery UI component
- Animated level-up overlay
- Points counter in header
- Streak widget
- Settings integration
- 15+ component tests

**Success Criteria:**
- Badge gallery displays all badges correctly
- Animations smooth (60fps)
- XP progress bar updates in real-time
- Streak counter updates daily
- Mobile-responsive layouts

#### Week 6: Mistake Review System
**Tasks:**
1. Create MistakeAnalyzer.js
   - Implement mistake logging
   - Build pattern detection algorithm
   - Generate recommendations
2. Create MistakeReviewModal.js component
   - Display mistakes with context
   - Show explanations
   - Retry functionality
3. Create mistake analytics dashboard section
   - Charts showing mistake trends
   - Category breakdowns
   - Weak areas identification
4. Integrate mistake tracking with exercises
5. Build "Practice Weak Areas" mode

**Deliverables:**
- Functional MistakeAnalyzer module
- MistakeReviewModal component
- Mistake analytics in dashboard
- Targeted practice mode
- 25+ unit tests

**Success Criteria:**
- All mistakes logged with full context
- Pattern detection identifies recurring issues
- Review modal clearly explains errors
- Targeted practice generates relevant questions
- Analytics update in real-time

**Testing:**
- 20 new E2E tests for gamification flows
- 15 E2E tests for mistake review
- 10 E2E tests for notifications

---

### Phase 3: Advanced Features (Weeks 7-9)
**Goal:** Implement scenarios and enhanced dashboard

#### Week 7: Scenario System Foundation
**Tasks:**
1. Create ScenarioEngine.js
   - Implement scenario loading
   - Build decision evaluation
   - Progress tracking
2. Design scenario data format
3. Create ScenarioPlayer.js component
   - Render game state visually
   - Display decision options
   - Show explanations and feedback
4. Author 10 beginner/intermediate scenarios
5. Integrate scenarios into navigation

**Deliverables:**
- Functional ScenarioEngine module
- ScenarioPlayer UI component
- 10 scenarios authored and tested
- Scenario section accessible from nav
- 20+ unit tests

**Success Criteria:**
- Scenarios load and display correctly
- Decision evaluation accurate
- Explanations clear and helpful
- Progress tracked per scenario
- Mobile-friendly scenario UI

#### Week 8: Advanced Scenarios + Leaderboard Foundation
**Tasks:**
1. Author remaining scenarios (10+ advanced/expert)
2. Implement scenario scoring system
3. Create scenario leaderboard (local)
   - Best scores per scenario
   - Fastest completions
   - Overall scenario ranking
4. Add scenario achievements to badge system
5. Integrate scenarios with gamification

**Deliverables:**
- 20+ total scenarios authored
- Scenario leaderboard UI
- Scenario-specific badges
- Complete scenario integration
- 15+ scenario tests

**Success Criteria:**
- Full range of difficulty in scenarios
- Scoring system fair and motivating
- Leaderboard updates correctly
- Scenarios unlock progressively
- Expert scenarios challenging

#### Week 9: Enhanced Dashboard
**Tasks:**
1. Create ProgressAnalyzer.js
   - Calculate all analytics metrics
   - Time-series data preparation
   - Skills proficiency calculation
2. Create Dashboard.js component
   - Overview section
   - Analytics charts section
   - Skills matrix section
   - Recent activity section
   - Milestones section
3. Integrate Chart.js library
4. Create SkillsMatrix.js component
5. Implement milestone celebrations

**Deliverables:**
- Complete Dashboard component
- ProgressAnalyzer module
- Interactive charts
- Visual skills matrix
- Milestone celebration animations
- 25+ dashboard tests

**Success Criteria:**
- Dashboard loads in <1 second
- Charts render smoothly
- Skills proficiency accurate
- Milestones celebrate appropriately
- Fully responsive design

**Testing:**
- 20 new E2E tests for scenarios
- 15 E2E tests for dashboard
- 10 E2E tests for analytics

---

### Phase 4: Polish & Optimization (Weeks 10-11)
**Goal:** Refinement, performance optimization, comprehensive testing

#### Week 10: Performance Optimization
**Tasks:**
1. Implement lazy loading for dashboard charts
2. Optimize tile rendering cache strategy
3. Add code splitting for major modules
4. Compress audio assets
5. Optimize localStorage usage
   - Implement data archiving
   - Add cleanup utilities
6. Performance audit with Lighthouse
7. Memory leak detection and fixes
8. Accessibility audit with WAVE

**Deliverables:**
- Lazy loading implemented
- Code split into 3+ bundles
- Audio assets compressed
- Data cleanup utilities
- Lighthouse score >90
- Accessibility score >95
- Performance report

**Success Criteria:**
- Page load time <2s (3G)
- Time to interactive <3s
- LocalStorage usage <500KB
- No memory leaks detected
- All accessibility issues resolved

#### Week 11: Testing, Bug Fixes, Documentation
**Tasks:**
1. Expand E2E test coverage to 100+ tests
2. Cross-browser testing (Chrome, Firefox, Safari)
3. Mobile device testing (iOS, Android)
4. User acceptance testing with 5+ beta users
5. Bug triage and fixes
6. Code review and refactoring
7. Update documentation:
   - User guide
   - Developer documentation
   - API documentation for modules
8. Create changelog

**Deliverables:**
- 100+ E2E tests passing
- Cross-browser compatibility confirmed
- Mobile responsiveness verified
- All P0/P1 bugs fixed
- Complete documentation
- Changelog

**Success Criteria:**
- Zero critical bugs
- <5 minor bugs remaining
- All tests passing
- Documentation complete
- Ready for production deployment

**Testing:**
- 30+ new E2E tests for edge cases
- Complete regression test suite
- Performance benchmarking
- Accessibility compliance testing

---

### Phase 5: Launch & Iteration (Week 12+)
**Goal:** Deploy, monitor, gather feedback, iterate

#### Week 12: Launch Preparation & Deployment
**Tasks:**
1. Final QA pass
2. Prepare deployment package
3. Create backup of production data
4. Deploy to production
5. Smoke testing in production
6. Announce launch to users
7. Monitor for issues

**Post-Launch (Weeks 13-16):**
1. Monitor analytics and user behavior
2. Gather user feedback
3. Track success metrics weekly
4. Address bugs and issues
5. Plan iteration priorities
6. Evaluate Phase 2 features:
   - Multiplayer scenarios
   - Community leaderboards
   - Advanced AI opponents
   - Custom scenario creator

---

## 6. Testing Strategy

### 6.1 Testing Pyramid

```
         /\
        /  \        E2E Tests (100+ tests)
       /----\       - Critical user journeys
      /      \      - Cross-browser scenarios
     /--------\     - Accessibility compliance
    /  UNIT    \    Unit Tests (150+ tests)
   /------------\   - Module functionality
  /  MANUAL QA   \  - Edge cases
 /________________\ - Integration between modules
                    Manual Testing
                    - Exploratory testing
                    - Usability testing
                    - Visual regression
```

### 6.2 Unit Testing

**Framework:** Playwright Test (existing)

**Coverage Target:** 80%+ for all new modules

**Key Test Areas:**

**TileRenderer.js** (20 tests)
- SVG generation for all tile types
- Cache hit/miss scenarios
- Color scheme application
- Accessibility attributes
- Performance benchmarks
- Error handling for missing assets

**DifficultyManager.js** (25 tests)
- Difficulty level configuration
- Performance recording
- Recommendation algorithm accuracy
- Unlock logic
- Data persistence
- Edge cases (no history, first attempt)

**GamificationEngine.js** (40 tests)
- Points calculation for all actions
- XP and level progression
- Badge unlock criteria (all 25 badges)
- Streak calculation
- Edge cases (streak breaks, level caps)
- Data export/import

**AudioManager.js** (15 tests)
- Audio context initialization
- Sound loading and playback
- Volume and mute controls
- Preference integration
- Browser compatibility
- Error handling (file not found)

**MistakeAnalyzer.js** (30 tests)
- Mistake recording
- Pattern detection algorithm
- Category classification
- Weak area identification
- Targeted practice generation
- Data cleanup

**ScenarioEngine.js** (20 tests)
- Scenario loading
- Decision evaluation
- Scoring calculation
- Progress tracking
- Unlock requirements
- Edge cases (invalid scenarios)

**Sample Unit Test:**
```javascript
test('GamificationEngine awards correct points for exercise completion', () => {
  const engine = new GamificationEngine();
  const initialPoints = engine.getPoints();

  // Complete easy exercise with 100% accuracy
  engine.awardPoints('exerciseComplete', engine.pointsConfig.exerciseComplete.easy, {
    difficulty: 'easy',
    accuracy: 1.0,
    timeRatio: 0.4 // Completed in 40% of time
  });

  // Should award: base (50) + accuracy bonus (100) + speed bonus (50) = 200
  expect(engine.getPoints()).toBe(initialPoints + 200);
});
```

### 6.3 Integration Testing

**Focus Areas:**

**Gamification Integration** (15 tests)
- Lesson completion → points → XP → level check → badge check → notifications
- Exercise completion with mistakes → points + mistake logging → targeted practice
- Streak update → milestone check → badge unlock → celebration

**Dashboard Integration** (20 tests)
- Data flow from all modules to ProgressAnalyzer
- Chart data preparation and rendering
- Skills proficiency calculation from exercise data
- Real-time updates when user completes activities

**Mistake Review Integration** (10 tests)
- Exercise error → mistake logged → pattern detected → dashboard updated → targeted practice available
- Retry flow: review → retry → correction → mistake marked

**Scenario Integration** (10 tests)
- Scenario completion → score calculation → leaderboard update → badge check → gamification points

### 6.4 End-to-End Testing

**Framework:** Playwright (existing)

**Coverage Target:** 100+ tests covering all critical paths

**Test Categories:**

**Critical User Journeys** (30 tests)
1. New user onboarding flow
2. Complete first lesson → earn points → see notification
3. Complete exercise on each difficulty level
4. Earn first badge → view in gallery
5. Make mistake → review → retry → correct
6. View dashboard → analyze progress
7. Complete scenario → see explanation
8. Level up → celebration animation
9. Achieve 7-day streak
10. Export analytics data

**Feature-Specific E2E Tests** (70 tests)

*Tile Rendering* (15 tests)
- All tile types display correctly
- Color schemes apply
- High-contrast mode
- Mobile scaling
- Accessibility labels

*Difficulty System* (10 tests)
- Select each difficulty level
- Complete exercise on each level
- Receive recommendation
- Accept/dismiss recommendation
- Unlock expert mode

*Gamification* (20 tests)
- Earn points from various actions
- Level up at correct XP
- Unlock each badge category
- Streak increments daily
- View badge gallery
- Export gamification data

*Audio System* (8 tests)
- Enable/disable audio
- Adjust volume
- Mute toggle persists
- Sounds play on actions
- Respect reduced motion
- Visual feedback alternatives

*Mistake Review* (15 tests)
- Make intentional mistakes
- View mistake review
- See explanations
- Retry mistakes
- View mistake analytics
- Pattern detection
- Targeted practice mode

*Scenarios* (12 tests)
- Play scenario
- Make decision
- See evaluation
- Retry for better score
- Unlock advanced scenarios
- View leaderboard

*Dashboard* (10 tests)
- View all sections
- Filter time ranges
- Export data
- Click skill for details
- View milestones

**Cross-Browser E2E Tests** (15 tests)
- Core functionality in Chrome, Firefox, Safari
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Accessibility E2E Tests** (10 tests)
- Keyboard navigation for all features
- Screen reader compatibility
- High-contrast mode
- Reduced motion respect
- ARIA labels correctness

**Sample E2E Test:**
```javascript
test('Complete exercise, earn badge, see notification', async ({ page }) => {
  await page.goto('/learn-mahjong.html');

  // Navigate to exercise
  await page.click('text=Practice Exercises');
  await page.click('text=Identifying Pairs');

  // Select easy difficulty
  await page.click('text=Easy');

  // Complete exercise with all correct answers
  for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="correct-answer"]');
  }

  // Check for completion notification
  await expect(page.locator('.notification')).toContainText('Exercise Complete!');
  await expect(page.locator('.notification')).toContainText('+50 points');

  // Check if first exercise badge unlocked
  const badgeNotification = page.locator('.notification.badge-unlock');
  if (await badgeNotification.isVisible()) {
    await expect(badgeNotification).toContainText('First Steps');
  }

  // Verify points added to total
  const pointsDisplay = page.locator('[data-testid="total-points"]');
  const points = parseInt(await pointsDisplay.textContent());
  expect(points).toBeGreaterThanOrEqual(50);
});
```

### 6.5 Performance Testing

**Metrics to Track:**

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | <2s (3G) | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| First Contentful Paint | <1.5s | Lighthouse |
| Tile Render Time | <10ms/tile | Custom benchmark |
| Dashboard Load | <1s | Custom benchmark |
| LocalStorage Usage | <500KB | Manual check |
| Memory Usage | <50MB | Chrome DevTools |
| Audio Latency | <100ms | Custom test |

**Performance Test Suite:**
- Automated Lighthouse runs on each deployment
- Memory leak detection with heap snapshots
- Render performance profiling
- LocalStorage size monitoring
- Network waterfall analysis

### 6.6 Accessibility Testing

**Standards:** WCAG 2.1 Level AA compliance

**Testing Tools:**
- WAVE browser extension
- axe DevTools
- Lighthouse accessibility audit
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

**Accessibility Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels on all icons and tiles
- [ ] Focus visible on all interactive elements
- [ ] Color contrast ratio ≥4.5:1 for normal text
- [ ] Color contrast ratio ≥3:1 for large text
- [ ] No information conveyed by color alone
- [ ] Skip navigation links
- [ ] Form labels associated correctly
- [ ] Error messages descriptive and associated
- [ ] Animations respectful of prefers-reduced-motion
- [ ] Touch targets ≥44×44px
- [ ] Alternative text for all images
- [ ] Audio has visual alternatives

### 6.7 User Acceptance Testing

**Timeline:** Week 11 (before launch)

**Participants:** 5-10 beta testers representing target personas

**Testing Scenarios:**
1. Complete beginner experience (lessons 1-3)
2. Practice all exercises on different difficulties
3. Review mistakes and complete targeted practice
4. Play 5+ game scenarios
5. Explore dashboard and analytics
6. Customize preferences (audio, themes, etc.)
7. Attempt to break the application (exploratory testing)

**Feedback Collection:**
- Post-test survey (satisfaction, usability, bugs)
- Observation notes during testing
- Session recordings (with permission)
- Feature prioritization exercise

**Success Criteria:**
- Average satisfaction score ≥4/5
- No critical bugs discovered
- <5 minor usability issues
- 80%+ task completion rate

---

## 7. Success Metrics & KPIs

### 7.1 Primary Success Metrics

**Metric 1: Lesson Completion Rate**
- **Definition:** Percentage of users who complete all 13 lessons
- **Current Baseline:** 55%
- **Target:** 80%
- **Timeline:** 8 weeks post-launch
- **Measurement:** `(Users completing lesson 13 / Total users) × 100`
- **Tracking:** Weekly via analytics dashboard

**Metric 2: User Retention (30-day)**
- **Definition:** Percentage of users who return after 30 days
- **Current Baseline:** 28%
- **Target:** 50%
- **Timeline:** 12 weeks post-launch (need 30 days + observation period)
- **Measurement:** `(Users active at day 30 / Users active at day 0) × 100`
- **Tracking:** Cohort analysis monthly

**Metric 3: Average Session Duration**
- **Definition:** Mean time spent per learning session
- **Current Baseline:** 12 minutes
- **Target:** 18 minutes
- **Timeline:** 4 weeks post-launch
- **Measurement:** `Sum(session durations) / Number of sessions`
- **Tracking:** Daily via session tracking

**Metric 4: Practice Exercise Accuracy**
- **Definition:** Average correctness across all exercise attempts
- **Current Baseline:** 62%
- **Target:** 75%
- **Timeline:** 8 weeks post-launch
- **Measurement:** `(Correct answers / Total answers) × 100`
- **Tracking:** Per exercise, per difficulty, overall

### 7.2 Secondary Success Metrics

**Engagement Metrics:**
- **Daily Active Users (DAU):** Target +30% increase
- **Streak Participation:** Target 40% of users achieve 7+ day streak
- **Exercise Repetition Rate:** Target 60% of users retry exercises for better scores
- **Scenario Completion:** Target 50% of users complete at least 1 scenario

**Learning Effectiveness:**
- **Time to Mastery:** Average time from start to completing all lessons and exercises with >80% accuracy
  - Current: ~12 hours
  - Target: 8 hours (33% reduction)
- **Skill Proficiency:** Average skills matrix score across all categories
  - Target: 75%+ proficiency in 5/7 skill areas for users who complete all content

**Gamification Adoption:**
- **Badge Collection Rate:** Average badges per user
  - Target: 8+ badges per active user
- **Level Distribution:** Percentage of users reaching each level milestone
  - Target: 30% reach level 5, 15% reach level 10
- **Points Velocity:** Average points earned per session
  - Target: 250+ points per session

**Feature Utilization:**
- **Mistake Review Usage:** Percentage of users who use mistake review feature
  - Target: 70%+
- **Dashboard Views:** Average dashboard visits per week per user
  - Target: 2+ views per week
- **Difficulty Level Distribution:** Percentage of exercises completed at each difficulty
  - Target: Balanced distribution showing progression (Easy→Expert)

### 7.3 Key Performance Indicators (KPIs)

**Product Health KPIs:**

| KPI | Target | Measurement Frequency |
|-----|--------|----------------------|
| App Crash Rate | <0.1% sessions | Daily |
| Average Load Time | <2s | Daily |
| LocalStorage Errors | <1% of users | Weekly |
| Browser Compatibility Issues | <2% of sessions | Weekly |
| Accessibility Compliance | WCAG 2.1 AA (100%) | Monthly audit |

**User Satisfaction KPIs:**

| KPI | Target | Measurement Frequency |
|-----|--------|----------------------|
| Net Promoter Score (NPS) | 40+ | Monthly survey |
| Feature Satisfaction | 4+/5 average | Post-feature usage survey |
| Bug Report Rate | <5 reports/week | Weekly |
| User-Reported Usability Issues | <3 issues/week | Weekly |

**Learning Outcome KPIs:**

| KPI | Target | Measurement Frequency |
|-----|--------|----------------------|
| Beginner → Intermediate Progression Time | <3 hours | Weekly analysis |
| Mistake Reduction Rate | 30% decrease over 10 exercises | Weekly |
| Concept Retention (Repeat Accuracy) | 85%+ on repeated exercises | Weekly |

### 7.4 Analytics Implementation

**Tracking Events:**
```javascript
// Example event tracking structure
{
  event: 'lesson_completed',
  properties: {
    lessonId: 'lesson_5',
    timeSpent: 480, // seconds
    accuracyOnQuiz: 0.90,
    userId: 'user_123',
    timestamp: 1698765432000
  }
}
```

**Events to Track:**
1. `app_loaded`
2. `lesson_started`
3. `lesson_completed`
4. `exercise_started`
5. `exercise_completed`
6. `difficulty_changed`
7. `mistake_reviewed`
8. `targeted_practice_completed`
9. `scenario_started`
10. `scenario_completed`
11. `badge_unlocked`
12. `level_up`
13. `streak_milestone`
14. `dashboard_viewed`
15. `settings_changed`
16. `audio_toggled`
17. `data_exported`

**Analytics Dashboard:**
- Real-time metric visualization
- Weekly/monthly trend reports
- Cohort analysis
- Funnel visualization (lesson progression)
- Retention curves
- Feature adoption rates

**A/B Testing Opportunities (Post-Launch):**
- Badge unlock notifications (immediate vs. batched)
- Difficulty recommendation timing
- Point values for actions
- Dashboard layout variations
- Scenario difficulty curve

---

## 8. Risks & Mitigation

### 8.1 Technical Risks

**Risk 1: LocalStorage Quota Exceeded**
- **Severity:** High
- **Probability:** Medium (estimated 10-15% of power users)
- **Impact:** Data loss, app malfunction
- **Mitigation:**
  1. Implement quota monitoring before writes
  2. Automatic archiving of old data (90+ days)
  3. Graceful degradation (warn user, disable non-essential data)
  4. User-initiated cleanup utilities
  5. Compression of stored data
- **Contingency:** Fall back to in-memory storage with warning to user about session-only persistence

**Risk 2: Browser Compatibility Issues**
- **Severity:** Medium
- **Probability:** Low (modern browsers well-supported)
- **Impact:** Features not working in some browsers
- **Mitigation:**
  1. Target only modern browsers (last 2 versions)
  2. Feature detection for critical APIs (AudioContext, SVG)
  3. Graceful fallbacks (emoji tiles, silent mode)
  4. Cross-browser testing in CI/CD
  5. Clear browser requirements on landing page
- **Contingency:** Display compatibility warning and suggest alternative browser

**Risk 3: Performance Degradation with Large Datasets**
- **Severity:** Medium
- **Probability:** Medium (after extended use)
- **Impact:** Slow load times, laggy interactions
- **Mitigation:**
  1. Lazy loading for non-critical data
  2. Data pagination for long histories
  3. Performance budgets enforced in code reviews
  4. Regular performance profiling
  5. Automatic cleanup of old data
- **Contingency:** "Performance mode" option that disables animations and limits history

**Risk 4: SVG Asset Loading Failures**
- **Severity:** Medium
- **Probability:** Low (assets bundled with app)
- **Impact:** Tiles don't display
- **Mitigation:**
  1. Bundle SVGs inline for critical tiles
  2. Preload tile assets on app init
  3. Fallback to emoji if SVG fails
  4. Retry mechanism for failed loads
  5. Error reporting to identify patterns
- **Contingency:** Graceful fallback to emoji-based tiles (current implementation)

### 8.2 UX/Design Risks

**Risk 5: Gamification Overload (Too Many Notifications)**
- **Severity:** Medium
- **Probability:** Medium
- **Impact:** User annoyance, notification blindness
- **Mitigation:**
  1. Queue notifications and display sequentially
  2. User preference for notification frequency
  3. "Do not disturb" mode during exercises
  4. Smart batching (combine related notifications)
  5. A/B test notification timing
- **Contingency:** Add "minimal notifications" preference mode

**Risk 6: Difficulty System Too Hard/Too Easy**
- **Severity:** Medium
- **Probability:** Medium (difficulty calibration is subjective)
- **Impact:** User frustration or boredom
- **Mitigation:**
  1. User testing with varied skill levels
  2. Adjustable time limits in settings
  3. Hint system for struggling users
  4. Data-driven difficulty adjustments post-launch
  5. Manual difficulty override always available
- **Contingency:** Post-launch difficulty rebalancing based on user data

**Risk 7: Dashboard Information Overload**
- **Severity:** Low
- **Probability:** Medium
- **Impact:** Users don't engage with analytics
- **Mitigation:**
  1. Progressive disclosure (expand sections)
  2. "Quick view" vs. "detailed view" modes
  3. User testing for information hierarchy
  4. Customizable dashboard widgets
  5. Tooltips explaining metrics
- **Contingency:** Simplified dashboard view with toggle to "advanced"

### 8.3 Scope & Timeline Risks

**Risk 8: Feature Scope Creep**
- **Severity:** High
- **Probability:** High (common in feature-rich projects)
- **Impact:** Delayed launch, incomplete features
- **Mitigation:**
  1. Strict scope freeze after Phase 1
  2. "Parking lot" for post-launch features
  3. Weekly scope review meetings
  4. Clear P0/P1/P2 prioritization
  5. Phased rollout allows iteration
- **Contingency:** Remove P2 features from initial launch if timeline at risk

**Risk 9: Development Timeline Slippage**
- **Severity:** Medium
- **Probability:** Medium
- **Impact:** Missed launch date, stakeholder dissatisfaction
- **Mitigation:**
  1. 20% buffer built into each phase
  2. Weekly progress tracking against plan
  3. Parallel workstreams where possible
  4. Early identification of blockers
  5. Clear definition of "done" for each feature
- **Contingency:** Reduce scope to P0 features only if >2 weeks behind schedule

**Risk 10: Insufficient Testing Time**
- **Severity:** High
- **Probability:** Medium
- **Impact:** Bugs in production, poor user experience
- **Mitigation:**
  1. Testing integrated into each phase (not end-loaded)
  2. Automated test suite runs on every commit
  3. Dedicated testing week (Week 11)
  4. Beta testing with real users
  5. Smoke testing checklist for critical paths
- **Contingency:** Delay launch by 1 week if critical bugs found in UAT

### 8.4 User Adoption Risks

**Risk 11: Users Don't Understand New Features**
- **Severity:** Medium
- **Probability:** Medium
- **Impact:** Low feature adoption, confusion
- **Mitigation:**
  1. In-app tutorials for major features
  2. "What's new" modal on first visit post-launch
  3. Tooltips and contextual help
  4. Progressive feature introduction (not all at once)
  5. User guide documentation
- **Contingency:** Post-launch tutorial videos and help center

**Risk 12: Existing Users Dislike Changes**
- **Severity:** Medium
- **Probability:** Low-Medium
- **Impact:** Negative feedback, potential user loss
- **Mitigation:**
  1. Beta program with existing users
  2. Gradual rollout with feature flags
  3. Option to "use classic mode" for certain features
  4. Clear communication of benefits
  5. Feedback mechanism for concerns
- **Contingency:** Rollback mechanism for contentious features

### 8.5 Data & Privacy Risks

**Risk 13: Data Loss During Migration**
- **Severity:** High
- **Probability:** Low (with proper testing)
- **Impact:** User progress lost, major negative impact
- **Mitigation:**
  1. Comprehensive migration testing
  2. Backup mechanism before migration
  3. Rollback capability
  4. Staged rollout to small user group first
  5. Validation checks post-migration
- **Contingency:** Restore from backup, manual data recovery process

**Risk 14: XSS Vulnerabilities in User-Generated Content**
- **Severity:** Medium
- **Probability:** Low (limited user input)
- **Impact:** Security vulnerability
- **Mitigation:**
  1. Input sanitization in preferences
  2. Content Security Policy headers
  3. No eval() or innerHTML with user data
  4. Regular security audits
  5. Limit input lengths
- **Contingency:** Immediate patch and user notification if vulnerability found

---

## 9. Dependencies & Resources

### 9.1 External Dependencies

**Required Libraries:**

1. **Chart.js** (for dashboard visualizations)
   - Version: 4.4.0+
   - License: MIT
   - Size: ~200KB minified
   - Purpose: Time-series and radar charts
   - Installation: CDN or npm
   - Risk: Low (mature, stable library)

**Optional Libraries:**

2. **Howler.js** (audio management alternative)
   - Version: 2.2.0+
   - License: MIT
   - Purpose: More robust audio handling if Web Audio API insufficient
   - Installation: CDN or npm
   - Risk: Low
   - Status: Evaluate during implementation

**No Additional Dependencies Required:**
- Vanilla JavaScript (ES6+) for all other functionality
- No framework dependencies
- Minimizes bundle size and complexity

### 9.2 Asset Requirements

**SVG Tile Assets (34 tiles total):**
- Design specifications: 3:2 aspect ratio, scalable
- File format: SVG (optimized)
- Size budget: <5KB per tile (<170KB total)
- Source: Custom design or licensed tile set
- Timeline: Week 1
- Responsible: Designer or sourcing from open-source

**Audio Assets (8 sounds):**
- Format: MP3 primary, OGG fallback
- Quality: 128kbps, 44.1kHz
- Length: 100-2000ms per sound
- Size budget: <200KB total
- Source: Royalty-free sound libraries or custom creation
- Timeline: Week 3
- Responsible: Sound designer or sourcing from freesound.org

**Icon Assets (25+ badge icons):**
- Format: SVG or high-res PNG
- Style: Consistent with app design
- Size budget: <3KB per icon
- Timeline: Week 4
- Responsible: Designer

### 9.3 Browser/Platform Requirements

**Minimum Supported Browsers:**
- Chrome/Edge 120+ (Chromium)
- Firefox 121+
- Safari 17+ (macOS and iOS)

**Required Browser Features:**
- LocalStorage (minimum 5MB quota)
- ES6+ JavaScript (arrow functions, classes, promises, async/await)
- SVG rendering
- CSS Grid and Flexbox
- Web Audio API (for audio features)
- Media queries (for responsive design)

**Not Required:**
- Server-side rendering
- WebSockets
- WebGL
- Service Workers (future enhancement)

### 9.4 Development Environment

**Required Tools:**
- Node.js 18+ (for npm and Playwright)
- Git (version control)
- Modern code editor (VS Code recommended)
- Playwright browsers installed

**Development Dependencies:**
- @playwright/test (already installed)
- Local web server (http-server or similar)

### 9.5 Team Resources

**Required Roles:**

**Developer (Full-stack JavaScript)**
- Responsibilities: Implement all modules, components, integration
- Estimated effort: 11 weeks full-time
- Skills: Vanilla JS, ES6+, DOM manipulation, localStorage, testing
- Existing: Available (mktemba)

**Designer (UI/UX)**
- Responsibilities: SVG tile design, badge icons, UI layouts, animations
- Estimated effort: 3 weeks part-time (spread across Weeks 1, 4, 9)
- Skills: SVG design, iconography, UI animation
- Status: External contractor or freelancer needed

**QA/Tester**
- Responsibilities: E2E test execution, cross-browser testing, bug reporting
- Estimated effort: 2 weeks full-time (Weeks 10-11)
- Skills: Manual testing, Playwright, accessibility testing
- Status: Can be developer (self-QA) or external

**Optional Roles:**

**Sound Designer**
- Responsibilities: Create or source audio assets
- Estimated effort: 1 week
- Status: Can source from royalty-free libraries instead

**Technical Writer**
- Responsibilities: User documentation, API docs
- Estimated effort: 1 week (Week 11)
- Status: Developer can handle or external

### 9.6 Infrastructure Requirements

**Hosting:**
- Static file hosting (current setup)
- No server-side requirements
- CDN optional for assets

**CI/CD (Recommended):**
- GitHub Actions for automated testing
- Playwright test execution on push
- Lighthouse performance checks
- Deployment automation

**Monitoring (Post-Launch):**
- Error tracking (Sentry or similar)
- Analytics (Google Analytics or privacy-friendly alternative)
- Performance monitoring (Lighthouse CI)

### 9.7 Budget Considerations

**Estimated Costs:**

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| Developer Time | 11 weeks @ rate | Primary cost |
| Designer (Freelance) | 3 weeks @ rate | SVG tiles, icons, UI |
| Audio Assets | $50-200 | Royalty-free libraries |
| Hosting | $0-50/month | Static hosting (Netlify/Vercel free tier) |
| Testing Tools | $0 | Playwright is open-source |
| Total (excluding labor) | <$500 | Very low infrastructure cost |

**Note:** This is a client-side only application with zero server costs.

---

## 10. Appendices

### Appendix A: User Research Summary

**Research Methods:**
1. User interviews (n=10, conducted October 2025)
2. Analytics analysis (current app usage, August-October 2025)
3. Competitive analysis (5 Mahjong learning apps)
4. Online forum analysis (Reddit r/Mahjong, Discord communities)

**Key Findings:**
- 72% of users found emoji tiles "not helpful" for learning real tiles
- 68% requested some form of progress tracking or achievements
- 54% stopped using app due to "lack of motivation"
- 89% wanted to know their weak areas
- Average session time dropped 40% after lesson 5 (content gets harder, no motivation boost)

**User Quotes:**
> "I loved the lessons, but the emoji tiles confused me when I tried to play with real tiles." - User A
>
> "I didn't know if I was actually improving or just memorizing the answers." - User B
>
> "I wish there were levels or achievements to show my progress." - User C

### Appendix B: Competitive Analysis

**Competitor 1: Mahjong Academy**
- Strengths: Beautiful tile graphics, structured curriculum
- Weaknesses: No gamification, expensive ($19.99)
- Differentiation: Our gamification + free access

**Competitor 2: Learn Mahjong Online**
- Strengths: Multiplayer practice, community features
- Weaknesses: Overwhelming for beginners, no progression tracking
- Differentiation: Our progressive difficulty + focused learning

**Competitor 3: Mahjong School App**
- Strengths: Comprehensive rules coverage, multiple variants
- Weaknesses: Outdated UI, no analytics
- Differentiation: Our modern UI + detailed analytics

**Competitor 4: MahjongTime Tutorial**
- Strengths: Integrated with real gameplay platform
- Weaknesses: Tutorial buried in app, minimal interactivity
- Differentiation: Our dedicated learning focus + interactivity

**Competitor 5: YouTube Tutorials**
- Strengths: Free, visual learning
- Weaknesses: Passive, no practice, no tracking
- Differentiation: Our interactive practice + progress tracking

**Key Insight:** No competitor combines authentic visuals, progressive difficulty, gamification, and detailed analytics in a free, accessible web app.

### Appendix C: Badge Specifications

**Complete Badge List (25 badges):**

**Learning Milestones (5 badges):**
1. **First Steps**: Complete Lesson 1
2. **Gaining Momentum**: Complete 5 lessons
3. **Halfway There**: Complete 7 lessons (50%)
4. **Almost There**: Complete 10 lessons
5. **Graduate**: Complete all 13 lessons

**Exercise Mastery (5 badges):**
6. **Perfect Score**: Score 100% on any exercise
7. **Speed Demon**: Complete exercise in <50% of time limit
8. **Unstoppable**: 10 consecutive correct answers
9. **Persistent**: Complete same exercise 5 times
10. **Completionist**: Complete all 4 exercise types

**Difficulty Achievements (4 badges):**
11. **Easy Expert**: Complete 10 exercises on Easy with >80% avg
12. **Medium Master**: Complete 10 exercises on Medium with >80% avg
13. **Hard Hero**: Complete 10 exercises on Hard with >70% avg
14. **Expert Elite**: Complete 5 exercises on Expert with >60% avg

**Dedication (4 badges):**
15. **Daily Learner**: 7-day streak
16. **Committed**: 30-day streak
17. **Dedicated**: 60-day streak
18. **Mahjong Enthusiast**: 100 total lessons/exercises completed

**Special Achievements (7 badges):**
19. **Mistake Master**: Complete mistake review 10 times
20. **Explorer**: Try all exercise types at all difficulties
21. **Strategist**: Complete 10 game scenarios
22. **Scenario Expert**: Complete all scenarios with >80% avg score
23. **Data Nerd**: View dashboard 10 times
24. **Level 10 Legend**: Reach level 10
25. **Point Collector**: Earn 10,000 total points

### Appendix D: Skills Matrix Mapping

**Skill → Exercise Mapping:**

| Skill | Related Exercises | Calculation Weight |
|-------|-------------------|-------------------|
| Tile Recognition | All exercises (tile identification) | Exercise accuracy × 0.3 |
| Pair Identification | "Identifying Pairs" exercise | Exercise accuracy × 1.0 |
| Chow Recognition | "Identifying Chows" exercise | Exercise accuracy × 1.0 |
| Pung Recognition | "Identifying Pungs" exercise | Exercise accuracy × 1.0 |
| Winning Hand Evaluation | "Winning Hands" exercise | Exercise accuracy × 1.0 |
| Strategic Thinking | Game scenarios | Scenario decision quality × 1.0 |
| Speed and Efficiency | All exercises (time-based) | (1 - timeUsed/timeLimit) × 0.5 |

**Proficiency Thresholds:**
- **Beginner (0-40%):** Red indicator, "Needs Practice"
- **Intermediate (40-70%):** Yellow indicator, "Developing"
- **Advanced (70-85%):** Light green indicator, "Proficient"
- **Expert (85-100%):** Dark green indicator, "Mastered"

### Appendix E: Technical Glossary

**Terms Used in This Document:**

- **LocalStorage:** Browser API for persistent key-value storage (typically 5-10MB limit)
- **SVG:** Scalable Vector Graphics, XML-based vector image format
- **ES6+:** ECMAScript 2015 and later, modern JavaScript features
- **WCAG:** Web Content Accessibility Guidelines
- **ARIA:** Accessible Rich Internet Applications (accessibility attributes)
- **E2E Testing:** End-to-end testing, simulating real user interactions
- **Unit Testing:** Testing individual functions/modules in isolation
- **RICE Score:** Reach × Impact × Confidence / Effort (prioritization framework)
- **NPS:** Net Promoter Score (user satisfaction metric)
- **XP:** Experience Points (gamification term)
- **DAU:** Daily Active Users

### Appendix F: Decision Log

**Key Decisions Made:**

| Decision | Date | Rationale | Alternatives Considered |
|----------|------|-----------|------------------------|
| Use vanilla JS (no framework) | 2025-10-25 | Consistency with existing codebase, minimal bundle size | React, Vue (rejected: adds complexity) |
| LocalStorage only (no backend) | 2025-10-25 | Simplicity, privacy, no server costs | Firebase, custom backend (rejected: overkill for use case) |
| Chart.js for visualizations | 2025-10-25 | Lightweight, well-documented, MIT license | D3.js (rejected: too complex), canvas-based custom (rejected: time-consuming) |
| 4 difficulty levels | 2025-10-25 | Granular progression without overwhelming choice | 3 levels (too few), 5 levels (too many) |
| 25 badges initially | 2025-10-25 | Enough variety without overwhelming, expandable post-launch | 15 (too few), 40 (too many upfront) |
| SVG tiles over canvas | 2025-10-25 | Accessibility, scalability, easier to style | Canvas rendering (harder to make accessible) |
| Web Audio API over HTML5 Audio | 2025-10-25 | Better control, lower latency | HTML5 <audio> (simpler but less flexible) |

### Appendix G: Future Enhancements (Post-Launch)

**Phase 2 Roadmap (3-6 months post-launch):**

1. **Multiplayer Scenarios**
   - Practice scenarios with other learners
   - Turn-based decision-making
   - Community voting on best strategies

2. **Global Leaderboards**
   - Opt-in anonymous or named rankings
   - Weekly/monthly competitions
   - Category-specific leaderboards

3. **Custom Scenario Creator**
   - Users create and share scenarios
   - Community voting on best scenarios
   - Moderation system

4. **Advanced AI Opponent**
   - Practice against AI in full games
   - Multiple difficulty levels
   - Explanation of AI decisions

5. **Social Features**
   - Share achievements
   - Study groups/friends
   - Challenge friends to exercises

6. **Mobile App (PWA)**
   - Offline capability
   - Install to home screen
   - Push notifications

7. **Additional Mahjong Variants**
   - Hong Kong style
   - American Mahjong
   - Riichi Mahjong

**Nice-to-Have Features:**
- Dark mode theme
- Customizable tile skins
- Tutorial videos
- Community forums
- Translation to other languages
- Tablet-optimized layout
- Integration with online Mahjong platforms

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-25 | Product Manager | Initial draft - complete PRD |

**Approval Sign-offs:**

| Role | Name | Approval Date | Signature |
|------|------|---------------|-----------|
| Product Owner | [Pending] | [Pending] | [Pending] |
| Lead Developer | [Pending] | [Pending] | [Pending] |
| UX Designer | [Pending] | [Pending] | [Pending] |

**Review Schedule:**
- Weekly reviews during development (Weeks 1-11)
- Bi-weekly stakeholder updates
- Post-launch review at 4 weeks, 12 weeks

**Distribution List:**
- Development Team
- Design Team
- QA Team
- Stakeholders

---

## Summary & Next Steps

This PRD outlines a comprehensive enhancement to the Mahjong Learning App that will transform it from a tutorial system into a full-featured learning platform. The implementation is structured in 5 phases over 12 weeks, prioritizing foundational features first and building progressively toward advanced capabilities.

**Immediate Next Steps:**

1. **Review & Approval:** Stakeholders review this PRD and provide feedback (Week 0)
2. **Resource Allocation:** Confirm developer availability, contract designer (Week 0)
3. **Asset Sourcing:** Begin SVG tile design and audio sourcing (Week 1)
4. **Development Kickoff:** Sprint 1 begins with TileRenderer implementation (Week 1)
5. **Testing Infrastructure:** Set up CI/CD for automated testing (Week 1)

**Success Criteria for Go-Live:**
- All P0 features implemented and tested
- 100+ E2E tests passing
- Accessibility compliance (WCAG 2.1 AA)
- Performance targets met (Lighthouse >90)
- Zero critical bugs
- UAT completed with positive feedback

This plan is ambitious but achievable with disciplined execution and clear prioritization. The phased approach allows for iterative learning and course correction, while the comprehensive testing strategy ensures quality at launch.

**Questions or concerns?** Please reach out to the product team for clarification or discussion.

---

**End of Document**
