package com.vcsd.nestify
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    private const val BASE_URL = "http://10.0.2.2:3000/"
    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val applicationApi: ApplicationApi by lazy {
        instance.create(ApplicationApi::class.java)
    }

    val chatApi: ChatApi by lazy {
        instance.create(ChatApi::class.java)
    }

    val propertyApi: PropertyApi by lazy {
        instance.create(PropertyApi::class.java)
    }

    val apiService: ApiService by lazy {
        instance.create(ApiService::class.java)
    }
}