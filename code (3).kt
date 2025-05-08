package com.example.moodriffmaker.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.moodriffmaker.data.local.dao.RiffDao
import com.example.moodriffmaker.data.local.entity.RiffEntity

@Database(entities = [RiffEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun riffDao(): RiffDao
}