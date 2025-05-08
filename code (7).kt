package com.example.moodriffmaker.util

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import com.example.moodriffmaker.data.model.Mood
import kotlinx.coroutines.*
import kotlin.random.Random

object ToneHelper {

    private var toneGenerator: ToneGenerator? = null
    private val handler = Handler(Looper.getMainLooper())
    private var generationJob: Job? = null

    // Simple tone generation - plays continuously until stopped
    fun startTone(mood: Mood) {
        stopTone() // Stop any existing tone
        try {
            // Use STREAM_MUSIC for better volume control matching media
            toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 80) // 80% volume
            val toneType = mood.toneType
            // Note: ToneGenerator frequencies are fixed for DTMF etc.
            // To get specific Hz (like 440Hz), you'd need to generate PCM data yourself.
            // ToneGenerator is simpler for pre-defined tones.
            // For this example, we'll use the mood's pre-defined tone type.
            // The frequency in Mood enum is more conceptual here or for future PCM generation.

             if (mood.isRandom) {
                generationJob = CoroutineScope(Dispatchers.Default).launch {
                    while (isActive) {
                        val randomTone = ToneGenerator::class.java.fields
                            .filter { it.name.startsWith("TONE_") && !it.name.contains("SUP") && !it.name.contains("CALL") } // Filter some tones
                            .random().getInt(null)
                        toneGenerator?.startTone(randomTone, 150) // Play short bursts
                         delay( (200 / mood.speedFactor).toLong() + Random.nextLong(50) ) // Random delay
                    }
                }
            } else {
                 // Simple continuous tone (or sequence if startTone had duration)
                 // startTone(type, duration) plays for duration then stops.
                 // To make it continuous or patterned, use a loop like the random one.
                 generationJob = CoroutineScope(Dispatchers.Default).launch {
                     while(isActive) {
                         toneGenerator?.startTone(toneType, (1000 / mood.speedFactor).toInt()) // Play for 1 sec adjusted by speed
                         delay((1100 / mood.speedFactor).toLong()) // Small gap
                     }
                 }
                 // Alternative: A single long startTone if the device supports it without issues
                 // toneGenerator?.startTone(toneType, -1) // -1 might mean indefinite? Check docs/test. Often needs manual stop.
            }

        } catch (e: RuntimeException) {
            // Handle exceptions (e.g., device limitations)
            stopTone() // Clean up if failed
        }
    }

    fun stopTone() {
        generationJob?.cancel() // Cancel the coroutine loop
        generationJob = null
        handler.post { // Ensure stop/release happens on main thread if needed, or directly if safe
            toneGenerator?.stopTone()
            toneGenerator?.release()
            toneGenerator = null
        }
    }

    // --- Advanced: Generate PCM data for specific frequencies ---
    // This is much more complex, involves creating a byte array of sine waves
    // and playing it via AudioTrack or ExoPlayer. ToneGenerator is simpler for basic sounds.
    // fun generatePcmData(frequency: Int, durationMs: Int): ByteArray { ... }
}