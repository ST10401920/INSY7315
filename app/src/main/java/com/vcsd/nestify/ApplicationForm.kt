package com.vcsd.nestify

import android.os.Bundle
import android.widget.*
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.bumptech.glide.load.HttpException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ApplicationForm : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etPhoneNumber: EditText
    private lateinit var etIdNumber: EditText
    private lateinit var etAge: EditText
    private lateinit var etJobTitle: EditText
    private lateinit var etIncome: EditText
    private lateinit var spinnerIncomeSource: Spinner
    private lateinit var cbAgreeLease: CheckBox
    private lateinit var btnUploadDocs: TextView
    private lateinit var btnSubmitApplication: TextView

    private var uploadedDocs: List<String> = listOf()

    // Use the correct API interface
    private val applicationAPI = RetrofitClient.applicationApi

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_application_form)

        // Adjust for system bars
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        initViews()
        setupIncomeSpinner()
        setupListeners()
    }

    private fun initViews() {
        etFirstName = findViewById(R.id.et_first_name)
        etLastName = findViewById(R.id.et_last_name)
        etPhoneNumber = findViewById(R.id.et_phone_number)
        etIdNumber = findViewById(R.id.et_id_number)
        etAge = findViewById(R.id.et_age)
        etJobTitle = findViewById(R.id.et_job_title)
        etIncome = findViewById(R.id.et_income)
        spinnerIncomeSource = findViewById(R.id.spinner_income_source)
        cbAgreeLease = findViewById(R.id.cb_agree_lease)
        btnUploadDocs = findViewById(R.id.btn_upload_docs)
        btnSubmitApplication = findViewById(R.id.btn_submit_application)
    }

    private fun setupIncomeSpinner() {
        val sources = listOf("Salary", "Business", "Freelance", "Other")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, sources)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerIncomeSource.adapter = adapter
    }

    private fun setupListeners() {
        btnUploadDocs.setOnClickListener {
            // TODO: implement document upload logic
            uploadedDocs = listOf("doc1.pdf", "doc2.pdf") // example
            Toast.makeText(this, "Documents uploaded", Toast.LENGTH_SHORT).show()
        }

        btnSubmitApplication.setOnClickListener {
            if (validateInputs()) {
                submitApplication()
            }
        }
    }

    private fun validateInputs(): Boolean {
        if (etFirstName.text.isBlank() ||
            etLastName.text.isBlank() ||
            etPhoneNumber.text.isBlank() ||
            etIdNumber.text.isBlank() ||
            etAge.text.isBlank()
        ) {
            Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show()
            return false
        }

        if (!cbAgreeLease.isChecked) {
            Toast.makeText(this, "You must agree to the lease terms", Toast.LENGTH_SHORT).show()
            return false
        }

        return true
    }

    private fun submitApplication() {
        val request = ApplicationRequest(
            propertyId = "123", // TODO: Replace with actual propertyId
            first_name = etFirstName.text.toString(),
            last_name = etLastName.text.toString(),
            phone_number = etPhoneNumber.text.toString(),
            id_number = etIdNumber.text.toString(),
            age = etAge.text.toString().toInt(),
            job_title = etJobTitle.text.toString(),
            income = etIncome.text.toString().toDoubleOrNull() ?: 0.0,
            income_source = spinnerIncomeSource.selectedItem.toString(),
            lease_agreed = cbAgreeLease.isChecked,
            documents = uploadedDocs,
            notes = ""
        )

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = applicationAPI.submitApplication(
                    token = "Bearer YOUR_AUTH_TOKEN", // TODO: pass actual token
                    request = request
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@ApplicationForm,
                            "Application submitted successfully",
                            Toast.LENGTH_LONG
                        ).show()
                        finish()
                    } else {
                        Toast.makeText(
                            this@ApplicationForm,
                            "Error: ${response.errorBody()?.string()}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: HttpException) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@ApplicationForm,
                        "Network error: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@ApplicationForm,
                        "Unexpected error: ${e.localizedMessage}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
}
