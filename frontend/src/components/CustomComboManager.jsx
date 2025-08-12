import React, { useState, useEffect } from 'react'
import { useTrainingStore } from '../stores/trainingStore'
import { useSettingsStore } from '../stores/settingsStore'
import './CustomComboManager.css'

const CustomComboManager = ({ onComboSelect, onClose }) => {
  const { 
    getAllCustomCombos, 
    saveCustomCombo, 
    updateCustomCombo, 
    deleteCustomCombo 
  } = useTrainingStore()
  const { inputButtons } = useSettingsStore()
  
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
    
    // Map common keys to input buttons
    const keyMap = {
      'w': inputButtons.up,
      's': inputButtons.down,
      'a': inputButtons.left,
      'd': inputButtons.right,
      'j': inputButtons.lp,
      'k': inputButtons.mp,
      'l': inputButtons.hp,
      'u': inputButtons.lk,
      'i': inputButtons.mk,
      'o': inputButtons.hk
    }
    
    if (keyMap[key]) {
      setRecordedInputs(prev => [...prev, keyMap[key]])
      setCurrentInput(keyMap[key])
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordedInputs([])
    setCurrentInput('')
  }

  const stopRecording = () => {
    setIsRecording(false)
    setFormData(prev => ({
      ...prev,
      inputs: recordedInputs
    }))
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

  const formatInputs = (inputs) => {
    return inputs.map(input => {
      // Find the key name for the input
      const keyName = Object.keys(inputButtons).find(key => inputButtons[key] === input)
      return keyName ? keyName.toUpperCase() : input
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
                    ? 'Press keys (WASD for movement, JKL for punches, UIO for kicks)' 
                    : 'Click to start recording inputs'
                  }
                </span>
              </div>
              
              {isRecording && (
                <div className="recording-status">
                  <span>Recording...</span>
                  {currentInput && <span className="current-input">Current: {currentInput}</span>}
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
              <h4>Combo Preview:</h4>
              <div className="inputs-display">
                {formData.inputs.length > 0 ? (
                  formData.inputs.map((input, index) => (
                    <div key={index} className="input-item">
                      <span className="input-value">{input}</span>
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
