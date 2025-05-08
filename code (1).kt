package com.example.moodriffmaker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "riffs")
data class RiffEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val moodName: String, // Store the Mood enum's name
    val timestamp: Long,
    val filePath: String? = null, // Path to the saved audio file (if saving actual audio)
    // Or potentially store the generation parameters if regenerating on the fly
    val durationSeconds: Int = 30
)