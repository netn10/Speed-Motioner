// Test file to verify max combo behavior
import { useGameStore } from '../stores/gameStore'

describe('Max Combo Tests', () => {
  let gameStore

  beforeEach(() => {
    // Reset the game store
    gameStore = useGameStore.getState()
    gameStore.resetGame()
    gameStore.setTrainingMode('motion')
  })

  test('max combo should only increase on successful completions', () => {
    // Complete a valid combo
    gameStore.addInput('w') // up - valid single input
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1) // Should increase on success

    // Add invalid input - should reset combo but not affect max combo
    gameStore.addInput('x') // invalid input
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(1) // Should remain the same

    // Add another invalid input
    gameStore.addInput('y') // another invalid input
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(1) // Should still remain the same
  })

  test('max combo should increase when achieving higher combo count', () => {
    // Complete first combo
    gameStore.addInput('w') // up
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1)

    // Complete second combo
    gameStore.addInput('s') // down
    expect(gameStore.comboCount).toBe(2)
    expect(gameStore.maxCombo).toBe(2) // Should increase to 2

    // Reset with invalid input
    gameStore.addInput('x') // invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(2) // Should remain at 2
  })

  test('max combo should not decrease when combo resets', () => {
    // Achieve a high combo
    gameStore.addInput('w') // up
    gameStore.addInput('s') // down
    gameStore.addInput('a') // left
    expect(gameStore.comboCount).toBe(3)
    expect(gameStore.maxCombo).toBe(3)

    // Reset combo multiple times
    gameStore.addInput('x') // invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(3) // Should remain at 3

    gameStore.addInput('y') // another invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(3) // Should still remain at 3
  })

  test('max combo should work correctly with combo training mode', () => {
    gameStore.setTrainingMode('combos')
    
    // Start a combo but don't complete it
    gameStore.addInput('j') // first attack
    expect(gameStore.comboCount).toBe(0) // Not complete yet
    expect(gameStore.maxCombo).toBe(0) // No successful combo yet

    // Complete the combo
    gameStore.addInput('j') // second attack - completes double attack
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1) // Should increase on completion

    // Reset with invalid input
    gameStore.addInput('x') // invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(1) // Should remain at 1
  })
})

console.log('Max combo tests completed!')
