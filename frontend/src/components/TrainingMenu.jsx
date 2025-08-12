import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useSettingsStore } from '../stores/settingsStore'
import CustomComboManager from './CustomComboManager'
import './TrainingMenu.css'

const TrainingMenu = () => {
  const navigate = useNavigate()
  const { setTrainingMode, setDifficulty, resetGame } = useGameStore()
  const { startTrainingSession } = useTrainingStore()
  const { theme } = useSettingsStore()
  const [selectedMode, setSelectedMode] = useState('motion')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [customInputs, setCustomInputs] = useState(10)
  const [customSeconds, setCustomSeconds] = useState(2)
  const [showComboManager, setShowComboManager] = useState(false)
  const [selectedCustomCombo, setSelectedCustomCombo] = useState(null)
  
  // Custom Challenge configuration
  const [customConfig, setCustomConfig] = useState({
    includeBasicMotions: true,
    includeFightingGameMotions: false,
    includeComboTraining: false
  })

  const trainingModes = [
    { id: 'motion', name: 'Basic Motion', description: 'Practice basic movement and attack inputs' },
    { id: 'motions', name: 'Fighting Game Motions', description: 'Practice QCF, QCB, DP, HCF, HCB, Charge, and Double motions' },
    { id: 'combos', name: 'Combo Training', description: 'Practice hit confirms and combos' },
    { id: 'custom', name: 'Custom Challenge', description: 'Custom difficulty challenge mode' },
    { id: 'custom-combos', name: 'Custom Combos', description: 'Practice your own saved combos' }
  ]

  const difficulties = [
    { id: 'easy', name: 'Easy', description: '5 inputs, 3 seconds per input' },
    { id: 'medium', name: 'Medium', description: '10 inputs, 2 seconds per input' },
    { id: 'hard', name: 'Hard', description: '20 inputs, 1 second per input' }
  ]

  const handleStartTraining = () => {
    // Validate custom challenge selection
    if (selectedMode === 'custom') {
      const hasSelection = customConfig.includeBasicMotions || 
                          customConfig.includeFightingGameMotions || 
                          customConfig.includeComboTraining
      if (!hasSelection) {
        alert('Please select at least one training pattern type for Custom Challenge!')
        return
      }
    }

    // Validate custom combo selection
    if (selectedMode === 'custom-combos' && !selectedCustomCombo) {
      alert('Please select a custom combo to practice!')
      return
    }

    // Reset game state
    resetGame()

    // Set training parameters
    setTrainingMode(selectedMode)
    setDifficulty(selectedDifficulty)

    // Get target inputs based on difficulty
    let targetInputs = 10 // default
    let customTiming = 2000 // default 2 seconds
    let customComboConfig = null

    if (selectedMode === 'custom') {
      targetInputs = customInputs
      customTiming = customSeconds * 1000 // convert to milliseconds
    } else if (selectedMode === 'custom-combos') {
      targetInputs = selectedCustomCombo.inputs.length
      customTiming = 2000 // 2 seconds per input for custom combos
      customComboConfig = {
        customCombo: selectedCustomCombo,
        includeCustomCombo: true
      }
    } else {
      switch (selectedDifficulty) {
        case 'easy': targetInputs = 5; break
        case 'medium': targetInputs = 10; break
        case 'hard': targetInputs = 20; break
        default: targetInputs = 10
      }
    }

    // Start new training session with duration, custom timing, and custom config
    startTrainingSession(selectedMode, selectedDifficulty, targetInputs, customTiming, customComboConfig)

    // Navigate to game
    navigate('/game')
  }

  const handleComboSelect = (combo) => {
    setSelectedCustomCombo(combo)
    setShowComboManager(false)
  }

  const handleOpenComboManager = () => {
    setShowComboManager(true)
  }

  const handleCloseComboManager = () => {
    setShowComboManager(false)
  }

  const clearSelectedCombo = () => {
    setSelectedCustomCombo(null)
  }

  if (showComboManager) {
    return (
      <div className={`training-menu ${theme}`}>
        <CustomComboManager 
          onComboSelect={handleComboSelect}
          onClose={handleCloseComboManager}
        />
      </div>
    )
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

        {selectedMode === 'custom-combos' && (
          <div className="custom-combo-selection">
            <h3>Custom Combo Selection</h3>
            {selectedCustomCombo ? (
              <div className="selected-combo">
                <div className="combo-info">
                  <h4>{selectedCustomCombo.name}</h4>
                  {selectedCustomCombo.description && (
                    <p>{selectedCustomCombo.description}</p>
                  )}
                  <div className="combo-inputs">
                    <strong>Inputs:</strong> {selectedCustomCombo.inputs.join(' → ')}
                  </div>
                </div>
                <div className="combo-actions">
                  <button className="change-combo-button" onClick={handleOpenComboManager}>
                    Change Combo
                  </button>
                  <button className="clear-combo-button" onClick={clearSelectedCombo}>
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-combo-selected">
                <p>No custom combo selected</p>
                <button className="select-combo-button" onClick={handleOpenComboManager}>
                  Select Custom Combo
                </button>
              </div>
            )}
          </div>
        )}

        {selectedMode !== 'custom' && selectedMode !== 'custom-combos' && (
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
            
            <div className="pattern-selection">
              <h4>Training Pattern Types</h4>
              <div className="pattern-checkboxes">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customConfig.includeBasicMotions}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        includeBasicMotions: e.target.checked
                      }))}
                    />
                    <span className="checkbox-text">
                      <strong>Basic Motions</strong>
                      <small>Simple directional inputs and single attacks (↑, ↓, ←, →, Attack)</small>
                    </span>
                  </label>
                </div>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customConfig.includeFightingGameMotions}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        includeFightingGameMotions: e.target.checked
                      }))}
                    />
                    <span className="checkbox-text">
                      <strong>Fighting Game Motions</strong>
                      <small>Complex motion inputs (QCF, QCB, DP, HCF, HCB, Charge, Double motions)</small>
                    </span>
                  </label>
                </div>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customConfig.includeComboTraining}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        includeComboTraining: e.target.checked
                      }))}
                    />
                    <span className="checkbox-text">
                      <strong>Combo Training</strong>
                      <small>Multi-attack sequences and movement + attack combinations</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
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
            {selectedMode !== 'custom' && selectedMode !== 'custom-combos' && (
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
                  : selectedMode === 'custom-combos'
                  ? selectedCustomCombo 
                    ? `${selectedCustomCombo.inputs.length} inputs, 2s per input`
                    : 'No combo selected'
                  : `${selectedDifficulty === 'easy' ? 5 : selectedDifficulty === 'hard' ? 20 : 10} inputs`
                }
              </span>
            </div>
            {selectedMode === 'custom' && (
              <div className="summary-item">
                <span className="summary-label">Pattern Types:</span>
                <span className="summary-value">
                  {[
                    customConfig.includeBasicMotions && 'Basic Motions',
                    customConfig.includeFightingGameMotions && 'Fighting Game Motions', 
                    customConfig.includeComboTraining && 'Combo Training'
                  ].filter(Boolean).join(', ') || 'None selected'}
                </span>
              </div>
            )}
            {selectedMode === 'custom-combos' && selectedCustomCombo && (
              <div className="summary-item">
                <span className="summary-label">Selected Combo:</span>
                <span className="summary-value">{selectedCustomCombo.name}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          className="start-button" 
          onClick={handleStartTraining}
          disabled={selectedMode === 'custom-combos' && !selectedCustomCombo}
        >
          Start Training
        </button>
      </div>
    </div>
  )
}

export default TrainingMenu
