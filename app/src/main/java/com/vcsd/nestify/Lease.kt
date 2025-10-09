package com.vcsd.nestify
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import java.io.File
import java.io.FileOutputStream

class Lease : AppCompatActivity() {

    private lateinit var container: LinearLayout
    private lateinit var pickFileLauncher: ActivityResultLauncher<String>
    private lateinit var back: ImageView

    private var leaseId: String? = null
    private var leaseBase64: String? = null
    private var leaseStatus: String? = null
    private var propertyImageUrl: String? = null
    private var applicationId: Int = -1
    private var propertyName: String = "Property"


    companion object {
        private const val TAG = "LeaseActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lease)

        container = findViewById(R.id.lease_container)

        applicationId = intent.getIntExtra("APPLICATION_ID", -1)
        leaseStatus = intent.getStringExtra("LEASE_STATUS")?.lowercase()
        propertyImageUrl = intent.getStringExtra("PROPERTY_IMAGE_URL")
        propertyName = intent.getStringExtra("PROPERTY_NAME") ?: "Property"

        // ⚡ Register the ActivityResultLauncher once here (before STARTED)
        pickFileLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            uri?.let { fileUri ->
                leaseId?.let { id ->
                    uploadSignedLease(id, fileUri, propertyName)
                }
            }
        }

        back = findViewById(R.id.back_arrow)
        back.setOnClickListener {
            val intent = Intent(this, ApplicationHistory::class.java)
            startActivity(intent)
            finish()
        }

        if (applicationId != -1) {
            fetchLease(applicationId)
        } else {
            Toast.makeText(this, "Invalid application", Toast.LENGTH_SHORT).show()
        }
    }

    private fun fetchLease(appId: Int) {
        val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
            .getString("access_token", null) ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.leaseApi.getLeases("Bearer $token")

                if (response.isSuccessful) {
                    val lease = response.body()?.leases?.find { it.applicationId == appId }

                    leaseId = lease?.id
                    leaseBase64 = lease?.leaseDocument
                    leaseStatus = lease?.status?.lowercase() ?: "unknown"

                    withContext(Dispatchers.Main) {
                        displayLease()
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@Lease, "Failed to fetch lease", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error fetching lease", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@Lease, "Error fetching lease", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun displayLease() {
        container.removeAllViews()
        val leaseView = layoutInflater.inflate(R.layout.lease_card, container, false)

        val tvProperty = leaseView.findViewById<TextView>(R.id.tv_lease_property)
        val tvStatus = leaseView.findViewById<TextView>(R.id.tv_lease_status)
        val ivProperty = leaseView.findViewById<ImageView>(R.id.iv_lease_preview)
        val btnView = leaseView.findViewById<TextView>(R.id.btn_view_lease)
        val btnDownload = leaseView.findViewById<TextView>(R.id.btn_download_lease)
        val btnUpload = leaseView.findViewById<TextView>(R.id.btn_upload_signed)

        tvProperty.text = propertyName
        tvStatus.text = "Status: ${leaseStatus?.replaceFirstChar { it.uppercase() }}"

        // Load property image
        propertyImageUrl?.let { urlOrBase64 ->
            if (urlOrBase64.startsWith("data:image")) {
                loadBase64Image(urlOrBase64, ivProperty)
            } else {
                Glide.with(this)
                    .load(urlOrBase64)
                    .placeholder(R.drawable.placeholder)
                    .error(R.drawable.placeholder)
                    .into(ivProperty)
            }
        } ?: ivProperty.setImageResource(R.drawable.placeholder)

        // Open/download lease PDF
        btnView.setOnClickListener { openLeasePdf() }
        btnDownload.setOnClickListener { openLeasePdf() }

        // Upload signed lease
        btnUpload.setOnClickListener {
            if (leaseStatus == "sent_to_tenant" || leaseStatus == "approved") {
                pickFileLauncher.launch("application/pdf")
            } else {
                Toast.makeText(this, "Cannot upload lease until sent/approved", Toast.LENGTH_SHORT).show()
            }
        }

        container.addView(leaseView)
    }

    private fun openLeasePdf() {
        leaseBase64?.let { base64 ->
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
                Log.e(TAG, "Failed to open lease PDF", e)
                Toast.makeText(this, "Failed to open lease document", Toast.LENGTH_SHORT).show()
            }
        } ?: Toast.makeText(this, "No lease document available", Toast.LENGTH_SHORT).show()
    }

    private fun uploadSignedLease(leaseId: String, fileUri: Uri, propertyName: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val inputStream = contentResolver.openInputStream(fileUri)
                val bytes = inputStream?.readBytes()
                inputStream?.close()

                if (bytes == null) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@Lease, "Failed to read file", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val base64 = "data:application/pdf;base64," +
                        Base64.encodeToString(bytes, Base64.NO_WRAP)

                val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
                    .getString("access_token", null) ?: return@launch

                val response = RetrofitClient.leaseApi.uploadSignedLease(
                    "Bearer $token",
                    leaseId,
                    mapOf(
                        "signed_document" to base64,
                        "action" to "signed_by_tenant"
                    )
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@Lease, "Lease uploaded successfully!", Toast.LENGTH_SHORT).show()
                        leaseStatus = "signed_by_tenant"
                        displayLease()
                    } else {
                        Toast.makeText(this@Lease, "Failed to upload lease", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error uploading lease", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@Lease, "Error uploading lease", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun loadBase64Image(base64String: String, imageView: ImageView) {
        try {
            val base64Data = base64String.substringAfter(",")
            val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            imageView.setImageBitmap(bitmap)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode property image", e)
            imageView.setImageResource(R.drawable.placeholder)
        }
    }
}

