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
    addInputForTracking,
    resetGame,
    startSession,
    updateTimer
  } = useGameStore()

  const {
    currentSession,
    isTraining,
    endTrainingSession,
    updateSessionScore,
    addSessionInput,
    updateSessionTimer
  } = useTrainingStore()

  const socket = useSocket()
  const inputButtons = useInputButtons()
  const { attackButtonMode, theme } = useSettingsStore()
  const { isConnected: gamepadConnected, setInputCallback } = useGamepad()

  const [showEndDialog, setShowEndDialog] = useState(false)
  const [completedSession, setCompletedSession] = useState(null)
  const previousScoreRef = useRef(null)

  // Initialize game state when component mounts
  useEffect(() => {
    // Only start playing if there's an active training session
    if (isTraining && currentSession) {
      setGameState('playing')
      startSession()
    } else {
      setGameState('menu')
      resetGame()
    }
  }, [setGameState, resetGame, isTraining, currentSession, startSession])

  // Real-time timer effect - updates every second
  useEffect(() => {
    if (gameState !== 'playing') return

    const timerInterval = setInterval(() => {
      if (isTraining && currentSession) {
        updateSessionTimer()
      } else {
        updateTimer()
      }
    }, 1000) // Update every second

    return () => clearInterval(timerInterval)
  }, [gameState, isTraining, updateTimer, updateSessionTimer])

  // Monitor when training session ends and show dialog
  useEffect(() => {
    if (!isTraining && currentSession === null && showEndDialog === false) {
      // Training session just ended, show the end dialog
      // We need to get the completed session from the sessions array
      const { sessions } = useTrainingStore.getState()
      const lastSession = sessions[0] // Most recent session
      if (lastSession && !completedSession) {
        setCompletedSession(lastSession)
        setShowEndDialog(true)
      }
    }
  }, [isTraining, currentSession, showEndDialog, completedSession])

  useEffect(() => {
    if (socket) {
      socket.on('gameState', (newState) => {
        // The backend sends an object, but we need a string for the frontend
        if (newState && typeof newState === 'object' && newState.status) {
          // Map backend status to frontend gameState
          const statusMap = {
            'waiting': 'menu',
            'active': 'playing'
          }
          const mappedState = statusMap[newState.status] || 'playing'
          setGameState(mappedState)
        } else if (typeof newState === 'string') {
          setGameState(newState)
        }
      })

      socket.on('connect', () => {
      })

      socket.on('disconnect', () => {
      })

      socket.on('connect_error', (error) => {
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

      const validInputs = [...movementKeys, ...punchKeys, ...kickKeys]

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
    // For training mode, track inputs for wrong input detection but don't score them
    if (isTraining && currentSession) {
      // Add input to gameStore for tracking only (TrainingInputDisplay needs this for wrong input detection)
      // The scoring will be handled separately by TrainingInputDisplay
      addInputForTracking(input)
    } else {
      // For free play mode, track all inputs normally
      addInput(input)
    }
    // TrainingInputDisplay component will handle all training scoring and ending the session when progress reaches target
  }

  // Handle ending training session
  const handleEndTraining = () => {
    if (isTraining && currentSession) {
      const completedSession = endTrainingSession(currentSession.score)
      if (completedSession) {
        setCompletedSession(completedSession)
        setShowEndDialog(true)
      }
    } else {
      navigate('/')
    }
  }

  const handleViewLeaderboard = () => {
    setShowEndDialog(false)
    setCompletedSession(null)
    navigate('/leaderboard')
  }

  const handleBackToMenu = () => {
    setShowEndDialog(false)
    setCompletedSession(null)
    navigate('/')
  }

  return (
    <div className={`game-canvas ${theme}`}>
      <GamepadStatus />

      {isTraining && currentSession && (
        <TrainingInputDisplay />
      )}

      {gameState === 'menu' && !isTraining ? (
        // Start screen when no training session is active
        <div className="game-start-screen">
          <div className="start-screen-content">
            <h2>Welcome to Speed Motioner</h2>
            <p>Ready to improve your fighting game skills?</p>
            <div className="start-screen-buttons">
              <button 
                className="start-training-btn"
                onClick={() => navigate('/')}
              >
                Start Training
              </button>
              <button 
                className="free-play-btn"
                onClick={() => setGameState('playing')}
              >
                Free Play Mode
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Game interface when playing
        <div className="game-main-layout">
          <div className="game-stats-panel">
            <ScoreDisplay score={isTraining && currentSession ? currentSession.score : score} />
            {isTraining && currentSession && (
              <div className="training-info">
                <h3>Training Session</h3>
                <p>Mode: {String(currentSession.mode || 'Unknown')}</p>
                <p>Difficulty: {String(currentSession.difficulty || 'Unknown')}</p>
                <p>Duration: {currentSession.score.timeElapsed || 0}s</p>
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
            {!isTraining && (
              <button 
                className="start-training-btn"
                onClick={() => navigate('/')}
              >
                Start Training
              </button>
            )}
            <button onClick={handleEndTraining}>
              {isTraining ? 'End Training' : 'Back to Menu'}
            </button>
          </div>
        </div>
      )}

      {showEndDialog && completedSession && (
        <div className="end-session-dialog">
          <div className="dialog-content">
            <h2>Training Complete!</h2>
            <div className="session-results">
              <div className="result-item points">
                <span className="result-label">Total Points:</span>
                <span className="result-value">{(completedSession.score?.points || 0).toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy:</span>
                <span className="result-value">{(completedSession.score?.accuracy || 0).toFixed(1)}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">Max Combo:</span>
                <span className="result-value">{completedSession.score?.maxCombo || 0}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total Inputs:</span>
                <span className="result-value">{completedSession.score?.totalInputs || 0}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Duration:</span>
                <span className="result-value">{Math.floor(completedSession.score?.timeElapsed || 0)}s</span>
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
