package com.vcsd.nestify

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.PUT
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

    @PUT("leases/{id}")
    suspend fun uploadSignedLease(
        @Header("Authorization") token: String,
        @Path("id") leaseId: String,
        @Body body: Map<String, String>
    ): Response<LeaseData>
}

data class LeasesResponse(val leases: List<LeaseData>)
//data class LeaseData(
//    val id: String,
//    val propertyName: String?,
//    val startDate: String,
//    val endDate: String,
//    val status: String,
//    val lease_document: String?,
//    val applicationId: Int
//)

data class LeaseData(
    val id: String,
    val propertyName: String?,
    val startDate: String?,
    val endDate: String?,
    val status: String?, // this is the lease status, e.g., sent_to_tenant
    @SerializedName("lease_document") val leaseDocument: String?,
    @SerializedName("application_id") val applicationId: Int,
    val applications: Application? // nested application
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

//data class Application(
//    val id: String,
//    val propertyName: String,
//    val status: String,
//    val leaseUrl: String? = null
//)

data class Application(
    val id: Int, // match the DB type
    @SerializedName("property_id") val propertyId: String?,
    @SerializedName("first_name") val firstName: String?,
    @SerializedName("last_name") val lastName: String?,
    val status: String? // application status (approved/rejected/etc.)
)

interface ChatApi {
    @POST("/chatbot")
    suspend fun sendMessage(
        @Header("Authorization") bearerToken: String,
        @Body request: MessageRequest
    ): Response<MessageResponse>
}

data class MessageRequest(
    val message: String,
    val language: String
)

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

//----------code added for maintenance request------------
interface MaintenanceApi {
    @POST("maintenance")
    suspend fun submitRequest(
        @Header("Authorization") token: String,
        @Body request: MaintenanceRequest
    ): Response<MaintenanceEnvelope>

    @GET("maintenance/my")
    suspend fun getMyRequests(
        @Header("Authorization") token: String
    ): Response<MaintenanceListEnvelope>
}

data class MaintenanceRequest(
    val propertyId: Int,
    val rentalId: Int,
    val caretakerId: String? = null,
    val description: String,
    val category: String,
    val photos: List<String> = emptyList(),
    val urgency: String,
    val progress_notes: List<String> = emptyList()
)

data class MaintenanceResponse(
    val id: String,
    val property_id: String,
    val rental_id: String,
    val tenant_id: String,
    val caretaker_id: String?,
    val description: String,
    val category: String,
    val photos: List<String>?,
    val urgency: String,
    val progress_notes: List<String>?,
    val status: String,
    val created_at: String,
    val updated_at: String?
)

data class MaintenanceEnvelope(val maintenance: MaintenanceResponse)
data class MaintenanceListEnvelope(val maintenance: List<MaintenanceResponse>)

interface RentalsApi {
    @GET("rentals/my")
    suspend fun getMyRentals(
        @Header("Authorization") token: String
    ): Response<RentalsEnvelope>
}

data class RentalsEnvelope(
    val rentals: List<RentalWithProperty>
)

data class RentalWithProperty(
    val rental: RentalData,
    val property: PropertyData?
)

data class RentalData(
    val id: String,
    val start_date: String?,
    val end_date: String?,
    val status: String
)

data class PropertyData(
    val id: String,
    val name: String?,
    val location: String?
)
//----------code added for maintenance request end------------

//interface NotificationApi {
//    @Headers(
//        "Content-Type: application/json",
//        "Authorization: key=e5tRK3d0SNek5WDVZBY_3J:APA91bGH7GQC3NqlUEMFJecSYq4vw0U8dSQ_qh7oyeWGyQ_HUkZeZshZ_lNvkvYD9_XeI9LaxynGVLxKelqH8Jluq4gyv2vs-fBcfm-MXuIrp8CDMiEmowo"
//    )
//    @POST("https://fcm.googleapis.com/fcm/send")
//    suspend fun sendNotification(@Body payload: FcmApi.FcmMessage): Response<Unit>
//}

interface NotificationApi {
    @POST("notifications/send")
    suspend fun sendNotification(@Body payload: FcmApi.FcmMessage): Response<Unit>

    @POST("notifications/broadcast")
    suspend fun broadcastNotification(@Body payload: FcmApi.FcmMessage): Response<Unit>
}

data class AnnouncementModel(
    val id: Int,
    val title: String,
    val message: String,
    val created_at: String
)


interface AnnouncementApi {
    @GET("announcements")
    suspend fun getAnnouncements(
        @Header("Authorization") token: String
    ): Response<Map<String, List<AnnouncementModel>>>

}
