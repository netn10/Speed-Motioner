import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useSettingsStore } from '../stores/settingsStore'
import './TrainingMenu.css'

const TrainingMenu = () => {
  const navigate = useNavigate()
  const { setTrainingMode, setDifficulty, resetGame } = useGameStore()
  const { startTrainingSession } = useTrainingStore()
  const { theme, trainingDuration } = useSettingsStore()
  const [selectedMode, setSelectedMode] = useState('motion')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [customInputs, setCustomInputs] = useState(10)
  const [customSeconds, setCustomSeconds] = useState(2)

  const trainingModes = [
    { id: 'motion', name: 'Motion Training', description: 'Practice special move inputs' },
    { id: 'combos', name: 'Combo Training', description: 'Practice hit confirms and combos' },
    { id: 'custom', name: 'Custom Challenge', description: 'Custom difficulty challenge mode' }
  ]

  const difficulties = [
    { id: 'easy', name: 'Easy', description: '5 inputs, 3 seconds per input' },
    { id: 'medium', name: 'Medium', description: '10 inputs, 2 seconds per input' },
    { id: 'hard', name: 'Hard', description: '20 inputs, 1 second per input' }
  ]

  const handleStartTraining = () => {
    // Reset game state
    resetGame()

    // Set training parameters
    setTrainingMode(selectedMode)
    setDifficulty(selectedDifficulty)

    // Get target inputs based on difficulty for custom challenge
    let targetInputs = trainingDuration
    let customTiming = 2000 // default 2 seconds
    if (selectedMode === 'custom') {
      targetInputs = customInputs
      customTiming = customSeconds * 1000 // convert to milliseconds
    } else {
      switch (selectedDifficulty) {
        case 'easy': targetInputs = 5; break
        case 'medium': targetInputs = 10; break
        case 'hard': targetInputs = 20; break
        default: targetInputs = 10
      }
    }

    // Start new training session with duration and custom timing
    startTrainingSession(selectedMode, selectedDifficulty, targetInputs, customTiming)

    // Navigate to game
    navigate('/game')
  }

  return (
    <div className={`training-menu ${theme}`}>
      <div className="menu-container">
        <div className="menu-header">
          <h2>Select Training Mode</h2>
          <div className="header-buttons">
            <button className="leaderboard-button" onClick={() => navigate('/leaderboard')}>
              🏆 Leaderboard
            </button>
            <button className="settings-button" onClick={() => navigate('/settings')}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        <div className="mode-selection">
          <h3>Training Type</h3>
          <div className="mode-grid">
            {trainingModes.map(mode => (
              <div
                key={mode.id}
                className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <h4>{mode.name}</h4>
                <p>{mode.description}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedMode !== 'custom' && (
          <div className="difficulty-selection">
            <h3>Difficulty</h3>
            <div className="difficulty-grid">
              {difficulties.map(difficulty => (
                <div
                  key={difficulty.id}
                  className={`difficulty-card ${selectedDifficulty === difficulty.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                >
                  <h4>{difficulty.name}</h4>
                  <p>{difficulty.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMode === 'custom' && (
          <div className="custom-settings">
            <h3>Custom Challenge Settings</h3>
            <div className="custom-inputs">
              <div className="input-group">
                <label htmlFor="customInputs">Number of Inputs:</label>
                <input
                  type="number"
                  id="customInputs"
                  min="1"
                  max="50"
                  value={customInputs}
                  onChange={(e) => setCustomInputs(parseInt(e.target.value) || 1)}
                  className="custom-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="customSeconds">Seconds per Input:</label>
                <input
                  type="number"
                  id="customSeconds"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(parseFloat(e.target.value) || 1)}
                  className="custom-input"
                />
              </div>
            </div>
          </div>
        )}

        <div className="training-summary">
          <h3>Training Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="summary-label">Mode:</span>
              <span className="summary-value">{trainingModes.find(m => m.id === selectedMode)?.name}</span>
            </div>
            {selectedMode !== 'custom' && (
              <div className="summary-item">
                <span className="summary-label">Difficulty:</span>
                <span className="summary-value">{difficulties.find(d => d.id === selectedDifficulty)?.name}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">
                {selectedMode === 'custom' 
                  ? `${customInputs} inputs, ${customSeconds}s per input`
                  : `${trainingDuration} inputs`
                }
              </span>
            </div>
          </div>
        </div>

        <button className="start-button" onClick={handleStartTraining}>
          Start Training
        </button>
      </div>
    </div>
  )
}

export default TrainingMenu
