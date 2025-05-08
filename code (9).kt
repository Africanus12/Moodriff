package com.example.moodriffmaker.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.moodriffmaker.data.model.Mood
import com.example.moodriffmaker.data.repository.UserRepository
import com.example.moodriffmaker.data.repository.UserProgress // Import the data class
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val userRepository: UserRepository
    // Inject ChallengeRepository if needed
) : ViewModel() {

    private val _selectedMood = MutableLiveData<Mood?>()
    val selectedMood: LiveData<Mood?> get() = _selectedMood

    private val _userProgress = MutableLiveData<UserProgress>()
    val userProgress: LiveData<UserProgress> get() = _userProgress

    fun selectMood(mood: Mood) {
        _selectedMood.value = mood
    }

     fun loadInitialData() {
        viewModelScope.launch {
             // Fetch initial progress from repository
            _userProgress.value = userRepository.getUserProgress()
            // TODO: Load daily challenge status if implemented
        }
    }
}