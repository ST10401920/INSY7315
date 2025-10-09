package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch
import kotlin.collections.take

class Dashboard : AppCompatActivity() {

    //-----------code added for maintenance request--------------
    private lateinit var maintenanceContainer: LinearLayout
    private lateinit var logRequestBtn: TextView

    //-----------code added for maintenance request ends--------------

    //-----------code added for maintenance request--------------
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        maintenanceContainer = findViewById(R.id.maintenanceListContainer)
        logRequestBtn = findViewById(R.id.tv_log_request)

        // Fetch active rental IDs, then load requests
        lifecycleScope.launch {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val token = prefs.getString(MainActivity.TOKEN_KEY, null) ?: return@launch

            val resp = RetrofitClient.rentalsApi.getMyRentals("Bearer $token")
            if (resp.isSuccessful) {
                val rentals = resp.body()?.rentals.orEmpty()
                if (rentals.isNotEmpty()) {
                    //take the first active rental
                    val first = rentals[0]
                    prefs.edit().apply {
                        putString("property_id", first.property?.id)
                        putString("rental_id", first.rental.id)
                    }.apply()

                    // load requests
                    loadMaintenanceRequests()
                } else {
                    Toast.makeText(this@Dashboard, "No active rental in backend", Toast.LENGTH_LONG).show()
                }
            } else {
                Toast.makeText(this@Dashboard, "Error fetching rental: ${resp.code()}", Toast.LENGTH_SHORT).show()
            }
        }

        // Launch MaintainanceLog with IDs from SharedPreferences
        logRequestBtn.setOnClickListener {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val propertyId = prefs.getString("property_id", null)
            val rentalId = prefs.getString("rental_id", null)

            if (!propertyId.isNullOrBlank() && !rentalId.isNullOrBlank()) {
                val intent = Intent(this, MaintainanceLog::class.java).apply {
                    putExtra("propertyId", propertyId)
                    putExtra("rentalId", rentalId)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "No active rental found. Please log in again.", Toast.LENGTH_LONG).show()
            }
        }
        //-----------code added for maintenance request end--------------

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

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    //-----------code added for maintenance request--------------
    private fun loadMaintenanceRequests() {
        lifecycleScope.launch {
            try {
                val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
                val token = prefs.getString(MainActivity.TOKEN_KEY, null)

                if (token.isNullOrBlank()) {
                    Toast.makeText(this@Dashboard, "No token found, please log in again", Toast.LENGTH_LONG).show()
                    return@launch
                }

                val resp = RetrofitClient.maintenanceApi.getMyRequests("Bearer $token")
                if (resp.isSuccessful) {
                    val requests = resp.body()?.maintenance.orEmpty()
                    showRequests(requests)
                } else {
                    Toast.makeText(this@Dashboard, "Error: ${resp.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@Dashboard, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun showRequests(requests: List<MaintenanceResponse>) {
        maintenanceContainer.removeAllViews()
        val inflater = LayoutInflater.from(this)

        requests.take(3).forEach { req ->
            val row = inflater.inflate(R.layout.item_dashboard_request, maintenanceContainer, false)
            row.findViewById<TextView>(R.id.tvRequestTitle).text = req.description
            val statusView = row.findViewById<TextView>(R.id.tvRequestStatus)
            statusView.text = req.status ?: "pending"
            statusView.setTextColor(
                when (req.status) {
                    "completed" -> Color.parseColor("#00B822")
                    "in_progress" -> Color.parseColor("#2196F3")
                    else -> Color.parseColor("#FF9800")
                }
            )
            maintenanceContainer.addView(row)
        }
    }
    //-----------code added for maintenance request end--------------
}