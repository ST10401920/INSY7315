package com.vcsd.nestify

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import java.io.Serializable

interface ApiService {
    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): retrofit2.Response<LoginResponse>

    @POST("/auth/signup")
    suspend fun signup(@Body request: SignupRequest): retrofit2.Response<SignupResponse>
}

interface PropertyApi {
    @GET("properties")
    suspend fun getProperties(
        @Header("Authorization") token: String
    ): Response<PropertiesResponse>

    @GET("properties/{id}")
    suspend fun getPropertyById(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<PropertyResponse>
}

interface NoAuthPropertyApi {
    @GET("no-auth-properties")
    suspend fun getProperties(): Response<PropertiesResponse>

    @GET("no-auth-properties/{id}")
    suspend fun getPropertyById(@Path("id") id: String): Response<PropertyResponse>
}





interface LeaseApi {
    @GET("leases")
    suspend fun getLeases(@Header("Authorization") token: String): Response<LeasesResponse>
}

data class LeasesResponse(val leases: List<LeaseData>)
data class LeaseData(
    val id: String,
    val propertyName: String?,
    val startDate: String,
    val endDate: String,
    val status: String,
    val lease_document: String?,
    val applicantId: String
)

interface ApplicationApi {
    @POST("/applications")
    suspend fun submitApplication(
        @Header("Authorization") token: String,
        @Body request: ApplicationRequest
    ): Response<Unit>

    @GET("/applications")
    suspend fun getApplications(
        @Header("Authorization") token: String
    ): Response<ApplicationsResponse>
}

data class ApplicationsResponse(
    val applications: List<ApplicationData>
)

data class ApplicationData(
    val id: Int,
    val property_id: Int,
    val applicant_id: String,
    val first_name: String,
    val last_name: String,
    val phone_number: String,
    val id_number: String,
    val age: Int,
    val job_title: String?,
    val income: Double?,
    val income_source: String?,
    val status: String,
    val submitted_at: String,
    val approved_at: String?,
    val notes: String?,
    val lease_agreed: Boolean,
    val documents: String?,
    val lease: LeaseData? = null
)

data class Application(
    val id: String,
    val propertyName: String,
    val status: String,
    val leaseUrl: String? = null
)


interface ChatApi {
    @POST("/chatbot")
    suspend fun sendMessage(
        @Header("Authorization") bearerToken: String,
        @Body request: MessageRequest
    ): Response<MessageResponse>
}

data class MessageRequest(val message: String)
data class MessageResponse(val reply: String)

data class PropertiesResponse(
    val properties: List<Property>
)

data class PropertyResponse(
    val property: Property
)

data class Property(
    val id: String,
    val user_id: String,
    val name: String?,
    val location: String?,
    val images: List<String>?,
    val bedrooms: Int?,
    val price: Int?,
    val amenities: List<String>?,
    val available: Boolean
)


data class SyncResponse(
    val accessToken: String,
    val userId: String,
    val email: String
)

data class PropertyFilter(
    val minPrice: Int? = null,
    val maxPrice: Int? = null,
    val bedrooms: Int? = null,
    val amenities: List<String>? = null
) : Serializable

data class ApplicationRequest(
    val propertyId: String,
    val first_name: String,
    val last_name: String,
    val phone_number: String,
    val id_number: String,
    val age: Int,
    val job_title: String?,
    val income: Double?,
    val income_source: String?,
    val lease_agreed: Boolean,
    val documents: List<String> = emptyList(),
    val notes: String? = ""
)