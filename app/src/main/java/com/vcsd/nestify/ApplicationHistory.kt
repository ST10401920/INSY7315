package com.vcsd.nestify

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import com.bumptech.glide.Glide
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ApplicationHistory : AppCompatActivity() {

    private lateinit var container: LinearLayout
    private lateinit var back: ImageView
    private val propertyMap = mutableMapOf<Int, Property>() // property_id -> Property

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_application_history)

        container = findViewById(R.id.container_applications)
        back = findViewById(R.id.back_arrow)

        back.setOnClickListener {
            startActivity(Intent(this, Settings::class.java))
            finish()
        }

        setupBottomNavigation()
        fetchApplicationsAndProperties()
    }

    private fun setupBottomNavigation() {
        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> { startActivity(Intent(this, HomePage::class.java)); true }
                R.id.navigation_chatbot -> { startActivity(Intent(this, Chatbot::class.java)); true }
                R.id.navigation_dashboard -> { startActivity(Intent(this, Dashboard::class.java)); true }
                R.id.navigation_profile -> { startActivity(Intent(this, Settings::class.java)); true }
                else -> false
            }
        }
    }

    private fun fetchApplicationsAndProperties() {
        val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
            .getString("access_token", null) ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val appResponse = RetrofitClient.instance
                    .create(ApplicationApi::class.java)
                    .getApplications("Bearer $token")

                if (!appResponse.isSuccessful) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@ApplicationHistory, "Failed to fetch applications", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val applications = appResponse.body()?.applications ?: emptyList()
                Log.d("AppHistory", "Applications fetched: ${applications.size}")

                // Fetch properties
                val propertyIds = applications.map { it.property_id }.distinct()
                propertyIds.forEach { id ->
                    try {
                        val propResponse = RetrofitClient.propertyApi.getPropertyById("Bearer $token", id.toString())
                        if (propResponse.isSuccessful) propResponse.body()?.property?.let { propertyMap[id] = it }
                    } catch (e: Exception) {
                        Log.e("AppHistory", "Failed to fetch property $id", e)
                    }
                }

                withContext(Dispatchers.Main) { displayApplications(applications) }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ApplicationHistory, "Network error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun displayApplications(applications: List<ApplicationData>) {
        container.removeAllViews()

        applications.forEach { app ->
            val card = layoutInflater.inflate(R.layout.application_card, container, false)

            val tvPropertyName = card.findViewById<TextView>(R.id.tv_property_name)
            val tvStatus = card.findViewById<TextView>(R.id.tv_application_status)
            val btnViewLease = card.findViewById<TextView>(R.id.btn_view_lease)
            val ivProperty = card.findViewById<ImageView>(R.id.img_property)

            val property = propertyMap[app.property_id]
            tvPropertyName.text = property?.name ?: "Property"
            tvStatus.text = app.status.replaceFirstChar { it.uppercase() }

            // Use Glide to load the first image URL
            val imageUrl = property?.images?.firstOrNull()
            Glide.with(this)
                .load(imageUrl)
                .placeholder(R.drawable.placeholder)
                .error(R.drawable.placeholder)
                .into(ivProperty)

            val isApproved = app.status.lowercase() == "approved"
            btnViewLease.isVisible = isApproved

            btnViewLease.setOnClickListener {
                val intent = Intent(this, Lease::class.java)
                intent.putExtra("LEASE_URL", app.lease?.lease_document)
                intent.putExtra("LEASE_ID", app.lease?.id)
                intent.putExtra("PROPERTY_NAME", property?.name)
                intent.putExtra("LEASE_STATUS", app.status)
                intent.putExtra("PROPERTY_IMAGE_URL", imageUrl) // Pass URL, not Base64
                startActivity(intent)
            }

            container.addView(card)
        }
    }
}
