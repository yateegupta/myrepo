package com.voicereminder.app

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.voicereminder.app.data.AppDatabase
import com.voicereminder.app.data.Reminder
import com.voicereminder.app.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var textToSpeech: TextToSpeech
    private lateinit var database: AppDatabase
    private var isTtsReady = false
    
    // Permission launcher for notification permission (Android 13+)
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Toast.makeText(this, "Notification permission granted", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Notification permission denied. Reminders may not work properly.", Toast.LENGTH_LONG).show()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize database
        database = AppDatabase.getDatabase(this)
        
        // Initialize TextToSpeech
        textToSpeech = TextToSpeech(this, this)
        
        // Create notification channel
        createNotificationChannel()
        
        // Check and request notification permission for Android 13+
        checkNotificationPermission()
        
        // Setup button click listeners
        setupButtonListeners()
    }
    
    private fun setupButtonListeners() {
        // Set Reminder button
        binding.btnSetReminder.setOnClickListener {
            setReminder()
        }
        
        // Preview Voice button
        binding.btnPreview.setOnClickListener {
            previewVoiceNote()
        }
        
        // Clear button
        binding.btnClear.setOnClickListener {
            clearInputs()
        }
    }
    
    private fun setReminder() {
        val message = binding.etMessage.text.toString().trim()
        
        if (message.isEmpty()) {
            Toast.makeText(this, "Please enter a reminder message", Toast.LENGTH_SHORT).show()
            return
        }
        
        // Get selected time from TimePicker
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, binding.timePicker.hour)
            set(Calendar.MINUTE, binding.timePicker.minute)
            set(Calendar.SECOND, 0)
        }
        
        // If the selected time is in the past, schedule for tomorrow
        if (calendar.timeInMillis <= System.currentTimeMillis()) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }
        
        // Generate unique alarm ID
        val alarmId = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
        
        // Create reminder object
        val reminder = Reminder(
            message = message,
            timeInMillis = calendar.timeInMillis,
            alarmId = alarmId
        )
        
        // Save reminder to database and schedule alarm
        lifecycleScope.launch {
            try {
                // Save to database
                val reminderId = database.reminderDao().insertReminder(reminder)
                
                // Schedule the alarm
                scheduleAlarm(calendar.timeInMillis, alarmId, message)
                
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "Reminder set successfully for ${binding.timePicker.hour}:${String.format("%02d", binding.timePicker.minute)}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "Failed to set reminder: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
    
    private fun scheduleAlarm(timeInMillis: Long, alarmId: Int, message: String) {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, ReminderReceiver::class.java).apply {
            putExtra("alarm_id", alarmId)
            putExtra("message", message)
        }
        
        val pendingIntent = android.app.PendingIntent.getBroadcast(
            this,
            alarmId,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        
        // Set exact alarm
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            timeInMillis,
            pendingIntent
        )
    }
    
    private fun previewVoiceNote() {
        val message = binding.etMessage.text.toString().trim()
        
        if (message.isEmpty()) {
            Toast.makeText(this, "Please enter a message to preview", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (isTtsReady) {
            speak(message)
        } else {
            Toast.makeText(this, "Text-to-speech is not ready yet. Please wait a moment.", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun speak(text: String) {
        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }
    
    private fun clearInputs() {
        binding.etMessage.text?.clear()
        // Reset time picker to current time
        val calendar = Calendar.getInstance()
        binding.timePicker.hour = calendar.get(Calendar.HOUR_OF_DAY)
        binding.timePicker.minute = calendar.get(Calendar.MINUTE)
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.channel_name)
            val descriptionText = getString(R.string.channel_description)
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel("reminder_channel", name, importance).apply {
                description = descriptionText
            }
            
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech.setLanguage(Locale.US)
            
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Toast.makeText(this, "Text-to-speech language not supported", Toast.LENGTH_SHORT).show()
            } else {
                isTtsReady = true
            }
        } else {
            Toast.makeText(this, "Text-to-speech initialization failed", Toast.LENGTH_SHORT).show()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Shutdown TextToSpeech to release resources
        if (::textToSpeech.isInitialized) {
            textToSpeech.stop()
            textToSpeech.shutdown()
        }
    }
}