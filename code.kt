package com.example.moodriffmaker.data.model

import android.media.ToneGenerator

enum class Mood(val displayName: String, val baseFrequencyHz: Int, val toneType: Int, val isRandom: Boolean = false, val speedFactor: Float = 1.0f) {
    CHILL("Chill", 440, ToneGenerator.TONE_DTMF_1, speedFactor = 0.7f), // Example Tone, Slow
    HYPE("Hype", 880, ToneGenerator.TONE_DTMF_D, speedFactor = 1.5f),   // Example Tone, Fast
    CALM("Calm", 220, ToneGenerator.TONE_SUP_DIAL, speedFactor = 0.5f),    // Example Tone, Soft/Slow
    WILD("Wild", 440, ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, isRandom = true) // Base freq for random range
    // Add more moods as needed
}