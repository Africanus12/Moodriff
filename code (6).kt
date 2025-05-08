package com.example.moodriffmaker.data.repository

import com.example.moodriffmaker.data.local.SharedPreferencesHelper
import com.example.moodriffmaker.data.model.UserProgress
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

class UserRepository @Inject constructor(
    private val prefsHelper: SharedPreferencesHelper,
    private val riffRepository: RiffRepository // Inject if needed for XP calc
) {

    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE // yyyy-MM-dd

    fun getUserProgress(): UserProgress {
        return UserProgress(
            xp = prefsHelper.getUserXp(),
            level = prefsHelper.getUserLevel(),
            streak = getCurrentStreak() // Calculate current streak
        )
    }

    fun recordRiffCreation(): UserProgress {
        val today = LocalDate.now()
        val todayStr = today.format(dateFormatter)
        val lastRiffDateStr = prefsHelper.getLastRiffDate()

        var currentStreak = prefsHelper.getStreakCount()

        if (lastRiffDateStr != null) {
            val lastRiffDate = LocalDate.parse(lastRiffDateStr, dateFormatter)
            if (today.isEqual(lastRiffDate.plusDays(1))) {
                // Consecutive day
                currentStreak++
            } else if (!today.isEqual(lastRiffDate)) {
                // Missed a day or more, or first riff today after a break
                currentStreak = 1
            } // else: multiple riffs on the same day, streak doesn't change
        } else {
            // First riff ever
            currentStreak = 1
        }

        prefsHelper.saveStreak(currentStreak, todayStr)

        // Award XP
        var currentXp = prefsHelper.getUserXp()
        var currentLevel = prefsHelper.getUserLevel()

        currentXp += calculateXpForRiff() // Define XP amounts
        currentXp += calculateStreakBonus(currentStreak) // Check for 5-day, 10-day etc.

        // Check for level up
        val newLevel = calculateLevel(currentXp) // Define level thresholds
        if (newLevel > currentLevel) {
            // TODO: Trigger level up event (e.g., show Lottie animation)
            currentLevel = newLevel
            // Award level up rewards (unlock features/cosmetics)
        }

        prefsHelper.saveUserProgress(currentXp, currentLevel)

        return UserProgress(currentXp, currentLevel, currentStreak)
    }

    private fun getCurrentStreak(): Int {
         val today = LocalDate.now()
         val lastRiffDateStr = prefsHelper.getLastRiffDate()
         if (lastRiffDateStr != null) {
             val lastRiffDate = LocalDate.parse(lastRiffDateStr, dateFormatter)
             if (today.isEqual(lastRiffDate) || today.isEqual(lastRiffDate.plusDays(1))) {
                 return prefsHelper.getStreakCount()
             } else {
                 // Streak broken if not today or yesterday
                 return 0
             }
         }
         return 0 // No riffs recorded yet
    }


    // --- XP/Level Calculation Helpers (Implement these) ---
    private fun calculateXpForRiff(): Long = 10L // Example
    private fun calculateXpForShare(): Long = 25L // Example
    private fun calculateXpForChallenge(): Long = 50L // Example
    private fun calculateStreakBonus(streak: Int): Long {
        return when {
            streak % 10 == 0 && streak > 0 -> 100L // Bonus every 10 days
            streak % 5 == 0 && streak > 0 -> 50L  // Bonus every 5 days
            else -> 0L
        }
    }
    private fun calculateLevel(xp: Long): Int {
        // Example: Level up every 100 XP
        return 1 + (xp / 100).toInt()
    }
     // Add functions for sharing, completing challenges, etc. to update XP
    fun recordRiffShare() { /* Update XP */ }
    fun recordChallengeComplete() { /* Update XP */ }
}

data class UserProgress(val xp: Long, val level: Int, val streak: Int)