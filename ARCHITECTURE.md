# Mahjong Learning App - Architecture Documentation

## Overview

This is a sophisticated web application for learning Mahjong, built with a modular architecture inspired by professional game platforms. The application features proper state management, event-driven design, and clear separation of concerns.

## Architecture Principles

- **Modular Design**: Separate files for distinct responsibilities
- **Event-Driven**: Decoupled components communicate via events
- **State Management**: Centralized game state with immutable patterns
- **Type Safety**: JSDoc annotations for type checking
- **Accessibility First**: WCAG compliant with keyboard navigation
- **Progressive Enhancement**: Works without JavaScript for basic content

## Directory Structure

```
/
├── src/
│   ├── components/          # UI components and managers
│   │   └── TutorialManager.js   # Lesson progression and state
│   ├── lib/                 # Core utilities and business logic
│   │   ├── MahjongController.js # Central game coordination (like GobanController)
│   │   ├── data.js              # Data persistence layer
│   │   ├── preferences.js       # User preferences management
│   │   └── utils.js             # Common utility functions
│   ├── models/              # Type definitions and validation
│   │   └── types.js             # JSDoc types and validators
│   └── main.js              # Application entry point
├── mahjong-game-engine.js   # Core game engine (standalone)
└── learn-mahjong.html       # Main HTML file with embedded tutorial content
```

## Core Systems

### 1. Game Engine (`mahjong-game-engine.js`)

Standalone, framework-agnostic game engine that handles:

- **Tile System**: Tile creation, validation, and manipulation
- **Hand Analysis**: Winning hand detection, set validation
- **Game State**: Immutable state management with cloning
- **Rules Engine**: Legal move validation
- **AI System**: Configurable difficulty AI opponent
- **Event System**: Pub/sub for game events

**Key Classes:**
- `MahjongEngine` - Main game coordinator
- `MahjongGameState` - Immutable game state
- `Tile` - Individual tile representation
- `TileFactory` - Tile creation and shuffling
- `HandAnalyzer` - Static analysis utilities
- `MahjongAI` - AI decision making

**Design Patterns:**
- Factory Pattern (TileFactory)
- Observer Pattern (Event system)
- State Pattern (Game phases)
- Strategy Pattern (AI difficulty)

### 2. Game Controller (`src/lib/MahjongController.js`)

Central coordination layer inspired by online-go.com's GobanController:

- Manages game engine lifecycle
- Coordinates AI moves
- Handles state transitions
- Manages event forwarding
- Auto-save functionality
- Session persistence

**Responsibilities:**
- Bridge between engine and UI
- Human vs AI turn management
- Claim resolution
- Error handling

### 3. Tutorial Manager (`src/components/TutorialManager.js`)

Manages educational content and progression:

- Lesson navigation
- Progress tracking
- Completion state
- Lesson metadata
- Event emission for UI updates

### 4. Data Layer (`src/lib/data.js`)

localStorage abstraction with:

- Key-value storage with namespacing
- JSON serialization
- Caching layer
- Game statistics tracking
- Lesson completion tracking
- Import/export functionality

**API:**
```javascript
GameData.saveGame(state)
GameData.loadGame()
GameData.recordGame(won, score)
GameData.completeLesson(id)
GameData.getStats()
```

### 5. Preferences (`src/lib/preferences.js`)

User configuration management:

- Default values
- Change observers (watch pattern)
- Persistence
- Import/export
- Validation

**Preference Categories:**
- UI (theme, animations)
- Game (AI difficulty, auto-sort)
- Tutorial (hints, auto-advance)
- Accessibility (reduced motion, high contrast)

### 6. Utilities (`src/lib/utils.js`)

Common helpers:

- DOM manipulation
- Animation utilities
- Debounce/throttle
- Deep cloning
- Mobile detection
- Easing functions

## Data Flow

```
User Input
    ↓
MahjongApp (main.js)
    ↓
MahjongController
    ↓
MahjongEngine
    ↓
State Change
    ↓
Event Emission
    ↓
UI Update
```

## Event System

### Tutorial Events

| Event | Description | Payload |
|-------|-------------|---------|
| `lessonChanged` | User navigates to new lesson | `{ lesson, total }` |
| `lessonCompleted` | Lesson marked complete | `{ lesson, progress }` |
| `progressReset` | All progress cleared | `{}` |

### Game Events

| Event | Description | Payload |
|-------|-------------|---------|
| `gameInitialized` | New game started | `{ state }` |
| `tileDrawn` | Player drew tile | `{ playerIndex, tile }` |
| `tileDiscarded` | Player discarded tile | `{ playerIndex, tile }` |
| `claimAvailable` | Tile can be claimed | `{ tile, claims }` |
| `gameEnded` | Game finished | `{ winner, score }` |
| `stateChanged` | Game state updated | `{ state }` |

## State Management

### Immutability

Game state is immutable - all changes create new state objects:

```javascript
const newState = currentState.clone();
newState.currentPlayer = nextPlayer;
```

### State Persistence

- Auto-save every 30 seconds during active games
- Manual save on game end
- Session restoration on app init
- localStorage as persistence layer

### State Validation

TypeScript-style validators ensure data integrity:

```javascript
if (TileValidator.isValid(tile)) {
    // Process tile
}

if (GameStateValidator.isValid(state)) {
    // Apply state
}
```

## Component Lifecycle

### Initialization Flow

1. `main.js` creates `MahjongApp` instance
2. Preferences loaded from localStorage
3. Accessibility settings applied
4. TutorialManager initialized
5. MahjongController created
6. Game engine and AI injected
7. Event listeners registered
8. Session restored
9. App emits 'ready' event

### Lesson Navigation Flow

1. User triggers navigation (click/keyboard)
2. TutorialManager validates transition
3. Previous lessons marked complete
4. `lessonChanged` event emitted
5. MahjongApp handles event
6. UI updated (hide/show content)
7. Lesson-specific features initialized
8. Progress bar updated
9. Session saved

## Accessibility

### Keyboard Navigation

- Arrow Left/Right: Navigate lessons
- Number keys 1-9, 0: Jump to lesson
- Tab: Focus interactive elements
- Enter/Space: Activate tiles/buttons
- Escape: Close modals

### Screen Reader Support

- ARIA labels on all interactive elements
- `role` attributes for custom components
- `aria-live` regions for dynamic feedback
- Semantic HTML structure

### Reduced Motion

- Detects system preference
- Can be overridden in settings
- Disables/simplifies animations
- Maintains functionality

### High Contrast

- Optional high contrast mode
- Accessible color combinations
- Configurable font sizes

## Performance Considerations

### Lazy Initialization

Practice exercises initialize only when accessed:

```javascript
if (lessonNum === 8) {
    initPungPractice();  // Only loaded when needed
}
```

### Caching

- Data layer caches localStorage reads
- Prevents redundant parsing
- Cache invalidation on writes

### Debouncing

Auto-save and other frequent operations use debouncing/throttling:

```javascript
const debouncedSave = Utils.debounce(saveGame, 1000);
```

### Event Cleanup

Proper cleanup prevents memory leaks:

```javascript
const unsubscribe = controller.on('event', handler);
// Later:
unsubscribe();
```

## Testing Approach

### Manual Testing

1. Lesson navigation (all transitions)
2. Practice exercises (all correct/incorrect paths)
3. Keyboard navigation
4. Mobile responsiveness
5. Accessibility (screen reader, keyboard only)

### State Validation

All state transitions validated:
- Type checking via JSDoc
- Runtime validators
- Console logging in development

### Error Handling

Graceful degradation:
- Try/catch around critical paths
- User-friendly error messages
- Fallback to default states
- Console logging for debugging

## Future Enhancements

### Potential Additions

1. **Multiplayer**: WebSocket integration for real-time play
2. **Replay System**: Review past games move-by-move
3. **Achievements**: Gamification with badges
4. **Leaderboards**: Score tracking and comparison
5. **Custom Rulesets**: Regional variations (Hong Kong, Japanese, etc.)
6. **Advanced AI**: Neural network-based opponents
7. **Analytics**: Usage tracking and insights
8. **Social Features**: Share progress, challenge friends
9. **Mobile App**: React Native or PWA

### Architecture for Multiplayer

Would require:
- WebSocket manager (similar to sockets.ts in online-go.com)
- Server-side game state validation
- Conflict resolution
- Spectator mode
- Chat system

## Contributing

### Code Style

- Use JSDoc for type annotations
- Sparse but meaningful comments
- Explain complex logic, not obvious code
- Follow existing patterns
- No emojis in code (tutorial content is exception)

### Testing Changes

- Test all affected features
- Check keyboard navigation
- Verify accessibility
- Test on mobile
- Check browser console for errors

### Documentation

- Update this file for architectural changes
- Add JSDoc for new public APIs
- Update README for user-facing changes

## Dependencies

### None!

This application is deliberately dependency-free:
- Pure JavaScript (no frameworks)
- Native DOM APIs
- localStorage for persistence
- No build step required
- Works offline

This makes it:
- Fast to load
- Easy to maintain
- Simple to debug
- Portable and embeddable

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Uses modern JavaScript features:
- ES6+ syntax
- Arrow functions
- Classes
- Template literals
- Destructuring
- Spread operator
- Optional chaining

## License

Educational project - use and modify freely.

## Credits

Architecture inspired by:
- [online-go.com](https://github.com/online-go/online-go.com) - Game platform patterns
- Modern web game development practices
- Accessibility-first design principles
