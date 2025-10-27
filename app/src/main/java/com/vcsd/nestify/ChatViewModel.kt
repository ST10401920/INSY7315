package com.vcsd.nestify

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.io.IOException

class ChatViewModel : ViewModel() {

    private val _state = MutableLiveData(ChatState())
    val state: LiveData<ChatState> = _state

    private val api: FcmApi = Retrofit.Builder()
        //.baseUrl("http://10.0.2.2:3000/")
        .baseUrl("https://insy7315-api-deploy.onrender.com/")
        //.baseUrl("http://10.0.0.167:3000/")
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
        .create(FcmApi::class.java)

    fun onRemoteCTokenChange(newToken: String) {
        _state.value = _state.value?.copy(remoteToken = newToken)
    }

    fun onSubmitRemoteToken() {
        _state.value = _state.value?.copy(isEnteringToken = false)
    }

    fun onMessageChange(message: String) {
        _state.value = _state.value?.copy(messageText = message)
    }

    fun sendMessage(isBroadcast: Boolean) {
        viewModelScope.launch {
            val currentState = _state.value ?: return@launch

            val messageDto = SendMessageDto(
                to = if (isBroadcast) null else currentState.remoteToken,
                notification = NotificationBody(
                    title = "New Message",
                    body = currentState.messageText
                )
            )

            try {
                if (isBroadcast) {
                    api.broadcast(messageDto)
                } else {
                    api.sendMessage(messageDto)
                }

                _state.value = currentState.copy(messageText = "")
            } catch (e: HttpException) {
                e.printStackTrace()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }
}
