package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.widget.*
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.ByteArrayOutputStream
import android.util.Base64

class MaintainanceLog : AppCompatActivity() {

    private lateinit var issueSpinner: Spinner
    private lateinit var locationSpinner: Spinner
    private lateinit var urgencySpinner: Spinner
    private lateinit var descriptionEt: EditText
    private lateinit var submitBtn: TextView
    private lateinit var backArrow: ImageView
    private val base64Images = mutableListOf<String>()

    companion object {
        private const val IMAGE_PICK_CODE = 1001
    }

    private val selectedImageUris = mutableListOf<Uri>()

    private val issueTypes = listOf("Plumbing", "Electrical", "Appliance", "Other")
    private val locations = listOf("Kitchen", "Bathroom", "Living Room", "Bedroom", "Other")
    private val urgencyOptions = listOf("low", "medium", "high")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_maintainance_log)

        issueSpinner = findViewById(R.id.spinner_issue_type)
        locationSpinner = findViewById(R.id.spinner_location)
        urgencySpinner = findViewById(R.id.spinner_urgency)
        descriptionEt = findViewById(R.id.et_description)
        submitBtn = findViewById(R.id.tv_submit)
        backArrow = findViewById(R.id.back_arrow)

        // spinners
        issueSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, issueTypes)
        locationSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, locations)
        urgencySpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, urgencyOptions)

        backArrow.setOnClickListener { finish() }

        submitBtn.setOnClickListener { submitMaintenanceRequest() }

        // images
        findViewById<LinearLayout>(R.id.add_image_button).setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true) // allow multiple
            }
            startActivityForResult(Intent.createChooser(intent, "Select Images"), IMAGE_PICK_CODE)
        }
    }

    private fun submitMaintenanceRequest() {
        val description = descriptionEt.text.toString().trim()
        val category = issueSpinner.selectedItem?.toString().orEmpty()
        val urgency = urgencySpinner.selectedItem?.toString().orEmpty()

        val propertyId = intent.getStringExtra("propertyId")
        val rentalId = intent.getStringExtra("rentalId")

        Log.d("MaintainanceLog", "Submitting with propertyId=$propertyId rentalId=$rentalId")

        if (propertyId.isNullOrBlank() || rentalId.isNullOrBlank()) {
            Toast.makeText(this, "Missing property or rental ID", Toast.LENGTH_LONG).show()
            return
        }
        if (description.isBlank()) {
            Toast.makeText(this, "Please enter a description", Toast.LENGTH_SHORT).show()
            return
        }

        val request = MaintenanceRequest(
            propertyId = propertyId.toInt(),
            rentalId = rentalId.toInt(),
            description = description,
            category = category,
            urgency = urgency,
            photos = base64Images
        )

        lifecycleScope.launch {
            try {
                // Convert images
                val base64Images = withContext(Dispatchers.IO) {
                    selectedImageUris.mapNotNull { uri ->
                        try {
                            contentResolver.openInputStream(uri)?.use { inputStream ->
                                val options = BitmapFactory.Options().apply { inPreferredConfig = Bitmap.Config.ARGB_8888 }
                                BitmapFactory.decodeStream(inputStream, null, options)?.let { bitmap ->
                                    val baos = ByteArrayOutputStream()
                                    bitmap.compress(Bitmap.CompressFormat.JPEG, 80, baos)
                                    val byteArray = baos.toByteArray()
                                    Base64.encodeToString(byteArray, Base64.NO_WRAP)
                                }
                            }
                        } catch (e: Exception) {
                            Log.e("MaintainanceLog", "Error encoding image", e)
                            null
                        }
                    }
                }

                val request = MaintenanceRequest(
                    propertyId = propertyId?.toInt() ?: 0,
                    rentalId = rentalId?.toInt() ?: 0,
                    description = description,
                    category = category,
                    urgency = urgency,
                    photos = base64Images
                )

                val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
                val token = prefs.getString(MainActivity.TOKEN_KEY, null)

                if (!token.isNullOrBlank()) {
                    val resp = RetrofitClient.maintenanceApi.submitRequest("Bearer $token", request)
                    if (resp.isSuccessful) {
                        Toast.makeText(this@MaintainanceLog, "Request submitted successfully!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@MaintainanceLog, "Error: ${resp.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@MaintainanceLog, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}

//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        enableEdgeToEdge()
//        setContentView(R.layout.activity_maintainance_log)
//        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
//            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
//            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
//            insets
//        }
//    }