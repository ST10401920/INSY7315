package com.vcsd.nestify
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private const val BASE_URL = "http://10.0.2.2:3000/"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val applicationApi: ApplicationApi by lazy {
        instance.create(ApplicationApi::class.java)
    }

    val noAuthPropertyApi: NoAuthPropertyApi by lazy {
        instance.create(NoAuthPropertyApi::class.java)
    }

    val leaseApi: LeaseApi by lazy {
        instance.create(LeaseApi::class.java)
    }

    val chatApi: ChatApi by lazy {
        instance.create(ChatApi::class.java)
    }

    val propertyApi: PropertyApi by lazy {
        instance.create(PropertyApi::class.java)
    }

    val maintenanceApi: MaintenanceApi by lazy {
        instance.create(MaintenanceApi::class.java)
    }

    val rentalsApi: RentalsApi by lazy {
        instance.create(RentalsApi::class.java)
    }

    val apiService: ApiService by lazy {
        instance.create(ApiService::class.java)
    }
}