package com.vcsd.nestify

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update

@Dao
interface MaintenanceRequestDao {

    @Insert
    suspend fun insert(request: MaintenanceRequestEntity)

    @Query("SELECT * FROM maintenance_requests WHERE synced = 0")
    suspend fun getUnsyncedRequests(): List<MaintenanceRequestEntity>

    @Update
    suspend fun update(request: MaintenanceRequestEntity)
}