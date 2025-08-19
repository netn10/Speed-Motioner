import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useInputButtons } from '../hooks/useInputButtons'
import { useSettingsStore } from '../stores/settingsStore'
import { generateDifficultyBasedPatterns } from '../utils/motionInputs'
// import { generateRealComboTrainingPatterns, getCombosByDifficulty } from '../utils/realCombos'
import './TrainingInputDisplay.css'

const TrainingInputDisplay = () => {
  const { currentSession, updateSessionScore, endTrainingSession } = useTrainingStore()
  const trainingMode = currentSession?.mode || 'motion'
  const difficulty = currentSession?.difficulty || 'medium'
  const inputButtons = useInputButtons()
  const { attackButtonMode, attackDisplayMode, theme } = useSettingsStore()
  const [currentInput, setCurrentInput] = useState([])
  const [inputIndex, setInputIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(null) // 'success', 'fail', or 'wrong'
  const [pointsEarned, setPointsEarned] = useState(0)
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render when needed
  const [showCountdown, setShowCountdown] = useState(true) // New state for countdown
  const [countdownNumber, setCountdownNumber] = useState(3) // Countdown number
  const [hasShownCountdown, setHasShownCountdown] = useState(false) // Track if countdown has been shown
  const [currentComboInfo, setCurrentComboInfo] = useState(null) // Track real combo information
  const timerRef = useRef(null)
  const timeoutRef = useRef(null)
  const inputStartTimeRef = useRef(null)
  const inputStartCountRef = useRef(0)
  const processingSuccessRef = useRef(false)
  const timeoutTriggeredRef = useRef(false)
  const startNewInputCallCount = useRef(0)
  const timeoutCount = useRef(0)
  const handlingWrongInputRef = useRef(false) // Flag to prevent timeout during wrong input handling

  // Reset countdown when session changes
  useEffect(() => {
    if (currentSession) {
      setShowCountdown(true)
      setCountdownNumber(3)
      setHasShownCountdown(false)
    } else {
      // If no session, hide countdown to prevent white screen
      setShowCountdown(false)
      setHasShownCountdown(true)
    }
  }, [currentSession?.id]) // Reset when session ID changes

  // Scroll to training display when countdown starts or when session loads
  useEffect(() => {
    if (showCountdown || (currentSession && !hasShownCountdown)) {
      // Scroll to the training display area (just below the header)
      window.scrollTo({ top: 220, behavior: 'smooth' })
    }
  }, [showCountdown, currentSession, hasShownCountdown])

  // Countdown effect - only show once per session
  useEffect(() => {
    if (!showCountdown || hasShownCountdown) return

    const countdownInterval = setInterval(() => {
      setCountdownNumber(prev => {
        if (prev <= 1) {
          setShowCountdown(false)
          setHasShownCountdown(true)
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 300) // Fast countdown - 300ms per number

    return () => clearInterval(countdownInterval)
  }, [showCountdown, hasShownCountdown])

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

  // Generate training patterns based on difficulty
  const trainingPatterns = useMemo(() => {
    const patterns = {}
    
    // Generate patterns for each training mode using difficulty-based filtering
    const modes = ['motion', 'motions', 'custom']
    modes.forEach(mode => {
      try {
        patterns[mode] = generateDifficultyBasedPatterns(inputButtons, activeAttackButtons, mode, difficulty) || []
      } catch (error) {
        console.warn(`Error generating patterns for ${mode}:`, error)
        patterns[mode] = [[inputButtons.up]] // Basic fallback
      }
    })
    
    // For combos mode, use simple fallback for now (real combos temporarily disabled)
    patterns['combos'] = (() => {
      try {
        const fallbackPatterns = generateDifficultyBasedPatterns(inputButtons, activeAttackButtons, 'combos', difficulty)
        return (fallbackPatterns || []).map(pattern => ({ pattern, comboInfo: null }))
      } catch (error) {
        console.warn('Pattern generation failed:', error)
        // Ultimate fallback
        return [
          { pattern: [inputButtons.up], comboInfo: null },
          { pattern: [inputButtons.down], comboInfo: null },
          { pattern: [activeAttackButtons[0]], comboInfo: null }
        ]
      }
    })()
    
    // Handle custom-combos separately since it uses specific custom combo data
    patterns['custom-combos'] = (() => {
      if (currentSession?.customConfig?.customCombo) {
        return [{ 
          pattern: currentSession.customConfig.customCombo.inputs,
          comboInfo: {
            name: currentSession.customConfig.customCombo.name,
            description: currentSession.customConfig.customCombo.description,
            notation: currentSession.customConfig.customCombo.inputs.join(' → '),
            type: 'Custom',
            difficulty: 'Custom'
          }
        }]
      }
      return []
    })()
    
    return patterns
  }, [inputButtons, activeAttackButtons, difficulty, currentSession?.customConfig?.customCombo])

  // Input key mappings for display
  const inputLabels = {
    [inputButtons.up]: '↑',
    [inputButtons.left]: '←',
    [inputButtons.down]: '↓',
    [inputButtons.right]: '→',
    // Attack buttons - use icons or text based on display mode
    [inputButtons.lp]: attackDisplayMode === 'icons' ? '✊' : 'LP',
    [inputButtons.mp]: attackDisplayMode === 'icons' ? '✊' : 'MP',
    [inputButtons.hp]: attackDisplayMode === 'icons' ? '✊' : 'HP',
    [inputButtons.lk]: attackDisplayMode === 'icons' ? '🦵' : 'LK',
    [inputButtons.mk]: attackDisplayMode === 'icons' ? '🦵' : 'MK',
    [inputButtons.hk]: attackDisplayMode === 'icons' ? '🦵' : 'HK',
    // Arrow key mappings
    arrowup: '↑',
    arrowleft: '←',
    arrowdown: '↓',
    arrowright: '→'
  }

  const { inputs, clearInputs } = useGameStore()

  // Start new input sequence
  const startNewInput = () => {
    // Prevent multiple simultaneous calls
    if (processingSuccessRef.current) {
      return
    }
    
    startNewInputCallCount.current += 1

    const patterns = trainingPatterns[trainingMode] || trainingPatterns.motion || []
    
    // Safety check - ensure we have patterns
    if (!patterns || patterns.length === 0) {
      console.warn('No training patterns available, using fallback');
      setCurrentInput([inputButtons.up]) // Basic fallback
      setCurrentComboInfo(null)
      return
    }
    
    let selectedItem

    // For custom combos, always use the same pattern (the selected custom combo)
    if (trainingMode === 'custom-combos') {
      selectedItem = patterns[0] // Custom combos only have one pattern
    } else {
      const randomIndex = Math.floor(Math.random() * patterns.length)
      selectedItem = patterns[randomIndex]
    }

    // Safety check for selected item
    if (!selectedItem) {
      console.warn('No selected item available, using fallback');
      setCurrentInput([inputButtons.up])
      setCurrentComboInfo(null)
      return
    }

    // Handle both old format (just arrays) and new format (objects with pattern and comboInfo)
    let selectedPattern
    let comboInfo = null
    
    if (selectedItem && typeof selectedItem === 'object' && selectedItem.pattern) {
      selectedPattern = selectedItem.pattern
      comboInfo = selectedItem.comboInfo
    } else {
      selectedPattern = selectedItem
    }

    // Final safety check for pattern
    if (!selectedPattern || !Array.isArray(selectedPattern) || selectedPattern.length === 0) {
      console.warn('Invalid selected pattern, using fallback');
      setCurrentInput([inputButtons.up])
      setCurrentComboInfo(null)
      return
    }

    setCurrentInput(selectedPattern)
    setCurrentComboInfo(comboInfo)
    setInputIndex(0)
    setIsCompleted(false)
    setShowFeedback(null)
    setPointsEarned(0)
    processingSuccessRef.current = false  // Reset processing flag for new input
    timeoutTriggeredRef.current = false  // Reset timeout flag for new input
    handlingWrongInputRef.current = false  // Reset wrong input flag for new input

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
          } else {
          }
          return 0
        }
        return newTime
      })
    }, 100)
  }

  useEffect(() => {
    // Only start new input if we're not already processing and countdown is complete
    if (!processingSuccessRef.current && !showCountdown) {
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
  }, [trainingMode, attackButtonMode, showCountdown]) // Added showCountdown dependency

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
    timeoutCount.current += 1

    if (isCompleted || handlingWrongInputRef.current) {
      return
    }
    setIsCompleted(true)
    setShowFeedback('fail')

    // Clear all player inputs when timer runs out
    clearInputs()
    // Reset the input start count to match the cleared inputs array
    inputStartCountRef.current = 0

    // Update score for failed attempt - get current score from store to ensure we have the latest
    const { currentSession: latestSession } = useTrainingStore.getState()
    const currentScore = latestSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
    
    const newScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs,
      points: currentScore.points || 0, // No points for timeout
      accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
    }
    
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
      // Set flag to prevent timeout from triggering
      handlingWrongInputRef.current = true
      
      // Show wrong input feedback
      setShowFeedback('wrong')

      // Mark as completed to prevent timeout from triggering
      setIsCompleted(true)

      // Clear all timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Update progress for wrong inputs - increment totalInputs by 1
      const { currentSession: latestSession } = useTrainingStore.getState()
      const currentScore = latestSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
      
      const newScore = {
        totalInputs: currentScore.totalInputs + 1,
        correctInputs: currentScore.correctInputs, // Don't increment correct inputs for wrong inputs
        points: currentScore.points || 0, // No points for wrong inputs
        accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
      }
      
      updateSessionScore(newScore)
      
      console.log('❌ Wrong input (progress +1):', {
        expected: expectedFirstInput,
        actual: lastInput,
        inputStartCount: inputStartCountRef.current,
        newTotalInputs: newScore.totalInputs
      })

      // Clear wrong input feedback and start new input after a short delay
      setTimeout(() => {
        setShowFeedback(null)
        // Start a completely new input sequence
        startNewInput()
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

  // Show countdown overlay - only if countdown is active and hasn't been shown yet
  if (showCountdown && !hasShownCountdown && currentSession) {
    return (
      <div className={`training-countdown ${theme}`}>
        <div className="countdown-number">{countdownNumber}</div>
      </div>
    )
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
        
        {/* Real combo information for combos mode */}
        {trainingMode === 'combos' && currentComboInfo && (
          <div className="real-combo-info">
            <div className="combo-name">{currentComboInfo.name}</div>
            <div className="combo-notation">{currentComboInfo.notation}</div>
            <div className="combo-description">{currentComboInfo.description}</div>
            <div className="combo-meta">
              <span className="combo-difficulty">{currentComboInfo.difficulty}</span>
              <span className="combo-type">{currentComboInfo.type}</span>
            </div>
          </div>
        )}
        
        {/* Motion pattern names for motions mode */}
        {trainingMode === 'motions' && getMotionPatternName(currentInput) && (
          <div className="motion-pattern-name">
            {getMotionPatternName(currentInput)}
          </div>
        )}
        
        {/* Custom combo information */}
        {trainingMode === 'custom-combos' && currentComboInfo && (
          <div className="custom-combo-name">
            {currentComboInfo.name}
            {currentComboInfo.description && (
              <div className="custom-combo-description">
                {currentComboInfo.description}
              </div>
            )}
          </div>
        )}
        <div className="input-sequence">
          {currentInput.map((input, index) => {
            const isAttackButton = [inputButtons.lp, inputButtons.mp, inputButtons.hp, inputButtons.lk, inputButtons.mk, inputButtons.hk].includes(input)
            const getAttackColor = (input) => {
              if (input === inputButtons.lp || input === inputButtons.lk) return '#3498db' // Light - blue
              if (input === inputButtons.mp || input === inputButtons.mk) return '#f39c12' // Medium - yellow
              if (input === inputButtons.hp || input === inputButtons.hk) return '#e74c3c' // Heavy - red
              return null
            }
            
            return (
              <span
                key={index}
                className={`input-key ${index < inputIndex ? 'completed' : ''}`}
                style={{
                  backgroundColor: attackDisplayMode === 'icons' && isAttackButton ? getAttackColor(input) : undefined,
                  color: attackDisplayMode === 'icons' && isAttackButton ? 'white' : undefined,
                  borderColor: attackDisplayMode === 'icons' && isAttackButton ? getAttackColor(input) : undefined
                }}
              >
                {getInputDisplay(input)}
              </span>
            )
          })}
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
