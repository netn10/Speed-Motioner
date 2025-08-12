import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useSocket } from '../hooks/useSocket'
import { useInputButtons } from '../hooks/useInputButtons'
import { useSettingsStore } from '../stores/settingsStore'
import { useGamepad } from '../hooks/useGamepad'
import InputDisplay from './InputDisplay'
import ScoreDisplay from './ScoreDisplay'
import TrainingInputDisplay from './TrainingInputDisplay'
import GamepadStatus from './GamepadStatus'
import './GameCanvas.css'

const GameCanvas = () => {
  const navigate = useNavigate()
  const {
    gameState,
    inputs,
    score,
    setGameState,
    addInput,
    resetGame
  } = useGameStore()

  const {
    currentSession,
    isTraining,
    endTrainingSession,
    updateSessionScore,
    addSessionInput
  } = useTrainingStore()

  const socket = useSocket()
  const inputButtons = useInputButtons()
  const { attackButtonMode } = useSettingsStore()
  const { isConnected: gamepadConnected, setInputCallback } = useGamepad()

  const [showEndDialog, setShowEndDialog] = useState(false)
  const previousScoreRef = useRef(null)

  // Initialize game state when component mounts
  useEffect(() => {
    console.log('GameCanvas mounted, initializing game state')
    console.log('Training state on mount:', { isTraining, currentSession })
    console.log('LocalStorage training data:', localStorage.getItem('speed-motioner-training'))

    setGameState('playing')

    // Only reset game if there's no active training session
    if (!isTraining || !currentSession) {
      console.log('No active training session, resetting game')
      resetGame()
    } else {
      console.log('Active training session found, preserving state')
    }
  }, [setGameState, resetGame, isTraining, currentSession])

  useEffect(() => {
    if (socket) {
      socket.on('gameState', (newState) => {
        console.log('Received gameState:', newState, typeof newState)
        // The backend sends an object, but we need a string for the frontend
        if (newState && typeof newState === 'object' && newState.status) {
          // Map backend status to frontend gameState
          const statusMap = {
            'waiting': 'menu',
            'active': 'playing'
          }
          const mappedState = statusMap[newState.status] || 'playing'
          console.log('Mapping backend status:', newState.status, 'to frontend state:', mappedState)
          setGameState(mappedState)
        } else if (typeof newState === 'string') {
          console.log('Setting string gameState:', newState)
          setGameState(newState)
        } else {
          console.warn('Unexpected gameState format:', newState)
        }
      })

      socket.on('connect', () => {
        console.log('Socket connected successfully')
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      socket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error)
      })

      return () => {
        socket.off('gameState')
        socket.off('connect')
        socket.off('disconnect')
        socket.off('connect_error')
      }
    }
  }, [socket, setGameState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      let key = e.key.toLowerCase()

      // Prevent browser scrolling for arrow keys
      if (key.startsWith('arrow')) {
        e.preventDefault()
      }

      // Get all valid keys based on attack button mode
      const movementKeys = ['up', 'down', 'left', 'right'].map(action => inputButtons[action])
      const punchKeys = attackButtonMode === 6
        ? ['lp', 'mp', 'hp'].map(action => inputButtons[action])
        : ['lp', 'mp'].map(action => inputButtons[action])
      const kickKeys = attackButtonMode === 6
        ? ['lk', 'mk', 'hk'].map(action => inputButtons[action])
        : ['lk', 'mk'].map(action => inputButtons[action])

      const validKeys = [...movementKeys, ...punchKeys, ...kickKeys]

      // Check if the pressed key is valid
      if (validKeys.includes(key)) {
        handleInputForTraining(key)
        if (socket) {
          socket.emit('input', { key, timestamp: Date.now() })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [socket, inputButtons, attackButtonMode])

  // Gamepad input event handling
  useEffect(() => {
    if (!gamepadConnected) {
      setInputCallback(null)
      return
    }

    const handleGamepadInput = (input) => {
      // Convert action names to actual key bindings to match keyboard input
      let mappedInput = input

      // Convert action names to actual key bindings
      if (input === 'lp') mappedInput = inputButtons.lp
      else if (input === 'mp') mappedInput = inputButtons.mp
      else if (input === 'hp') mappedInput = inputButtons.hp
      else if (input === 'lk') mappedInput = inputButtons.lk
      else if (input === 'mk') mappedInput = inputButtons.mk
      else if (input === 'hk') mappedInput = inputButtons.hk
      else if (input === 'block') mappedInput = inputButtons.block
      else if (input === 'special') mappedInput = inputButtons.special
      // Convert movement actions to key bindings too
      else if (input === 'up') mappedInput = inputButtons.up
      else if (input === 'down') mappedInput = inputButtons.down
      else if (input === 'left') mappedInput = inputButtons.left
      else if (input === 'right') mappedInput = inputButtons.right

      // Get all valid keys based on attack button mode
      const movementKeys = [inputButtons.up, inputButtons.down, inputButtons.left, inputButtons.right]
      const punchKeys = attackButtonMode === 6
        ? [inputButtons.lp, inputButtons.mp, inputButtons.hp]
        : [inputButtons.lp, inputButtons.mp]
      const kickKeys = attackButtonMode === 6
        ? [inputButtons.lk, inputButtons.mk, inputButtons.hk]
        : [inputButtons.lk, inputButtons.mk]
      const otherKeys = [inputButtons.block, inputButtons.special]

      const validInputs = [...movementKeys, ...punchKeys, ...kickKeys, ...otherKeys]

      if (validInputs.includes(mappedInput)) {
        handleInputForTraining(mappedInput)
        if (socket) {
          socket.emit('input', { key: mappedInput, timestamp: Date.now() })
        }
      }
    }

    setInputCallback(handleGamepadInput)

    return () => {
      setInputCallback(null)
    }
  }, [gamepadConnected, setInputCallback, socket, inputButtons, attackButtonMode])

  // Handle input tracking for training session
  const handleInputForTraining = (input) => {
    addInput(input)
    if (isTraining && currentSession) {
      addSessionInput(input)

      // Check if training session should end
      const newTotalInputs = (currentSession.score.totalInputs || 0) + 1
      const targetInputs = currentSession.targetInputs || 10

      if (newTotalInputs >= targetInputs) {
        // End training session automatically
        setTimeout(() => {
          handleEndTraining()
        }, 500) // Small delay to show the final input
      }
    }
  }

  // Handle ending training session
  const handleEndTraining = () => {
    if (isTraining && currentSession) {
      endTrainingSession(currentSession.score)
      setShowEndDialog(true)
    } else {
      navigate('/')
    }
  }

  const handleViewLeaderboard = () => {
    setShowEndDialog(false)
    navigate('/leaderboard')
  }

  const handleBackToMenu = () => {
    setShowEndDialog(false)
    navigate('/')
  }

  return (
    <div className="game-canvas">
      <GamepadStatus />

      {isTraining && currentSession && (
        <TrainingInputDisplay />
      )}

      <div className="game-main-layout">
        <div className="game-stats-panel">
          <ScoreDisplay score={isTraining && currentSession ? currentSession.score : score} />
          {isTraining && currentSession && (
            <div className="training-info">
              <h3>Training Session</h3>
              <p>Mode: {String(currentSession.mode || 'Unknown')}</p>
              <p>Difficulty: {String(currentSession.difficulty || 'Unknown')}</p>
              <p>Duration: {Math.floor((Date.now() - (currentSession.startTime || Date.now())) / 1000)}s</p>
            </div>
          )}
          {!isTraining && (
            <div className="game-info">
              <h3>Free Play Mode</h3>
              <p>Press keys to practice inputs</p>
              <p>Game State: {String(gameState)}</p>
            </div>
          )}
        </div>

        <div className="game-center-area">
          <InputDisplay inputs={inputs} />
        </div>

        <div className="game-controls">
          <button onClick={handleEndTraining}>
            {isTraining ? 'End Training' : 'Back to Menu'}
          </button>
        </div>
      </div>

      {showEndDialog && (
        <div className="end-session-dialog">
          <div className="dialog-content">
            <h2>Training Complete!</h2>
            <div className="session-results">
              <div className="result-item points">
                <span className="result-label">Total Points:</span>
                <span className="result-value">{(currentSession?.score?.points || 0).toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy:</span>
                <span className="result-value">{(currentSession?.score?.accuracy || 0).toFixed(1)}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">Max Combo:</span>
                <span className="result-value">{currentSession?.score?.maxCombo || 0}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total Inputs:</span>
                <span className="result-value">{currentSession?.score?.totalInputs || 0}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Duration:</span>
                <span className="result-value">{Math.floor(currentSession?.score?.timeElapsed || 0)}s</span>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="leaderboard-btn" onClick={handleViewLeaderboard}>
                🏆 View Leaderboard
              </button>
              <button className="menu-btn" onClick={handleBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameCanvas
