package com.vcsd.nestify

import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): retrofit2.Response<LoginResponse>

    @POST("/auth/signup")
    suspend fun signup(@Body request: SignupRequest): retrofit2.Response<SignupResponse>

}

data class SyncResponse(
    val accessToken: String,
    val userId: String,
    val email: String
)