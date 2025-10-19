package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.json.JSONObject

class ScreenSubmit : AppCompatActivity() {

    private val TAG = "ScreenSubmit"

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_screen_submit)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val backArrow = findViewById<ImageView>(R.id.back_arrow)
        val btnSubmit = findViewById<TextView>(R.id.btn_submit)

        val propertyId = intent.getStringExtra("PROPERTY_ID")
        val firstName = intent.getStringExtra("FIRST_NAME")
        val lastName = intent.getStringExtra("LAST_NAME")
        val phone = intent.getStringExtra("PHONE_NUMBER")
        val idNumber = intent.getStringExtra("ID_NUMBER")
        val age = intent.getIntExtra("AGE", -1)
        val jobTitleStr = intent.getStringExtra("JOB_TITLE")
        val incomeVal = intent.getDoubleExtra("INCOME", 0.0)
        val incomeSourceStr = intent.getStringExtra("INCOME_SOURCE")
        val leaseAgreedVal = intent.getBooleanExtra("LEASE_AGREED", false)
        val documentsList = intent.getStringArrayListExtra("DOCUMENTS") ?: emptyList()
        val documentNames = intent.getStringArrayListExtra("DOCUMENT_NAMES") ?: emptyList()

        // Set tenant info
        findViewById<TextView>(R.id.tvTenantName).text = "$firstName $lastName"
        findViewById<TextView>(R.id.tvTenantPhone).text = phone ?: "N/A"
        findViewById<TextView>(R.id.tvTenantID).text = idNumber ?: "N/A"
        findViewById<TextView>(R.id.tvTenantAge).text = if (age != -1) age.toString() else "N/A"
        findViewById<TextView>(R.id.tvJobTitle).text = jobTitleStr ?: "N/A"
        findViewById<TextView>(R.id.tvIncome).text = "R%.2f".format(incomeVal)
        findViewById<TextView>(R.id.tvIncomeSource).text = incomeSourceStr ?: "N/A"
        findViewById<TextView>(R.id.tvLeaseAgreed).text = if (leaseAgreedVal) "Yes" else "No"
        findViewById<TextView>(R.id.tvDocuments).text = if (documentNames.isNotEmpty()) documentNames.joinToString(", ") else "None"

        // Navigation
        backArrow.setOnClickListener { onBackPressedDispatcher.onBackPressed() }

        // Submit application
        btnSubmit.setOnClickListener {
            val request = ApplicationRequest(
                propertyId = propertyId ?: "",
                first_name = firstName ?: "",
                last_name = lastName ?: "",
                phone_number = phone ?: "",
                id_number = idNumber ?: "",
                age = age,
                job_title = jobTitleStr ?: "",
                income = incomeVal,
                income_source = incomeSourceStr ?: "",
                lease_agreed = leaseAgreedVal,
                documents = documentsList,
                notes = ""
            )

            val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
                .getString("access_token", null)

            if (token == null) {
                Toast.makeText(this, "Authentication required", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val response = RetrofitClient.applicationApi.submitApplication(
                        token = "Bearer $token",
                        request = request
                    )

                    if (response.isSuccessful) {
                        Toast.makeText(this@ScreenSubmit, "Application submitted", Toast.LENGTH_LONG).show()

                        // Send FCM notification asynchronously in GlobalScope
                        GlobalScope.launch {
                            sendTopicNotification()
                        }

                        // Move to PaymentSuccess
                        val intent = Intent(this@ScreenSubmit, PaymentSuccess::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Toast.makeText(this@ScreenSubmit, "Error: $errorBody", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@ScreenSubmit, "Network error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private suspend fun sendTopicNotification() {
        try {
            val fcmMessage = FcmApi.FcmMessage(
                to = "/topics/rent_notifications",
                notification = FcmApi.NotificationData(
                    title = "Application Received!",
                    body = "You successfully booked a property. We’ll review your application shortly."
                )
            )

            val fcmResponse = RetrofitClient.notificationApi.sendNotification(fcmMessage)
            if (fcmResponse.isSuccessful) {
                Log.d(TAG, "FCM topic notification sent successfully")
            } else {
                Log.e(TAG, "FCM failed: ${fcmResponse.errorBody()?.string()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error sending FCM notification: ${e.localizedMessage}")
        }
    }
}
