import React, { useState, useEffect } from 'react'
import { useTrainingStore } from '../stores/trainingStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useGamepad } from '../hooks/useGamepad'
import './CustomComboManager.css'

const CustomComboManager = ({ onComboSelect, onClose }) => {
  const { 
    getAllCustomCombos, 
    saveCustomCombo, 
    updateCustomCombo, 
    deleteCustomCombo 
  } = useTrainingStore()
  const { inputButtons } = useSettingsStore()
  const { isConnected: gamepadConnected, setInputCallback } = useGamepad()
  
  const [combos, setCombos] = useState([])
  const [editingCombo, setEditingCombo] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inputs: []
  })
  const [currentInput, setCurrentInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedInputs, setRecordedInputs] = useState([])
  const [previewInput, setPreviewInput] = useState('') // New state for immediate preview

  useEffect(() => {
    setCombos(getAllCustomCombos())
  }, [getAllCustomCombos])

  useEffect(() => {
    if (isRecording) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isRecording, inputButtons])

  // Handle gamepad inputs during recording
  const handleGamepadInput = (input) => {
    if (!isRecording) return
    
    // Convert action names to actual key bindings to match keyboard input
    let mappedInput = input

    // Convert action names to actual key bindings
    if (input === 'lp') mappedInput = inputButtons.lp
    else if (input === 'mp') mappedInput = inputButtons.mp
    else if (input === 'hp') mappedInput = inputButtons.hp
    else if (input === 'lk') mappedInput = inputButtons.lk
    else if (input === 'mk') mappedInput = inputButtons.mk
    else if (input === 'hk') mappedInput = inputButtons.hk
    // Convert movement actions to key bindings too
    else if (input === 'up') mappedInput = inputButtons.up
    else if (input === 'down') mappedInput = inputButtons.down
    else if (input === 'left') mappedInput = inputButtons.left
    else if (input === 'right') mappedInput = inputButtons.right

    // Add the input to the combo
    setRecordedInputs(prev => [...prev, mappedInput])
    setCurrentInput(mappedInput)
    
    // Immediately add to combo preview
    setFormData(prev => ({
      ...prev,
      inputs: [...prev.inputs, mappedInput]
    }))
    
    // Set immediate preview
    setPreviewInput(mappedInput)
    
    // Clear preview after a short delay
    setTimeout(() => {
      setPreviewInput('')
    }, 300)
  }

  // Set up gamepad input callback when recording starts/stops
  useEffect(() => {
    if (isRecording && gamepadConnected) {
      setInputCallback(handleGamepadInput)
    } else {
      setInputCallback(null)
    }
  }, [isRecording, gamepadConnected, setInputCallback])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleKeyDown = (e) => {
    if (!isRecording) return
    
    e.preventDefault()
    const key = e.key.toLowerCase()
    
    // Create reverse mapping from user's configured input buttons to keys
    const reverseKeyMap = {}
    
    // Map movement keys
    Object.entries(inputButtons).forEach(([action, button]) => {
      if (['up', 'down', 'left', 'right', 'lp', 'mp', 'hp', 'lk', 'mk', 'hk'].includes(action)) {
        reverseKeyMap[button] = button
      }
    })
    
    // Also support arrow keys for movement (common alternative)
    reverseKeyMap['arrowup'] = inputButtons.up
    reverseKeyMap['arrowdown'] = inputButtons.down
    reverseKeyMap['arrowleft'] = inputButtons.left
    reverseKeyMap['arrowright'] = inputButtons.right
    
    if (reverseKeyMap[key]) {
      const inputValue = reverseKeyMap[key]
      setRecordedInputs(prev => [...prev, inputValue])
      setCurrentInput(inputValue)
      
      // Immediately add to combo preview
      setFormData(prev => ({
        ...prev,
        inputs: [...prev.inputs, inputValue]
      }))
      
      // Set immediate preview
      setPreviewInput(inputValue)
      
      // Clear preview after a short delay
      setTimeout(() => {
        setPreviewInput('')
      }, 300)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordedInputs([])
    setCurrentInput('')
    setPreviewInput('')
    // Clear existing inputs when starting new recording
    setFormData(prev => ({
      ...prev,
      inputs: []
    }))
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Inputs are already added to formData during recording, so no need to set them again
    setPreviewInput('')
  }

  const addInput = (input) => {
    setFormData(prev => ({
      ...prev,
      inputs: [...prev.inputs, input]
    }))
  }

  const removeInput = (index) => {
    setFormData(prev => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index)
    }))
  }

  const clearInputs = () => {
    setFormData(prev => ({
      ...prev,
      inputs: []
    }))
    setRecordedInputs([])
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a combo name')
      return
    }
    
    if (formData.inputs.length === 0) {
      alert('Please add at least one input to the combo')
      return
    }

    if (editingCombo) {
      updateCustomCombo(editingCombo.id, formData)
    } else {
      saveCustomCombo(formData)
    }
    
    handleCancel()
    setCombos(getAllCustomCombos())
  }

  const handleCancel = () => {
    setEditingCombo(null)
    setShowCreateForm(false)
    setFormData({
      name: '',
      description: '',
      inputs: []
    })
    setRecordedInputs([])
    setCurrentInput('')
    setIsRecording(false)
  }

  const handleEdit = (combo) => {
    setEditingCombo(combo)
    setFormData({
      name: combo.name,
      description: combo.description,
      inputs: combo.inputs
    })
    setShowCreateForm(true)
  }

  const handleDelete = (comboId) => {
    if (window.confirm('Are you sure you want to delete this combo?')) {
      deleteCustomCombo(comboId)
      setCombos(getAllCustomCombos())
    }
  }

  const handleSelect = (combo) => {
    if (onComboSelect) {
      onComboSelect(combo)
    }
  }

  const getInputDisplay = (input) => {
    // Input key mappings for display
    const inputLabels = {
      [inputButtons.up]: '↑',
      [inputButtons.left]: '←',
      [inputButtons.down]: '↓',
      [inputButtons.right]: '→',
      [inputButtons.lp]: 'LP',
      [inputButtons.mp]: 'MP',
      [inputButtons.hp]: 'HP',
      [inputButtons.lk]: 'LK',
      [inputButtons.mk]: 'MK',
      [inputButtons.hk]: 'HK',
      // Arrow key mappings
      arrowup: '↑',
      arrowleft: '←',
      arrowdown: '↓',
      arrowright: '→'
    }
    
    return inputLabels[input] || input.toUpperCase()
  }

  const formatInputs = (inputs) => {
    return inputs.map(input => {
      return getInputDisplay(input)
    }).join(' → ')
  }

  const inputButtonsList = [
    { key: 'up', label: 'Up', value: inputButtons.up },
    { key: 'down', label: 'Down', value: inputButtons.down },
    { key: 'left', label: 'Left', value: inputButtons.left },
    { key: 'right', label: 'Right', value: inputButtons.right },
    { key: 'lp', label: 'LP', value: inputButtons.lp },
    { key: 'mp', label: 'MP', value: inputButtons.mp },
    { key: 'hp', label: 'HP', value: inputButtons.hp },
    { key: 'lk', label: 'LK', value: inputButtons.lk },
    { key: 'mk', label: 'MK', value: inputButtons.mk },
    { key: 'hk', label: 'HK', value: inputButtons.hk }
  ]

  return (
    <div className="custom-combo-manager">
      <div className="combo-manager-header">
        <h2>Custom Combos</h2>
        <div className="header-buttons">
          <button 
            className="create-button"
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Combo
          </button>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="combo-form">
          <h3>{editingCombo ? 'Edit Combo' : 'Create New Combo'}</h3>
          
          <div className="form-group">
            <label htmlFor="comboName">Combo Name:</label>
            <input
              type="text"
              id="comboName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter combo name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="comboDescription">Description (optional):</label>
            <textarea
              id="comboDescription"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter combo description"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Combo Inputs:</label>
            <div className="input-recording">
              <div className="recording-controls">
                <button
                  type="button"
                  className={`record-button ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
                </button>
                <span className="recording-hint">
                  {isRecording 
                    ? `Press keys (${inputButtons.up.toUpperCase()}/${inputButtons.down.toUpperCase()}/${inputButtons.left.toUpperCase()}/${inputButtons.right.toUpperCase()}/Arrow keys for movement, ${inputButtons.lp.toUpperCase()}/${inputButtons.mp.toUpperCase()}/${inputButtons.hp.toUpperCase()} for punches, ${inputButtons.lk.toUpperCase()}/${inputButtons.mk.toUpperCase()}/${inputButtons.hk.toUpperCase()} for kicks)${gamepadConnected ? ' or use gamepad' : ''}` 
                    : `Click to start recording inputs${gamepadConnected ? ' (keyboard or gamepad supported)' : ''}`
                  }
                </span>
              </div>
              
              {isRecording && (
                <div className="recording-status">
                  <span>Recording...</span>
                  {currentInput && <span className="current-input">Current: {getInputDisplay(currentInput)}</span>}
                  {gamepadConnected && <span className="gamepad-indicator">🎮 Gamepad Active</span>}
                </div>
              )}
            </div>

            <div className="manual-inputs">
              <h4>Or Add Inputs Manually:</h4>
              <div className="input-buttons">
                {inputButtonsList.map(btn => (
                  <button
                    key={btn.key}
                    type="button"
                    className="input-button"
                    onClick={() => addInput(btn.value)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="combo-preview">
              <h4>
                Combo Preview:
                {isRecording && <span className="recording-indicator"> 🎙️ Recording...</span>}
              </h4>
              <div className={`inputs-display ${isRecording ? 'recording-active' : ''}`}>
                {formData.inputs.length > 0 ? (
                  formData.inputs.map((input, index) => (
                    <div key={index} className="input-item">
                      <span className="input-value">{getInputDisplay(input)}</span>
                      <button
                        type="button"
                        className="remove-input"
                        onClick={() => removeInput(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="no-inputs">No inputs added yet</span>
                )}
              </div>
              <button
                type="button"
                className="clear-inputs"
                onClick={clearInputs}
                disabled={formData.inputs.length === 0}
              >
                Clear All Inputs
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button className="save-button" onClick={handleSave}>
              {editingCombo ? 'Update Combo' : 'Save Combo'}
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="combos-list">
          {combos.length > 0 ? (
            combos.map(combo => (
              <div key={combo.id} className="combo-item">
                <div className="combo-info">
                  <h4 className="combo-name">{combo.name}</h4>
                  {combo.description && (
                    <p className="combo-description">{combo.description}</p>
                  )}
                  <div className="combo-inputs">
                    <strong>Inputs:</strong> {formatInputs(combo.inputs)}
                  </div>
                  <div className="combo-meta">
                    <span>Created: {new Date(combo.createdAt).toLocaleDateString()}</span>
                    {combo.updatedAt !== combo.createdAt && (
                      <span>Updated: {new Date(combo.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="combo-actions">
                  <button
                    className="select-button"
                    onClick={() => handleSelect(combo)}
                  >
                    Use Combo
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(combo)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(combo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-combos">
              <p>No custom combos saved yet.</p>
              <p>Create your first combo to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomComboManager
