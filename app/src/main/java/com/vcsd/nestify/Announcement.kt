package com.vcsd.nestify

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class Announcement : AppCompatActivity() {

    private lateinit var container: LinearLayout
    private lateinit var back: ImageView
    private lateinit var emptyText: TextView

    companion object {
        private const val TAG = "Announcement"
    }

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.setLocale(newBase, LocaleHelper.getLanguage(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_announcement)

        container = findViewById(R.id.container_announcements)
        back = findViewById(R.id.back_arrow)
        emptyText = findViewById(R.id.emptyAnnouncementsText)

        fetchAnnouncements()
        back()
    }

    private fun back() {
        val back = findViewById<ImageView>(R.id.back_arrow)
        back.setOnClickListener {
            val intent = Intent(this, Settings::class.java)
            startActivity(intent)
            finish()
        }
    }

//    private fun fetchAnnouncements() {
//        val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
//            .getString("access_token", null)
//
//        if (token.isNullOrEmpty()) return
//
//        CoroutineScope(Dispatchers.IO).launch {
//            try {
//                val response = RetrofitClient.instance
//                    .create(AnnouncementApi::class.java)
//                    .getAnnouncements("Bearer $token")
//
//                if (!response.isSuccessful) {
//                    withContext(Dispatchers.Main) {
//                        Toast.makeText(
//                            this@Announcement,
//                            "Failed to fetch announcements",
//                            Toast.LENGTH_SHORT
//                        ).show()
//                    }
//                    return@launch
//                }
//
//                // Extract announcements from the map
//                val announcements: List<AnnouncementModel> =
//                    response.body()?.values?.flatten() ?: emptyList()
//
//                Log.d(TAG, "Announcements fetched: ${announcements.size}")
//
//                withContext(Dispatchers.Main) {
//                    displayAnnouncements(announcements)
//                }
//
//            } catch (e: Exception) {
//                withContext(Dispatchers.Main) {
//                    Toast.makeText(
//                        this@Announcement,
//                        "Network error: ${e.localizedMessage}",
//                        Toast.LENGTH_LONG
//                    ).show()
//                }
//            }
//        }
//    }

    private fun fetchAnnouncements() {
        val token = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
            .getString("access_token", null)

        if (token.isNullOrEmpty()) return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.instance
                    .create(AnnouncementApi::class.java)
                    .getAnnouncements("Bearer $token")

                if (!response.isSuccessful) return@launch

                val announcements: List<AnnouncementModel> =
                    response.body()?.values?.flatten() ?: emptyList()

                if (announcements.isNotEmpty()) {
                    // Check last seen announcement
                    val prefs = getSharedPreferences("MyAppPrefs", MODE_PRIVATE)
                    val lastSeenId = prefs.getInt("last_announcement_id", -1)
                    val latestId = announcements.maxOf { it.id }

                    if (latestId > lastSeenId) {
                        // New announcement, show notification
                        showNewAnnouncementNotification(announcements.first { it.id == latestId })

                        // Save latest ID
                        prefs.edit().putInt("last_announcement_id", latestId).apply()
                    }
                }

                withContext(Dispatchers.Main) {
                    displayAnnouncements(announcements)
                }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@Announcement,
                        "Network error: ${e.localizedMessage}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun showNewAnnouncementNotification(announcement: AnnouncementModel) {
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager

        val channelId = "announcements_channel"
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                channelId,
                "Announcements",
                android.app.NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val builder = androidx.core.app.NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.logo) // replace with your icon
            .setContentTitle(announcement.title)
            .setContentText(announcement.message)
            .setAutoCancel(true)

        notificationManager.notify(announcement.id, builder.build())
    }


    private fun displayAnnouncements(announcements: List<AnnouncementModel>) {
        container.removeAllViews()
        emptyText.isVisible = announcements.isEmpty()

        announcements.forEach { announcement ->
            val card = layoutInflater.inflate(R.layout.item_announcement, container, false)

            val tvTitle = card.findViewById<TextView>(R.id.textTitle)
            val tvMessage = card.findViewById<TextView>(R.id.textMessage)
            val tvDate = card.findViewById<TextView>(R.id.textDate)

            tvTitle.text = announcement.title
            tvMessage.text = announcement.message
            tvDate.text = announcement.created_at.substring(0, 10) // yyyy-mm-dd

            container.addView(card)
        }
    }


}
