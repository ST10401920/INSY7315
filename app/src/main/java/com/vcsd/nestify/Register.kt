package com.vcsd.nestify

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.edit
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.credentials.Credential
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CredentialManager
import com.google.android.gms.common.SignInButton
import com.google.android.gms.tasks.OnCompleteListener
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.Companion.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
//import com.google.firebase.messaging.FirebaseMessaging
//import com.google.firebase.messaging.messaging
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.HttpURLConnection
import java.net.URL

data class SignupRequest( val email: String, val password: String)
data class User(val id: String?, val email: String?)
data class SignupResponse(
    @SerializedName("access_token")
    val accessToken: String?,
    val user: User?
)

class Register : AppCompatActivity() {
    private lateinit var auth: FirebaseAuth
    private lateinit var credentialManager: CredentialManager
    private lateinit var getCredentialRequest: GetCredentialRequest

    companion object {
        private const val TAG = "Register"
    }

    private val apiService = RetrofitClient.apiService
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContentView(R.layout.activity_register)
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
            Log.d(TAG, "OnClickListener ATTACHED AND TRIGGERED") // Basic log
            Log.d(TAG, "btnGoogle clicked")
            signInWithGoogle()
        }

        val etEmail = findViewById<TextInputEditText>(R.id.etEmail)
        val etPassword = findViewById<TextInputEditText>(R.id.etPassword)
        val tvRegister = findViewById<TextView>(R.id.tvRegister)
        val tvSignUp = findViewById<TextView>(R.id.tvSignIn)

        tvSignUp.setOnClickListener {
            val intent = Intent(this@Register, MainActivity::class.java)
            startActivity(intent)
        }

        tvRegister.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and Password cannot be empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = apiService.signup(SignupRequest( email, password))
                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            val signupResponse = response.body()
                            if (signupResponse?.accessToken != null) {
                                saveToken(signupResponse.accessToken)
                                Toast.makeText(this@Register, "Signup successful! Token stored.", Toast.LENGTH_LONG).show()
                                Log.d(TAG, "Token: ${signupResponse.accessToken}, User: ${signupResponse.user}")
                                val intent = Intent(this@Register, HomePage::class.java)
                                startActivity(intent)
                            } else {
                                Toast.makeText(this@Register, "Signup successful, but no token received.", Toast.LENGTH_LONG).show()
                                Log.e(TAG, "Signup success but no token/user: ${response.body()}")
                            }
                        } else {
                            val errorBody = response.errorBody()?.string() ?: "Unknown error"
                            Toast.makeText(this@Register, "Signup failed: $errorBody", Toast.LENGTH_LONG).show()
                            Log.e(TAG, "Signup failed: ${response.code()} - $errorBody")
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@Register, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                        Log.e(TAG, "Network error", e)
                    }
                }
            }
        }
    }

    private fun signInWithGoogle() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = credentialManager.getCredential(this@Register, getCredentialRequest)
                handleSignIn(response.credential)
                withContext(Dispatchers.Main) {
                    val intent = Intent(this@Register, MainActivity::class.java)
                    startActivity(intent)
                    finish()
                }

            } catch (e: Exception) {
                Log.e(com.vcsd.nestify.Register.Companion.TAG, "Failed to get credential: ${e.localizedMessage}")
            }
        }
    }

    private fun handleSignIn(credential: Credential) {
        if (credential is CustomCredential && credential.type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data).idToken
            if (googleIdToken != null) {
                firebaseAuthWithGoogle(googleIdToken)
            } else Log.e(com.vcsd.nestify.Register.Companion.TAG, "Google ID Token is null")
        } else Log.w(com.vcsd.nestify.Register.Companion.TAG, "Credential is not of type Google ID")
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    Log.d(com.vcsd.nestify.Register.Companion.TAG, "signInWithCredential:success")
                    updateUI(auth.currentUser)
                } else {
                    Log.w(com.vcsd.nestify.Register.Companion.TAG, "signInWithCredential:failure", task.exception)
                    updateUI(null)
                }
            }
    }

    override fun onStart() {
        super.onStart()
        updateUI(auth.currentUser)
    }

    private fun updateUI(user: FirebaseUser?) {
        if (user != null) {
            Log.d(com.vcsd.nestify.Register.Companion.TAG, "User signed in: ${user.uid}")
            sendTokenToBackend(user)
        } else Log.d(com.vcsd.nestify.Register.Companion.TAG, "No user signed in")
    }

    private fun sendTokenToBackend(user: FirebaseUser) {
        user.getIdToken(false).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val idToken = task.result?.token
                if (idToken != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            //val url = URL("http://10.0.2.2:3000/auth/firebase")
                            val url = URL("https://insy7315-api-deploy.onrender.com/auth/firebase")
                            val conn = url.openConnection() as HttpURLConnection
                            conn.requestMethod = "POST"
                            conn.setRequestProperty("Content-Type", "application/json")
                            conn.doOutput = true
                            val body = JSONObject()
                            body.put("firebaseToken", idToken)
                            conn.outputStream.use { os -> os.write(body.toString().toByteArray()) }
                            val response = conn.inputStream.bufferedReader().readText()
                            Log.d(com.vcsd.nestify.Register.Companion.TAG, "Backend response: $response")
                        } catch (e: Exception) {
                            Log.e(com.vcsd.nestify.Register.Companion.TAG, "Error sending token: ${e.message}")
                        }
                    }
                }
            } else Log.e(com.vcsd.nestify.Register.Companion.TAG, "Failed to get Firebase ID token: ${task.exception?.localizedMessage}")
        }
    }

    private fun saveToken(token: String) {
        val sharedPreferences = getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        sharedPreferences.edit {
            putString("access_token", token)
        }
    }
}
