package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.credentials.Credential
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CredentialManager
import com.google.android.gms.common.SignInButton
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.Companion.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import com.google.firebase.internal.InternalTokenResult
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.net.HttpURLConnection
import java.net.URL

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(
    @SerializedName("token") val accessToken: String?,
    val success: Boolean?,
    val user: User?
)

class MainActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var credentialManager: CredentialManager
    private lateinit var getCredentialRequest: GetCredentialRequest

    companion object {
        const val TAG = "MainActivity"
    }

    private val retrofitInstance by lazy {
        Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3000")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    private val apiService by lazy { retrofitInstance.create(ApiService::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        auth = Firebase.auth
        credentialManager = CredentialManager.create(this)

        val googleIdOption = GetGoogleIdOption.Builder()
            .setServerClientId(getString(R.string.default_web_client_id))
            .setFilterByAuthorizedAccounts(false)
            .build()

        getCredentialRequest = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        findViewById<SignInButton>(R.id.btnGoogle).setOnClickListener {
            signInWithGoogle()
        }

        val etEmail = findViewById<TextInputEditText>(R.id.etEmail)
        val etPassword = findViewById<TextInputEditText>(R.id.etPassword)
        val tvLogin = findViewById<TextView>(R.id.tvLogin)
        val signUp = findViewById<TextView>(R.id.tvSignUp)

        signUp.setOnClickListener {
            val intent = Intent(this@MainActivity, Register::class.java)
            startActivity(intent)
        }

        tvLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and Password cannot be empty", Toast.LENGTH_SHORT)
                    .show()
                return@setOnClickListener
            }

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = apiService.login(LoginRequest(email, password))
                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            val loginResponse = response.body()
                            if (loginResponse?.accessToken != null) {
                                //loginResponse.user
                                handleLoginSuccess(loginResponse.accessToken, null)
                            } else {
                                showError("Login success but no token received.")
                                Log.e(
                                    com.vcsd.nestify.MainActivity.Companion.TAG,
                                    "Response: ${response.body()}"
                                )
                            }
                        } else {
                            val errorBody = response.errorBody()?.string() ?: "Unknown error"
                            showError("Login failed: $errorBody")
                            Log.e(
                                com.vcsd.nestify.MainActivity.Companion.TAG,
                                "Login failed: ${response.code()} - $errorBody"
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        showError("Network error: ${e.message}")
                        Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Network error", e)
                    }
                }
            }
        }
    }

    private fun signInWithGoogle() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = credentialManager.getCredential(this@MainActivity, getCredentialRequest)
                handleSignIn(response.credential)

                withContext(Dispatchers.Main) {
                    val intent = Intent(this@MainActivity, HomePage::class.java)
                    startActivity(intent)
                    finish()
                }
            } catch (e: Exception) {
                Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Failed to get credential: ${e.localizedMessage}")
            }
        }
    }

    private fun handleSignIn(credential: Credential) {
        if (credential is CustomCredential && credential.type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data).idToken
            if (googleIdToken != null) {
                firebaseAuthWithGoogle(googleIdToken)
            } else {
                Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Google ID Token is null")
            }
        } else {
            Log.w(com.vcsd.nestify.MainActivity.Companion.TAG, "Credential is not of type Google ID")
        }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "signInWithCredential:success")
                    updateUI(auth.currentUser)
                } else {
                    Log.w(com.vcsd.nestify.MainActivity.Companion.TAG, "signInWithCredential:failure", task.exception)
                    updateUI(null)
                }
            }
    }

    override fun onStart() {
        super.onStart()
        //updateUI(auth.currentUser)
    }

    private fun updateUI(user: FirebaseUser?) {
        if (user != null) {
            Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "User signed in: ${user.uid}")
            sendTokenToBackend(user)
        } else {
            Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "No user signed in")
        }
    }

    private fun sendTokenToBackend(user: FirebaseUser) {
        user.getIdToken(false).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val idToken = task.result?.token
                if (idToken != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val url = URL("http://10.0.2.2:3000/auth/firebase")
                            val conn = url.openConnection() as HttpURLConnection
                            conn.requestMethod = "POST"
                            conn.setRequestProperty("Content-Type", "application/json")
                            conn.doOutput = true

                            val body = JSONObject().apply { put("firebaseToken", idToken) }
                            conn.outputStream.use { os -> os.write(body.toString().toByteArray()) }

                            val responseCode = conn.responseCode
                            val response = if (responseCode in 200..299) {
                                conn.inputStream.bufferedReader().readText()
                            } else {
                                conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                            }

                            withContext(Dispatchers.Main) {
                                if (responseCode == 200) {
                                    val json = JSONObject(response)
                                    val token = json.optString("firebaseToken", null)
                                    if (token != null) {
                                        handleLoginSuccess(token, null)
                                    } else {
                                        showError("Google login success but no token received.")
                                        Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Response: $response")
                                    }
                                } else {
                                    showError("Google login failed: $response")
                                    Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Error: $responseCode - $response")
                                }
                            }
                        } catch (e: Exception) {
                            withContext(Dispatchers.Main) {
                                showError("Error sending token: ${e.message}")
                                Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Error sending token", e)
                            }
                        }
                    }
                }
            } else {
                Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Failed to get Firebase ID token: ${task.exception?.localizedMessage}")
            }
        }
    }

    private fun handleLoginSuccess(token: String, user: User?) {
        saveToken(token)
        Toast.makeText(this, "Login successful!", Toast.LENGTH_LONG).show()
        Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "Token: $token, User: $user")

        val intent = Intent(this, HomePage::class.java)
        startActivity(intent)
        finish()
    }

    private fun saveToken(token: String) {
        val sharedPreferences = getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        sharedPreferences.edit {
            putString("firebaseToken", token)
        }
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }


}