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
import androidx.appcompat.app.AppCompatActivity
import android.widget.*
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import android.util.Base64
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

class MaintainanceLog : AppCompatActivity() {

    private lateinit var issueSpinner: Spinner
    private lateinit var locationSpinner: Spinner
    private lateinit var urgencySpinner: Spinner
    private lateinit var descriptionEt: EditText
    private lateinit var submitBtn: TextView
    private lateinit var backArrow: ImageView
    private lateinit var imageContainer: LinearLayout
    private val base64Images = mutableListOf<String>()


    companion object {
        private const val IMAGE_PICK_CODE = 1001
        private const val TAG = "MaintainanceLog"
    }

    private val selectedImageUris = mutableListOf<Uri>()

    private val issueTypes = listOf("Plumbing", "Electrical", "Appliance", "Other")
    private val locations = listOf("Kitchen", "Bathroom", "Living Room", "Bedroom", "Other")
    private val urgencyOptions = listOf("low", "medium", "high")

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_maintainance_log)

        issueSpinner = findViewById(R.id.spinner_issue_type)
        locationSpinner = findViewById(R.id.spinner_location)
        urgencySpinner = findViewById(R.id.spinner_urgency)
        descriptionEt = findViewById(R.id.et_description)
        submitBtn = findViewById(R.id.tv_submit)
        backArrow = findViewById(R.id.back_arrow)
        imageContainer = findViewById(R.id.imageContainer)

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

        registerNetworkCallback()

        lifecycleScope.launch {
            syncMaintenanceRequests()
        }
    }

    private fun addImageToContainer(uri: Uri) {
        try {
            val options = BitmapFactory.Options().apply { inSampleSize = 2 } // scale down
            val bitmap = contentResolver.openInputStream(uri)?.use {
                BitmapFactory.decodeStream(it, null, options)
            }
            bitmap?.let {
                val imageView = ImageView(this)
                val params = LinearLayout.LayoutParams(200, 200)
                params.setMargins(12, 0, 12, 0)
                imageView.layoutParams = params
                imageView.scaleType = ImageView.ScaleType.CENTER_CROP
                imageView.setImageBitmap(it)
                imageContainer.addView(imageView)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to display image", e)
        }
    }


    private fun submitMaintenanceRequest() {
        val description = descriptionEt.text.toString().trim()
        val category = issueSpinner.selectedItem?.toString().orEmpty()
        val urgency = urgencySpinner.selectedItem?.toString().orEmpty()

        val db = AppDatabase.getDatabase(this)
        val dao = db.maintenanceRequestDao()

        val propertyId = intent.getStringExtra("propertyId")
        val rentalId = intent.getStringExtra("rentalId")

        Log.d(TAG, "Submitting with propertyId=$propertyId rentalId=$rentalId")

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
                            Log.e(TAG, "Error encoding image", e)
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

                val entity = MaintenanceRequestEntity(
                    propertyId = propertyId.toInt(),
                    rentalId = rentalId.toInt(),
                    description = description,
                    category = category,
                    urgency = urgency,
                    photos = base64Images,
                    synced = false
                )

                dao.insert(entity)

                if (isOnline()) {
                    val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
                    val token = prefs.getString(MainActivity.TOKEN_KEY, null)

                    if (!token.isNullOrBlank()) {
                        val resp = RetrofitClient.maintenanceApi.submitRequest("Bearer $token", request)
                        if (resp.isSuccessful) {
                            Toast.makeText(this@MaintainanceLog, "Request submitted successfully!", Toast.LENGTH_SHORT).show()
                            dao.update(entity.copy(synced = true))
                            finish()
                        } else {
                            Toast.makeText(this@MaintainanceLog, "Error: ${resp.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                } else {
                    Toast.makeText(this@MaintainanceLog, "Saved locally. Will sync when online.", Toast.LENGTH_SHORT).show()
                    Log.e(TAG, "Will sync when back online")
                    finish()
                }


//                val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
//                val token = prefs.getString(MainActivity.TOKEN_KEY, null)
//
//                if (!token.isNullOrBlank()) {
//                    val resp = RetrofitClient.maintenanceApi.submitRequest("Bearer $token", request)
//                    if (resp.isSuccessful) {
//                        Toast.makeText(this@MaintainanceLog, "Request submitted successfully!", Toast.LENGTH_SHORT).show()
//                        finish()
//                    } else {
//                        Toast.makeText(this@MaintainanceLog, "Error: ${resp.code()}", Toast.LENGTH_SHORT).show()
//                    }
//                }
            } catch (e: Exception) {
                Toast.makeText(this@MaintainanceLog, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private suspend fun syncMaintenanceRequests() {
        val db = AppDatabase.getDatabase(this)
        val dao = db.maintenanceRequestDao()
        val unsynced = dao.getUnsyncedRequests()
        val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
        val token = prefs.getString(MainActivity.TOKEN_KEY, null)

        unsynced.forEach { entity ->
            try {
                val request = MaintenanceRequest(
                    propertyId = entity.propertyId,
                    rentalId = entity.rentalId,
                    description = entity.description,
                    category = entity.category,
                    urgency = entity.urgency,
                    photos = entity.photos
                )

                if (!token.isNullOrBlank()) {
                    val resp = RetrofitClient.maintenanceApi.submitRequest("Bearer $token", request)
                    if (resp.isSuccessful) {
                        dao.update(entity.copy(synced = true))
                    }
                }
            } catch (e: Exception) {
                Log.e("Sync", "Failed to sync request", e)
            }
        }
    }

    private fun isOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val net = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(net) ?: return false
        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
    }

    private fun registerNetworkCallback() {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        cm.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: android.net.Network) {
                super.onAvailable(network)
                lifecycleScope.launch {
                    syncMaintenanceRequests()
                }
            }
        })
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == IMAGE_PICK_CODE && resultCode == RESULT_OK && data != null)
            data.clipData?.let { clipData ->
                for (i in 0 until clipData.itemCount) {
                    val uri = clipData.getItemAt(i).uri
                    selectedImageUris.add(uri)
                    addImageToContainer(uri)
                }
            } ?: data.data?.let { uri ->
                // Single image
                selectedImageUris.add(uri)
                addImageToContainer(uri)
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