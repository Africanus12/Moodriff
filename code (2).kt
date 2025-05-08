package com.example.moodriffmaker.data.local.dao

import androidx.room.*
import com.example.moodriffmaker.data.local.entity.RiffEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RiffDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRiff(riff: RiffEntity): Long

    @Query("SELECT * FROM riffs ORDER BY timestamp DESC")
    fun getAllRiffs(): Flow<List<RiffEntity>> // Use Flow for reactive updates

    @Query("SELECT * FROM riffs WHERE id = :id")
    suspend fun getRiffById(id: Long): RiffEntity?

    @Delete
    suspend fun deleteRiff(riff: RiffEntity)

    @Query("DELETE FROM riffs WHERE id = :id")
    suspend fun deleteRiffById(id: Long)

    @Query("SELECT COUNT(*) FROM riffs")
    suspend fun getRiffCount(): Int
}