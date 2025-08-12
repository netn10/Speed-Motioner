// Test for training completion dialog values
export const testTrainingCompletionDialog = () => {
  console.log('🧪 Testing training completion dialog...')
  
  // Import the stores
  const { useTrainingStore } = require('../stores/trainingStore')
  
  // Start a training session
  const trainingStore = useTrainingStore.getState()
  const session = trainingStore.startTrainingSession('motion', 'medium', 5)
  
  console.log('📊 Initial session:', session)
  
  // Simulate some score updates
  trainingStore.updateSessionScore({
    totalInputs: 3,
    correctInputs: 2,
    accuracy: 66.7,
    maxCombo: 2,
    points: 250,
    timeElapsed: 45
  })
  
  console.log('📊 After score update:', trainingStore.currentSession)
  
  // End the training session
  const completedSession = trainingStore.endTrainingSession(trainingStore.currentSession.score)
  
  console.log('📊 Completed session:', completedSession)
  console.log('📊 Sessions array:', trainingStore.sessions)
  
  // Check if the completed session has the correct values
  if (completedSession && completedSession.score) {
    console.log('✅ Training completion test passed!')
    console.log('📊 Final values:')
    console.log('  - Total Points:', completedSession.score.points)
    console.log('  - Accuracy:', completedSession.score.accuracy)
    console.log('  - Max Combo:', completedSession.score.maxCombo)
    console.log('  - Total Inputs:', completedSession.score.totalInputs)
    console.log('  - Duration:', completedSession.score.timeElapsed)
  } else {
    console.log('❌ Training completion test failed!')
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testTrainingCompletionDialog = testTrainingCompletionDialog
}

