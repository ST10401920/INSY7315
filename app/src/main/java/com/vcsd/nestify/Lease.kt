package com.vcsd.nestify

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide

class Lease : AppCompatActivity() {

    private lateinit var container: LinearLayout
    private lateinit var pickFileLauncher: ActivityResultLauncher<String>
    private var leaseId: String? = null
    private var leaseUrl: String? = null
    private var leaseStatus: String? = null
    private var propertyImageUrl: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lease)

        container = findViewById(R.id.lease_container)

        // Get data from ApplicationHistory
        leaseUrl = intent.getStringExtra("LEASE_URL")
        leaseId = intent.getStringExtra("LEASE_ID")
        val propertyName = intent.getStringExtra("PROPERTY_NAME") ?: "Property"
        leaseStatus = intent.getStringExtra("LEASE_STATUS")?.lowercase()
        propertyImageUrl = intent.getStringExtra("PROPERTY_IMAGE_URL")

        pickFileLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            uri?.let { leaseId?.let { id -> uploadSignedLease(id, it) } }
        }

        displayLease(propertyName)
    }

    private fun displayLease(propertyName: String) {
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

        // Load property image using Glide
        Glide.with(this)
            .load(propertyImageUrl)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.placeholder)
            .into(ivProperty)

        btnView.setOnClickListener {
            leaseUrl?.let { url -> startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
                ?: Toast.makeText(this, "No lease document available", Toast.LENGTH_SHORT).show()
        }

        btnDownload.setOnClickListener {
            leaseUrl?.let { url -> startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
                ?: Toast.makeText(this, "No lease document available", Toast.LENGTH_SHORT).show()
        }

        btnUpload.setOnClickListener {
            if (leaseStatus == "approved") {
                pickFileLauncher.launch("application/pdf")
            } else {
                Toast.makeText(this, "Cannot upload lease until approved", Toast.LENGTH_SHORT).show()
            }
        }

        container.addView(leaseView)
    }

    private fun uploadSignedLease(leaseId: String, fileUri: Uri) {
        Toast.makeText(this, "Uploading signed lease for $leaseId: $fileUri", Toast.LENGTH_SHORT).show()
    }
}
