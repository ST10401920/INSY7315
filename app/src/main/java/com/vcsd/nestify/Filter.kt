package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class Filter : AppCompatActivity() {

    private lateinit var priceSeekBar: SeekBar
    private lateinit var tvSelectedPrice: TextView
    private lateinit var btnApply: Button
    private lateinit var btnReset: TextView
    private lateinit var backButton: ImageView

    private lateinit var tvGym: TextView
    private lateinit var tvPool: TextView
    private lateinit var tvWifi: TextView
    private lateinit var tvBedroom1: TextView
    private lateinit var tvBedroom2: TextView
    private lateinit var tvBedroom3: TextView
    private lateinit var tvBedroom4: TextView
    private lateinit var tvBedroom5: TextView

    private var selectedAmenities = mutableListOf<String>()
    private var selectedBedrooms: Int? = null
    private var selectedPrice: Int? = null

    private val priceRanges = listOf(5000, 6000, 7000, 8000, 9000, 10000)

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_filter)

        priceSeekBar = findViewById(R.id.sb_price_range)
        tvSelectedPrice = findViewById(R.id.tv_selected_price)
        btnApply = findViewById(R.id.btn_apply)
        btnReset = findViewById(R.id.tv_reset_filter)
        backButton = findViewById(R.id.tv_back)

        tvBedroom1 = findViewById(R.id.tv_bedroom_1)
        tvBedroom2 = findViewById(R.id.tv_bedroom_2)
        tvBedroom3 = findViewById(R.id.tv_bedroom_3)
        tvBedroom4 = findViewById(R.id.tv_bedroom_4)
        tvBedroom5 = findViewById(R.id.tv_bedroom_5)

        tvGym = findViewById(R.id.tv_category_gym)
        tvPool = findViewById(R.id.tv_category_pool)
        tvWifi = findViewById(R.id.tv_category_wifi)

        setupBedroomToggle(tvBedroom1, 1)
        setupBedroomToggle(tvBedroom2, 2)
        setupBedroomToggle(tvBedroom3, 3)
        setupBedroomToggle(tvBedroom4, 4)
        setupBedroomToggle(tvBedroom5, 5)

        setupAmenityToggle(tvGym, "Gym")
        setupAmenityToggle(tvPool, "Pool")
        setupAmenityToggle(tvWifi, "WiFi")

        backButton.setOnClickListener { finish() }

        priceSeekBar.max = priceRanges.size - 1
        tvSelectedPrice.text = "Any"
        priceSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                selectedPrice = priceRanges.getOrNull(progress)
                tvSelectedPrice.text = selectedPrice?.let { "R$it" } ?: "Any"
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        btnReset.setOnClickListener {
            selectedPrice = null
            selectedBedrooms = null
            selectedAmenities.clear()
            priceSeekBar.progress = 0
            tvSelectedPrice.text = "Any"

            listOf(tvBedroom1, tvBedroom2, tvBedroom3, tvBedroom4, tvBedroom5).forEach { resetView(it) }
            listOf(tvGym, tvPool, tvWifi).forEach { resetView(it) }

            val resetFilter = PropertyFilter(
                selectedPrice = null,
                bedrooms = null,
                amenities = null
            )
            val resultIntent = Intent()
            Toast.makeText(this, "Filter has been reset", Toast.LENGTH_LONG).show()
            resultIntent.putExtra("FILTER_DATA", resetFilter)
            setResult(RESULT_OK, resultIntent)
            finish()
        }

        btnApply.setOnClickListener {
            val filter = PropertyFilter(
                selectedPrice = selectedPrice,
                bedrooms = selectedBedrooms,
                amenities = if (selectedAmenities.isNotEmpty()) selectedAmenities.toList() else null
            )
            val resultIntent = Intent()
            resultIntent.putExtra("FILTER_DATA", filter)
            setResult(RESULT_OK, resultIntent)
            finish()
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    private fun setupBedroomToggle(view: TextView, value: Int) {
        view.setOnClickListener {
            if (selectedBedrooms == value) {
                selectedBedrooms = null
                resetView(view)
            } else {
                listOf(tvBedroom1, tvBedroom2, tvBedroom3, tvBedroom4, tvBedroom5).forEach { resetView(it) }
                selectedBedrooms = value
                selectView(view)
            }
        }
    }

    private fun setupAmenityToggle(view: TextView, amenity: String) {
        view.setOnClickListener {
            if (selectedAmenities.contains(amenity)) {
                selectedAmenities.remove(amenity)
                resetView(view)
            } else {
                selectedAmenities.add(amenity)
                selectView(view)
            }
        }
    }

    private fun selectView(view: TextView) {
        view.setBackgroundResource(R.drawable.selected_bg)
        view.setTextColor(resources.getColor(android.R.color.white, null))
    }

    private fun resetView(view: TextView) {
        view.setBackgroundResource(R.drawable.unselected_bg)
        view.setTextColor(resources.getColor(android.R.color.black, null))
    }
}
