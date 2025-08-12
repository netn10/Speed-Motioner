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
      console.log('❌ startNewInput blocked - already processing success')
      return
    }
    
    startNewInputCallCount.current += 1
    console.log('🔄 startNewInput called (call #' + startNewInputCallCount.current + ')', {
      trainingMode,
      attackButtonMode,
      inputButtons,
      currentInput: currentInput.length,
      isCompleted,
      processingSuccessRef: processingSuccessRef.current,
      timeoutTriggeredRef: timeoutTriggeredRef.current
    })

    const patterns = trainingPatterns[trainingMode] || trainingPatterns.motion
    const randomIndex = Math.floor(Math.random() * patterns.length)
    const selectedPattern = patterns[randomIndex]

    console.log('New pattern selected:', {
      trainingMode,
      pattern: selectedPattern,
      patternDisplay: selectedPattern.map(input => getInputDisplay(input)),
      patternTypes: selectedPattern.map(input => typeof input),
      inputButtons,
      activeAttackButtons,
      allPatterns: patterns
    })

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
      console.log('⏹️ Clearing existing timer before starting new one')
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Also clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Start countdown timer
    console.log('⏱️ Starting new timer with timing:', timing)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 100
        console.log('⏱️ Timer tick:', { prev, newTime, willTimeout: newTime <= 100, timerId: timerRef.current })
        
        if (newTime <= 100) {
          // Time's up - mark as failed
          console.log('⏰ Timer reached 0, calling handleInputTimeout')
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
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered for startNewInput', {
      trainingMode,
      attackButtonMode,
      stableInputButtons: Object.keys(stableInputButtons)
    })
    
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
    console.log('🎯 handleInputSuccess called', {
      isCompleted,
      processingSuccessRef: processingSuccessRef.current,
      timeoutTriggeredRef: timeoutTriggeredRef.current,
      timeRemaining
    })

    if (isCompleted || processingSuccessRef.current || timeoutTriggeredRef.current) {
      console.log('❌ Success ignored - already completed, processing, or timeout triggered')
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

    console.log('🎉 CORRECT FULL INPUT! +' + totalPoints + ' points!', {
      pattern: currentInput.map(input => getInputDisplay(input)).join(' + '),
      completionTime: completionTime + 'ms',
      timeBonus: Math.round(timeBonus * 100) + '%',
      basePoints,
      complexityBonus,
      difficultyMultiplier,
      timeBonusPoints,
      totalPoints,
      newScore
    })

    // Start new input after delay
    setTimeout(() => {
      processingSuccessRef.current = false  // Reset the processing flag
      startNewInput()
    }, 1500)
  }

  // Handle input timeout
  const handleInputTimeout = () => {
    timeoutCount.current += 1
    console.log('🕐 TIMEOUT TRIGGERED! (timeout #' + timeoutCount.current + ')', {
      isCompleted,
      currentSession: currentSession?.score,
      currentInput,
      timeoutTriggeredRef: timeoutTriggeredRef.current
    })

    if (isCompleted) {
      console.log('❌ Timeout ignored - already completed')
      return
    }
    setIsCompleted(true)
    setShowFeedback('fail')

    // Update score for failed attempt
    const currentScore = currentSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
    const newScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs,
      points: currentScore.points || 0, // No points for timeout
      accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
    }

    console.log('📊 Updating score on timeout:', {
      currentScore,
      newScore,
      difference: {
        totalInputs: newScore.totalInputs - currentScore.totalInputs,
        correctInputs: newScore.correctInputs - currentScore.correctInputs
      }
    })

    updateSessionScore(newScore)

    console.log('✅ Score updated after timeout!', { newScore })

    // Start new input after delay
    setTimeout(() => {
      console.log('🔄 Starting new input after timeout delay (timeout #' + timeoutCount.current + ')')
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

      console.log('Single input check:', {
        expected: expectedInput,
        actual: lastInput,
        match: lastInput === expectedInput,
        inputStartCount: inputStartCountRef.current,
        totalInputs: inputs.length,
        newInputsCount: newInputs.length
      })

      if (lastInput === expectedInput) {
        console.log('✅ Single input SUCCESS!')
        handleInputSuccess()
        return
      }
    } else {
      // For multi-input patterns, check if we have enough new inputs and they match
      if (newInputs.length >= currentInput.length) {
        const recentNewInputs = newInputs.slice(-currentInput.length)
        const isMatch = currentInput.length === recentNewInputs.length &&
          currentInput.every((expectedInput, index) => expectedInput === recentNewInputs[index])

        console.log('Multi-input check:', {
          currentInput,
          newInputs,
          recentNewInputs,
          isMatch,
          inputStartCount: inputStartCountRef.current,
          comparison: currentInput.map((expected, i) => ({
            expected,
            actual: recentNewInputs[i],
            match: expected === recentNewInputs[i]
          }))
        })

        if (isMatch) {
          console.log('✅ Multi-input SUCCESS!')
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
      console.log('❌ Wrong input (incrementing progress by 1):', {
        expected: expectedFirstInput,
        actual: lastInput,
        inputStartCount: inputStartCountRef.current
      })

      // Show wrong input feedback
      setShowFeedback('wrong')

      // Reset timer for wrong input
      console.log('⏱️ Resetting timer due to wrong input')
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
          console.log('⏱️ Timer tick (after wrong input):', { prev, newTime, willTimeout: newTime <= 100, timerId: timerRef.current })
          
          if (newTime <= 100) {
            // Time's up - mark as failed
            console.log('⏰ Timer reached 0 after wrong input, calling handleInputTimeout')
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

      // Check if this wrong input would exceed the target
      const currentScore = currentSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
      const targetInputs = currentSession?.targetInputs || 10
      
      if (currentScore.totalInputs >= targetInputs) {
        // Already at or past target - don't increment progress further
        console.log('🚫 Wrong input ignored - already at target:', {
          currentTotalInputs: currentScore.totalInputs,
          targetInputs,
          actual: lastInput,
          expected: expectedFirstInput
        })
      } else {
        // Update score for wrong inputs - increment progress by 1 but don't affect accuracy calculation
        const newScore = {
          totalInputs: currentScore.totalInputs + 1,
          correctInputs: currentScore.correctInputs,
          points: currentScore.points || 0,
          // Don't recalculate accuracy for wrong inputs - keep the existing accuracy
          accuracy: currentScore.accuracy || 0
        }
        updateSessionScore(newScore)

        console.log('📊 Updated score after wrong input:', {
          currentScore,
          newScore,
          difference: {
            totalInputs: newScore.totalInputs - currentScore.totalInputs,
            correctInputs: newScore.correctInputs - currentScore.correctInputs
          }
        })
      }

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

    console.log('Progress tracking:', {
      currentInput,
      newInputs,
      recentInputs: newInputs.slice(-Math.min(currentInput.length, newInputs.length)),
      progressIndex,
      inputIndex,
      inputStartCount: inputStartCountRef.current
    })

    setInputIndex(progressIndex)
  }, [inputs, currentInput])

  // Monitor session score changes for debugging
  useEffect(() => {
    if (currentSession?.score) {
      console.log('📊 Session score updated:', {
        totalInputs: currentSession.score.totalInputs,
        correctInputs: currentSession.score.correctInputs,
        targetInputs: currentSession.targetInputs,
        progress: `${currentSession.score.totalInputs}/${currentSession.targetInputs}`,
        timestamp: Date.now()
      })
      // Force re-render to ensure UI updates
      setForceUpdate(prev => prev + 1)
    }
  }, [currentSession?.score?.totalInputs, currentSession?.score?.correctInputs])

  // Check if training should end immediately when progress exceeds target
  useEffect(() => {
    if (!currentSession) return
    
    const currentProgress = currentSession.score?.totalInputs || 0
    const targetInputs = currentSession.targetInputs || 10
    
    console.log('📊 Progress check:', {
      currentProgress,
      targetInputs,
      willEnd: currentProgress >= targetInputs,
      isCompleted,
      timeoutTriggeredRef: timeoutTriggeredRef.current,
      timeoutCount: timeoutCount.current
    })
    
    if (currentProgress >= targetInputs && !isCompleted) {
      // End training session immediately when progress reaches or exceeds target
      console.log('🎯 Training target reached! Ending session immediately.', {
        currentProgress,
        targetInputs,
        isCompleted
      })
      
      setIsCompleted(true)
      // Don't show success feedback here - this could be triggered by a timeout or wrong input
      // Only show success feedback when an actual successful input completion happens
      
      // Clear timer
      if (timerRef.current) {
        console.log('⏹️ Clearing timer due to immediate completion')
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (timeoutRef.current) {
        console.log('⏹️ Clearing timeout due to immediate completion')
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      // End session immediately
      setTimeout(() => {
        console.log('🏁 Ending training session immediately')
        endTrainingSession(currentSession.score)
      }, 1000)
    }
  }, [currentSession?.score?.totalInputs, currentSession?.targetInputs, currentSession, endTrainingSession, isCompleted])

  const getInputDisplay = (input) => {
    return inputLabels[input] || input.toUpperCase()
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
           {process.env.NODE_ENV === 'development' && (
             <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
               (Debug: {JSON.stringify({
                 totalInputs: currentSession?.score?.totalInputs,
                 targetInputs: currentSession?.targetInputs,
                 customTiming: currentSession?.customTiming,
                 forceUpdate,
                 timeoutCount: timeoutCount.current,
                 startNewInputCalls: startNewInputCallCount.current
               })})
             </span>
           )}
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

      {/* Debug button for testing timeout */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={() => {
            console.log('🧪 Manual timeout test triggered')
            handleInputTimeout()
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Timeout
        </button>
      )}
    </div>
  )
}

export default TrainingInputDisplay
