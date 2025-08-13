import React from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import './InputDisplay.css'

const InputDisplay = ({ inputs }) => {
  const { inputButtons, attackButtonMode, attackDisplayMode, theme } = useSettingsStore()

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
      [inputButtons.lp]: '#3498db', // Light Punch (blue)
      [inputButtons.mp]: '#f39c12', // Medium Punch (yellow)
      [inputButtons.hp]: '#e74c3c', // Heavy Punch (red)
      [inputButtons.lk]: '#3498db', // Light Kick (blue)
      [inputButtons.mk]: '#f39c12', // Medium Kick (yellow)
      [inputButtons.hk]: '#e74c3c'  // Heavy Kick (red)
    }
    return colors[input] || '#95a5a6'
  }

  const getInputLabel = (input) => {
    const movementLabels = {
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
      arrowright: '→'
    }

    // Return movement labels as they are
    if (movementLabels[input]) {
      return movementLabels[input]
    }

    // Handle attack buttons based on display mode
    if (attackDisplayMode === 'icons') {
      const iconLabels = {
        [inputButtons.lp]: '✊',
        [inputButtons.mp]: '✊',
        [inputButtons.hp]: '✊',
        [inputButtons.lk]: '🦵',
        [inputButtons.mk]: '🦵',
        [inputButtons.hk]: '🦵'
      }
      return iconLabels[input] || input.toUpperCase()
    } else {
      // Text mode
      const textLabels = {
        [inputButtons.lp]: 'LP',
        [inputButtons.mp]: 'MP',
        [inputButtons.hp]: 'HP',
        [inputButtons.lk]: 'LK',
        [inputButtons.mk]: 'MK',
        [inputButtons.hk]: 'HK'
      }
      return textLabels[input] || input.toUpperCase()
    }
  }

  // Get active attack buttons based on mode
  const getActiveAttackButtons = () => {
    const allAttackButtons = attackDisplayMode === 'icons' ? [
      { key: inputButtons.lp, label: '✊', name: 'Light Punch', color: '#3498db' },
      { key: inputButtons.mp, label: '✊', name: 'Medium Punch', color: '#f39c12' },
      { key: inputButtons.hp, label: '✊', name: 'Heavy Punch', color: '#e74c3c' },
      { key: inputButtons.lk, label: '🦵', name: 'Light Kick', color: '#3498db' },
      { key: inputButtons.mk, label: '🦵', name: 'Medium Kick', color: '#f39c12' },
      { key: inputButtons.hk, label: '🦵', name: 'Heavy Kick', color: '#e74c3c' }
    ] : [
      { key: inputButtons.lp, label: 'LP', name: 'Light Punch', color: '#3498db' },
      { key: inputButtons.mp, label: 'MP', name: 'Medium Punch', color: '#f39c12' },
      { key: inputButtons.hp, label: 'HP', name: 'Heavy Punch', color: '#e74c3c' },
      { key: inputButtons.lk, label: 'LK', name: 'Light Kick', color: '#3498db' },
      { key: inputButtons.mk, label: 'MK', name: 'Medium Kick', color: '#f39c12' },
      { key: inputButtons.hk, label: 'HK', name: 'Heavy Kick', color: '#e74c3c' }
    ]

    if (attackButtonMode === 4) {
      return allAttackButtons.filter(btn => [inputButtons.lp, inputButtons.mp, inputButtons.lk, inputButtons.mk].includes(btn.key))
    }
    return allAttackButtons
  }

  const activeAttackButtons = getActiveAttackButtons()

  return (
    <div className={`input-display ${theme}`}>
      <h3>Recent Inputs</h3>
      <div className="input-list">
        {inputs && inputs.length > 0 ? (
          inputs.slice(-10).reverse().map((input, index) => (
                         <div
               key={index}
               className="input-item"
               style={{ 
                 backgroundColor: getInputColor(input),
                 color: attackDisplayMode === 'icons' && ['✊', '🦵'].includes(getInputLabel(input)) ? 'white' : 'inherit'
               }}
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
               style={{ 
                 backgroundColor: btn.color, 
                 color: attackDisplayMode === 'icons' ? 'white' : 'inherit'
               }}
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
