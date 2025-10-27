package com.vcsd.nestify

import androidx.room.TypeConverter

class Converters {
    @TypeConverter
    fun fromString(value: String?): List<String>? {
        if (value.isNullOrEmpty()) {
            return emptyList()
        }
        return value.split(",")
    }

    @TypeConverter
    fun fromList(list: List<String>?): String? {
        if (list.isNullOrEmpty()) {
            return ""
        }
        return list.joinToString(",")
    }
}
