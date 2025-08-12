import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useInputButtons } from '../hooks/useInputButtons'
import { useSettingsStore } from '../stores/settingsStore'
import './TrainingInputDisplay.css'

const TrainingInputDisplay = () => {
  const { currentSession, updateSessionScore, endTrainingSession } = useTrainingStore()
  const trainingMode = currentSession?.mode || 'motion'
  const difficulty = currentSession?.difficulty || 'medium'
  const inputButtons = useInputButtons()
  const { attackButtonMode, theme } = useSettingsStore()
  const [currentInput, setCurrentInput] = useState([])
  const [inputIndex, setInputIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(null) // 'success', 'fail', or 'wrong'
  const [pointsEarned, setPointsEarned] = useState(0)
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render when needed
  const timerRef = useRef(null)
  const timeoutRef = useRef(null)
  const inputStartTimeRef = useRef(null)
  const inputStartCountRef = useRef(0)
  const processingSuccessRef = useRef(false)
  const timeoutTriggeredRef = useRef(false)
  const startNewInputCallCount = useRef(0)
  const timeoutCount = useRef(0)

  // Difficulty-based timing (in milliseconds)
  const getDifficultyTiming = () => {
    // If custom mode and custom timing is set, use that
    if (trainingMode === 'custom' && currentSession?.customTiming) {
      return currentSession.customTiming
    }
    
    // Otherwise use standard difficulty timing
    switch (difficulty.toLowerCase()) {
      case 'easy': return 3000 // 3 seconds
      case 'medium': return 2000 // 2 seconds  
      case 'hard': return 1000 // 1 second
      default: return 2000
    }
  }

  // Get active attack buttons based on mode
  const getActiveAttackButtons = () => {
    const allAttackButtons = [inputButtons.lp, inputButtons.mp, inputButtons.hp, inputButtons.lk, inputButtons.mk, inputButtons.hk]
    if (attackButtonMode === 4) {
      return [inputButtons.lp, inputButtons.mp, inputButtons.lk, inputButtons.mk]
    }
    return allAttackButtons
  }

  const activeAttackButtons = getActiveAttackButtons()

  // Memoize inputButtons to prevent unnecessary useEffect re-runs
  const stableInputButtons = useMemo(() => inputButtons, [inputButtons])

  // Training patterns based on the backend
  const trainingPatterns = {
    motion: [
      // Single movement inputs
      [inputButtons.up], // up
      [inputButtons.down], // down
      [inputButtons.left], // left
      [inputButtons.right], // right
      // Single attack inputs
      [activeAttackButtons[0]], // first attack
      [activeAttackButtons[1]], // second attack
    ],
    motions: [
      // Quarter-Circle Forward (QCF) - 236 + attack
      [inputButtons.down, inputButtons.right, activeAttackButtons[0]], // QCF + LP
      [inputButtons.down, inputButtons.right, activeAttackButtons[1]], // QCF + MP
      
      // Quarter-Circle Back (QCB) - 214 + attack  
      [inputButtons.down, inputButtons.left, activeAttackButtons[0]], // QCB + LP
      [inputButtons.down, inputButtons.left, activeAttackButtons[1]], // QCB + MP
      
      // Dragon Punch (DP) - 623 + attack
      [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // DP + LP
      [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[1]], // DP + MP
      
      // Half-Circle Forward (HCF) - 41236 + attack
      [inputButtons.left, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // HCF + LP (simplified)
      
      // Half-Circle Back (HCB) - 63214 + attack
      [inputButtons.right, inputButtons.down, inputButtons.left, activeAttackButtons[0]], // HCB + LP (simplified)
      
      // Charge Back-Forward (simplified for training)
      [inputButtons.left, inputButtons.right, activeAttackButtons[0]], // Charge B-F + LP
      
      // Charge Down-Up (simplified for training)  
      [inputButtons.down, inputButtons.up, activeAttackButtons[0]], // Charge D-U + LP
      
      // Double Quarter-Circle Forward - 236236 + attack
      [inputButtons.down, inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // D-QCF + LP
    ],
    combos: [
      [activeAttackButtons[0], activeAttackButtons[0]], // double attack
      [activeAttackButtons[0], activeAttackButtons[1]], // first + second
      [activeAttackButtons[1], activeAttackButtons[0]], // second + first
      [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[0]], // triple first attack
      [inputButtons.up, activeAttackButtons[0]], // up + attack
    ],
    custom: [
      // Mixed patterns for custom challenge
      [inputButtons.up], // up
      [inputButtons.down], // down
      [inputButtons.left], // left
      [inputButtons.right], // right
      [activeAttackButtons[0]], // first attack
      [activeAttackButtons[1]], // second attack
      [inputButtons.up, activeAttackButtons[0]], // up + attack
      [inputButtons.down, activeAttackButtons[0]], // down + attack
      [inputButtons.left, activeAttackButtons[0]], // left + attack
      [inputButtons.right, activeAttackButtons[0]], // right + attack
      [activeAttackButtons[0], activeAttackButtons[0]], // double attack
      [activeAttackButtons[0], activeAttackButtons[1]], // attack + attack
      [inputButtons.up, inputButtons.down], // up + down
      [inputButtons.left, inputButtons.right], // left + right
      [inputButtons.up, activeAttackButtons[0], inputButtons.down], // up + attack + down
      // Add some motion inputs to custom mode too
      [inputButtons.down, inputButtons.right, activeAttackButtons[0]], // QCF + LP
      [inputButtons.down, inputButtons.left, activeAttackButtons[0]], // QCB + LP
      [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // DP + LP
    ]
  }

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
    [inputButtons.block]: 'Block',
    // Arrow key mappings
    arrowup: '↑',
    arrowleft: '←',
    arrowdown: '↓',
    arrowright: '→'
  }

  const { inputs } = useGameStore()

  // Start new input sequence
  const startNewInput = () => {
    // Prevent multiple simultaneous calls
    if (processingSuccessRef.current) {
      return
    }
    
    startNewInputCallCount.current += 1

    const patterns = trainingPatterns[trainingMode] || trainingPatterns.motion
    const randomIndex = Math.floor(Math.random() * patterns.length)
    const selectedPattern = patterns[randomIndex]

    setCurrentInput(selectedPattern)
    setInputIndex(0)
    setIsCompleted(false)
    setShowFeedback(null)
    setPointsEarned(0)
    processingSuccessRef.current = false  // Reset processing flag for new input
    timeoutTriggeredRef.current = false  // Reset timeout flag for new input

    // Start timer
    const timing = getDifficultyTiming()
    setTimeRemaining(timing)
    inputStartTimeRef.current = Date.now()
    // Record the current input count to ignore previous inputs
    inputStartCountRef.current = inputs.length

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Also clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 100
        
        if (newTime <= 100) {
          console.log('⏰ Timer reached zero! Triggering timeout...')
          // Time's up - mark as failed
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          // Use timeoutRef to ensure this only runs once
          if (!timeoutRef.current) {
            console.log('🔄 Setting up timeout callback...')
            timeoutRef.current = setTimeout(() => {
              console.log('🚀 Calling handleInputTimeout...')
              handleInputTimeout()
              timeoutRef.current = null
            }, 0)
          } else {
            console.log('⚠️ Timeout already scheduled, skipping...')
          }
          return 0
        }
        return newTime
      })
    }, 100)
  }

  useEffect(() => {
    // Only start new input if we're not already processing
    if (!processingSuccessRef.current) {
      startNewInput()
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [trainingMode, attackButtonMode]) // Removed stableInputButtons dependency

  // Handle successful input completion
  const handleInputSuccess = () => {
    if (isCompleted || processingSuccessRef.current || timeoutTriggeredRef.current) {
      return
    }

    processingSuccessRef.current = true
    setIsCompleted(true)
    setShowFeedback('success')

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Calculate completion time and points
    const completionTime = Date.now() - inputStartTimeRef.current
    const maxTime = getDifficultyTiming()
    const timeBonus = Math.max(0, (maxTime - completionTime) / maxTime)

    // Base points for completing the input correctly
    let basePoints = 100

    // Bonus points based on difficulty
    const difficultyMultiplier = {
      'easy': 1.0,
      'medium': 1.2,
      'hard': 1.5
    }[difficulty.toLowerCase()] || 1.0

    // Bonus points for complex inputs (more buttons = more points)
    const complexityBonus = currentInput.length > 1 ? (currentInput.length - 1) * 25 : 0

    // Time bonus (up to 50% more points for fast completion)
    const timeBonusPoints = Math.round(basePoints * timeBonus * 0.5)

    const totalPoints = Math.round((basePoints + complexityBonus) * difficultyMultiplier + timeBonusPoints)

    // Update score
    const currentScore = currentSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0, maxCombo: 0 }
    const newScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs + 1,
      points: (currentScore.points || 0) + totalPoints,
      accuracy: ((currentScore.correctInputs + 1) / (currentScore.totalInputs + 1)) * 100,
      maxCombo: Math.max(currentScore.maxCombo || 0, currentScore.correctInputs + 1) // This tracks total correct inputs, not max combo streak
    }

    updateSessionScore(newScore)
    setPointsEarned(totalPoints)

    // Start new input after delay
    setTimeout(() => {
      processingSuccessRef.current = false  // Reset the processing flag
      startNewInput()
    }, 1500)
  }

  // Handle input timeout
  const handleInputTimeout = () => {
    console.log('🕐 Timeout triggered!', { timeoutCount: timeoutCount.current })
    timeoutCount.current += 1

    if (isCompleted) {
      console.log('❌ Timeout ignored - already completed')
      return
    }
    setIsCompleted(true)
    setShowFeedback('fail')

    // Update score for failed attempt - get current score from store to ensure we have the latest
    const { currentSession: latestSession } = useTrainingStore.getState()
    const currentScore = latestSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
    console.log('📊 Before timeout update:', currentScore)
    
    const newScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs,
      points: currentScore.points || 0, // No points for timeout
      accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
    }
    
    console.log('📊 After timeout update:', newScore)
    updateSessionScore(newScore)

    // Start new input after delay
    setTimeout(() => {
      // Reset the timeout flag before starting new input
      timeoutTriggeredRef.current = false
      startNewInput()
    }, 500) // Reduced from 1500ms to 500ms
  }

  // Check if current input sequence is completed
  useEffect(() => {
    if (currentInput.length === 0 || inputs.length === 0 || isCompleted || processingSuccessRef.current) return

    // Only consider inputs that occurred after this sequence started
    const newInputs = inputs.slice(inputStartCountRef.current)
    if (newInputs.length === 0) return

    // For single input patterns, just check the last new input
    if (currentInput.length === 1) {
      const lastInput = newInputs[newInputs.length - 1]
      const expectedInput = currentInput[0]

      if (lastInput === expectedInput) {
        handleInputSuccess()
        return
      }
    } else {
      // For multi-input patterns, check if we have enough new inputs and they match
      if (newInputs.length >= currentInput.length) {
        const recentNewInputs = newInputs.slice(-currentInput.length)
        const isMatch = currentInput.length === recentNewInputs.length &&
          currentInput.every((expectedInput, index) => expectedInput === recentNewInputs[index])

        if (isMatch) {
          handleInputSuccess()
          return
        }
      }
    }

    // Check for wrong inputs and update progress by 1
    const lastInput = newInputs[newInputs.length - 1]
    const expectedFirstInput = currentInput[0]

    // If this is a new input that doesn't match what we expect, increment progress by 1
    if (lastInput !== expectedFirstInput && inputIndex === 0) {
      // Show wrong input feedback
      setShowFeedback('wrong')

      // Reset timer for wrong input
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Reset timer to full duration
      const timing = getDifficultyTiming()
      setTimeRemaining(timing)
      inputStartTimeRef.current = Date.now()

      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 100
          
          if (newTime <= 100) {
            // Time's up - mark as failed
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            // Use timeoutRef to ensure this only runs once
            if (!timeoutRef.current) {
              timeoutRef.current = setTimeout(() => {
                handleInputTimeout()
                timeoutRef.current = null
              }, 0)
            }
            return 0
          }
          return newTime
        })
      }, 100)

      // Don't update progress for wrong inputs - progress should only be made on completion or timeout
      // This ensures progress is only made when user finishes all their input or when time is up
      console.log('❌ Wrong input (no progress):', {
        expected: expectedFirstInput,
        actual: lastInput,
        inputStartCount: inputStartCountRef.current
      })

      // Clear wrong input feedback after a short delay
      setTimeout(() => {
        setShowFeedback(null)
      }, 1000)
    }
  }, [inputs, currentInput, isCompleted, inputIndex])

  // Track progress through current input sequence
  useEffect(() => {
    if (currentInput.length === 0 || inputs.length === 0) return

    // Only consider inputs that occurred after this sequence started
    const newInputs = inputs.slice(inputStartCountRef.current)
    if (newInputs.length === 0) {
      setInputIndex(0)
      return
    }

    // Check for partial matches from the end of the new inputs array
    let progressIndex = 0

    for (let i = 1; i <= Math.min(currentInput.length, newInputs.length); i++) {
      const recentInputs = newInputs.slice(-i)
      const expectedInputs = currentInput.slice(0, i)

      const isPartialMatch = expectedInputs.every((expected, index) => expected === recentInputs[index])

      if (isPartialMatch) {
        progressIndex = i
      }
    }



    setInputIndex(progressIndex)
  }, [inputs, currentInput])

  // Monitor session score changes for debugging
  useEffect(() => {
    if (currentSession?.score) {
      // Force re-render to ensure UI updates
      setForceUpdate(prev => prev + 1)
    }
  }, [currentSession?.score?.totalInputs, currentSession?.score?.correctInputs])

  // Check if training should end immediately when progress exceeds target
  useEffect(() => {
    if (!currentSession) return
    
    const currentProgress = currentSession.score?.totalInputs || 0
    const targetInputs = currentSession.targetInputs || 10
    
    if (currentProgress >= targetInputs && !isCompleted) {
      // End training session immediately when progress reaches or exceeds target
      setIsCompleted(true)
      // Don't show success feedback here - this could be triggered by a timeout or wrong input
      // Only show success feedback when an actual successful input completion happens
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      // End session immediately
      setTimeout(() => {
        endTrainingSession(currentSession.score)
      }, 1000)
    }
  }, [currentSession?.score?.totalInputs, currentSession?.targetInputs, currentSession, endTrainingSession, isCompleted])

  const getInputDisplay = (input) => {
    return inputLabels[input] || input.toUpperCase()
  }

  // Get motion pattern name for display
  const getMotionPatternName = (pattern) => {
    // Check if this pattern matches any known motion inputs
    const patternString = pattern.map(input => getInputDisplay(input)).join('')
    
    // Check for common motion patterns
    if (pattern.length >= 3) {
      const directions = pattern.slice(0, -1) // All but last (attack) input
      const directionString = directions.map(input => getInputDisplay(input)).join('')
      
      if (directionString === '↓→') return 'QCF (236)'
      if (directionString === '↓←') return 'QCB (214)'
      if (directionString === '→↓→') return 'DP (623)'
      if (directionString === '←↓→') return 'HCF (41236)'
      if (directionString === '→↓←') return 'HCB (63214)'
      if (directionString === '←→') return 'Charge B-F'
      if (directionString === '↓↑') return 'Charge D-U'
      if (directionString === '↓→↓→') return 'D-QCF (236236)'
    }
    
    return null
  }

  if (!currentInput.length) {
    return null
  }

  return (
    <div className={`training-input-display ${theme} ${showFeedback ? `feedback-${showFeedback}` : ''}`}>
      <div className="training-header">
        <h3>Training: {trainingMode.charAt(0).toUpperCase() + trainingMode.slice(1)}</h3>
        <span className="difficulty-badge">{difficulty}</span>
      </div>

             {/* Progress Bar */}
       <div className="progress-container">
         <div className="progress-label">
           Progress: {currentSession?.score?.totalInputs || 0} / {currentSession?.targetInputs || 10}
         </div>
         <div className="progress-bar">
           <div
             className="progress-fill"
             style={{
               width: `${Math.min(((currentSession?.score?.totalInputs || 0) / (currentSession?.targetInputs || 10)) * 100, 100)}%`
             }}
           />
         </div>
       </div>

      {/* Timer Bar */}
      <div className="timer-container">
        <div className="timer-label">Time Remaining</div>
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{
              width: `${(timeRemaining / getDifficultyTiming()) * 100}%`,
              backgroundColor: timeRemaining < getDifficultyTiming() * 0.3 ? '#e74c3c' : '#2ecc71'
            }}
          />
        </div>
        <div className="timer-text">{(timeRemaining / 1000).toFixed(1)}s</div>
      </div>

      <div className="input-instruction">
        <span className="instruction-text">Perform this input:</span>
        {trainingMode === 'motions' && getMotionPatternName(currentInput) && (
          <div className="motion-pattern-name">
            {getMotionPatternName(currentInput)}
          </div>
        )}
        <div className="input-sequence">
          {currentInput.map((input, index) => (
            <span
              key={index}
              className={`input-key ${index < inputIndex ? 'completed' : ''}`}
            >
              {getInputDisplay(input)}
            </span>
          ))}
        </div>
      </div>

      {/* Feedback Display */}
      {showFeedback && (
        <div className={`feedback-message ${showFeedback}`}>
          {showFeedback === 'success' && (
            <div>
              <span className="success-icon">✅</span>
              <span>Correct! +{pointsEarned} points</span>
            </div>
          )}
          {showFeedback === 'fail' && (
            <div>
              <span className="fail-icon">❌</span>
              <span>Time's up!</span>
            </div>
          )}
          {showFeedback === 'wrong' && (
            <div>
              <span className="wrong-icon">❌</span>
              <span>Wrong Input!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainingInputDisplay
