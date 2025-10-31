/**
 * Storage Service
 * Handles persistent storage of reminders using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

export class StorageService {
  private static readonly REMINDERS_KEY = 'voice_reminders';

  /**
   * Save a single reminder to local storage
   * @param reminder - The reminder to save
   */
  static async saveReminder(reminder: Reminder): Promise<void> {
    try {
      // Get existing reminders
      const existingReminders = await this.getReminders();
      
      // Add the new reminder
      const updatedReminders = [...existingReminders, reminder];
      
      // Save to storage
      await AsyncStorage.setItem(
        this.REMINDERS_KEY, 
        JSON.stringify(updatedReminders)
      );
      
      console.log('Reminder saved successfully:', reminder.id);
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw new Error('Failed to save reminder');
    }
  }

  /**
   * Get all saved reminders from local storage
   * @returns Array of Reminder objects
   */
  static async getReminders(): Promise<Reminder[]> {
    try {
      const remindersData = await AsyncStorage.getItem(this.REMINDERS_KEY);
      
      if (!remindersData) {
        return [];
      }
      
      const reminders = JSON.parse(remindersData);
      
      // Convert date strings back to Date objects
      const processedReminders = reminders.map((reminder: any) => ({
        ...reminder,
        dateTime: new Date(reminder.dateTime),
      }));
      
      // Filter out reminders that have passed (optional cleanup)
      const now = new Date();
      const validReminders = processedReminders.filter(
        (reminder: Reminder) => new Date(reminder.dateTime) > now
      );
      
      // If we filtered out any reminders, update storage
      if (validReminders.length !== processedReminders.length) {
        await AsyncStorage.setItem(
          this.REMINDERS_KEY,
          JSON.stringify(validReminders)
        );
      }
      
      return validReminders;
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  /**
   * Remove a specific reminder from storage
   * @param reminderId - The ID of the reminder to remove
   */
  static async removeReminder(reminderId: string): Promise<void> {
    try {
      const existingReminders = await this.getReminders();
      
      // Filter out the reminder to remove
      const updatedReminders = existingReminders.filter(
        reminder => reminder.id !== reminderId
      );
      
      // Save the updated list
      await AsyncStorage.setItem(
        this.REMINDERS_KEY,
        JSON.stringify(updatedReminders)
      );
      
      console.log('Reminder removed successfully:', reminderId);
    } catch (error) {
      console.error('Error removing reminder:', error);
      throw new Error('Failed to remove reminder');
    }
  }

  /**
   * Update an existing reminder
   * @param updatedReminder - The updated reminder object
   */
  static async updateReminder(updatedReminder: Reminder): Promise<void> {
    try {
      const existingReminders = await this.getReminders();
      
      // Find and update the reminder
      const reminderIndex = existingReminders.findIndex(
        reminder => reminder.id === updatedReminder.id
      );
      
      if (reminderIndex === -1) {
        throw new Error('Reminder not found');
      }
      
      existingReminders[reminderIndex] = updatedReminder;
      
      // Save the updated list
      await AsyncStorage.setItem(
        this.REMINDERS_KEY,
        JSON.stringify(existingReminders)
      );
      
      console.log('Reminder updated successfully:', updatedReminder.id);
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw new Error('Failed to update reminder');
    }
  }

  /**
   * Clear all reminders from storage
   */
  static async clearAllReminders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.REMINDERS_KEY);
      console.log('All reminders cleared');
    } catch (error) {
      console.error('Error clearing reminders:', error);
      throw new Error('Failed to clear reminders');
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalReminders: number;
    storageSize: number;
  }> {
    try {
      const reminders = await this.getReminders();
      const remindersData = await AsyncStorage.getItem(this.REMINDERS_KEY);
      
      return {
        totalReminders: reminders.length,
        storageSize: remindersData ? JSON.stringify(remindersData).length : 0,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalReminders: 0,
        storageSize: 0,
      };
    }
  }

  /**
   * Cleanup expired reminders (older than current time)
   * This can be called on app startup to maintain storage efficiency
   */
  static async cleanupExpiredReminders(): Promise<number> {
    try {
      const allReminders = await this.getReminders();
      const now = new Date();
      
      const expiredReminders = allReminders.filter(
        reminder => new Date(reminder.dateTime) <= now
      );
      
      if (expiredReminders.length === 0) {
        return 0;
      }
      
      // Remove expired reminders from storage
      for (const expiredReminder of expiredReminders) {
        await this.removeReminder(expiredReminder.id);
      }
      
      console.log(`Cleaned up ${expiredReminders.length} expired reminders`);
      return expiredReminders.length;
    } catch (error) {
      console.error('Error cleaning up expired reminders:', error);
      return 0;
    }
  }

  /**
   * Export reminders data (for backup purposes)
   * @returns JSON string of all reminders
   */
  static async exportReminders(): Promise<string> {
    try {
      const reminders = await this.getReminders();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        reminders: reminders,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting reminders:', error);
      throw new Error('Failed to export reminders');
    }
  }

  /**
   * Import reminders data (for restore purposes)
   * @param exportData - JSON string of reminder data
   */
  static async importReminders(exportData: string): Promise<void> {
    try {
      const importData = JSON.parse(exportData);
      
      if (!importData.reminders || !Array.isArray(importData.reminders)) {
        throw new Error('Invalid export data format');
      }
      
      // Clear existing reminders
      await this.clearAllReminders();
      
      // Import all reminders
      for (const reminder of importData.reminders) {
        await this.saveReminder({
          ...reminder,
          dateTime: new Date(reminder.dateTime),
        });
      }
      
      console.log(`Imported ${importData.reminders.length} reminders`);
    } catch (error) {
      console.error('Error importing reminders:', error);
      throw new Error('Failed to import reminders');
    }
  }
}