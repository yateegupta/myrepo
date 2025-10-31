/**
 * Main entry point for Voice Reminder mobile app
 * Sets up notification configuration and launches the app
 */

import { AppRegistry, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import App from './src/App';
import { name as appName } from './app.json';

// Configure push notifications
PushNotification.configure({
  // Called when a notification is received
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    
    // Process the notification for voice reminder
    if (notification.userInteraction) {
      // User tapped on notification
      if (notification.data?.message) {
        // Play TTS when user interacts with notification
        import('./src/services/TTSService').then(({ default: TTSService }) => {
          TTSService.speak(notification.data.message);
        });
      }
    }
  },

  // Request permissions (iOS only)
  requestPermissions: Platform.OS === 'ios',

  // iOS specific settings
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Android specific settings
  senderID: 'YOUR_SENDER_ID', // Replace with actual sender ID if needed
  popInitialNotification: true,
  requestPermissions: true,
});

// Create default notification channel (Android)
PushNotification.createChannel(
  {
    channelId: 'voice-reminder-channel',
    channelName: 'Voice Reminders',
    channelDescription: 'Channel for voice reminder notifications',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Channel created: ${created}`)
);

// Register the main app component
AppRegistry.registerComponent(appName, () => App);