package com.vcsd.nestify

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

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
    private lateinit var btnSubmitApplication: TextView
    private lateinit var btnUploadDocs: TextView
    private lateinit var tvUploadedDocs: TextView

    private var uploadedDocs: MutableList<String> = mutableListOf()
    private var uploadedDocNames: MutableList<String> = mutableListOf() // file names

    private var propertyId: String? = null

    private val pickFileLauncher = registerForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            val fileName = getFileNameFromUri(it)
            val base64Data = encodeFileToBase64(it)

            if (base64Data != null) {
                uploadedDocs.add(base64Data)
                uploadedDocNames.add(fileName)
                tvUploadedDocs.text = "Uploaded: ${uploadedDocNames.joinToString(", ")}"
                Toast.makeText(this, "$fileName uploaded successfully!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Failed to encode file", Toast.LENGTH_SHORT).show()
            }
        }
    }

    companion object {
        private val TAG = "ApplicationForm"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_application_form)

        // Adjust insets
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Bind views
        etFirstName = findViewById(R.id.et_first_name)
        etLastName = findViewById(R.id.et_last_name)
        etPhoneNumber = findViewById(R.id.et_phone_number)
        etIdNumber = findViewById(R.id.et_id_number)
        etAge = findViewById(R.id.et_age)
        etJobTitle = findViewById(R.id.et_job_title)
        etIncome = findViewById(R.id.et_income)
        spinnerIncomeSource = findViewById(R.id.spinner_income_source)
        cbAgreeLease = findViewById(R.id.cb_agree_lease)
        btnSubmitApplication = findViewById(R.id.btn_submit_application)
        btnUploadDocs = findViewById(R.id.btn_upload_docs)
        tvUploadedDocs = findViewById(R.id.tv_uploaded_docs)

        // Get propertyId from previous screen
        propertyId = intent.getStringExtra("PROPERTY_ID")

        // Income source options
        val incomeSources = arrayOf("Salary", "Self-Employed", "Student", "Freelance", "Other")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, incomeSources)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerIncomeSource.adapter = adapter


        // Upload button (placeholder)
        btnUploadDocs.setOnClickListener {
            pickFileLauncher.launch("application/pdf")
        }

        // Submit button navigates to ScreenSubmit instead of sending API request
        btnSubmitApplication.setOnClickListener {
            if (validateInputs()) {
                val intent = Intent(this, ScreenSubmit::class.java)
                intent.putExtra("PROPERTY_ID", propertyId)
                intent.putExtra("FIRST_NAME", etFirstName.text.toString())
                intent.putExtra("LAST_NAME", etLastName.text.toString())
                intent.putExtra("PHONE_NUMBER", etPhoneNumber.text.toString())
                intent.putExtra("ID_NUMBER", etIdNumber.text.toString())
                intent.putExtra("AGE", etAge.text.toString().toInt())
                intent.putExtra("JOB_TITLE", etJobTitle.text.toString())
                intent.putExtra("INCOME", etIncome.text.toString().toDoubleOrNull() ?: 0.0)
                intent.putExtra("INCOME_SOURCE", spinnerIncomeSource.selectedItem.toString())
                intent.putExtra("LEASE_AGREED", cbAgreeLease.isChecked)
                intent.putStringArrayListExtra("DOCUMENTS", ArrayList(uploadedDocs))
                intent.putStringArrayListExtra("DOCUMENT_NAMES", ArrayList(uploadedDocNames))
                startActivity(intent)
            }
        }
    }

    private fun getFileNameFromUri(uri: android.net.Uri): String {
        var name = "unknown"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) {
                name = cursor.getString(nameIndex)
            }
        }
        return name
    }

    private fun encodeFileToBase64(uri: android.net.Uri): String? {
        return try {
            val inputStream = contentResolver.openInputStream(uri)
            val bytes = inputStream?.readBytes()
            inputStream?.close()
            android.util.Base64.encodeToString(bytes, android.util.Base64.DEFAULT)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }


    private fun validateInputs(): Boolean {
        if (etFirstName.text.isNullOrBlank()) {
            etFirstName.error = "First name required"
            return false
        }
        if (etLastName.text.isNullOrBlank()) {
            etLastName.error = "Last name required"
            return false
        }
        if (etPhoneNumber.text.isNullOrBlank()) {
            etPhoneNumber.error = "Phone number required"
            return false
        }
        if (etIdNumber.text.isNullOrBlank()) {
            etIdNumber.error = "ID number required"
            return false
        }
        if (etAge.text.isNullOrBlank()) {
            etAge.error = "Age required"
            return false
        }
        if (etJobTitle.text.isNullOrBlank()) {
            etJobTitle.error = "Job title required"
            return false
        }
        if (etIncome.text.isNullOrBlank()) {
            etIncome.error = "Income required"
            return false
        }
        if (!cbAgreeLease.isChecked) {
            Toast.makeText(this, "You must agree to the lease terms", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }
}
