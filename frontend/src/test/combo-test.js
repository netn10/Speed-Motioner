// Test file to verify combo tracking logic
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'

// Mock the settings store for testing
const mockSettingsStore = {
  inputButtons: {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    lp: 'j',
    mp: 'k',
    hp: 'l',
    lk: 'u',
    mk: 'i',
    hk: 'o',
    block: 'b'
  },
  attackButtonMode: 6
}

// Mock the useSettingsStore.getState function
jest.mock('../stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => mockSettingsStore
  }
}))

describe('Combo Tracking Tests', () => {
  let gameStore

  beforeEach(() => {
    // Reset the game store
    gameStore = useGameStore.getState()
    gameStore.resetGame()
    gameStore.setTrainingMode('motion')
  })

  test('should track correct sequential inputs for motion training', () => {
    // Test single input patterns
    gameStore.addInput('w') // up
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1)

    gameStore.addInput('s') // down
    expect(gameStore.comboCount).toBe(2)
    expect(gameStore.maxCombo).toBe(2)

    // Test wrong input should reset combo
    gameStore.addInput('x') // invalid input
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(2) // max combo should remain
  })

  test('should track correct sequential inputs for combo training', () => {
    gameStore.setTrainingMode('combos')
    
    // Test double attack combo
    gameStore.addInput('j') // first attack
    expect(gameStore.comboCount).toBe(0) // Not a complete combo yet
    
    gameStore.addInput('j') // second attack - completes double attack combo
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1)
  })

  test('should track correct sequential inputs for blocking training', () => {
    gameStore.setTrainingMode('blocking')
    
    // Test block + direction combo
    gameStore.addInput('a') // left
    expect(gameStore.comboCount).toBe(0) // Not a complete combo yet
    
    gameStore.addInput('b') // block - completes left + block combo
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1)
  })

  test('should reset combo on invalid input sequence', () => {
    gameStore.setTrainingMode('combos')
    
    // Start a valid combo
    gameStore.addInput('j') // first attack
    expect(gameStore.comboCount).toBe(0)
    
    // Add invalid input
    gameStore.addInput('x') // invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(0)
  })

  test('should maintain max combo even when current combo resets', () => {
    gameStore.setTrainingMode('motion')
    
    // Complete a combo
    gameStore.addInput('w') // up
    expect(gameStore.comboCount).toBe(1)
    expect(gameStore.maxCombo).toBe(1)
    
    // Reset combo with invalid input
    gameStore.addInput('x') // invalid
    expect(gameStore.comboCount).toBe(0)
    expect(gameStore.maxCombo).toBe(1) // max combo should remain
  })
})

console.log('Combo tracking tests completed!')
