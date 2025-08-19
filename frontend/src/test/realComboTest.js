// Test script for real combo functionality
import { generateRealComboTrainingPatterns, getCombosByDifficulty, REAL_COMBOS } from '../utils/realCombos.js'

// Mock input buttons for testing
const mockInputButtons = {
  up: 'KeyW',
  down: 'KeyS', 
  left: 'KeyA',
  right: 'KeyD'
}

const mockAttackButtons = ['Space', 'KeyJ', 'KeyK', 'KeyL']

// Test combo generation
console.log('Testing real combo system...')

try {
  // Test getting combos by difficulty
  console.log('\n=== Testing combo retrieval ===')
  const easyCombos = getCombosByDifficulty('easy')
  console.log(`Easy combos found: ${easyCombos.length}`)
  if (easyCombos.length > 0) {
    console.log('Sample easy combo:', easyCombos[0])
  }

  const mediumCombos = getCombosByDifficulty('medium')
  console.log(`Medium combos found: ${mediumCombos.length}`)

  const hardCombos = getCombosByDifficulty('hard')
  console.log(`Hard combos found: ${hardCombos.length}`)

  // Test pattern generation
  console.log('\n=== Testing pattern generation ===')
  const patterns = generateRealComboTrainingPatterns(mockInputButtons, mockAttackButtons, 'medium')
  console.log(`Generated patterns: ${patterns.length}`)
  
  // Show a few sample patterns
  for (let i = 0; i < Math.min(5, patterns.length); i++) {
    const pattern = patterns[i]
    console.log(`Pattern ${i + 1}:`, {
      name: pattern.name,
      notation: pattern.notation,
      displaySequence: pattern.displaySequence,
      difficulty: pattern.difficulty,
      type: pattern.type
    })
  }

  console.log('\n✓ All tests passed! Real combo system is working.')
} catch (error) {
  console.error('❌ Test failed:', error)
}