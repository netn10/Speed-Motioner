import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../stores/settingsStore'
import { useGamepad } from '../hooks/useGamepad'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const {
    theme,
    toggleTheme,
    attackButtonMode,
    attackDisplayMode,
    inputButtons,
    gamepadButtons,
    setInputButton,
    setGamepadButton,
    setAttackButtonMode,
    setAttackDisplayMode,
    availableButtons,
    resetToDefaults
  } = useSettingsStore()

  const [editingButton, setEditingButton] = useState(null)
  const [editingGamepadAction, setEditingGamepadAction] = useState(null)
  const [activeSection, setActiveSection] = useState('general') // 'general' or 'input'
  const [activeInputTab, setActiveInputTab] = useState('keyboard') // 'keyboard', 'gamepad-config', or 'gamepad-test'
  const [gamepadInputs, setGamepadInputs] = useState([])
  const [waitingForGamepadInput, setWaitingForGamepadInput] = useState(false)
  const { isConnected: gamepadConnected, gamepads, getGamepadInputs, buttonMappings } = useGamepad()

  // Check if inputButtons is properly loaded
  if (!inputButtons || Object.keys(inputButtons).length === 0) {
    return (
      <div className={`settings ${theme || 'dark'}`}>
        <div className="settings-container">
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="back-button" onClick={() => navigate('/')}>
              ← Back to Menu
            </button>
          </div>
          <div className="settings-section">
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  const movementActions = [
    { key: 'up', label: 'Up', icon: '↑' },
    { key: 'down', label: 'Down', icon: '↓' },
    { key: 'left', label: 'Left', icon: '←' },
    { key: 'right', label: 'Right', icon: '→' }
  ]

  const getPunchActions = () => {
    const actions = [
      { key: 'lp', label: 'Light Punch', icon: '✊', text: 'LP', color: '#3498db' },
      { key: 'mp', label: 'Medium Punch', icon: '✊', text: 'MP', color: '#f39c12' },
      { key: 'hp', label: 'Heavy Punch', icon: '✊', text: 'HP', color: '#e74c3c' }
    ]
    return actions.map(action => ({
      ...action,
      displayIcon: attackDisplayMode === 'icons' ? action.icon : action.text
    }))
  }

  const getKickActions = () => {
    const actions = [
      { key: 'lk', label: 'Light Kick', icon: '🦵', text: 'LK', color: '#3498db' },
      { key: 'mk', label: 'Medium Kick', icon: '🦵', text: 'MK', color: '#f39c12' },
      { key: 'hk', label: 'Heavy Kick', icon: '🦵', text: 'HK', color: '#e74c3c' }
    ]
    return actions.map(action => ({
      ...action,
      displayIcon: attackDisplayMode === 'icons' ? action.icon : action.text
    }))
  }

  // Filter actions based on attack button mode
  const getFilteredPunchActions = () => {
    const actions = getPunchActions()
    return attackButtonMode === 6 ? actions : actions.slice(0, 2)
  }
  
  const getFilteredKickActions = () => {
    const actions = getKickActions()
    return attackButtonMode === 6 ? actions : actions.slice(0, 2)
  }

  const handleButtonClick = (action) => {
    setEditingButton(action)
  }

  const handleButtonSelect = (button) => {
    if (editingButton) {
      let key = button

      // Keep arrow keys as they are for storage
      // The input system will handle the conversion when needed

      setInputButton(editingButton, key)
      setEditingButton(null)
    }
  }

  const handleGamepadActionClick = (action) => {
    setEditingGamepadAction(action)
    setWaitingForGamepadInput(true)
  }

  // Listen for gamepad button presses when waiting for input
  useEffect(() => {
    if (!waitingForGamepadInput || !gamepadConnected || !editingGamepadAction) return

    let timeoutId
    let buttonPressed = false // Flag to prevent multiple button presses

    const checkForGamepadInput = () => {
      if (buttonPressed) return // Prevent multiple assignments

      const freshGamepads = navigator.getGamepads().filter(gp => gp !== null)

      freshGamepads.forEach(gamepad => {
        if (!gamepad || buttonPressed) return

        // Check for button presses
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && !buttonPressed) {
            buttonPressed = true // Set flag immediately

            // Assign the button to the action
            setGamepadButton(index, editingGamepadAction)
            setEditingGamepadAction(null)
            setWaitingForGamepadInput(false)
            return
          }
        })
      })

      if (waitingForGamepadInput && !buttonPressed) {
        timeoutId = setTimeout(checkForGamepadInput, 50) // Check every 50ms
      }
    }

    checkForGamepadInput()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [waitingForGamepadInput, gamepadConnected, editingGamepadAction, setGamepadButton])

  const cancelGamepadMapping = () => {
    setEditingGamepadAction(null)
    setWaitingForGamepadInput(false)
  }

  const handleKeyPress = (e) => {
    if (editingButton) {
      let key = e.key.toLowerCase()

      // Handle arrow keys
      if (key.startsWith('arrow')) {
        // Keep the full arrow key name for storage
        key = key
        // Prevent browser scrolling for arrow keys
        e.preventDefault()
      }

      if (availableButtons.includes(key)) {
        setInputButton(editingButton, key)
        setEditingButton(null)
      }
    }
  }

  // Poll for gamepad inputs when on gamepad test tab
  useEffect(() => {
    if (activeInputTab === 'gamepad-test' && gamepadConnected) {
      const interval = setInterval(() => {
        const inputs = getGamepadInputs()
        setGamepadInputs(inputs)
      }, 16) // ~60fps
      return () => clearInterval(interval)
    }
  }, [activeInputTab, gamepadConnected, getGamepadInputs])

  React.useEffect(() => {
    if (editingButton) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [editingButton])

  return (
    <div className={`settings ${theme}`}>
      <div className="settings-container">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Menu
          </button>
        </div>

        <div className="settings-sections">
          <button
            className={`section-button ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            General Settings
          </button>
          <button
            className={`section-button ${activeSection === 'input' ? 'active' : ''}`}
            onClick={() => setActiveSection('input')}
          >
            Input Settings
          </button>
        </div>

        {activeSection === 'general' && (
          <>
            <div className="settings-section">
              <h3>Theme</h3>
              <div className="theme-toggle">
                <span className="theme-label">Light Mode</span>
                <button
                  className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                  onClick={toggleTheme}
                >
                  <div className="toggle-slider"></div>
                </button>
                <span className="theme-label">Dark Mode</span>
              </div>
            </div>

            <div className="settings-section">
              <h3>Attack Button Mode</h3>
              <div className="attack-mode-toggle">
                <span className="mode-label">4 Buttons</span>
                <button
                  className={`toggle-switch ${attackButtonMode === 6 ? 'active' : ''}`}
                  onClick={() => setAttackButtonMode(attackButtonMode === 4 ? 6 : 4)}
                >
                  <div className="toggle-slider"></div>
                </button>
                <span className="mode-label">6 Buttons</span>
              </div>
              <p className="section-description">
                Choose between 4 buttons (LP, MP, LK, MK) or 6 buttons (LP, MP, HP, LK, MK, HK)
              </p>
            </div>

            <div className="settings-section">
              <h3>Attack Display Mode</h3>
              <div className="attack-mode-toggle">
                <span className="mode-label">Text</span>
                <button
                  className={`toggle-switch ${attackDisplayMode === 'icons' ? 'active' : ''}`}
                  onClick={() => setAttackDisplayMode(attackDisplayMode === 'text' ? 'icons' : 'text')}
                >
                  <div className="toggle-slider"></div>
                </button>
                <span className="mode-label">Icons</span>
              </div>
              <p className="section-description">
                Choose between text labels (LP, MP, HP, LK, MK, HK) or Street Fighter-style icons (✊, 🦵) with colored backgrounds
              </p>
            </div>



            <div className="settings-actions">
              <button className="reset-button" onClick={resetToDefaults}>
                Reset to Defaults
              </button>
            </div>
          </>
        )}

        {activeSection === 'input' && (
          <>
            <div className="input-tabs">
              <button
                className={`tab-button ${activeInputTab === 'keyboard' ? 'active' : ''}`}
                onClick={() => setActiveInputTab('keyboard')}
              >
                Keyboard
              </button>
              <button
                className={`tab-button ${activeInputTab === 'gamepad-config' ? 'active' : ''}`}
                onClick={() => setActiveInputTab('gamepad-config')}
              >
                Gamepad Controls
              </button>
              <button
                className={`tab-button ${activeInputTab === 'gamepad-test' ? 'active' : ''}`}
                onClick={() => setActiveInputTab('gamepad-test')}
              >
                Gamepad Test
              </button>
            </div>

            {activeInputTab === 'keyboard' && (
              <>
                <div className="settings-section">
                  <h3>Movement Controls</h3>
                  <p className="section-description">
                    Click on any button to change its key binding. You can also press a key while editing.
                  </p>
                  {gamepadConnected ? (
                    <div className="gamepad-status-settings">
                      <span className="gamepad-indicator">🎮 Gamepad Connected</span>
                      <span className="gamepad-info">You may use the joystick for movement and face buttons for attacks at the Gamepad Controls tab</span>
                    </div>
                  ) : (
                    <div className="gamepad-status-settings disconnected">
                      <span className="gamepad-indicator">🎮 No Gamepad Detected</span>
                      <span className="gamepad-info">Connect a gamepad to use joystick controls</span>
                    </div>
                  )}

                  <div className="input-buttons-grid">
                    {movementActions.map(action => (
                      <div key={action.key} className="input-button-item">
                        <div className="input-label">
                          <span className="input-icon">{action.icon}</span>
                          <span>{action.label}</span>
                        </div>
                        <button
                          className={`input-button ${editingButton === action.key ? 'editing' : ''}`}
                          onClick={() => handleButtonClick(action.key)}
                        >
                          {(inputButtons[action.key] || '?').toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Punch Controls</h3>
                  <div className="input-buttons-grid">
                    {getFilteredPunchActions().map(action => (
                      <div key={action.key} className="input-button-item">
                        <div className="input-label">
                          <span className="input-icon" style={{ 
                            backgroundColor: attackDisplayMode === 'icons' ? action.color : 'transparent', 
                            color: attackDisplayMode === 'icons' ? 'white' : 'inherit',
                            padding: attackDisplayMode === 'icons' ? '4px 8px' : '0',
                            borderRadius: attackDisplayMode === 'icons' ? '4px' : '0',
                            display: 'inline-block',
                            minWidth: attackDisplayMode === 'icons' ? '24px' : 'auto',
                            textAlign: 'center'
                          }}>{action.displayIcon}</span>
                          <span>{action.label}</span>
                        </div>
                        <button
                          className={`input-button ${editingButton === action.key ? 'editing' : ''}`}
                          onClick={() => handleButtonClick(action.key)}
                        >
                          {(inputButtons[action.key] || '?').toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Kick Controls</h3>
                  <div className="input-buttons-grid">
                    {getFilteredKickActions().map(action => (
                      <div key={action.key} className="input-button-item">
                        <div className="input-label">
                          <span className="input-icon" style={{ 
                            backgroundColor: attackDisplayMode === 'icons' ? action.color : 'transparent', 
                            color: attackDisplayMode === 'icons' ? 'white' : 'inherit',
                            padding: attackDisplayMode === 'icons' ? '4px 8px' : '0',
                            borderRadius: attackDisplayMode === 'icons' ? '4px' : '0',
                            display: 'inline-block',
                            minWidth: attackDisplayMode === 'icons' ? '24px' : 'auto',
                            textAlign: 'center'
                          }}>{action.displayIcon}</span>
                          <span>{action.label}</span>
                        </div>
                        <button
                          className={`input-button ${editingButton === action.key ? 'editing' : ''}`}
                          onClick={() => handleButtonClick(action.key)}
                        >
                          {(inputButtons[action.key] || '?').toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {editingButton && (
                  <div className="button-selection">
                    <p>Press a key or click a button below:</p>
                    <div className="available-buttons">
                      {availableButtons.map(button => {
                        // Display arrow keys more user-friendly
                        let displayText = button.toUpperCase()
                        if (button === 'arrowup') displayText = '↑'
                        else if (button === 'arrowdown') displayText = '↓'
                        else if (button === 'arrowleft') displayText = '←'
                        else if (button === 'arrowright') displayText = '→'

                        return (
                          <button
                            key={button}
                            className="available-button"
                            onClick={() => handleButtonSelect(button)}
                          >
                            {displayText}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeInputTab === 'gamepad-config' && (
              <>
                <div className="settings-section">
                  <h3>Gamepad Button Configuration</h3>
                  <p className="section-description">
                    Click on any gamepad button mapping to change which fighting game action it performs.
                  </p>
                  {gamepadConnected ? (
                    <div className="gamepad-status-settings">
                      <span className="gamepad-indicator">🎮 Gamepad Connected</span>
                      <span className="gamepad-info">Press buttons on your gamepad to test the mappings</span>
                    </div>
                  ) : (
                    <div className="gamepad-status-settings disconnected">
                      <span className="gamepad-indicator">🎮 No Gamepad Detected</span>
                      <span className="gamepad-info">Connect a gamepad to configure button mappings</span>
                    </div>
                  )}

                  <div className="gamepad-action-mappings">
                    <h4>Movement Controls</h4>
                    <div className="input-buttons-grid">
                      {movementActions.map(action => {
                        // Find which gamepad button is assigned to this action
                        const assignedButton = Object.entries(gamepadButtons || {}).find(([buttonIndex, buttonAction]) =>
                          buttonAction === action.key
                        )
                        const buttonIndex = assignedButton ? assignedButton[0] : null
                        const buttonName = buttonIndex ? `Button ${buttonIndex}` : 'Not Assigned'

                        return (
                          <div key={action.key} className="input-button-item">
                            <div className="input-label">
                              <span className="input-icon">{action.icon}</span>
                              <span>{action.label}</span>
                            </div>
                            <button
                              className={`input-button ${editingGamepadAction === action.key ? 'editing' : ''}`}
                              onClick={() => handleGamepadActionClick(action.key)}
                            >
                              {buttonIndex || 'CLICK'}
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <h4>Punch Controls</h4>
                    <div className="input-buttons-grid">
                      {getFilteredPunchActions().map(action => {
                        const assignedButton = Object.entries(gamepadButtons || {}).find(([buttonIndex, buttonAction]) =>
                          buttonAction === action.key
                        )
                        const buttonIndex = assignedButton ? assignedButton[0] : null
                        const buttonName = buttonIndex ? `Button ${buttonIndex}` : 'Not Assigned'

                        return (
                          <div key={action.key} className="input-button-item">
                            <div className="input-label">
                              <span className="input-icon" style={{ 
                                backgroundColor: attackDisplayMode === 'icons' ? action.color : 'transparent', 
                                color: attackDisplayMode === 'icons' ? 'white' : 'inherit',
                                padding: attackDisplayMode === 'icons' ? '4px 8px' : '0',
                                borderRadius: attackDisplayMode === 'icons' ? '4px' : '0',
                                display: 'inline-block',
                                minWidth: attackDisplayMode === 'icons' ? '24px' : 'auto',
                                textAlign: 'center'
                              }}>{action.displayIcon}</span>
                              <span>{action.label}</span>
                            </div>
                            <button
                              className={`input-button ${editingGamepadAction === action.key ? 'editing' : ''}`}
                              onClick={() => handleGamepadActionClick(action.key)}
                            >
                              {buttonIndex || 'CLICK'}
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <h4>Kick Controls</h4>
                    <div className="input-buttons-grid">
                      {getFilteredKickActions().map(action => {
                        const assignedButton = Object.entries(gamepadButtons || {}).find(([buttonIndex, buttonAction]) =>
                          buttonAction === action.key
                        )
                        const buttonIndex = assignedButton ? assignedButton[0] : null
                        const buttonName = buttonIndex ? `Button ${buttonIndex}` : 'Not Assigned'

                        return (
                          <div key={action.key} className="input-button-item">
                            <div className="input-label">
                              <span className="input-icon" style={{ 
                                backgroundColor: attackDisplayMode === 'icons' ? action.color : 'transparent', 
                                color: attackDisplayMode === 'icons' ? 'white' : 'inherit',
                                padding: attackDisplayMode === 'icons' ? '4px 8px' : '0',
                                borderRadius: attackDisplayMode === 'icons' ? '4px' : '0',
                                display: 'inline-block',
                                minWidth: attackDisplayMode === 'icons' ? '24px' : 'auto',
                                textAlign: 'center'
                              }}>{action.displayIcon}</span>
                              <span>{action.label}</span>
                            </div>
                            <button
                              className={`input-button ${editingGamepadAction === action.key ? 'editing' : ''}`}
                              onClick={() => handleGamepadActionClick(action.key)}
                            >
                              {buttonIndex || 'CLICK'}
                            </button>
                          </div>
                        )
                      })}
                    </div>


                  </div>

                  {waitingForGamepadInput && (
                    <div className="gamepad-input-prompt">
                      <div className="prompt-content">
                        <h4>Press a gamepad button</h4>
                        <p>Press the gamepad button you want to assign to <strong>{editingGamepadAction?.toUpperCase()}</strong></p>
                        <div className="prompt-actions">
                          <button className="cancel-button" onClick={cancelGamepadMapping}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeInputTab === 'gamepad-test' && (
              <div className="gamepad-test-section">
                <div className="settings-section">
                  <h3>Gamepad Connection Status</h3>
                  {gamepadConnected && (
                    <div className="gamepad-status connected">
                      <div className="status-indicator">
                        <span className="status-dot connected"></span>
                        <span className="status-text">Gamepad Connected</span>
                      </div>
                      {gamepads.map((gamepad, index) => (
                        <div key={index} className="gamepad-info">
                          <h4>Controller {index + 1}</h4>
                          <p><strong>Name:</strong> {gamepad.id}</p>
                          <p><strong>Buttons:</strong> {gamepad.buttons.length}</p>
                          <p><strong>Axes:</strong> {gamepad.axes.length}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {gamepadConnected && (
                  <>
                    <div className="settings-section">
                      <h3>Live Input Test</h3>
                      <p className="section-description">
                        Press buttons and move sticks on your gamepad to see them light up below.
                      </p>
                      <div className="live-inputs">
                        {gamepadInputs.length > 0 ? (
                          <div className="active-inputs">
                            <h4>Currently Pressed:</h4>
                            <div className="input-tags">
                              {gamepadInputs.map((input, index) => (
                                <span key={index} className="input-tag active">
                                  {input.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-inputs">
                            <span>No inputs detected - try pressing buttons or moving sticks</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="settings-section">
                      <h3>Button Mapping Reference</h3>
                      <p className="section-description">
                        This shows how your gamepad buttons map to fighting game actions.
                      </p>
                      <div className="button-mapping-grid">
                        {Object.entries(buttonMappings).map(([buttonIndex, action]) => (
                          <div key={buttonIndex} className="mapping-item">
                            <div className="button-number">Button {buttonIndex}</div>
                            <div className="arrow">→</div>
                            <div className="action-name">{action.toUpperCase()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="settings-section">
                      <h3>Raw Gamepad Data</h3>
                      <p className="section-description">
                        Technical information for troubleshooting gamepad issues.
                      </p>
                      {gamepads.map((gamepad, gamepadIndex) => (
                        <div key={gamepadIndex} className="raw-gamepad-data">
                          <h4>Controller {gamepadIndex + 1} Data</h4>
                          <div className="data-grid">
                            <div className="data-section">
                              <h5>Buttons ({gamepad.buttons.length})</h5>
                              <div className="button-states">
                                {gamepad.buttons.map((button, index) => (
                                  <div
                                    key={index}
                                    className={`button-state ${button.pressed ? 'pressed' : ''}`}
                                  >
                                    <span className="button-index">{index}</span>
                                    <span className="button-value">
                                      {button.pressed ? '1.0' : '0.0'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="data-section">
                              <h5>Axes ({gamepad.axes.length})</h5>
                              <div className="axes-states">
                                {gamepad.axes.map((axis, index) => (
                                  <div key={index} className="axis-state">
                                    <span className="axis-index">Axis {index}</span>
                                    <div className="axis-bar">
                                      <div
                                        className="axis-value"
                                        style={{
                                          left: `${((axis + 1) / 2) * 100}%`
                                        }}
                                      ></div>
                                    </div>
                                    <span className="axis-number">{axis.toFixed(3)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Settings
