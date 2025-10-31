/**
 * Type definitions for Voice Reminder app
 */

export interface Reminder {
  id: string;
  message: string;
  dateTime: Date;
  isScheduled: boolean;
}

export interface NotificationData {
  message: string;
  reminderId: string;
}

export type ReminderStatus = 'scheduled' | 'triggered' | 'cancelled';

export interface ReminderWithStatus extends Reminder {
  status: ReminderStatus;
}