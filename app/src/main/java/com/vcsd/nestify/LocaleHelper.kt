//package com.vcsd.nestify
//
//import android.content.Context
//import android.os.Build
//import java.util.Locale
//
//object LocaleHelper {
//    fun setLocale(context: Context, languageCode: String): Context {
//        val locale = Locale(languageCode)
//        Locale.setDefault(locale)
//
//        val resources = context.resources
//        val config = resources.configuration
//
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
//            config.setLocale(locale)
//            return context.createConfigurationContext(config)
//        } else {
//            @Suppress("DEPRECATION")
//            resources.updateConfiguration(config, resources.displayMetrics)
//            return context
//        }
//    }
//
//    fun getLanguage(context: Context): String {
//        val prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
//        return prefs.getString("selected_language", "en") ?: "en"
//    }
//}

package com.vcsd.nestify

import android.content.Context
import android.os.Build
import java.util.Locale

object LocaleHelper {

    private const val PREFS_NAME = "user_prefs"
    private const val LANGUAGE_KEY = "selected_language"

    fun setLocale(context: Context, languageCode: String): Context {
        saveLanguage(context, languageCode)

        val locale = Locale(languageCode)
        Locale.setDefault(locale)

        val resources = context.resources
        val config = resources.configuration

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocale(locale)
            return context.createConfigurationContext(config)
        } else {
            @Suppress("DEPRECATION")
            resources.updateConfiguration(config, resources.displayMetrics)
            return context
        }
    }

    fun getLanguage(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(LANGUAGE_KEY, "en") ?: "en"
    }

    private fun saveLanguage(context: Context, languageCode: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(LANGUAGE_KEY, languageCode).apply()
    }
}
