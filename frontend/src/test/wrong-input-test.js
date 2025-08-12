// Test to verify wrong inputs don't give points and only add 1 to progress
export function testWrongInputScoring() {
  console.log('🧪 Testing wrong input scoring...')
  
  // Import stores
  const { useTrainingStore } = require('../stores/trainingStore')
  const { useGameStore } = require('../stores/gameStore')
  
  // Get store instances
  const trainingStore = useTrainingStore.getState()
  const gameStore = useGameStore.getState()
  
  // Start a training session
  const session = trainingStore.startTrainingSession('motion', 'medium', 5)
  console.log('📊 Initial session score:', session.score)
  
  // Simulate a wrong input
  console.log('❌ Simulating wrong input...')
  
  // Get the current expected input from TrainingInputDisplay
  // For motion training, it could be 'w', 's', 'a', 'd', etc.
  const wrongInput = 'x' // This should be wrong for motion training
  
  // Add the wrong input
  trainingStore.addSessionInput(wrongInput)
  
  // Check the updated score
  const updatedScore = trainingStore.currentSession.score
  console.log('📊 Score after wrong input:', updatedScore)
  
  // Verify the behavior
  const pointsAfterWrong = updatedScore.points
  const totalInputsAfterWrong = updatedScore.totalInputs
  const correctInputsAfterWrong = updatedScore.correctInputs
  
  console.log('✅ Test Results:')
  console.log(`   Points after wrong input: ${pointsAfterWrong} (should be 0)`)
  console.log(`   Total inputs: ${totalInputsAfterWrong} (should be 1)`)
  console.log(`   Correct inputs: ${correctInputsAfterWrong} (should be 0)`)
  
  // Assertions
  if (pointsAfterWrong === 0) {
    console.log('✅ PASS: Wrong input gives 0 points')
  } else {
    console.log('❌ FAIL: Wrong input gives points')
  }
  
  if (totalInputsAfterWrong === 1) {
    console.log('✅ PASS: Wrong input only adds 1 to progress')
  } else {
    console.log('❌ FAIL: Wrong input adds more than 1 to progress')
  }
  
  if (correctInputsAfterWrong === 0) {
    console.log('✅ PASS: Wrong input not counted as correct')
  } else {
    console.log('❌ FAIL: Wrong input counted as correct')
  }
  
  // Clean up
  trainingStore.endTrainingSession(updatedScore)
  
  console.log('🧪 Wrong input scoring test completed!')
}

// Make test available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testWrongInputScoring = testWrongInputScoring
}
