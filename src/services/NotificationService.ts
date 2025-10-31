/**
 * Notification Service
 * Handles scheduling and managing local notifications for voice reminders
 */

import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Reminder } from '../types';

export class NotificationService {
  /**
   * Initialize notification service with required configurations
   */
  static initialize(): void {
    // Configure default notification settings
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        
        // Handle notification when user interacts with it
        if (notification.userInteraction && notification.data?.message) {
          // Import TTS service dynamically to avoid circular dependencies
          import('./TTSService').then(({ default: TTSService }) => {
            TTSService.speak(notification.data.message);
          });
        }
      },
      
      requestPermissions: Platform.OS === 'ios',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
    });

    // Create notification channel for Android (required for Android 8.0+)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'voice-reminder-channel',
          channelName: 'Voice Reminders',
          channelDescription: 'Notifications for voice reminders',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => {
          console.log(`Notification channel created: ${created}`);
        }
      );
    }
  }

  /**
   * Schedule a notification for a voice reminder
   * @param reminder - The reminder object containing message and time
   */
  static async scheduleReminder(reminder: Reminder): Promise<void> {
    const now = new Date();
    const reminderTime = new Date(reminder.dateTime);

    // Validate that the reminder time is in the future
    if (reminderTime <= now) {
      throw new Error('Reminder time must be in the future');
    }

    // Calculate the delay in milliseconds
    const delay = reminderTime.getTime() - now.getTime();

    return new Promise((resolve, reject) => {
      PushNotification.localNotificationSchedule({
        // Notification ID to allow cancellation later
        id: parseInt(reminder.id),
        
        // Channel for Android
        channelId: 'voice-reminder-channel',
        
        // Notification title
        title: 'Voice Reminder',
        
        // Notification message
        message: reminder.message.length > 50 
          ? reminder.message.substring(0, 50) + '...' 
          : reminder.message,
        
        // Custom data to pass the full message
        data: {
          message: reminder.message,
          reminderId: reminder.id,
        },
        
        // Schedule the notification
        date: reminderTime,
        
        // Play sound
        playSound: true,
        soundName: 'default',
        
        // Vibration
        vibrate: true,
        
        // Android-specific settings
        allowWhileIdle: true, // Show notification even in Doze mode
        
        // iOS-specific settings
        actions: ['Listen'], // Custom action button
        
        // Callback when notification is scheduled
        userInfo: {
          reminderId: reminder.id,
        },
      }, (success) => {
        if (success) {
          console.log(`Reminder scheduled for ${reminderTime.toISOString()}`);
          resolve();
        } else {
          console.error('Failed to schedule reminder');
          reject(new Error('Failed to schedule notification'));
        }
      });
    });
  }

  /**
   * Cancel a scheduled reminder
   * @param reminderId - The ID of the reminder to cancel
   */
  static async cancelReminder(reminderId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel the specific notification
      PushNotification.cancelLocalNotifications({
        id: parseInt(reminderId),
      });

      // Also cancel by userInfo as fallback
      PushNotification.cancelLocalNotifications({
        userInfo: {
          reminderId: reminderId,
        },
      });

      console.log(`Reminder ${reminderId} cancelled`);
      resolve();
    });
  }

  /**
   * Cancel all scheduled reminders
   */
  static async cancelAllReminders(): Promise<void> {
    return new Promise((resolve) => {
      PushNotification.cancelAllLocalNotifications();
      console.log('All reminders cancelled');
      resolve();
    });
  }

  /**
   * Get all scheduled notifications (limited support on some platforms)
   * Note: This functionality is limited on iOS due to privacy restrictions
   */
  static getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  /**
   * Check if notifications are enabled
   */
  static async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        const hasPermissions = 
          (permissions.alert || permissions.badge || permissions.sound);
        resolve(hasPermissions);
      });
    });
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        const granted = 
          (permissions.alert || permissions.badge || permissions.sound);
        resolve(granted);
      });
    });
  }
}