package com.voicereminder.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.lifecycle.lifecycleScope
import com.voicereminder.app.data.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * BroadcastReceiver that handles device boot events to restore scheduled alarms
 */
class BootReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || 
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            // Restore all scheduled reminders from database
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val database = AppDatabase.getDatabase(context)
                    val reminderDao = database.reminderDao()
                    val scheduledReminders = reminderDao.getScheduledReminders()
                    
                    scheduledReminders.collect { reminders ->
                        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
                        
                        reminders.forEach { reminder ->
                            // Only reschedule if the reminder time is in the future
                            if (reminder.timeInMillis > System.currentTimeMillis()) {
                                val alarmIntent = Intent(context, ReminderReceiver::class.java).apply {
                                    putExtra("alarm_id", reminder.alarmId)
                                    putExtra("message", reminder.message)
                                }
                                
                                val pendingIntent = android.app.PendingIntent.getBroadcast(
                                    context,
                                    reminder.alarmId,
                                    alarmIntent,
                                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                                )
                                
                                // Reschedule the alarm
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                    if (alarmManager.canScheduleExactAlarms()) {
                                        alarmManager.setExactAndAllowWhileIdle(
                                            android.app.AlarmManager.RTC_WAKEUP,
                                            reminder.timeInMillis,
                                            pendingIntent
                                        )
                                    }
                                } else {
                                    alarmManager.setExactAndAllowWhileIdle(
                                        android.app.AlarmManager.RTC_WAKEUP,
                                        reminder.timeInMillis,
                                        pendingIntent
                                    )
                                }
                            } else {
                                // Mark past reminders as completed
                                reminderDao.markAsCompleted(reminder.id)
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Log error but don't crash
                    e.printStackTrace()
                }
            }
        }
    }
}