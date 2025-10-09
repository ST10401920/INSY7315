package com.vcsd.nestify

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.bumptech.glide.Glide
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.firebase.auth.FirebaseAuth
//import com.google.firebase.Firebase
//import com.google.firebase.auth.FirebaseAuth
//import com.google.firebase.messaging.messaging
import java.util.*

class Settings : AppCompatActivity() {

    private lateinit var profileNameTextView: TextView
    private lateinit var profileImageView: ImageView
    private lateinit var pushSwitch: Switch
    private lateinit var sharedPrefs: SharedPreferences
    private lateinit var languageSpinner: Spinner

    private val imagePicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            try {
                contentResolver.takePersistableUriPermission(it, Intent.FLAG_GRANT_READ_URI_PERMISSION)
                profileImageView.setImageURI(it)
                sharedPrefs.edit().putString("profile_image_uri", it.toString()).apply()
                Toast.makeText(this, "Profile picture updated", Toast.LENGTH_SHORT).show()
            } catch (e: SecurityException) {
                e.printStackTrace()
                Toast.makeText(this, "Failed to set image: permission issue", Toast.LENGTH_SHORT).show()
            }
        }
    }

//    private val requestPermissionLauncher = registerForActivityResult(
//        ActivityResultContracts.RequestPermission()
//    ) { isGranted: Boolean ->
//        if (isGranted) {
//            Firebase.messaging.isAutoInitEnabled = true
//            sharedPrefs.edit().putBoolean("push_enabled", true).apply()
//            pushSwitch.isChecked = true
//            Toast.makeText(this, "Push notifications enabled", Toast.LENGTH_SHORT).show()
//        } else {
//            pushSwitch.isChecked = false
//            Toast.makeText(this, "Push notifications denied", Toast.LENGTH_SHORT).show()
//        }
//    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        sharedPrefs = getSharedPreferences("user_prefs", MODE_PRIVATE)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupBottomNavigation()
        setupProfile()
        //setupPushNotifications()
        setupLanguageSpinner()
        setupInfoRows()
        setupSignOut()
        setUpHistory()

        //----------code added for maintenance request--------------
        val maintenanceRow = findViewById<LinearLayout>(R.id.maintaince)
        maintenanceRow.setOnClickListener {
            val prefs = getSharedPreferences(MainActivity.PREFS_KEY, Context.MODE_PRIVATE)
            val propertyId = prefs.getString("property_id", null)
            val rentalId = prefs.getString("rental_id", null)

            if (!propertyId.isNullOrBlank() && !rentalId.isNullOrBlank()) {
                val intent = Intent(this, MaintainanceLog::class.java).apply {
                    putExtra("propertyId", propertyId)
                    putExtra("rentalId", rentalId)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "No active rental found. Please log in again.", Toast.LENGTH_LONG).show()
            }
        }
        //----------code added for maintenance request--------------
    }

    private fun setupBottomNavigation() {
        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        bottomNavigation.selectedItemId = R.id.navigation_profile
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
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
    }

    private fun setupProfile() {
        profileNameTextView = findViewById(R.id.profileNameTextView)
        profileImageView = findViewById(R.id.profileImageView)
        profileNameTextView.text = sharedPrefs.getString("user_name", "Guest")

        sharedPrefs.getString("profile_image_uri", null)?.let { uriString ->
            try {
                val uri = Uri.parse(uriString)
                Glide.with(this)
                    .load(uri)
                    .placeholder(R.drawable.placeholder)
                    .into(profileImageView)
            } catch (e: Exception) {
                e.printStackTrace()
                profileImageView.setImageResource(R.drawable.placeholder)
            }
        }

        findViewById<LinearLayout>(R.id.editProfileRow).setOnClickListener {
            imagePicker.launch("image/*")
        }

        findViewById<LinearLayout>(R.id.maintaince).setOnClickListener {
            startActivity(Intent(this, MaintainanceLog::class.java))
        }
    }

//    private fun setupPushNotifications() {
//        pushSwitch = findViewById(R.id.pushNotificationsSwitch)
//
//        val isPushEnabled = sharedPrefs.getBoolean("push_enabled", true)
//        val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
//            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
//        } else true
//
//        pushSwitch.isChecked = isPushEnabled && hasPermission
//        pushSwitch.isEnabled = hasPermission || !isPushEnabled
//
//        pushSwitch.setOnCheckedChangeListener { _, isChecked ->
//            if (isChecked) {
//                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
//                    ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
//                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
//                } else {
//                    Firebase.messaging.isAutoInitEnabled = true
//                    sharedPrefs.edit().putBoolean("push_enabled", true).apply()
//                    Toast.makeText(this, "Push notifications enabled", Toast.LENGTH_SHORT).show()
//                }
//            } else {
//                Firebase.messaging.isAutoInitEnabled = false
//                sharedPrefs.edit().putBoolean("push_enabled", false).apply()
//                Toast.makeText(this, "Push notifications disabled", Toast.LENGTH_SHORT).show()
//            }
//        }
//    }

    private fun setupLanguageSpinner() {
        languageSpinner = findViewById(R.id.languageSpinner)
        val languageMap = mapOf(
            getString(R.string.english) to "en",
//            getString(R.string.afrikaans) to "af",
//            getString(R.string.zulu) to "zu"
        )
        val languageNames = languageMap.keys.toList()
        languageSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, languageNames)

        val savedLanguageCode = sharedPrefs.getString("selected_language", "en")
        val savedIndex = languageNames.indexOfFirst { languageMap[it] == savedLanguageCode }
        languageSpinner.setSelection(savedIndex.takeIf { it >= 0 } ?: 0)

        var isSpinnerInitialized = false
        languageSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                if (!isSpinnerInitialized) {
                    isSpinnerInitialized = true
                    return
                }

                val selectedCode = languageMap[languageNames[position]] ?: "en"
                val currentCode = sharedPrefs.getString("selected_language", "en")

                if (selectedCode != currentCode) {
                    sharedPrefs.edit().putString("selected_language", selectedCode).apply()
                    setLocale(selectedCode)

                    val intent = Intent(this@Settings, HomePage::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                    startActivity(intent)
                    finish()
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    private fun setupInfoRows() {
        findViewById<LinearLayout>(R.id.contactUsRow).setOnClickListener {
            showInfoDialog("Contact Us", "Email us at support@nestify.com")
        }
    }

    private fun setUpHistory() {
        findViewById<LinearLayout>(R.id.application_history).setOnClickListener {
            startActivity(Intent(this, ApplicationHistory::class.java))
            finish()
        }
    }

    private fun setupSignOut() {
        findViewById<LinearLayout>(R.id.signOut).setOnClickListener {
            FirebaseAuth.getInstance().signOut()
            val prefs = getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
            prefs.edit().clear().apply()
            startActivity(Intent(this, MainActivity::class.java))
        }
    }

    private fun showInfoDialog(title: String, message: String) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }

    private fun setLocale(languageCode: String) {
        val locale = Locale(languageCode)
        Locale.setDefault(locale)
        val config = resources.configuration
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocale(locale)
            createConfigurationContext(config)
        } else {
            @Suppress("DEPRECATION")
            resources.updateConfiguration(config, resources.displayMetrics)
        }
    }
}