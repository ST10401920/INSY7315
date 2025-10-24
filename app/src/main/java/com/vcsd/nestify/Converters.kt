package com.vcsd.nestify

import androidx.room.TypeConverter

class Converters {
    @TypeConverter
    fun fromString(value: String?): List<String>? {
        // Check for null or empty string and return an empty list
        if (value.isNullOrEmpty()) {
            return emptyList()
        }
        // Split the string by commas to reconstruct the list
        return value.split(",")
    }

    @TypeConverter
    fun fromList(list: List<String>?): String? {
        // Check for null list and return an empty string
        if (list.isNullOrEmpty()) {
            return ""
        }
        // Join the list elements into a single comma-separated string
        return list.joinToString(",")
    }
}
