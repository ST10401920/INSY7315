package com.vcsd.nestify

import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.Gravity
import android.widget.GridLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class PropertyDetails : AppCompatActivity() {

    private lateinit var propertyApi: PropertyApi

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_property_details)

        val propertyId = intent.getStringExtra("PROPERTY_ID")
        if (propertyId == null) {
            Toast.makeText(this, "Property not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        propertyApi = RetrofitClient.propertyApi

        fetchPropertyDetails(propertyId)

        val backButton = findViewById<ImageView>(R.id.back_arrow)

        backButton.setOnClickListener {
            val intent = Intent(this@PropertyDetails, HomePage::class.java)
            startActivity(intent)
            finish()
        }

        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottomNavigation)

        bottomNavigation.selectedItemId = R.id.navigation_home
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    bottomNavigation.itemBackground = Color.TRANSPARENT.toDrawable()
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

    private fun fetchPropertyDetails(propertyId: String) {
        val sharedPreferences = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
        val accessToken = sharedPreferences.getString("access_token", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = propertyApi.getPropertyById("Bearer $accessToken", propertyId)
                if (response.isSuccessful) {
                    val property = response.body()?.property
                    if (property != null) populatePropertyDetails(property)
                } else {
                    Log.e("PropertyDetails", "Failed: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("PropertyDetails", "Error: ${e.message}")
            }
        }
    }

    private fun populatePropertyDetails(property: Property) {
        val propertyImage = findViewById<ImageView>(R.id.propertyImage)
        val propertyTitle = findViewById<TextView>(R.id.propertyTitle)
        val rentText = findViewById<TextView>(R.id.rentText)
        val photoCount = findViewById<TextView>(R.id.photoCount)
        val facilitiesLayout = findViewById<GridLayout>(R.id.facilities)

        propertyTitle.text = property.name ?: "Unknown"
        rentText.text = "R ${property.price ?: 0} /month"

        val images = property.images ?: emptyList()
        if (images.isNotEmpty()) {
            setImageFromBase64(propertyImage, images[0])
            photoCount.text = "1 / ${images.size}"
        } else {
            propertyImage.setImageResource(R.drawable.placeholder)
            photoCount.text = "0 / 0"
        }

        facilitiesLayout.removeAllViews()

        // Add bedrooms first
        addFacility(facilitiesLayout, "bed", "${property.bedrooms ?: 0} Beds")

        // Add all amenities dynamically
        property.amenities?.forEach { amenity ->
            addFacility(facilitiesLayout, amenity.lowercase(), amenity.capitalize())
        }
    }


    private fun addFacility(grid: GridLayout, amenity: String, text: String) {
        val iconRes = when (amenity.lowercase()) {
            "bed", "beds" -> R.drawable.bed
            "wifi" -> R.drawable.wifi
            "pool" -> R.drawable.swimming
            "gym" -> R.drawable.weights
            else -> R.drawable.placeholder
        }

        val card = CardView(this).apply {
            layoutParams = GridLayout.LayoutParams().apply {
                width = 0
                height = 36.dp
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                setMargins(4.dp, 4.dp, 4.dp, 4.dp)
            }
            radius = 18.dp.toFloat()
            cardElevation = 1.dp.toFloat()
            setCardBackgroundColor(android.graphics.Color.WHITE)
        }

        val layout = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            gravity = Gravity.CENTER
            orientation = LinearLayout.HORIZONTAL
            setPadding(12.dp, 0, 12.dp, 0)
        }

        val imageView = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(20.dp, 20.dp)
            setImageResource(iconRes)
        }

        val textView = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { leftMargin = 4.dp }
            setTextColor(android.graphics.Color.parseColor("#666666"))
            textSize = 11f
            setTypeface(null, android.graphics.Typeface.BOLD)
            this.text = text
        }

        layout.addView(imageView)
        layout.addView(textView)
        card.addView(layout)
        grid.addView(card)
    }

    private fun setImageFromBase64(imageView: ImageView, rawBase64: String) {
        var cleanBase64 = rawBase64.replace("\\s".toRegex(), "")
        if (cleanBase64.startsWith("data:image")) {
            val commaIndex = cleanBase64.indexOf(",")
            if (commaIndex != -1) cleanBase64 = cleanBase64.substring(commaIndex + 1)
        }
        try {
            val decodedBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
            val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            imageView.setImageBitmap(bitmap)
        } catch (e: IllegalArgumentException) {
            Log.e("PropertyDetails", "Invalid Base64 image", e)
            imageView.setImageResource(R.drawable.placeholder)
        }
    }

    private val Int.dp: Int
        get() = (this * resources.displayMetrics.density).toInt()
}
