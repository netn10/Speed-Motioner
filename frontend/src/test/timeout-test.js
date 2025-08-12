// Test to verify timeout behavior and progress increment
import { useTrainingStore } from '../stores/trainingStore'

// Test timeout behavior
export const testTimeoutBehavior = () => {
  const trainingStore = useTrainingStore.getState()
  
  console.log('🧪 Testing timeout behavior...')
  
  // Start a training session with target of 10 inputs
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('📊 Initial session:', {
    totalInputs: session.score.totalInputs,
    correctInputs: session.score.correctInputs,
    targetInputs: session.targetInputs
  })
  
  // Simulate a timeout by directly calling updateSessionScore
  console.log('🕐 Simulating timeout...')
  const currentScore = session.score
  const timeoutScore = {
    totalInputs: currentScore.totalInputs + 1,
    correctInputs: currentScore.correctInputs,
    points: currentScore.points || 0,
    accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
  }
  
  trainingStore.updateSessionScore(timeoutScore)
  
  // Check the updated score
  const updatedSession = trainingStore.currentSession
  console.log('📊 After timeout simulation:', {
    totalInputs: updatedSession.score.totalInputs,
    correctInputs: updatedSession.score.correctInputs,
    targetInputs: updatedSession.targetInputs,
    progress: `${updatedSession.score.totalInputs}/${updatedSession.targetInputs}`
  })
  
  // Verify the behavior
  if (updatedSession.score.totalInputs === 1) {
    console.log('✅ PASS: Timeout correctly increments progress to 1')
  } else {
    console.log('❌ FAIL: Timeout did not increment progress correctly')
  }
  
  if (updatedSession.score.correctInputs === 0) {
    console.log('✅ PASS: Timeout correctly keeps correct inputs at 0')
  } else {
    console.log('❌ FAIL: Timeout incorrectly changed correct inputs')
  }
}

// Test multiple timeouts to see if progress increments correctly
export const testMultipleTimeouts = () => {
  console.log('🧪 Testing multiple timeouts...')
  
  // Get the training store
  const { useTrainingStore } = require('../stores/trainingStore')
  const trainingStore = useTrainingStore.getState()
  
  // Start a new session with target of 10 inputs
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('📊 Initial session:', {
    totalInputs: session.score.totalInputs,
    targetInputs: session.targetInputs
  })
  
  // Simulate multiple timeouts
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const currentScore = trainingStore.currentSession.score
      const timeoutScore = {
        totalInputs: currentScore.totalInputs + 1,
        correctInputs: currentScore.correctInputs,
        points: currentScore.points || 0,
        accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
      }
      
      console.log(`🕐 Simulating timeout ${i + 1}:`, timeoutScore)
      trainingStore.updateSessionScore(timeoutScore)
      
      console.log(`📊 After timeout ${i + 1}:`, {
        totalInputs: trainingStore.currentSession.score.totalInputs,
        correctInputs: trainingStore.currentSession.score.correctInputs,
        progress: `${trainingStore.currentSession.score.totalInputs}/${trainingStore.currentSession.targetInputs}`
      })
    }, i * 1000) // Space out timeouts by 1 second
  }
}

// Simple test function that can be run in browser console
export const simpleTimeoutTest = () => {
  console.log('🧪 Simple timeout test starting...')
  
  // Get the training store
  const { useTrainingStore } = require('../stores/trainingStore')
  const trainingStore = useTrainingStore.getState()
  
  // Start a new session
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('📊 Initial session:', session.score)
  
  // Simulate a timeout
  const timeoutScore = {
    totalInputs: session.score.totalInputs + 1,
    correctInputs: session.score.correctInputs,
    points: 0,
    accuracy: 0
  }
  
  console.log('🕐 Simulating timeout with score:', timeoutScore)
  trainingStore.updateSessionScore(timeoutScore)
  
  // Check result
  const updatedSession = trainingStore.currentSession
  console.log('📊 After timeout:', updatedSession.score)
  
  if (updatedSession.score.totalInputs === 1) {
    console.log('✅ SUCCESS: Progress incremented to 1')
  } else {
    console.log('❌ FAIL: Progress not incremented correctly')
  }
}

// Test the exact scenario described by the user
export const testExactScenario = () => {
  console.log('🧪 Testing exact scenario: timeout should go from 0/10 to 1/10')
  
  // Get the training store
  const { useTrainingStore } = require('../stores/trainingStore')
  const trainingStore = useTrainingStore.getState()
  
  // Start a new session with target 10
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('📊 Initial state:', {
    totalInputs: session.score.totalInputs,
    correctInputs: session.score.correctInputs,
    targetInputs: session.targetInputs,
    progress: `${session.score.totalInputs}/${session.targetInputs}`
  })
  
  // Wait a moment for the session to be fully initialized
  setTimeout(() => {
    // Simulate a timeout exactly like the handleInputTimeout function does
    const currentScore = trainingStore.currentSession.score
    const timeoutScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs,
      points: currentScore.points || 0,
      accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
    }
    
    console.log('🕐 Simulating timeout with score update:', timeoutScore)
    trainingStore.updateSessionScore(timeoutScore)
    
    // Check the result after a short delay
    setTimeout(() => {
      const updatedSession = trainingStore.currentSession
      console.log('📊 After timeout simulation:', {
        totalInputs: updatedSession.score.totalInputs,
        correctInputs: updatedSession.score.correctInputs,
        targetInputs: updatedSession.targetInputs,
        progress: `${updatedSession.score.totalInputs}/${updatedSession.targetInputs}`
      })
      
      if (updatedSession.score.totalInputs === 1) {
        console.log('✅ SUCCESS: Progress correctly incremented to 1/10')
      } else {
        console.log('❌ FAIL: Progress not incremented correctly')
        console.log('Expected: 1, Got:', updatedSession.score.totalInputs)
      }
    }, 100)
  }, 100)
}

// Test rapid state updates to see if they all get processed
export const testRapidUpdates = () => {
  console.log('🧪 Testing rapid state updates...')
  
  // Get the training store
  const { useTrainingStore } = require('../stores/trainingStore')
  const trainingStore = useTrainingStore.getState()
  
  // Start a new session
  const session = trainingStore.startTrainingSession('motion', 'medium', 10)
  console.log('📊 Initial session:', session.score)
  
  // Simulate rapid updates
  for (let i = 0; i < 5; i++) {
    const currentScore = trainingStore.currentSession.score
    const timeoutScore = {
      totalInputs: currentScore.totalInputs + 1,
      correctInputs: currentScore.correctInputs,
      points: currentScore.points || 0,
      accuracy: (currentScore.correctInputs / (currentScore.totalInputs + 1)) * 100
    }
    
    console.log(`🕐 Rapid update ${i + 1}:`, timeoutScore)
    trainingStore.updateSessionScore(timeoutScore)
  }
  
  // Check final result
  setTimeout(() => {
    const finalSession = trainingStore.currentSession
    console.log('📊 Final result after rapid updates:', {
      totalInputs: finalSession.score.totalInputs,
      correctInputs: finalSession.score.correctInputs,
      progress: `${finalSession.score.totalInputs}/${finalSession.targetInputs}`
    })
    
    if (finalSession.score.totalInputs === 5) {
      console.log('✅ SUCCESS: All rapid updates processed correctly')
    } else {
      console.log('❌ FAIL: Not all rapid updates were processed')
    }
  }, 100)
}

// Test the exact scenario the user reported (0/10 to 1/10)
export function testUserScenario() {
  console.log('🧪 Testing user scenario: 0/10 to 1/10')
  
  // Get the current session
  const currentSession = useTrainingStore.getState().currentSession
  if (!currentSession) {
    console.log('❌ No active session found')
    return
  }
  
  console.log('📊 Initial state:', {
    totalInputs: currentSession.score.totalInputs,
    targetInputs: currentSession.targetInputs,
    isTraining: useTrainingStore.getState().isTraining
  })
  
  // Simulate a timeout
  console.log('🕐 Simulating timeout...')
  const newScore = {
    totalInputs: currentSession.score.totalInputs + 1,
    correctInputs: currentSession.score.correctInputs,
    accuracy: (currentSession.score.correctInputs / (currentSession.score.totalInputs + 1)) * 100,
    points: currentSession.score.points || 0
  }
  
  console.log('📊 Updating score:', {
    from: currentSession.score,
    to: newScore
  })
  
  useTrainingStore.getState().updateSessionScore(newScore)
  
  // Check the result
  setTimeout(() => {
    const updatedSession = useTrainingStore.getState().currentSession
    console.log('✅ Result:', {
      totalInputs: updatedSession.score.totalInputs,
      targetInputs: updatedSession.targetInputs,
      success: updatedSession.score.totalInputs === currentSession.score.totalInputs + 1
    })
  }, 100)
}

// Test multiple rapid timeouts
export function testRapidTimeouts() {
  console.log('🧪 Testing rapid timeouts')
  
  const currentSession = useTrainingStore.getState().currentSession
  if (!currentSession) {
    console.log('❌ No active session found')
    return
  }
  
  const initialTotalInputs = currentSession.score.totalInputs
  
  // Simulate 5 rapid timeouts
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const session = useTrainingStore.getState().currentSession
      const newScore = {
        totalInputs: session.score.totalInputs + 1,
        correctInputs: session.score.correctInputs,
        accuracy: (session.score.correctInputs / (session.score.totalInputs + 1)) * 100,
        points: session.score.points || 0
      }
      
      console.log(`🕐 Timeout ${i + 1}:`, {
        from: session.score.totalInputs,
        to: newScore.totalInputs
      })
      
      useTrainingStore.getState().updateSessionScore(newScore)
    }, i * 200) // 200ms apart
  }
  
  // Check final result
  setTimeout(() => {
    const finalSession = useTrainingStore.getState().currentSession
    console.log('✅ Final result:', {
      initial: initialTotalInputs,
      final: finalSession.score.totalInputs,
      expected: initialTotalInputs + 5,
      success: finalSession.score.totalInputs === initialTotalInputs + 5
    })
  }, 1500)
}

// Simple debug function to check current state
export function debugCurrentState() {
  const state = useTrainingStore.getState()
  const currentSession = state.currentSession
  
  console.log('🔍 Current training state:', {
    isTraining: state.isTraining,
    currentSession: currentSession ? {
      id: currentSession.id,
      mode: currentSession.mode,
      difficulty: currentSession.difficulty,
      targetInputs: currentSession.targetInputs,
      score: currentSession.score,
      startTime: new Date(currentSession.startTime).toLocaleTimeString(),
      endTime: currentSession.endTime ? new Date(currentSession.endTime).toLocaleTimeString() : null
    } : null,
    sessionStartTime: state.sessionStartTime ? new Date(state.sessionStartTime).toLocaleTimeString() : null,
    lastUpdateTime: state.lastUpdateTime ? new Date(state.lastUpdateTime).toLocaleTimeString() : null
  })
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testTimeoutBehavior = testTimeoutBehavior
  window.testMultipleTimeouts = testMultipleTimeouts
  window.simpleTimeoutTest = simpleTimeoutTest
  window.testExactScenario = testExactScenario
  window.testRapidUpdates = testRapidUpdates
  window.testUserScenario = testUserScenario
  window.testRapidTimeouts = testRapidTimeouts
  window.debugCurrentState = debugCurrentState
}
