package com.voicereminder.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.speech.tts.TextToSpeech
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*

/**
 * Foreground service that handles text-to-speech playback for reminders
 */
class ReminderService : Service(), TextToSpeech.OnInitListener {
    
    private lateinit var textToSpeech: TextToSpeech
    private var messageToSpeak: String? = null
    private var alarmId: Int = -1
    private var isTtsReady = false
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onCreate() {
        super.onCreate()
        textToSpeech = TextToSpeech(this, this)
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        messageToSpeak = intent?.getStringExtra("message")
        alarmId = intent?.getIntExtra("alarm_id", -1) ?: -1
        
        // Start foreground service with notification
        val notification = createForegroundNotification()
        startForeground(alarmId, notification)
        
        // Wait for TTS to be ready, then speak
        serviceScope.launch {
            waitForTtsAndSpeak()
            
            // Stop service after speaking is complete
            delay(2000) // Give time for speech to complete
            stopSelf()
        }
        
        return START_NOT_STICKY
    }
    
    private suspend fun waitForTtsAndSpeak() {
        // Wait for TTS to be ready
        withTimeoutOrNull(5000) { // 5 second timeout
            while (!isTtsReady) {
                delay(100)
            }
        }
        
        // Speak the message if TTS is ready
        if (isTtsReady && !messageToSpeak.isNullOrEmpty()) {
            speak(messageToSpeak!!)
        } else {
            // If TTS is not ready, just stop the service after a delay
            delay(1000)
        }
    }
    
    private fun speak(text: String) {
        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "reminder_speech")
    }
    
    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, "reminder_channel")
            .setContentTitle("Voice Reminder")
            .setContentText("Playing your reminder...")
            .setSmallIcon(R.drawable.ic_notification) // You'll need to create this icon
            .setColor(getColor(R.color.primary_blue))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .build()
    }
    
    private fun createNotificationChannel() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "reminder_channel",
                getString(R.string.channel_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_description)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech.setLanguage(java.util.Locale.US)
            isTtsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
        }
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        
        // Cleanup TTS
        if (::textToSpeech.isInitialized) {
            textToSpeech.stop()
            textToSpeech.shutdown()
        }
    }
}