package com.vcsd.nestify

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "maintenance_requests")
data class MaintenanceRequestEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val propertyId: Int,
    val rentalId: Int,
    val description: String,
    val category: String,
    val urgency: String,
    val photos: List<String>,
    val synced: Boolean = false
)