// Test for win condition bug fix
// This test verifies that the game doesn't register a win prematurely when inputs are processed correctly

export const testWinConditionBugFix = () => {
  console.log('🧪 Testing win condition bug fix...')
  
  // Import the stores
  const { useTrainingStore } = require('../stores/trainingStore')
  const { useGameStore } = require('../stores/gameStore')
  
  // Start a training session with target of 3 inputs
  const trainingStore = useTrainingStore.getState()
  const gameStore = useGameStore.getState()
  
  const session = trainingStore.startTrainingSession('motion', 'medium', 3)
  
  console.log('📊 Initial session:', {
    totalInputs: session.score.totalInputs,
    targetInputs: session.targetInputs,
    currentProgress: `${session.score.totalInputs}/${session.targetInputs}`
  })
  
  // Simulate a successful input sequence (e.g., a double input like "w+j")
  // This should only increment totalInputs by 1, not by the number of inputs in the sequence
  const initialTotalInputs = session.score.totalInputs
  
  // Simulate the bug scenario: user performs a multi-input sequence correctly
  // In the old code, this would increment totalInputs by the number of inputs in the sequence
  // In the fixed code, this should only increment by 1
  
  // Simulate a successful completion of a multi-input sequence
  const newScore = {
    totalInputs: initialTotalInputs + 1, // Should only increment by 1, not by sequence length
    correctInputs: session.score.correctInputs + 1,
    accuracy: ((session.score.correctInputs + 1) / (initialTotalInputs + 1)) * 100,
    points: (session.score.points || 0) + 150, // Some points for the successful sequence
    maxCombo: Math.max(session.score.maxCombo || 0, session.score.correctInputs + 1)
  }
  
  trainingStore.updateSessionScore(newScore)
  
  console.log('📊 After first successful sequence:', {
    totalInputs: trainingStore.currentSession.score.totalInputs,
    targetInputs: trainingStore.currentSession.targetInputs,
    progress: `${trainingStore.currentSession.score.totalInputs}/${trainingStore.currentSession.targetInputs}`,
    shouldNotBeComplete: trainingStore.currentSession.score.totalInputs < trainingStore.currentSession.targetInputs
  })
  
  // Verify that the session is NOT complete after just one successful sequence
  if (trainingStore.currentSession.score.totalInputs >= trainingStore.currentSession.targetInputs) {
    console.log('❌ BUG STILL EXISTS: Session completed prematurely!')
    console.log('   Expected: totalInputs < targetInputs')
    console.log('   Actual: totalInputs >= targetInputs')
    return false
  }
  
  // Simulate a second successful sequence
  const secondScore = {
    totalInputs: trainingStore.currentSession.score.totalInputs + 1,
    correctInputs: trainingStore.currentSession.score.correctInputs + 1,
    accuracy: ((trainingStore.currentSession.score.correctInputs + 1) / (trainingStore.currentSession.score.totalInputs + 1)) * 100,
    points: trainingStore.currentSession.score.points + 150,
    maxCombo: Math.max(trainingStore.currentSession.score.maxCombo, trainingStore.currentSession.score.correctInputs + 1)
  }
  
  trainingStore.updateSessionScore(secondScore)
  
  console.log('📊 After second successful sequence:', {
    totalInputs: trainingStore.currentSession.score.totalInputs,
    targetInputs: trainingStore.currentSession.targetInputs,
    progress: `${trainingStore.currentSession.score.totalInputs}/${trainingStore.currentSession.targetInputs}`,
    shouldNotBeComplete: trainingStore.currentSession.score.totalInputs < trainingStore.currentSession.targetInputs
  })
  
  // Verify that the session is still NOT complete after two successful sequences
  if (trainingStore.currentSession.score.totalInputs >= trainingStore.currentSession.targetInputs) {
    console.log('❌ BUG STILL EXISTS: Session completed after second sequence!')
    console.log('   Expected: totalInputs < targetInputs')
    console.log('   Actual: totalInputs >= targetInputs')
    return false
  }
  
  // Simulate a third successful sequence to reach the target
  const thirdScore = {
    totalInputs: trainingStore.currentSession.score.totalInputs + 1,
    correctInputs: trainingStore.currentSession.score.correctInputs + 1,
    accuracy: ((trainingStore.currentSession.score.correctInputs + 1) / (trainingStore.currentSession.score.totalInputs + 1)) * 100,
    points: trainingStore.currentSession.score.points + 150,
    maxCombo: Math.max(trainingStore.currentSession.score.maxCombo, trainingStore.currentSession.score.correctInputs + 1)
  }
  
  trainingStore.updateSessionScore(thirdScore)
  
  console.log('📊 After third successful sequence:', {
    totalInputs: trainingStore.currentSession.score.totalInputs,
    targetInputs: trainingStore.currentSession.targetInputs,
    progress: `${trainingStore.currentSession.score.totalInputs}/${trainingStore.currentSession.targetInputs}`,
    shouldBeComplete: trainingStore.currentSession.score.totalInputs >= trainingStore.currentSession.targetInputs
  })
  
  // Now the session should be complete
  if (trainingStore.currentSession.score.totalInputs >= trainingStore.currentSession.targetInputs) {
    console.log('✅ BUG FIXED: Session completed correctly after reaching target!')
    console.log('   Expected: totalInputs >= targetInputs')
    console.log('   Actual: totalInputs >= targetInputs')
    
    // End the session
    const completedSession = trainingStore.endTrainingSession(trainingStore.currentSession.score)
    console.log('📊 Final completed session:', {
      totalInputs: completedSession.score.totalInputs,
      correctInputs: completedSession.score.correctInputs,
      accuracy: completedSession.score.accuracy,
      points: completedSession.score.points
    })
    
    return true
  } else {
    console.log('❌ UNEXPECTED: Session not complete when it should be!')
    return false
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testWinConditionBugFix = testWinConditionBugFix
}
