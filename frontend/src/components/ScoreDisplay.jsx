import React from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import './ScoreDisplay.css'

const ScoreDisplay = ({ score }) => {
  const { theme } = useSettingsStore()
  const {
    totalInputs = 0,
    correctInputs = 0,
    comboCount = 0,
    maxCombo = 0,
    accuracy = 0,
    timeElapsed = 0,
    points = 0
  } = score

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`score-display ${theme}`}>
      <div className="score-grid">
        <div className="score-item points">
          <span className="score-label">Points</span>
          <span className="score-value">{points.toLocaleString()}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Accuracy</span>
          <span className="score-value">{accuracy.toFixed(1)}%</span>
        </div>
        <div className="score-item">
          <span className="score-label">Inputs</span>
          <span className="score-value">{correctInputs}/{totalInputs}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Current Combo</span>
          <span className="score-value">{comboCount}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Max Combo</span>
          <span className="score-value">{maxCombo}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Time</span>
          <span className="score-value">{formatTime(timeElapsed)}</span>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
