package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import android.widget.EditText
import android.view.inputmethod.EditorInfo
import androidx.core.graphics.drawable.toDrawable

class Chatbot : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var chatAdapter: ChatAdapter
    private lateinit var chatApi: ChatApi
    private lateinit var sendButton: ImageView
    private lateinit var messageInput: EditText

    private val chatMessages = mutableListOf<ChatMessage>()

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_chatbot)

        chatApi = RetrofitClient.chatApi


        recyclerView = findViewById(R.id.chatRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        chatAdapter = ChatAdapter(chatMessages)
        recyclerView.adapter = chatAdapter
        findViewById<ImageView>(R.id.languageSwitch).setOnClickListener {
            showLanguageSelector()
        }


        messageInput = findViewById(R.id.messageInput)
        sendButton = findViewById(R.id.send)

        sendButton.setOnClickListener {
            val messageText = messageInput.text.toString().trim()
            if (messageText.isNotEmpty()) {
                sendMessage(messageText)
                messageInput.setText("")
            }
        }

        messageInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendButton.performClick()
                true
            } else false
        }

        val bottomNavigation = findViewById<BottomNavigationView>(R.id.bottomNavigation)
        bottomNavigation.selectedItemId = R.id.navigation_chatbot
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    bottomNavigation.itemBackground = android.graphics.Color.TRANSPARENT.toDrawable()
                    startActivity(Intent(this, HomePage::class.java))
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

    private fun showLanguageSelector() {
        val languages = arrayOf("English", "Afrikaans", "Zulu")
        val languageCodes = arrayOf("en", "af", "zu")

        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(getString(R.string.choose_language))
            .setItems(languages) { _, which ->
                val selectedLang = languageCodes[which]
                LocaleHelper.setLocale(this, selectedLang)

                // Restart to apply language change
                val intent = intent
                finish()
                startActivity(intent)
            }
            .show()
    }


    private fun sendMessage(messageText: String) {
        val userMessage = ChatMessage(messageText, isUser = true)
        chatAdapter.addMessage(userMessage)
        recyclerView.scrollToPosition(chatAdapter.itemCount - 1)

        val sharedPreferences = getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        val accessToken = sharedPreferences.getString("access_token", null)

        if (accessToken == null) {
            Toast.makeText(this, "Session expired. Please log in again.", Toast.LENGTH_LONG).show()
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val currentLang = LocaleHelper.getLanguage(this@Chatbot) // get current app language
                val response = RetrofitClient.chatApi.sendMessage(
                    "Bearer $accessToken",
                    MessageRequest(messageText, currentLang)
                )

                if (response.isSuccessful) {
                    val botReply = response.body()?.reply ?: "Sorry, I didn't understand."
                    val botMessage = ChatMessage(botReply, isUser = false)
                    chatAdapter.addMessage(botMessage)
                    recyclerView.scrollToPosition(chatAdapter.itemCount - 1)
                } else {
                    Log.e("Chatbot", "API Error: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("Chatbot", "API call failed: ${e.message}")
            }
        }
    }
}
