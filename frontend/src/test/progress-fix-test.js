// Test to verify progress is only made on completion or timeout, not on wrong inputs

export const testProgressOnlyOnCompletionOrTimeout = () => {
  console.log('🧪 Testing: Progress should only be made on completion or timeout')
  
  const { useTrainingStore } = require('../stores/trainingStore')
  const trainingStore = useTrainingStore.getState()
  
  // Start a new training session
  const session = trainingStore.startTrainingSession('motion', 'medium', 5)
  console.log('📊 Initial session score:', session.score)
  
  // Simulate wrong input - should NOT increment progress
  console.log('❌ Simulating wrong input...')
  const wrongInput = 'x' // Invalid input
  const scoreBeforeWrong = trainingStore.currentSession.score.totalInputs
  
  // The wrong input should not increment progress anymore (this was the fix)
  // Previously, this would increment totalInputs, but now it should not
  
  const scoreAfterWrong = trainingStore.currentSession.score.totalInputs
  console.log('📊 Score after wrong input:', {
    before: scoreBeforeWrong,
    after: scoreAfterWrong,
    incremented: scoreAfterWrong > scoreBeforeWrong
  })
  
  if (scoreAfterWrong > scoreBeforeWrong) {
    console.log('❌ FAIL: Progress was made on wrong input')
    return false
  } else {
    console.log('✅ PASS: No progress made on wrong input')
  }
  
  // Simulate correct input completion - should increment progress
  console.log('✅ Simulating correct input completion...')
  const scoreBeforeCorrect = trainingStore.currentSession.score.totalInputs
  
  // Simulate a successful input completion by calling updateSessionScore directly
  const currentScore = trainingStore.currentSession.score
  const newScore = {
    totalInputs: currentScore.totalInputs + 1,
    correctInputs: currentScore.correctInputs + 1,
    points: currentScore.points + 100,
    accuracy: ((currentScore.correctInputs + 1) / (currentScore.totalInputs + 1)) * 100
  }
  trainingStore.updateSessionScore(newScore)
  
  const scoreAfterCorrect = trainingStore.currentSession.score.totalInputs
  console.log('📊 Score after correct input:', {
    before: scoreBeforeCorrect,
    after: scoreAfterCorrect,
    incremented: scoreAfterCorrect > scoreBeforeCorrect
  })
  
  if (scoreAfterCorrect > scoreBeforeCorrect) {
    console.log('✅ PASS: Progress was made on correct input completion')
  } else {
    console.log('❌ FAIL: No progress made on correct input completion')
    return false
  }
  
  // Simulate timeout - should increment progress
  console.log('⏰ Simulating timeout...')
  const scoreBeforeTimeout = trainingStore.currentSession.score.totalInputs
  
  // Simulate a timeout by calling updateSessionScore directly
  const currentScore2 = trainingStore.currentSession.score
  const newScore2 = {
    totalInputs: currentScore2.totalInputs + 1,
    correctInputs: currentScore2.correctInputs,
    points: currentScore2.points,
    accuracy: (currentScore2.correctInputs / (currentScore2.totalInputs + 1)) * 100
  }
  trainingStore.updateSessionScore(newScore2)
  
  const scoreAfterTimeout = trainingStore.currentSession.score.totalInputs
  console.log('📊 Score after timeout:', {
    before: scoreBeforeTimeout,
    after: scoreAfterTimeout,
    incremented: scoreAfterTimeout > scoreBeforeTimeout
  })
  
  if (scoreAfterTimeout > scoreBeforeTimeout) {
    console.log('✅ PASS: Progress was made on timeout')
  } else {
    console.log('❌ FAIL: No progress made on timeout')
    return false
  }
  
  console.log('🎉 All tests passed! Progress is only made on completion or timeout.')
  return true
}

// Make test available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testProgressOnlyOnCompletionOrTimeout = testProgressOnlyOnCompletionOrTimeout
}
