package com.example.moodriffmaker.data.local

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton // Make it a singleton with Hilt
class SharedPreferencesHelper @Inject constructor(@ApplicationContext context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("MoodRiffPrefs", Context.MODE_PRIVATE)

    companion object {
        const val KEY_STREAK_COUNT = "streak_count"
        const val KEY_LAST_RIFF_DATE = "last_riff_date" // Store date as String (yyyy-MM-dd) or Long
        const val KEY_USER_XP = "user_xp"
        const val KEY_USER_LEVEL = "user_level"
        const val KEY_APP_THEME = "app_theme"
        // Add keys for other settings like visualizer choice, unlocked items etc.
    }

    fun saveStreak(count: Int, lastDate: String) {
        prefs.edit()
            .putInt(KEY_STREAK_COUNT, count)
            .putString(KEY_LAST_RIFF_DATE, lastDate)
            .apply()
    }

    fun getStreakCount(): Int = prefs.getInt(KEY_STREAK_COUNT, 0)
    fun getLastRiffDate(): String? = prefs.getString(KEY_LAST_RIFF_DATE, null)

    fun saveUserProgress(xp: Long, level: Int) {
        prefs.edit()
            .putLong(KEY_USER_XP, xp)
            .putInt(KEY_USER_LEVEL, level)
            .apply()
    }

    fun getUserXp(): Long = prefs.getLong(KEY_USER_XP, 0L)
    fun getUserLevel(): Int = prefs.getInt(KEY_USER_LEVEL, 1) // Start at level 1

    // Add getters/setters for other preferences
}