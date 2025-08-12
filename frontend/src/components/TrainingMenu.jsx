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
  const [showConfirmation, setShowConfirmation] = useState(false)

  const trainingModes = [
    { id: 'motion', name: 'Motion Training', description: 'Practice special move inputs' },
    { id: 'blocking', name: 'Blocking Practice', description: 'Improve your blocking timing' },
    { id: 'punishing', name: 'Punish Training', description: 'Learn to punish unsafe moves' },
    { id: 'combos', name: 'Combo Training', description: 'Practice hit confirms and combos' }
  ]

  const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Slower inputs, more forgiving timing' },
    { id: 'medium', name: 'Medium', description: 'Standard timing and speed' },
    { id: 'hard', name: 'Hard', description: 'Fast inputs, strict timing' }
  ]

  const handleStartTraining = () => {
    setShowConfirmation(true)
  }

  const handleConfirmStart = () => {
    // Reset game state
    resetGame()

    // Set training parameters
    setTrainingMode(selectedMode)
    setDifficulty(selectedDifficulty)

    // Start new training session with duration
    startTrainingSession(selectedMode, selectedDifficulty, trainingDuration)

    // Navigate to game
    navigate('/game')
  }

  const handleCancelStart = () => {
    setShowConfirmation(false)
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

        <div className="training-summary">
          <h3>Training Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="summary-label">Mode:</span>
              <span className="summary-value">{trainingModes.find(m => m.id === selectedMode)?.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Difficulty:</span>
              <span className="summary-value">{difficulties.find(d => d.id === selectedDifficulty)?.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{trainingDuration} inputs</span>
            </div>
          </div>
        </div>

        <button className="start-button" onClick={handleStartTraining}>
          Start Training
        </button>
      </div>

      {showConfirmation && (
        <div className="confirmation-dialog">
          <div className="dialog-content">
            <h2>Ready to Start Training?</h2>
            <div className="training-details">
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <div className="detail-text">
                  <strong>{trainingModes.find(m => m.id === selectedMode)?.name}</strong>
                  <p>{trainingModes.find(m => m.id === selectedMode)?.description}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⚡</span>
                <div className="detail-text">
                  <strong>{difficulties.find(d => d.id === selectedDifficulty)?.name} Difficulty</strong>
                  <p>{difficulties.find(d => d.id === selectedDifficulty)?.description}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🎮</span>
                <div className="detail-text">
                  <strong>{trainingDuration} Input Challenge</strong>
                  <p>Complete {trainingDuration} inputs to finish the training session</p>
                </div>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={handleCancelStart}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmStart}>
                Let's Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingMenu
