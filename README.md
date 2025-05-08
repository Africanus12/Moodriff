# Mood Riff Maker

![Mood Riff Maker Logo](assets/logo.svg)

Mood Riff Maker is a Material 3-designed web application that allows users to create, save, and share audio riffs based on their mood. The app features a gamification system that rewards users for creating riffs regularly.

## Features

### Home Screen
- Four mood options to choose from:
  - **Chill**: Slow, relaxed 440Hz tones
  - **Hype**: Fast, energetic 880Hz tones
  - **Calm**: Soft, gentle 220Hz tones
  - **Wild**: Random patterns between 440-880Hz
- Streak counter to track daily usage
- Daily challenges to encourage diverse riff creation

### Riff Screen
- Auto-generated 30-second audio riffs based on selected mood
- Real-time audio visualizer with animated effects
- Play/Pause controls
- Save functionality to store riffs in your library
- Share capability
- Audio effect controls:
  - Reverb
  - Echo
  - Phaser

### Library Screen
- Saved riffs list with mood and date information
- Play, share, and delete functionality for each saved riff
- Swipe to delete (on touch devices)

### Level System
- XP progress tracking
- Level-based rewards:
  - Level 2: Wild Mood Unlocked
  - Level 3: Wave Visualizer Unlocked
  - Level 5: Mood Mixer Unlocked
  - Level 7: Echo Effect Unlocked
  - Level 10: Master Riff Maker Badge
- Streak bonuses for consistent usage

### Mood Diary
- Visual chart of your mood patterns over time
- Track which moods you create most frequently

## Technical Details

### Technologies Used
- HTML5, CSS3, and JavaScript
- [Tone.js](https://tonejs.github.io/) for audio synthesis and effects
- [Chart.js](https://www.chartjs.org/) for the mood diary visualizations
- [Lottie](https://airbnb.design/lottie/) for level-up animations
- IndexedDB for client-side storage
- Material 3 Design System

### Architecture
- Modular JavaScript with self-contained modules:
  - `Models`: Data structures and mood configurations
  - `Database`: IndexedDB interactions for storing riffs
  - `ToneHelper`: Audio generation and effects processing
  - `Visualizer`: Canvas-based audio visualization
  - `UserProgress`: Gamification and progression systems
  - `Navigation`: Screen transitions and navigation history

### Data Storage
- User riffs stored in IndexedDB
- User progress saved in LocalStorage
- Daily challenges tracked in LocalStorage

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Select a mood and click "Make Riff" to begin

## Planned Features

- Mood Mixing: Combine two moods to create unique riffs
- Custom Visualizers: Additional visual styles beyond the defaults
- Social Sharing: Public feed to discover and upvote other users' riffs
- Riff Pro Subscription: Unlimited saves, cloud backup, exclusive challenges
- Additional sound packs and special moods

## Browser Compatibility

Mood Riff Maker works best in modern browsers that support the Web Audio API and IndexedDB:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material 3 Design System for UI guidelines
- Bootstrap Icons for iconography
- Tone.js community for audio synthesis capabilities