package com.vcsd.nestify

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
import kotlinx.coroutines.launch

class ScreenSubmit : AppCompatActivity() {

    private val TAG = "ScreenSubmit"

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

        val tvTenantName = findViewById<TextView>(R.id.tvTenantName)
        val tvTenantPhone = findViewById<TextView>(R.id.tvTenantPhone)
        val tvTenantID = findViewById<TextView>(R.id.tvTenantID)
        val tvTenantAge = findViewById<TextView>(R.id.tvTenantAge)
        val tvJobTitle = findViewById<TextView>(R.id.tvJobTitle)
        val tvIncome = findViewById<TextView>(R.id.tvIncome)
        val tvIncomeSource = findViewById<TextView>(R.id.tvIncomeSource)
        val tvLeaseAgreed = findViewById<TextView>(R.id.tvLeaseAgreed)
        val tvDocuments = findViewById<TextView>(R.id.tvDocuments)

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

        tvTenantName.text = "$firstName $lastName"
        tvTenantPhone.text = phone ?: "N/A"
        tvTenantID.text = idNumber ?: "N/A"
        tvTenantAge.text = if (age != -1) age.toString() else "N/A"
        tvJobTitle.text = jobTitleStr ?: "N/A"
        tvIncome.text = "R%.2f".format(incomeVal)
        tvIncomeSource.text = incomeSourceStr ?: "N/A"
        tvLeaseAgreed.text = if (leaseAgreedVal) "Yes" else "No"
        tvDocuments.text = if (documentsList.isNotEmpty()) documentsList.joinToString(", ") else "None"

        Log.d(TAG, "Tenant Info: $firstName $lastName, Phone: $phone, ID: $idNumber, Age: $age")
        Log.d(TAG, "Employment: $jobTitleStr, Income: $incomeVal, Source: $incomeSourceStr")
        Log.d(TAG, "Lease: $leaseAgreedVal, Documents: ${documentsList.joinToString(", ")}")

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
}
