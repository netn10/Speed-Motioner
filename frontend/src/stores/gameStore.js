import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu', // menu, playing, paused, gameOver
  trainingMode: 'none', // none, motion, blocking, punishing, combos
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
  
  // Actions
  setGameState: (state) => set({ gameState: state }),
  setTrainingMode: (mode) => set({ trainingMode: mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  
  updatePlayerPosition: (x, y) => set({ playerPosition: { x, y } }),
  updateOpponentPosition: (x, y) => set({ opponentPosition: { x, y } }),
  
  addInput: (input) => {
    const { inputs, comboCount, maxCombo, score } = get()
    const newInputs = [...inputs, input]
    
    // Increment current combo count (every input extends the sequence)
    const newComboCount = comboCount + 1
    const newMaxCombo = Math.max(maxCombo, newComboCount)
    
    set({
      inputs: newInputs.slice(-50), // Keep last 50 inputs
      comboCount: newComboCount, // Current sequence length
      maxCombo: newMaxCombo, // Longest sequence achieved
      score: {
        ...score,
        totalInputs: score.totalInputs + 1,
        correctInputs: score.correctInputs + 1, // For now, all inputs are "correct"
        comboCount: newComboCount, // Current sequence
        maxCombo: newMaxCombo, // Longest sequence
        accuracy: ((score.correctInputs + 1) / (score.totalInputs + 1)) * 100
      }
    })
  },
  
  resetGame: () => set({
    gameState: 'playing',
    playerPosition: { x: 100, y: 300 },
    opponentPosition: { x: 700, y: 300 },
    playerHealth: 100,
    opponentHealth: 100,
    inputs: [],
    currentCombo: [],
    comboCount: 0,
    maxCombo: 0,
    score: {
      totalInputs: 0,
      correctInputs: 0,
      comboCount: 0,
      maxCombo: 0,
      accuracy: 0,
      timeElapsed: 0
    }
  }),
  
  updateScore: (newScore) => set({ score: { ...get().score, ...newScore } })
}))

// Helper function to check if a combo is valid
const checkComboValidity = (combo) => {
  if (combo.length < 2) return false
  
  // Get current input buttons from settings store
  const { inputButtons } = useSettingsStore.getState()
  
  // Simple combo validation - in a real game this would be much more complex
  const validCombos = [
    [inputButtons.up, inputButtons.attack], // up + attack
    [inputButtons.down, inputButtons.attack], // down + attack
    [inputButtons.left, inputButtons.attack], // left + attack
    [inputButtons.right, inputButtons.attack], // right + attack
    [inputButtons.up, inputButtons.special], // up + special
    [inputButtons.down, inputButtons.special], // down + special
    [inputButtons.left, inputButtons.special], // left + special
    [inputButtons.right, inputButtons.special], // right + special
    [inputButtons.attack, inputButtons.attack], // double attack
    [inputButtons.special, inputButtons.special], // double special
  ]
  
  return validCombos.some(validCombo => 
    combo.slice(-validCombo.length).join('') === validCombo.join('')
  )
}
