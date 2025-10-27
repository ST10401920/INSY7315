package com.vcsd.nestify

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.SearchView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HomePage : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var propertyAdapter: PropertyAdapter
    private lateinit var propertyApi: PropertyApi
    private lateinit var noAuthApi: NoAuthPropertyApi

    private lateinit var searchView: SearchView
    private lateinit var filterButton: ImageView
    private lateinit var noResultsText: TextView
    private var currentFilter: PropertyFilter? = null

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_home_page)

        searchView = findViewById(R.id.searchView)
        filterButton = findViewById(R.id.filter_button)
        noResultsText = findViewById(R.id.tv_no_results)

        propertyApi = RetrofitClient.propertyApi
        noAuthApi = RetrofitClient.noAuthPropertyApi
        fetchProperties()

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

        val menu = findViewById<ImageView>(R.id.menu)
        menu.setOnClickListener {
            val intent = Intent(this, Settings::class.java)
            startActivity(intent)
            finish()
        }

        recyclerView = findViewById(R.id.rv_properties)
        recyclerView.layoutManager = LinearLayoutManager(this)

        // Search filtering
//        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
//            override fun onQueryTextChange(newText: String?): Boolean {
//                propertyAdapter.filterAndSearch(
//                    searchText = newText,
//                    maxPrice = currentFilter?.maxPrice,
//                    bedrooms = currentFilter?.bedrooms,
//                    amenitiesFilter = amenitiesToList(currentFilter?.amenities)
//                )
//                return true
//            }
//
//            override fun onQueryTextSubmit(query: String?): Boolean {
//                propertyAdapter.filterAndSearch(
//                    searchText = query,
//                    maxPrice = currentFilter?.maxPrice,
//                    bedrooms = currentFilter?.bedrooms,
//                    amenitiesFilter = amenitiesToList(currentFilter?.amenities)
//                )
//                return true
//            }
//        })

        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextChange(newText: String?): Boolean {
                if (::propertyAdapter.isInitialized) {
                    propertyAdapter.filterAndSearch(
                        searchText = newText,
                        selectedPrice = currentFilter?.selectedPrice,
                        bedrooms = currentFilter?.bedrooms,
                        amenitiesFilter = amenitiesToList(currentFilter?.amenities)
                    )
                }
                return true
            }

            override fun onQueryTextSubmit(query: String?): Boolean {
                if (::propertyAdapter.isInitialized) {
                    propertyAdapter.filterAndSearch(
                        searchText = query,
                        selectedPrice = currentFilter?.selectedPrice,
                        bedrooms = currentFilter?.bedrooms,
                        amenitiesFilter = amenitiesToList(currentFilter?.amenities)
                    )
                }
                return true
            }
        })


        // Open filter screen
        filterButton.setOnClickListener {
            val intent = Intent(this, Filter::class.java)
            intent.putExtra("FILTER_DATA", currentFilter)
            startActivityForResult(intent, 1001)
        }

        // Insets handling
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    private fun fetchProperties() {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = RetrofitClient.noAuthPropertyApi.getProperties()
                if (response.isSuccessful) {
                    val properties = response.body()?.properties?.toMutableList() ?: mutableListOf()
                    setupRecyclerView(properties)
                    Log.d("Home", "Successfully fetched ${properties.size} properties.")
                } else {
                    Log.e("Home", "Failed to fetch properties: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("Home", "API call failed: ${e.message}")
            }
        }
    }

    private fun setupRecyclerView(properties: MutableList<Property>) {
        propertyAdapter = PropertyAdapter(
            properties,
            onItemClickListener = { propertyId ->
                val intent = Intent(this@HomePage, PropertyDetails::class.java)
                intent.putExtra("PROPERTY_ID", propertyId)
                startActivity(intent)
            }
        )

        recyclerView.adapter = propertyAdapter
    }

    private fun amenitiesToList(amenities: List<String>?): List<String> {
        return amenities ?: emptyList()
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 1001 && resultCode == Activity.RESULT_OK) {
            val filter = data?.getSerializableExtra("FILTER_DATA") as? PropertyFilter
            currentFilter = filter

            propertyAdapter.filterAndSearch(
                searchText = searchView.query.toString(),
                selectedPrice = currentFilter?.selectedPrice,
                bedrooms = currentFilter?.bedrooms,
                amenitiesFilter = amenitiesToList(currentFilter?.amenities)
            )
        }
    }

}
