// Test file to verify training timeout fixes
console.log('🧪 Training timeout fix test started')

// Mock the training store
const mockTrainingStore = {
  currentSession: {
    id: 'test-session',
    mode: 'motion',
    difficulty: 'medium',
    startTime: Date.now(),
    targetInputs: 3,
    score: {
      totalInputs: 0,
      correctInputs: 0,
      accuracy: 0,
      points: 0,
      maxCombo: 0
    }
  },
  updateSessionScore: (scoreUpdate) => {
    console.log('📝 Mock updateSessionScore called:', scoreUpdate)
    mockTrainingStore.currentSession.score = {
      ...mockTrainingStore.currentSession.score,
      ...scoreUpdate
    }
    console.log('✅ Mock score updated:', mockTrainingStore.currentSession.score)
  },
  endTrainingSession: (finalScore) => {
    console.log('🏁 Mock endTrainingSession called:', finalScore)
    mockTrainingStore.currentSession = null
  }
}

// Test the timeout logic
let timeoutCount = 0
let isCompleted = false
let timeoutTriggered = false

const handleInputTimeout = () => {
  timeoutCount++
  console.log('🕐 TIMEOUT TRIGGERED! (timeout #' + timeoutCount + ')', {
    isCompleted,
    currentSession: mockTrainingStore.currentSession?.score,
    timeoutTriggered
  })

  if (isCompleted || timeoutTriggered) {
    console.log('❌ Timeout ignored - already completed or timeout already triggered')
    return
  }

  // Set timeout flag to prevent duplicate processing
  timeoutTriggered = true
  isCompleted = true

  // Update score for failed attempt
  const currentScore = mockTrainingStore.currentSession?.score || { totalInputs: 0, correctInputs: 0, accuracy: 0, points: 0 }
  const newScore = {
    totalInputs: currentScore.totalInputs + 1,
    correctInputs: currentScore.correctInputs,
    points: currentScore.points || 0,
    accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
  }

  console.log('📊 Updating score on timeout:', {
    currentScore,
    newScore,
    difference: {
      totalInputs: newScore.totalInputs - currentScore.totalInputs,
      correctInputs: newScore.correctInputs - currentScore.correctInputs
    }
  })

  mockTrainingStore.updateSessionScore(newScore)

  console.log('✅ Score updated after timeout!', { newScore })

  // Reset timeout flag after delay
  setTimeout(() => {
    console.log('🔄 Resetting timeout flag')
    timeoutTriggered = false
  }, 500)
}

// Test multiple timeout calls
console.log('\n🧪 Testing multiple timeout calls...')
console.log('Initial state:', {
  totalInputs: mockTrainingStore.currentSession.score.totalInputs,
  isCompleted,
  timeoutTriggered
})

// Simulate multiple timeout calls
handleInputTimeout()
handleInputTimeout() // Should be ignored
handleInputTimeout() // Should be ignored

setTimeout(() => {
  console.log('\n🧪 Testing after delay...')
  console.log('State after delay:', {
    totalInputs: mockTrainingStore.currentSession.score.totalInputs,
    isCompleted,
    timeoutTriggered
  })
  
  // Reset for next test
  isCompleted = false
  timeoutTriggered = false
  mockTrainingStore.currentSession.score.totalInputs = 0
  
  console.log('\n🧪 Testing progress check...')
  
  // Simulate reaching target
  mockTrainingStore.updateSessionScore({ totalInputs: 3 })
  
  const currentProgress = mockTrainingStore.currentSession.score.totalInputs
  const targetInputs = mockTrainingStore.currentSession.targetInputs
  
  console.log('Progress check:', {
    currentProgress,
    targetInputs,
    willEnd: currentProgress >= targetInputs
  })
  
  if (currentProgress >= targetInputs) {
    console.log('🎯 Training target reached! Ending session.')
    mockTrainingStore.endTrainingSession(mockTrainingStore.currentSession.score)
  }
  
  console.log('\n✅ Training timeout fix test completed')
}, 1000)
