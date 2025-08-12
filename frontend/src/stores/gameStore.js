import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { useTrainingStore } from './trainingStore'
import { detectMotionPattern, detectPartialMotionPattern, generateMotionTrainingPatterns, generateCustomTrainingPatterns, MOTION_PATTERNS } from '../utils/motionInputs'

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu', // menu, playing, paused, gameOver
  trainingMode: 'none', // none, motion, combos, custom
  difficulty: 'medium',
  
  // Player state
  playerPosition: { x: 100, y: 300 },
  opponentPosition: { x: 700, y: 300 },
  playerHealth: 100,
  opponentHealth: 100,
  
  // Input tracking
  inputs: [],
  currentCombo: [],
  comboCount: 0, // Current sequence length
  maxCombo: 0, // Longest sequence achieved
  
  // Score tracking
  score: {
    totalInputs: 0,
    correctInputs: 0,
    comboCount: 0,
    maxCombo: 0,
    accuracy: 0,
    timeElapsed: 0
  },
  
  // Timer tracking
  sessionStartTime: null,
  lastUpdateTime: null,
  
  // Actions
  setGameState: (state) => set({ gameState: state }),
  setTrainingMode: (mode) => set({ trainingMode: mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  
  updatePlayerPosition: (x, y) => set({ playerPosition: { x, y } }),
  updateOpponentPosition: (x, y) => set({ opponentPosition: { x, y } }),
  
  startSession: () => {
    const now = Date.now()
    set({ 
      sessionStartTime: now,
      lastUpdateTime: now
    })
    
    // Immediately update timer to start counting
    setTimeout(() => {
      const { sessionStartTime: startTime, score } = get()
      if (startTime) {
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000)
        set({
          score: {
            ...score,
            timeElapsed
          }
        })
      }
    }, 100)
  },
  
  updateTimer: () => {
    const { sessionStartTime, lastUpdateTime, score } = get()
    if (!sessionStartTime) return
    
    const now = Date.now()
    const timeElapsed = Math.floor((now - sessionStartTime) / 1000) // Convert to seconds
    
    set({ 
      lastUpdateTime: now,
      score: {
        ...score,
        timeElapsed
      }
    })
  },
  
  addInput: (input) => {
    const { inputs, currentCombo, comboCount, maxCombo, score, trainingMode } = get()
    const newInputs = [...inputs, input]
    const newCurrentCombo = [...currentCombo, input]
    
    // Check if the current combo is valid (matches expected patterns)
    const isValidCombo = checkComboValidity(newCurrentCombo, trainingMode)
    
    // Update combo count - only increment when user correctly performs expected sequence
    let newComboCount = comboCount
    let finalCurrentCombo = newCurrentCombo
    let newMaxCombo = maxCombo // Only update max combo when a valid combo is completed
    
    if (isValidCombo) {
      // This means the user correctly performed a complete expected input sequence
      newComboCount++
      newMaxCombo = Math.max(maxCombo, newComboCount) // Only update max combo on successful completion
      finalCurrentCombo = [] // Reset current combo after successful completion
    } else {
      // Check if the current input is part of a valid pattern in progress
      const isPartialMatch = checkPartialComboValidity(newCurrentCombo, trainingMode)
      if (!isPartialMatch) {
        // Reset combo if input doesn't match any expected pattern
        finalCurrentCombo = [input]
        newComboCount = 0
        // Don't update maxCombo here - it should only increase on successful completions
      }
    }
    
    set({
      inputs: newInputs.slice(-50), // Keep last 50 inputs
      currentCombo: finalCurrentCombo,
      comboCount: newComboCount, // Current correct sequence count
      maxCombo: newMaxCombo, // Longest correct sequence achieved (only increases on success)
      score: {
        ...score,
        totalInputs: score.totalInputs + 1,
        correctInputs: score.correctInputs + (isValidCombo ? 1 : 0), // Only count as correct if it completes a valid combo
        comboCount: newComboCount, // Current correct sequence count
        maxCombo: newMaxCombo, // Longest correct sequence achieved (only increases on success)
        accuracy: ((score.correctInputs + (isValidCombo ? 1 : 0)) / (score.totalInputs + 1)) * 100
      }
    })
  },

  // Add input for tracking only (doesn't affect scoring)
  addInputForTracking: (input) => {
    const { inputs } = get()
    const newInputs = [...inputs, input]
    
    set({
      inputs: newInputs.slice(-50) // Keep last 50 inputs
    })
  },
  
  resetCombo: () => {
    set({ comboCount: 0 })
  },
  
  resetGame: () => {
    const now = Date.now()
    set({
      gameState: 'playing',
      playerPosition: { x: 100, y: 300 },
      opponentPosition: { x: 700, y: 300 },
      playerHealth: 100,
      opponentHealth: 100,
      inputs: [],
      currentCombo: [],
      comboCount: 0,
      maxCombo: 0,
      sessionStartTime: now,
      lastUpdateTime: now,
      score: {
        totalInputs: 0,
        correctInputs: 0,
        comboCount: 0,
        maxCombo: 0,
        accuracy: 0,
        timeElapsed: 0
      }
    })
  },
  
  updateScore: (newScore) => set({ score: { ...get().score, ...newScore } })
}))

// Helper function to check if a combo is valid
const checkComboValidity = (combo, trainingMode) => {
  if (combo.length === 0) return false
  
  // Get current input buttons from settings store
  const { inputButtons } = useSettingsStore.getState()
  
    // Get active attack buttons based on settings
  const { attackButtonMode } = useSettingsStore.getState()
  const allAttackButtons = [inputButtons.lp, inputButtons.mp, inputButtons.hp, inputButtons.lk, inputButtons.mk, inputButtons.hk]
  const activeAttackButtons = attackButtonMode === 4 
    ? [inputButtons.lp, inputButtons.mp, inputButtons.lk, inputButtons.mk]
    : allAttackButtons

  // Training patterns based on the training input display
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
    'custom-combos': (() => {
      // Get custom combo from training store
      const { currentSession } = useTrainingStore.getState()
      if (currentSession && currentSession.customConfig?.customCombo) {
        return [currentSession.customConfig.customCombo.inputs]
      }
      return []
    })(),
    custom: (() => {
      // Get custom configuration from training store
      const { currentSession } = useTrainingStore.getState()
      if (currentSession && currentSession.customConfig) {
        return generateCustomTrainingPatterns(inputButtons, activeAttackButtons, currentSession.customConfig)
      }
      
      // Fallback to mixed patterns if no custom config
      return [
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
    })()
  }

  const patterns = trainingPatterns[trainingMode] || trainingPatterns.motion
  
  return patterns.some(pattern => {
    if (combo.length < pattern.length) return false
    
    const recentInputs = combo.slice(-pattern.length)
    return recentInputs.join('') === pattern.join('')
  })
}

// Helper function to check if a partial combo is valid (e.g., if the current combo is a prefix of any valid sequence)
const checkPartialComboValidity = (combo, trainingMode) => {
  if (combo.length === 0) return true

  // Get current input buttons from settings store
  const { inputButtons } = useSettingsStore.getState()
  
  // Get active attack buttons based on settings
  const { attackButtonMode } = useSettingsStore.getState()
  const allAttackButtons = [inputButtons.lp, inputButtons.mp, inputButtons.hp, inputButtons.lk, inputButtons.mk, inputButtons.hk]
    const activeAttackButtons = attackButtonMode === 4 
    ? [inputButtons.lp, inputButtons.mp, inputButtons.lk, inputButtons.mk]
    : allAttackButtons
  
  // Training patterns based on the training input display
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
    'custom-combos': (() => {
      // Get custom combo from training store
      const { currentSession } = useTrainingStore.getState()
      if (currentSession && currentSession.customConfig?.customCombo) {
        return [currentSession.customConfig.customCombo.inputs]
      }
      return []
    })(),
    custom: (() => {
      // Get custom configuration from training store
      const { currentSession } = useTrainingStore.getState()
      if (currentSession && currentSession.customConfig) {
        return generateCustomTrainingPatterns(inputButtons, activeAttackButtons, currentSession.customConfig)
      }
      
      // Fallback to mixed patterns if no custom config
      return [
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
    })()
  }
  
  const patterns = trainingPatterns[trainingMode] || trainingPatterns.motion

  return patterns.some(pattern => {
    if (combo.length > pattern.length) return false
    
    // Check if the current combo is a prefix of any valid pattern
    return pattern.slice(0, combo.length).join('') === combo.join('')
  })
}
