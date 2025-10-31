package com.voicereminder.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity class for storing reminder information in Room database
 */
@Entity(tableName = "reminders")
data class Reminder(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val message: String,
    val timeInMillis: Long,
    val isScheduled: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val alarmId: Int // Unique ID for AlarmManager
)