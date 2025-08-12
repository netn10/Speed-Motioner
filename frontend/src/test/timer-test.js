// Simple test to verify timer and combo functionality
import { useGameStore } from '../stores/gameStore'
import { useTrainingStore } from '../stores/trainingStore'

// Test timer functionality
export const testTimerFunctionality = () => {
  const gameStore = useGameStore.getState()
  const trainingStore = useTrainingStore.getState()
  
  console.log('Testing timer functionality...')
  
  // Test game store timer
  gameStore.startSession()
  console.log('Game session started, timeElapsed:', gameStore.score.timeElapsed)
  
  // Test training store timer
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('Training session started, timeElapsed:', session.score.timeElapsed)
  
  // Simulate timer updates
  setTimeout(() => {
    gameStore.updateTimer()
    trainingStore.updateSessionTimer()
    
    console.log('After 1 second:')
    console.log('Game timeElapsed:', gameStore.score.timeElapsed)
    console.log('Training timeElapsed:', trainingStore.currentSession?.score.timeElapsed)
  }, 1000)
  
  setTimeout(() => {
    gameStore.updateTimer()
    trainingStore.updateSessionTimer()
    
    console.log('After 2 seconds:')
    console.log('Game timeElapsed:', gameStore.score.timeElapsed)
    console.log('Training timeElapsed:', trainingStore.currentSession?.score.timeElapsed)
  }, 2000)
}

// Test combo functionality
export const testComboFunctionality = () => {
  const gameStore = useGameStore.getState()
  const trainingStore = useTrainingStore.getState()
  
  console.log('Testing combo functionality...')
  
  // Test game store combo
  gameStore.addInput('w')
  console.log('After 1 input - comboCount:', gameStore.comboCount, 'maxCombo:', gameStore.maxCombo)
  
  gameStore.addInput('a')
  console.log('After 2 inputs - comboCount:', gameStore.comboCount, 'maxCombo:', gameStore.maxCombo)
  
  gameStore.addInput('s')
  console.log('After 3 inputs - comboCount:', gameStore.comboCount, 'maxCombo:', gameStore.maxCombo)
  
  // Test training store combo
  trainingStore.addSessionInput('w')
  console.log('Training - After 1 input - comboCount:', trainingStore.currentSession?.score.comboCount, 'maxCombo:', trainingStore.currentSession?.score.maxCombo)
  
  trainingStore.addSessionInput('a')
  console.log('Training - After 2 inputs - comboCount:', trainingStore.currentSession?.score.comboCount, 'maxCombo:', trainingStore.currentSession?.score.maxCombo)
}

// Run tests
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.testTimerFunctionality = testTimerFunctionality
  window.testComboFunctionality = testComboFunctionality
}
