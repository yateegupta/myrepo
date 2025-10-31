/**
 * Main App component for Voice Reminder
 * Implements the minimalist UI with all core functionality
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StorageService } from './services/StorageService';
import { NotificationService } from './services/NotificationService';
import { TTSService } from './services/TTSService';

// Type definitions for our reminder data
interface Reminder {
  id: string;
  message: string;
  dateTime: Date;
  isScheduled: boolean;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load saved reminders on app start
  useEffect(() => {
    loadReminders();
  }, []);

  /**
   * Load all saved reminders from local storage
   */
  const loadReminders = async () => {
    try {
      const savedReminders = await StorageService.getReminders();
      setReminders(savedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  /**
   * Handle date/time selection from picker
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDateTime(selectedDate);
    }
  };

  /**
   * Preview the voice note using TTS
   */
  const handlePreviewVoice = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message to preview');
      return;
    }

    try {
      await TTSService.speak(message);
    } catch (error) {
      console.error('TTS Error:', error);
      Alert.alert('Error', 'Failed to play voice preview');
    }
  };

  /**
   * Schedule a new reminder
   */
  const handleScheduleReminder = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a reminder message');
      return;
    }

    const now = new Date();
    const reminderTime = new Date(selectedDateTime);

    if (reminderTime <= now) {
      Alert.alert('Error', 'Please select a future time for the reminder');
      return;
    }

    setIsLoading(true);

    try {
      // Create new reminder object
      const newReminder: Reminder = {
        id: Date.now().toString(),
        message: message.trim(),
        dateTime: reminderTime,
        isScheduled: true,
      };

      // Schedule notification
      await NotificationService.scheduleReminder(newReminder);

      // Save to local storage
      await StorageService.saveReminder(newReminder);

      // Update UI state
      setReminders([...reminders, newReminder]);

      // Clear form
      setMessage('');
      setSelectedDateTime(new Date());

      Alert.alert('Success', 'Voice reminder scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to schedule reminder');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all input fields
   */
  const handleClear = () => {
    setMessage('');
    setSelectedDateTime(new Date());
  };

  /**
   * Cancel a scheduled reminder
   */
  const handleCancelReminder = async (reminderId: string) => {
    try {
      await NotificationService.cancelReminder(reminderId);
      await StorageService.removeReminder(reminderId);
      setReminders(reminders.filter(r => r.id !== reminderId));
      Alert.alert('Success', 'Reminder cancelled');
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      Alert.alert('Error', 'Failed to cancel reminder');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Title */}
        <Text style={styles.title}>Voice Reminder</Text>
        <Text style={styles.subtitle}>Set timed voice reminders</Text>

        {/* Main Input Card */}
        <View style={styles.card}>
          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Message</Text>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your reminder message..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date/Time Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {selectedDateTime.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={handlePreviewVoice}
              disabled={!message.trim()}
            >
              <Text style={styles.buttonText}>Preview Voice Note</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.scheduleButton, isLoading && styles.buttonDisabled]}
              onPress={handleScheduleReminder}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Scheduling...' : 'Schedule Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduled Reminders List */}
        {reminders.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scheduled Reminders</Text>
            {reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderMessage}>{reminder.message}</Text>
                  <Text style={styles.reminderTime}>
                    {reminder.dateTime.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelReminder(reminder.id)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Date/Time Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2fe', // Light blue background
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  dateTimeText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  previewButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#7dd3fc',
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  scheduleButton: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: '#1e293b',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  reminderContent: {
    flex: 1,
  },
  reminderMessage: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1e293b',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#64748b',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#dc2626',
  },
});

export default App;