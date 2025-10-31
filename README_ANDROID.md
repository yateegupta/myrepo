# Voice Reminder Android App

A native Android application that allows users to set timed voice reminders using text-to-speech technology.

## Features

- **Time Selection**: Use TimePicker widget to select reminder time
- **Message Input**: EditText field for entering custom reminder messages
- **Text-to-Speech**: Convert text to speech using Android's TextToSpeech API
- **Scheduled Reminders**: Automatic voice playback at scheduled times using AlarmManager
- **Background Support**: Notifications and TTS work when app is backgrounded or closed
- **Data Persistence**: Store scheduled reminders using Room database
- **Boot Recovery**: Automatically restore reminders after device restart
- **Preview Function**: Test reminder messages immediately
- **Elegant UI**: Minimalist Material Design with light blue theme and serif fonts

## Technical Specifications

- **Language**: Kotlin
- **MinSDK**: 24 (Android 7.0)
- **TargetSDK**: 34 (Android 14)
- **Architecture**: MVVM with Room database
- **UI Framework**: Material Design 3 with ConstraintLayout

## Key Components

### Core Activities & Services
- `MainActivity`: Main UI with time picker and message input
- `ReminderService`: Foreground service for TTS playback
- `ReminderReceiver`: BroadcastReceiver for alarm triggers
- `BootReceiver`: BroadcastReceiver for boot completion to restore alarms

### Data Layer
- `AppDatabase`: Room database for local storage
- `Reminder`: Entity class for reminder data
- `ReminderDao`: Data access object for database operations

### Permissions Required
- `SCHEDULE_EXACT_ALARM`: For precise alarm scheduling
- `POST_NOTIFICATIONS`: For showing reminder notifications (Android 13+)
- `WAKE_LOCK`: For device wake-up during reminders
- `RECEIVE_BOOT_COMPLETED`: For restoring alarms after restart
- `VIBRATE`: For notification vibration

## UI Design

- **Theme**: Light blue background (#E3F2FD) with Material Design 3
- **Typography**: Serif fonts (Lora and Playfair Display)
- **Layout**: Card-based design with rounded corners (12dp)
- **Colors**: Soft pastel palette with blue accents
- **Spacing**: Comfortable 16-24dp margins and padding

## Setup Instructions

### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK API 24+
- Kotlin 1.9.10+

### Building the App

1. Clone the repository
2. Open in Android Studio
3. Sync Gradle files
4. Build and run on emulator or device

### Adding Custom Fonts

The app uses Lora and Playfair Display fonts. To add them:

1. Download font files (.ttf or .otf)
2. Place them in `app/src/main/res/font/`
3. Update font XML files in the same directory

## Usage

1. **Set Reminder Time**: Use the TimePicker to select when you want the reminder
2. **Enter Message**: Type your reminder message in the text field
3. **Preview**: Tap "Preview Voice Note" to test the message immediately
4. **Schedule**: Tap "Set Reminder" to schedule the voice reminder
5. **Clear**: Use "Clear" button to reset all inputs

## Future Enhancements

- **Recurring Reminders**: Daily, weekly, or custom recurrence patterns
- **Multiple Reminders**: Manage multiple active reminders
- **Voice Customization**: Adjustable speech rate, pitch, and language
- **Snooze Function**: Snooze reminders with custom intervals
- **Widget Support**: Home screen widget for quick reminder setup
- **Reminder History**: View past reminders and usage statistics
- **Import/Export**: Backup and restore reminder data
- **Categories**: Organize reminders by categories (work, personal, etc.)
- **Location-based**: Reminders triggered by location

## Troubleshooting

### Common Issues

1. **Notifications Not Working**: Check notification permissions (Android 13+)
2. **TTS Not Speaking**: Ensure text-to-speech is enabled in device settings
3. **Alarms Not Triggering**: Check battery optimization settings
4. **App Crashes**: Ensure all required permissions are granted

### Permissions

For Android 13+ devices, users must manually grant notification permission. The app will request this on first launch.

## Architecture Notes

The app follows Android architecture best practices:

- **Separation of Concerns**: UI, business logic, and data are separated
- **Lifecycle Awareness**: Components respect Android lifecycle
- **Background Processing**: Proper use of services and broadcast receivers
- **Resource Management**: Proper cleanup of TTS and database resources
- **Error Handling**: Comprehensive error handling throughout the app

## License

This project is provided as a sample implementation. Feel free to modify and distribute according to your needs.