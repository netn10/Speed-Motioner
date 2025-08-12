// Test to verify training ends immediately when progress exceeds target
import { useTrainingStore } from '../stores/trainingStore'

// Test that training ends immediately when progress reaches or exceeds target
export const testProgressExceedsTarget = () => {
  const trainingStore = useTrainingStore.getState()
  
  console.log('Testing training progress exceeds target...')
  
  // Start a training session with target of 5 inputs
  const session = trainingStore.startTrainingSession('motion', 'medium', 5)
  console.log('Training session started with target:', session.targetInputs)
  console.log('Initial progress:', session.score.totalInputs)
  
  // Simulate inputs to reach target
  for (let i = 0; i < 5; i++) {
    trainingStore.addSessionInput('w')
    console.log(`After ${i + 1} inputs - Progress: ${trainingStore.currentSession?.score.totalInputs}/${trainingStore.currentSession?.targetInputs}`)
  }
  
  // Check if session is still active (it should be ended by the component logic)
  console.log('Session still active after reaching target:', trainingStore.isTraining)
  console.log('Current session:', trainingStore.currentSession)
  
  // Test exceeding target
  if (trainingStore.currentSession) {
    console.log('Adding one more input to exceed target...')
    trainingStore.addSessionInput('a')
    console.log(`After exceeding target - Progress: ${trainingStore.currentSession?.score.totalInputs}/${trainingStore.currentSession?.targetInputs}`)
    console.log('Session still active after exceeding target:', trainingStore.isTraining)
  }
}

// Test that training doesn't end prematurely
export const testProgressBelowTarget = () => {
  const trainingStore = useTrainingStore.getState()
  
  console.log('Testing training progress below target...')
  
  // Start a training session with target of 10 inputs
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('Training session started with target:', session.targetInputs)
  
  // Simulate inputs below target
  for (let i = 0; i < 5; i++) {
    trainingStore.addSessionInput('w')
    console.log(`After ${i + 1} inputs - Progress: ${trainingStore.currentSession?.score.totalInputs}/${trainingStore.currentSession?.targetInputs}`)
  }
  
  // Check if session is still active (it should be)
  console.log('Session still active below target:', trainingStore.isTraining)
  console.log('Current session:', trainingStore.currentSession)
}

// Run tests
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.testProgressExceedsTarget = testProgressExceedsTarget
  window.testProgressBelowTarget = testProgressBelowTarget
}
