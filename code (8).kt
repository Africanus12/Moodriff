package com.example.moodriffmaker.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.example.moodriffmaker.R
import com.example.moodriffmaker.data.model.Mood
import com.example.moodriffmaker.databinding.FragmentHomeBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupButtonClickListeners()
        observeViewModel()

        viewModel.loadInitialData() // Load streak etc.
    }

    private fun setupButtonClickListeners() {
        binding.buttonChill.setOnClickListener { viewModel.selectMood(Mood.CHILL) }
        binding.buttonHype.setOnClickListener { viewModel.selectMood(Mood.HYPE) }
        binding.buttonCalm.setOnClickListener { viewModel.selectMood(Mood.CALM) }
        binding.buttonWild.setOnClickListener { viewModel.selectMood(Mood.WILD) }

        binding.buttonMakeRiff.setOnClickListener {
            viewModel.selectedMood.value?.let { mood ->
                // Navigate to Riff Screen, passing the selected mood name
                val action = HomeFragmentDirections.actionHomeFragmentToRiffFragment(mood.name)
                findNavController().navigate(action)
            } ?: run {
                // Show a message to select a mood first (e.g., Snackbar)
            }
        }

        binding.buttonDailyChallenge.setOnClickListener {
           // findNavController().navigate(R.id.action_homeFragment_to_challengeFragment) // Add to nav graph
        }
        binding.buttonLevelProgress.setOnClickListener {
            findNavController().navigate(R.id.action_homeFragment_to_levelFragment)
        }
    }

    private fun observeViewModel() {
        viewModel.userProgress.observe(viewLifecycleOwner) { progress ->
            binding.textStreak.text = "Streak: ${progress.streak} Days"
            // Update level progress button text/icon if desired
             binding.buttonLevelProgress.text = "Level ${progress.level}" // Example update
        }

        viewModel.selectedMood.observe(viewLifecycleOwner) { mood ->
            // Optionally highlight the selected mood button
            binding.buttonMakeRiff.isEnabled = mood != null
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}