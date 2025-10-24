package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch
import android.graphics.Color
import android.util.Log
import android.view.LayoutInflater
import coil.load

class MaintainanceHistory : AppCompatActivity() {
    private lateinit var container: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_maintainance_history)

        container = findViewById(R.id.container_maintenance)

        // Back arrow
        findViewById<ImageView>(R.id.back_arrow).setOnClickListener {
            finish()
        }

        setupBottomNavigation()
        loadMaintenanceHistory()

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    private fun setupBottomNavigation() {
        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        bottomNavigation.selectedItemId = R.id.navigation_dashboard
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    startActivity(Intent(this, HomePage::class.java))
                    true
                }
                R.id.navigation_chatbot -> {
                    startActivity(Intent(this, Chatbot::class.java))
                    true
                }
                R.id.navigation_dashboard -> {
                    startActivity(Intent(this, Dashboard::class.java))
                    true
                }
                R.id.navigation_profile -> {
                    startActivity(Intent(this, Settings::class.java))
                    true
                }
                else -> false
            }
        }
    }

    private fun loadMaintenanceHistory() {
        lifecycleScope.launch {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val token = prefs.getString(MainActivity.TOKEN_KEY, null) ?: return@launch

            val response = RetrofitClient.maintenanceApi.getMyRequests("Bearer $token")
            if (response.isSuccessful) {
                val requests = response.body()?.maintenance.orEmpty()
                displayRequests(requests)
            } else {
                Toast.makeText(this@MaintainanceHistory, "Failed to load requests", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun displayRequests(requests: List<MaintenanceResponse>) {
        container.removeAllViews()
        val inflater = LayoutInflater.from(this)

        // Grouping by property and description (or another unique key)
        val grouped = requests.groupBy { "${it.property_id}_${it.description}" }

        // For each group, prefer the non-completed version if it exists
        val deduped = grouped.values.map { group ->
            group.find { it.status.lowercase() != "completed" } ?: group.first()
        }

        val active = deduped.filter { it.status.lowercase() != "completed" }
        val completed = deduped.filter { it.status.lowercase() == "completed" }

        //Active requests header
        if (active.isNotEmpty()) {
            val header = TextView(this).apply {
                text = "Active Requests"
                textSize = 18f
                setPadding(0, 16, 0, 8)
            }
            container.addView(header)
            active.forEach { addCard(it, inflater) }
        }

        //Completed requests header
        if (completed.isNotEmpty()) {
            val header = TextView(this).apply {
                text = "Completed Requests"
                textSize = 18f
                setPadding(0, 24, 0, 8)
            }
            container.addView(header)
            completed.forEach { addCard(it, inflater) }
        }
    }

    private fun reopenRequest(req: MaintenanceResponse) {
        lifecycleScope.launch {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val token = prefs.getString(MainActivity.TOKEN_KEY, null) ?: return@launch

            val response = RetrofitClient.maintenanceApi.reopenRequest(
                id = req.id,
                authHeader = "Bearer $token"
            )

            if (response.isSuccessful) {
                Toast.makeText(this@MaintainanceHistory, "Request re-opened", Toast.LENGTH_SHORT).show()
                loadMaintenanceHistory()
            } else {
                Toast.makeText(this@MaintainanceHistory, "Failed to re-open", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun addCard(req: MaintenanceResponse, inflater: LayoutInflater) {
        val card = inflater.inflate(R.layout.maintainance_card, container, false)

        card.findViewById<TextView>(R.id.tv_property_name).text = "Property ID: ${req.property_id}"
        card.findViewById<TextView>(R.id.tv_maintainance_description).text = req.description

        val statusView = card.findViewById<TextView>(R.id.tv_maintainance_status)
        statusView.text = "Status: ${req.status}"
        statusView.setTextColor(
            when (req.status.lowercase()) {
                "completed" -> Color.parseColor("#00B822")
                "in_progress" -> Color.parseColor("#2196F3")
                else -> Color.parseColor("#FF9800")
            }
        )

        val reopenBtn = card.findViewById<TextView>(R.id.btn_open_lease)
        if (req.status.lowercase() == "completed") {
            reopenBtn.visibility = View.VISIBLE
            reopenBtn.setOnClickListener { reopenRequest(req) }
        } else {
            reopenBtn.visibility = View.GONE
        }

        val photosContainer = card.findViewById<LinearLayout>(R.id.photos_container)
        photosContainer.removeAllViews()

        Log.d("MaintenanceHistory", "Photos count for req ${req.id}: ${req.photos?.size ?: 0}")
        req.photos?.forEach { photo ->
            Log.d("MaintenanceHistory", "Photo string (first 100 chars): ${photo.take(100)}")
            val imageView = ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(200, 200).apply {
                    setMargins(8, 0, 8, 0)
                }
                scaleType = ImageView.ScaleType.CENTER_CROP
            }

            if (photo.startsWith("data:image") || photo.startsWith("/9j/") || photo.length > 200) {
                setImageFromBase64(imageView, photo)
            } else {
                imageView.load(photo) {
                    placeholder(R.drawable.placeholder)
                }
            }

            photosContainer.addView(imageView)
        }
        container.addView(card)
    }

    private fun setImageFromBase64(imageView: ImageView, rawBase64: String) {
        var cleanBase64 = rawBase64.trim()
        if (cleanBase64.startsWith("data:image")) {
            val commaIndex = cleanBase64.indexOf(",")
            if (commaIndex != -1) cleanBase64 = cleanBase64.substring(commaIndex + 1)
        }
        try {
            val decodedBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
            val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            imageView.setImageBitmap(bitmap)
        } catch (e: Exception) {
            imageView.setImageResource(R.drawable.placeholder)
        }
    }
}