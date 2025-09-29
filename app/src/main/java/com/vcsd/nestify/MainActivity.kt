package com.vcsd.nestify

import android.app.KeyguardManager
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.util.Log
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
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
import com.google.gson.annotations.SerializedName
import com.vcsd.nestify.HomePage
import com.vcsd.nestify.LocaleHelper
import com.vcsd.nestify.R
import com.vcsd.nestify.Register
import com.vcsd.nestify.RetrofitClient
import com.vcsd.nestify.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.HttpURLConnection
import java.net.URL

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(
    @SerializedName("accessToken") val accessToken: String?,
    val userId: String?,
    val email: String?,
    val success: Boolean? = true
)


class MainActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var credentialManager: CredentialManager
    private lateinit var getCredentialRequest: GetCredentialRequest
    private var cancellationSignal: CancellationSignal? = null


    companion object {
        const val TAG = "MainActivity"
        const val PREFS_KEY = "MyAppPrefs"
        const val TOKEN_KEY = "access_token"
    }

    private val apiService = RetrofitClient.apiService

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    private val authenticationCallback: BiometricPrompt.AuthenticationCallback
        get() = @RequiresApi(Build.VERSION_CODES.P)
        object : BiometricPrompt.AuthenticationCallback() {

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence?) {
                super.onAuthenticationError(errorCode, errString)
                Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "Biometric error: $errString ($errorCode)")
                notifyUser("Authentication Error: $errString")
            }

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult?) {
                super.onAuthenticationSucceeded(result)
                Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "Biometric authentication succeeded")
                notifyUser("Authentication Succeeded")

                val prefs = getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
                val savedToken = prefs.getString(TOKEN_KEY, null)
                Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "Saved token: $savedToken")

                if (savedToken != null) {
                    refreshTokenAndLogin(savedToken)
                    val intent = Intent(this@MainActivity, HomePage::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    notifyUser("No previous login found. Please sign in manually.")
                    Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "No saved token found for biometric login")
                }
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, "Biometric authentication failed")
            }
        }


    @RequiresApi(Build.VERSION_CODES.P)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        checkBiometricSupport()

        setContentView(R.layout.activity_main)

        val bioButton = findViewById<ImageView>(R.id.start_authentication)
        bioButton.setOnClickListener {
            val biometricPrompt = BiometricPrompt.Builder(this)
                .setTitle("Biometric Authentication")
                .setSubtitle("Verify your identity")
                .setDescription("Scan your fingerprint to log in")
                .setNegativeButton(
                    "Cancel",
                    this.mainExecutor,
                    DialogInterface.OnClickListener { _, _ ->
                        notifyUser("Authentication Cancelled")
                    }
                ).build()
            biometricPrompt.authenticate(getCancellationSignal(), mainExecutor, authenticationCallback)
        }

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
                Toast.makeText(this, "Email and Password cannot be empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = apiService.login(LoginRequest(email, password))
                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            val loginResponse = response.body()

                            if (loginResponse?.accessToken != null) {
                                // Even if user is null, handleLoginSuccess will extract userId from JWT
                                val user = loginResponse.userId?.let { User(it, loginResponse.email ?: "") }
                                handleLoginSuccess(loginResponse.accessToken, user)
                            } else {
                                showError("Login failed: no token received")
                                Log.e(TAG, "Login response missing token: ${response.body()}")
                            }
                        } else {
                            val errorBody = response.errorBody()?.string() ?: "Unknown error"
                            showError("Login failed: $errorBody")
                            Log.e(TAG, "Login failed: ${response.code()} - $errorBody")
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        showError("Network error: ${e.message}")
                        Log.e(TAG, "Network error", e)
                    }
                }
            }
        }
    }

    private fun getCancellationSignal(): CancellationSignal {
        cancellationSignal = CancellationSignal()
        cancellationSignal?.setOnCancelListener {
            notifyUser("Authentication cancelled by user")
        }
        return cancellationSignal as CancellationSignal
    }

    private fun refreshTokenAndLogin(oldToken: String) {
        // Firebase token refresh to keep biometrics working
        auth.currentUser?.getIdToken(true)?.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val newToken = task.result?.token
                if (newToken != null) {
                    handleLoginSuccess(newToken, null)
                } else {
                    notifyUser("Failed to refresh token")
                }
            } else {
                Log.e(com.vcsd.nestify.MainActivity.Companion.TAG, "Token refresh failed: ${task.exception?.message}")
                notifyUser("Please login manually")
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun checkBiometricSupport(): Boolean {
        val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (!keyguardManager.isDeviceSecure) {
            notifyUser("Fingerprint authentication not enabled in settings")
            return false
        }
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.USE_BIOMETRIC) != PackageManager.PERMISSION_GRANTED) {
            notifyUser("Fingerprint Authentication Permission not granted")
            return false
        }
        return packageManager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)
    }

    private fun notifyUser(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        Log.d(com.vcsd.nestify.MainActivity.Companion.TAG, message)
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
                Log.e(TAG, "Failed to get credential: ${e.localizedMessage}")
            }
        }
    }

    private fun handleSignIn(credential: Credential) {
        if (credential is CustomCredential && credential.type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data).idToken
            if (googleIdToken != null) {
                firebaseAuthWithGoogle(googleIdToken)
            } else {
                Log.e(TAG, "Google ID Token is null")
            }
        } else {
            Log.w(TAG, "Credential is not of type Google ID")
        }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "signInWithCredential:success")
                    updateUI(auth.currentUser)
                } else {
                    Log.w(TAG, "signInWithCredential:failure", task.exception)
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
            Log.d(TAG, "User signed in: ${user.uid}")
            sendTokenToBackend(user)
        } else {
            Log.d(TAG, "No user signed in")
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
                            //val url = URL("http://10.0.0.119:3000/auth/firebase")
                            //val url = URL("https://prog7314-express.onrender.com/auth/firebase")
                            //val url = URL("http://172.20.10.2:3000/auth/firebase")
                            //val url = URL("http://172.20.10.2:3000/auth/firebase")
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
                                        Log.e(TAG, "Response: $response")
                                    }
                                } else {
                                    showError("Google login failed: $response")
                                    Log.e(TAG, "Error: $responseCode - $response")
                                }
                            }
                        } catch (e: Exception) {
                            withContext(Dispatchers.Main) {
                                showError("Error sending token: ${e.message}")
                                Log.e(TAG, "Error sending token", e)
                            }
                        }
                    }
                }
            } else {
                Log.e(TAG, "Failed to get Firebase ID token: ${task.exception?.localizedMessage}")
            }
        }
    }

    private fun handleLoginSuccess(token: String, user: User?) {
        // Determine userId
        val userId = user?.id ?: getUserIdFromToken(token)

        // Save token and userId in SharedPreferences
        val sharedPreferences = getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
        sharedPreferences.edit(commit = true) {
            putString(TOKEN_KEY, token)
            putString("user_id", userId)
        }

        Toast.makeText(this, "Login successful!", Toast.LENGTH_LONG).show()
        Log.d(TAG, "Token: $token, User ID: $userId")

        // Navigate to HomePage
        val intent = Intent(this, HomePage::class.java)
        startActivity(intent)
        finish()
    }


    // Helper function to decode JWT and get 'sub' claim
    private fun getUserIdFromToken(token: String): String {
        return try {
            val parts = token.split(".")
            if (parts.size < 2) return "unknown"

            val payload = android.util.Base64.decode(parts[1], android.util.Base64.URL_SAFE)
            val json = String(payload)
            val jsonObj = JSONObject(json)
            jsonObj.optString("sub", "unknown") // 'sub' usually contains user ID
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode JWT: ${e.message}")
            "unknown"
        }
    }

    private fun saveToken(token: String) {
        val sharedPreferences = getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        sharedPreferences.edit(commit = true) {
            putString("access_token", token)
        }
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
