import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useInputButtons } from '../hooks/useInputButtons'
import './MobileControls.css'

const MobileControls = ({ onInput, disabled = false }) => {
  const { theme, attackButtonMode } = useSettingsStore()
  const inputButtons = useInputButtons()
  const [activeButtons, setActiveButtons] = useState(new Set())
  const [hapticSupported, setHapticSupported] = useState(false)

  useEffect(() => {
    // Check for haptic feedback support
    setHapticSupported('vibrate' in navigator)
  }, [])

  const handleButtonPress = (action, key) => {
    if (disabled) return

    setActiveButtons(prev => new Set([...prev, action]))
    
    // Haptic feedback for mobile
    if (hapticSupported) {
      navigator.vibrate(50)
    }

    // Trigger input callback
    if (onInput) {
      onInput(key)
    }

    // Remove active state after short delay
    setTimeout(() => {
      setActiveButtons(prev => {
        const newSet = new Set(prev)
        newSet.delete(action)
        return newSet
      })
    }, 150)
  }

  const getButtonClass = (action) => {
    const baseClass = `mobile-button ${action}`
    const activeClass = activeButtons.has(action) ? 'active' : ''
    const disabledClass = disabled ? 'disabled' : ''
    return `${baseClass} ${activeClass} ${disabledClass}`.trim()
  }

  const getButtonLabel = (action) => {
    const labels = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
      lp: 'LP',
      mp: 'MP',
      hp: 'HP',
      lk: 'LK',
      mk: 'MK',
      hk: 'HK'
    }
    return labels[action] || action.toUpperCase()
  }

  const getButtonKey = (action) => {
    return inputButtons[action] || action
  }

  return (
    <div className={`mobile-controls ${theme} ${disabled ? 'disabled' : ''}`}>
      <div className="controls-container">
        {/* Movement controls (D-Pad) */}
        <div className="movement-controls">
          <div className="dpad">
            <button
              className={getButtonClass('up')}
              onTouchStart={(e) => {
                e.preventDefault()
                handleButtonPress('up', getButtonKey('up'))
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                handleButtonPress('up', getButtonKey('up'))
              }}
            >
              {getButtonLabel('up')}
            </button>
            
            <div className="dpad-middle">
              <button
                className={getButtonClass('left')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('left', getButtonKey('left'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('left', getButtonKey('left'))
                }}
              >
                {getButtonLabel('left')}
              </button>
              
              <div className="dpad-center"></div>
              
              <button
                className={getButtonClass('right')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('right', getButtonKey('right'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('right', getButtonKey('right'))
                }}
              >
                {getButtonLabel('right')}
              </button>
            </div>
            
            <button
              className={getButtonClass('down')}
              onTouchStart={(e) => {
                e.preventDefault()
                handleButtonPress('down', getButtonKey('down'))
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                handleButtonPress('down', getButtonKey('down'))
              }}
            >
              {getButtonLabel('down')}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-controls">
          {/* Punch buttons */}
          <div className="button-group punch-buttons">
            <h4>Punches</h4>
            <div className="button-row">
              <button
                className={getButtonClass('lp')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('lp', getButtonKey('lp'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('lp', getButtonKey('lp'))
                }}
              >
                {getButtonLabel('lp')}
              </button>
              
              <button
                className={getButtonClass('mp')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('mp', getButtonKey('mp'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('mp', getButtonKey('mp'))
                }}
              >
                {getButtonLabel('mp')}
              </button>
              
              {attackButtonMode === 6 && (
                <button
                  className={getButtonClass('hp')}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleButtonPress('hp', getButtonKey('hp'))
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleButtonPress('hp', getButtonKey('hp'))
                  }}
                >
                  {getButtonLabel('hp')}
                </button>
              )}
            </div>
          </div>

          {/* Kick buttons */}
          <div className="button-group kick-buttons">
            <h4>Kicks</h4>
            <div className="button-row">
              <button
                className={getButtonClass('lk')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('lk', getButtonKey('lk'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('lk', getButtonKey('lk'))
                }}
              >
                {getButtonLabel('lk')}
              </button>
              
              <button
                className={getButtonClass('mk')}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleButtonPress('mk', getButtonKey('mk'))
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleButtonPress('mk', getButtonKey('mk'))
                }}
              >
                {getButtonLabel('mk')}
              </button>
              
              {attackButtonMode === 6 && (
                <button
                  className={getButtonClass('hk')}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleButtonPress('hk', getButtonKey('hk'))
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleButtonPress('hk', getButtonKey('hk'))
                  }}
                >
                  {getButtonLabel('hk')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instruction text */}
      <div className="mobile-instructions">
        <p>Tap buttons for inputs • {hapticSupported ? 'Haptic feedback enabled' : 'Use headphones for better audio feedback'}</p>
      </div>
    </div>
  )
}

export default MobileControls