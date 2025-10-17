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
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import kotlin.collections.take
import android.util.Base64
import android.widget.ImageView

class Dashboard : AppCompatActivity() {

    //-----------code added for lease feature--------------
    private lateinit var tvLeaseStatus: TextView
    private lateinit var btnDownloadLease: TextView
    private var leaseBase64: String? = null
    private var leaseId: String? = null
    //-----------code added for lease feature ends--------------

    //-----------code added for maintenance request--------------
    private lateinit var maintenanceContainer: LinearLayout
    private lateinit var logRequestBtn: TextView

    //-----------code added for maintenance request ends--------------

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        //top of page navigation
        val backButton: ImageView = findViewById(R.id.backButton)
        val ellipsisButton: ImageView = findViewById(R.id.ellipsisButton)

        // Back button to navigate to HomePage
        backButton.setOnClickListener {
            val intent = Intent(this, HomePage::class.java)
            startActivity(intent)
        }

        // Ellipsis button to navigate to Settings
        ellipsisButton.setOnClickListener {
            val intent = Intent(this, Settings::class.java)
            startActivity(intent)
        }

        //-----------code added for lease feature--------------
        tvLeaseStatus = findViewById(R.id.tvLeaseStatus)
        btnDownloadLease = findViewById(R.id.tv_download_lease)

        lifecycleScope.launch {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val token = prefs.getString(MainActivity.TOKEN_KEY, null) ?: return@launch

            val resp = RetrofitClient.leaseApi.getLeases("Bearer $token")
            if (resp.isSuccessful) {
                val leases = resp.body()?.leases.orEmpty()
                if (leases.isNotEmpty()) {
                    val lease = leases.first()
                    leaseId = lease.id
                    leaseBase64 = lease.leaseDocument
                    bindLease(lease)
                }
            }
        }

        // Download button
        btnDownloadLease.setOnClickListener {
            leaseBase64?.let { base64 ->
                openLeasePdf(base64)
            } ?: Toast.makeText(this, "No lease document available", Toast.LENGTH_SHORT).show()
        }
        //-----------code added for lease feature ends--------------

        //-----------code added for maintenance request--------------
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

        val viewHistoryBtn = findViewById<TextView>(R.id.tv_request_history)
        viewHistoryBtn.setOnClickListener {
            startActivity(Intent(this, MaintainanceHistory::class.java))
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

    //-----------lease binding-----------
    private fun bindLease(lease: LeaseData) {
        tvLeaseStatus.text = lease.status?.replace("_", " ")?.replaceFirstChar { it.uppercase() }
    }

    private fun openLeasePdf(base64: String) {
        try {
            val base64Data = base64.substringAfter(",")
            val pdfBytes = Base64.decode(base64Data, Base64.DEFAULT)
            val file = File(cacheDir, "Lease_$leaseId.pdf")
            FileOutputStream(file).use { it.write(pdfBytes) }

            val uri = FileProvider.getUriForFile(this, "${packageName}.provider", file)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to open lease", Toast.LENGTH_SHORT).show()
        }
    }
    //-----------lease binding end-----------
}