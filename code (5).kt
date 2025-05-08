package com.example.moodriffmaker.data.repository

import com.example.moodriffmaker.data.local.dao.RiffDao
import com.example.moodriffmaker.data.local.entity.RiffEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class RiffRepository @Inject constructor(private val riffDao: RiffDao) {

    fun getAllRiffs(): Flow<List<RiffEntity>> = riffDao.getAllRiffs()

    suspend fun saveRiff(riff: RiffEntity): Long {
        // Add logic here if you need to save the actual audio file
        // e.g., generate PCM data, write to file, store path in entity
        return riffDao.insertRiff(riff)
    }

    suspend fun deleteRiff(riff: RiffEntity) {
        // Add logic to delete the associated audio file if stored
        riffDao.deleteRiff(riff)
    }

     suspend fun deleteRiffById(id: Long) {
        // Add logic to delete the associated audio file if stored
        riffDao.deleteRiffById(id)
    }

    suspend fun getRiffCount(): Int = riffDao.getRiffCount()
}