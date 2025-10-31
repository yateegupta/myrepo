# Voice Reminder Mobile App

A minimalist cross-platform mobile app for setting timed voice reminders using text-to-speech technology.

## Features

- **Time-based Reminders**: Set specific times for voice reminders
- **Text-to-Speech**: Convert text messages to spoken reminders using device TTS
- **Local Notifications**: Trigger reminders even when app is backgrounded
- **Persistent Storage**: Save reminders locally using AsyncStorage
- **Preview Functionality**: Test voice notes before scheduling
- **Minimalist Design**: Clean, elegant UI with light blue theme and serif fonts

## Tech Stack

- **Framework**: React Native 0.72.6
- **Language**: TypeScript
- **TTS**: react-native-tts (Google TTS on Android, AVSpeechSynthesizer on iOS)
- **Notifications**: react-native-push-notification
- **Storage**: @react-native-async-storage/async-storage
- **Date/Time Picker**: @react-native-community/datetimepicker
- **Icons**: react-native-vector-icons

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── types/
│   └── index.ts              # Type definitions
└── services/
    ├── NotificationService.ts # Local notification management
    ├── TTSService.ts         # Text-to-speech functionality
    └── StorageService.ts     # Local data persistence
```

## Installation & Setup

### Prerequisites

- Node.js 16+
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies (iOS only):
```bash
cd ios && pod install && cd ..
```

3. Start the Metro bundler:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

5. Run on iOS:
```bash
npm run ios
```

## Platform-Specific Setup

### Android

1. Add permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

2. Configure notification channels (handled automatically in NotificationService)

### iOS

1. Add permissions to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-fetch</string>
    <string>background-processing</string>
</array>
```

2. Enable background app refresh in device settings

## Usage

1. **Set Reminder Message**: Enter the text you want spoken
2. **Select Time**: Choose when the reminder should trigger
3. **Preview**: Test the voice note immediately
4. **Schedule**: Set the reminder for the selected time
5. **Manage**: View and cancel scheduled reminders

## Core Components

### NotificationService

Handles all local notification functionality:
- Scheduling time-based notifications
- Managing notification channels (Android)
- Handling notification interactions
- Permission management

### TTSService

Manages text-to-speech functionality:
- Platform-specific TTS initialization
- Speech customization (rate, pitch, language)
- Voice selection
- Error handling

### StorageService

Provides persistent data storage:
- Save/retrieve reminders
- Cleanup expired reminders
- Export/import functionality
- Storage statistics

## Future Enhancements

### Planned Features
- **Recurring Reminders**: Daily, weekly, monthly options
- **Custom Voice Options**: Multiple voice selections
- **Cloud Syncing**: Multi-device synchronization
- **Multiple Reminder Management**: Bulk operations
- **Snooze Functionality**: Postpone reminders
- **Categories & Labels**: Organize reminders
- **Priority Levels**: Urgent/normal/low priority
- **Location-based Reminders**: Trigger at specific locations

### Technical Improvements
- **Background Location**: Location-triggered reminders
- **Widget Support**: Home screen widgets
- **Watch Integration**: Apple Watch/Android Wear
- **Voice Input**: Speech-to-text for message entry
- **Smart Scheduling**: AI-powered optimal timing
- **Analytics**: Usage statistics and insights

### UI/UX Enhancements
- **Dark Mode**: System theme support
- **Custom Themes**: Multiple color schemes
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: VoiceOver and TalkBack optimizations
- **Internationalization**: Multi-language support
- **Adaptive Layouts**: Tablet and foldable phone support

## Development Notes

### Code Organization
- Separation of concerns with service layer
- TypeScript for type safety
- Async/await for asynchronous operations
- Error handling with user-friendly messages

### Performance Considerations
- Efficient storage with cleanup routines
- Minimal re-renders with React hooks
- Optimized TTS initialization
- Background processing for notifications

### Security & Privacy
- All data stored locally
- No network dependencies
- Minimal permissions requested
- No user data collection

## Troubleshooting

### Common Issues

1. **Notifications not working**:
   - Check app permissions
   - Verify notification channel setup (Android)
   - Ensure background app refresh is enabled (iOS)

2. **TTS not speaking**:
   - Verify device has TTS capabilities
   - Check language settings
   - Test with different text content

3. **Storage issues**:
   - Clear app data and restart
   - Check available device storage
   - Verify AsyncStorage permissions

### Debug Tips

- Enable console logging for service initialization
- Test with simple reminder messages
- Verify notification timing with short delays
- Check platform-specific permission settings

## License

MIT License - feel free to use this project as a foundation for your own voice reminder applications.