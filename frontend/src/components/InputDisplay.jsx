import React from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import './InputDisplay.css'

const InputDisplay = ({ inputs }) => {
  const { inputButtons, attackButtonMode } = useSettingsStore()

  const getInputColor = (input) => {
    const colors = {
      w: '#3498db', // up
      a: '#e74c3c', // left
      s: '#2ecc71', // down
      d: '#f39c12', // right
      up: '#3498db', // arrow up
      left: '#e74c3c', // arrow left
      down: '#2ecc71', // arrow down
      right: '#f39c12', // arrow right
      arrowup: '#3498db', // arrow up
      arrowleft: '#e74c3c', // arrow left
      arrowdown: '#2ecc71', // arrow down
      arrowright: '#f39c12', // arrow right
      // Attack colors - using the actual key mappings
      [inputButtons.lp]: '#9b59b6', // Light Punch
      [inputButtons.mp]: '#e67e22', // Medium Punch
      [inputButtons.hp]: '#e74c3c', // Heavy Punch
      [inputButtons.lk]: '#2ecc71', // Light Kick
      [inputButtons.mk]: '#f39c12', // Medium Kick
      [inputButtons.hk]: '#1abc9c'  // Heavy Kick
    }
    return colors[input] || '#95a5a6'
  }

  const getInputLabel = (input) => {
    const labels = {
      w: '↑',
      a: '←',
      s: '↓',
      d: '→',
      up: '↑',
      left: '←',
      down: '↓',
      right: '→',
      arrowup: '↑',
      arrowleft: '←',
      arrowdown: '↓',
      arrowright: '→',
      // Map keys to attack names
      [inputButtons.lp]: 'LP',
      [inputButtons.mp]: 'MP',
      [inputButtons.hp]: 'HP',
      [inputButtons.lk]: 'LK',
      [inputButtons.mk]: 'MK',
      [inputButtons.hk]: 'HK'
    }
    return labels[input] || input.toUpperCase()
  }

  // Get active attack buttons based on mode
  const getActiveAttackButtons = () => {
    const allAttackButtons = [
      { key: inputButtons.lp, label: 'LP', name: 'Light Punch' },
      { key: inputButtons.mp, label: 'MP', name: 'Medium Punch' },
      { key: inputButtons.hp, label: 'HP', name: 'Heavy Punch' },
      { key: inputButtons.lk, label: 'LK', name: 'Light Kick' },
      { key: inputButtons.mk, label: 'MK', name: 'Medium Kick' },
      { key: inputButtons.hk, label: 'HK', name: 'Heavy Kick' }
    ]

    if (attackButtonMode === 4) {
      return allAttackButtons.filter(btn => ['LP', 'MP', 'LK', 'MK'].includes(btn.label))
    }
    return allAttackButtons
  }

  const activeAttackButtons = getActiveAttackButtons()

  return (
    <div className="input-display">
      <h3>Recent Inputs</h3>
      <div className="input-list">
        {inputs && inputs.length > 0 ? (
          inputs.slice(-10).reverse().map((input, index) => (
            <div
              key={index}
              className="input-item"
              style={{ backgroundColor: getInputColor(input) }}
            >
              {getInputLabel(input)}
            </div>
          ))
        ) : (
          <div className="no-inputs">
            <span>Press keys to see inputs here</span>
          </div>
        )}
      </div>
      <div className="input-legend">
        <div className="legend-item">
          <span className="legend-key" style={{ backgroundColor: '#3498db' }}>↑</span>
          <span>Move Up</span>
        </div>
        <div className="legend-item">
          <span className="legend-key" style={{ backgroundColor: '#e74c3c' }}>←</span>
          <span>Move Left</span>
        </div>
        <div className="legend-item">
          <span className="legend-key" style={{ backgroundColor: '#2ecc71' }}>↓</span>
          <span>Move Down</span>
        </div>
        <div className="legend-item">
          <span className="legend-key" style={{ backgroundColor: '#f39c12' }}>→</span>
          <span>Move Right</span>
        </div>
        {activeAttackButtons.map(btn => (
          <div key={btn.key} className="legend-item">
            <span
              className="legend-key"
              style={{ backgroundColor: getInputColor(btn.key) }}
            >
              {btn.label}
            </span>
            <span>{btn.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InputDisplay
