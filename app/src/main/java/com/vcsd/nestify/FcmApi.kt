package com.vcsd.nestify

import retrofit2.http.Body
import retrofit2.http.POST

interface FcmApi {

    @POST("/send")
    suspend fun sendMessage(
        @Body body: SendMessageDto
    )

    @POST("/broadcast")
    suspend fun broadcast(
        @Body body: SendMessageDto
    )

    data class FcmMessage(
        val to: String,
        val notification: NotificationData
    )

    data class NotificationData(
        val title: String,
        val body: String
    )
}