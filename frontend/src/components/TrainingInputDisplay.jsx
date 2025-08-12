import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'
import { useInputButtons } from '../hooks/useInputButtons'
import { useSettingsStore } from '../stores/settingsStore'
import './TrainingInputDisplay.css'

const TrainingInputDisplay = () => {
  const { currentSession } = useTrainingStore()
  const { updateSessionScore } = useTrainingStore()
  const trainingMode = currentSession?.mode || 'motion'
  const difficulty = currentSession?.difficulty || 'medium'
  const inputButtons = useInputButtons()
  const { attackButtonMode } = useSettingsStore()
  const [currentInput, setCurrentInput] = useState([])
  const [inputIndex, setInputIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(null) // 'success' or 'fail'
  const [pointsEarned, setPointsEarned] = useState(0)
  const timerRef = useRef(null)
  const inputStartTimeRef = useRef(null)
  const inputStartCountRef = useRef(0)

  // Difficulty-based timing (in milliseconds)
  const getDifficultyTiming = () => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 3000 // 3 seconds
      case 'medium': return 2000 // 2 seconds  
      case 'hard': return 1200 // 1.2 seconds
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
    blocking: [
      [inputButtons.block], // block
      [inputButtons.left, inputButtons.block], // left + block
      [inputButtons.right, inputButtons.block], // right + block
      [inputButtons.up, inputButtons.block], // up + block
      [inputButtons.down, inputButtons.block], // down + block
    ],
    punishing: [
      [activeAttackButtons[0]], // single attack
      [activeAttackButtons[1]], // single attack
      [activeAttackButtons[0], activeAttackButtons[0]], // double first attack
      [activeAttackButtons[1], activeAttackButtons[1]], // double second attack
      [activeAttackButtons[0], activeAttackButtons[1]], // first + second attack
    ],
    combos: [
      [activeAttackButtons[0], activeAttackButtons[0]], // double attack
      [activeAttackButtons[0], activeAttackButtons[1]], // first + second
      [activeAttackButtons[1], activeAttackButtons[0]], // second + first
      [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[0]], // triple first attack
      [inputButtons.up, activeAttackButtons[0]], // up + attack
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

    // Start timer
    const timing = getDifficultyTiming()
    setTimeRemaining(timing)
    inputStartTimeRef.current = Date.now()
    // Record the current input count to ignore previous inputs
    inputStartCountRef.current = inputs.length

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          // Time's up - mark as failed
          clearInterval(timerRef.current)
          handleInputTimeout()
          return 0
        }
        return prev - 100
      })
    }, 100)
  }

  useEffect(() => {
    startNewInput()

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [trainingMode, attackButtonMode, inputButtons])

  // Handle successful input completion
  const handleInputSuccess = () => {
    if (isCompleted) return

    setIsCompleted(true)
    setShowFeedback('success')

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
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
      maxCombo: Math.max(currentScore.maxCombo || 0, currentScore.correctInputs + 1)
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
      startNewInput()
    }, 1500)
  }

  // Handle input timeout
  const handleInputTimeout = () => {
    if (isCompleted) return

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

    updateSessionScore(newScore)

    console.log('Input timed out!', { newScore })

    // Start new input after delay
    setTimeout(() => {
      startNewInput()
    }, 1500)
  }

  // Check if current input sequence is completed
  useEffect(() => {
    if (currentInput.length === 0 || inputs.length === 0 || isCompleted) return

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

    // Check for wrong inputs and update score
    const lastInput = newInputs[newInputs.length - 1]
    const expectedFirstInput = currentInput[0]

    // If this is a new input that doesn't match what we expect, count it as wrong
    if (lastInput !== expectedFirstInput && inputIndex === 0) {
      console.log('❌ Wrong input:', {
        expected: expectedFirstInput,
        actual: lastInput,
        inputStartCount: inputStartCountRef.current
      })

      // Update score for wrong input
      const currentScore = currentSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
      const newScore = {
        totalInputs: currentScore.totalInputs + 1,
        correctInputs: currentScore.correctInputs,
        points: currentScore.points || 0, // No points for wrong input
        accuracy: currentScore.correctInputs > 0 ? (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100 : 0
      }
      updateSessionScore(newScore)
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

  const getInputDisplay = (input) => {
    return inputLabels[input] || input.toUpperCase()
  }

  if (!currentInput.length) {
    return null
  }

  return (
    <div className={`training-input-display ${showFeedback ? `feedback-${showFeedback}` : ''}`}>
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
              width: `${((currentSession?.score?.totalInputs || 0) / (currentSession?.targetInputs || 10)) * 100}%`
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
          {showFeedback === 'success' ? (
            <>
              <span className="feedback-icon">✓</span>
              <span className="feedback-text">Perfect! +{pointsEarned} Points</span>
            </>
          ) : (
            <>
              <span className="feedback-icon">✗</span>
              <span className="feedback-text">Time's Up!</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainingInputDisplay
