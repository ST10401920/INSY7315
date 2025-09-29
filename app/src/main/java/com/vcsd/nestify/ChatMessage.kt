package com.vcsd.nestify

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestamp: String? = null
)

