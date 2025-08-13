// Motion Input Utility Functions
// Handles recognition and validation of fighting game motion inputs

/**
 * Motion input patterns using numpad notation:
 * 7 8 9    ↖ ↑ ↗
 * 4 5 6    ← N →  (5 = neutral)
 * 1 2 3    ↙ ↓ ↘
 */

// Convert input buttons to numpad notation
export const inputToNumpad = (input, inputButtons) => {
  if (input === inputButtons.up) return '8'
  if (input === inputButtons.down) return '2'
  if (input === inputButtons.left) return '4'
  if (input === inputButtons.right) return '6'
  if (input === inputButtons.up && input === inputButtons.left) return '7'
  if (input === inputButtons.up && input === inputButtons.right) return '9'
  if (input === inputButtons.down && input === inputButtons.left) return '1'
  if (input === inputButtons.down && input === inputButtons.right) return '3'
  return null // Not a directional input
}

// Convert numpad notation back to display string
export const numpadToDisplay = (numpad) => {
  const numpadMap = {
    '1': '↙',
    '2': '↓', 
    '3': '↘',
    '4': '←',
    '5': 'N',
    '6': '→',
    '7': '↖',
    '8': '↑',
    '9': '↗'
  }
  return numpadMap[numpad] || numpad
}

// Motion input definitions
export const MOTION_PATTERNS = {
  // Quarter-Circle Motions
  QCF: ['2', '3', '6'], // Quarter-Circle Forward (Hadouken)
  QCB: ['2', '1', '4'], // Quarter-Circle Back (Ashura Senku)
  
  // Half-Circle Motions  
  HCF: ['4', '1', '2', '3', '6'], // Half-Circle Forward (Banishing Flat)
  HCB: ['6', '3', '2', '1', '4'], // Half-Circle Back (Argentina Backbreaker)
  
  // Dragon Punch Motion
  DP: ['6', '2', '3'], // Dragon Punch (Shoryuken)
  
  // 360 Degree Motion (simplified - can start from any direction)
  '360': ['4', '1', '2', '3', '6', '9', '8', '7'], // Full circle
  '360_ALT1': ['2', '3', '6', '9', '8', '7', '4', '1'], // Starting from down
  '360_ALT2': ['6', '9', '8', '7', '4', '1', '2', '3'], // Starting from right
  '360_ALT3': ['8', '7', '4', '1', '2', '3', '6', '9'], // Starting from up
  
  // Charge Motions (require holding for duration)
  CHARGE_B_F: ['4', '6'], // Charge Back, Forward (Sonic Boom)
  CHARGE_D_U: ['2', '8'], // Charge Down, Up (Flash Kick)
  
  // Double Motions
  D_QCF: ['2', '3', '6', '2', '3', '6'], // Double Quarter-Circle Forward (Shinku Hadouken)
  D_QCB: ['2', '1', '4', '2', '1', '4'], // Double Quarter-Circle Back (Messatsu Gou Hadou)
  
  // Additional common motions
  QCF_QCF: ['2', '3', '6', '2', '3', '6'], // Same as D_QCF but different name
  QCB_QCB: ['2', '1', '4', '2', '1', '4'], // Same as D_QCB but different name
  HCF_HCF: ['4', '1', '2', '3', '6', '4', '1', '2', '3', '6'], // Double Half-Circle Forward
}

// Motion input display names
export const MOTION_NAMES = {
  QCF: 'Quarter-Circle Forward (236)',
  QCB: 'Quarter-Circle Back (214)', 
  HCF: 'Half-Circle Forward (41236)',
  HCB: 'Half-Circle Back (63214)',
  DP: 'Dragon Punch (623)',
  '360': '360° Motion',
  '360_ALT1': '360° Motion (Alt)',
  '360_ALT2': '360° Motion (Alt)',
  '360_ALT3': '360° Motion (Alt)',
  CHARGE_B_F: 'Charge Back-Forward',
  CHARGE_D_U: 'Charge Down-Up',
  D_QCF: 'Double QCF (236236)',
  D_QCB: 'Double QCB (214214)',
  QCF_QCF: 'Double QCF (236236)',
  QCB_QCB: 'Double QCB (214214)',
  HCF_HCF: 'Double HCF'
}

// Convert input sequence to numpad notation sequence
export const inputSequenceToNumpad = (inputs, inputButtons) => {
  return inputs.map(input => inputToNumpad(input, inputButtons)).filter(numpad => numpad !== null)
}

// Check if a sequence matches a motion pattern (allowing for some leniency)
export const matchesMotionPattern = (inputSequence, pattern, leniency = true) => {
  if (!inputSequence || inputSequence.length === 0) return false
  
  // For exact matches
  if (!leniency) {
    return inputSequence.join('') === pattern.join('')
  }
  
  // With leniency: allow extra inputs between required inputs, but maintain order
  let patternIndex = 0
  let inputIndex = 0
  
  while (inputIndex < inputSequence.length && patternIndex < pattern.length) {
    if (inputSequence[inputIndex] === pattern[patternIndex]) {
      patternIndex++
    }
    inputIndex++
  }
  
  return patternIndex === pattern.length
}

// Check if input sequence contains any motion pattern
export const detectMotionPattern = (inputSequence, inputButtons, maxLookback = 15) => {
  const numpadSequence = inputSequenceToNumpad(inputSequence.slice(-maxLookback), inputButtons)
  
  // Check each motion pattern
  for (const [motionName, pattern] of Object.entries(MOTION_PATTERNS)) {
    if (matchesMotionPattern(numpadSequence, pattern)) {
      return {
        motion: motionName,
        pattern: pattern,
        displayName: MOTION_NAMES[motionName],
        numpadSequence: numpadSequence,
        matched: true
      }
    }
  }
  
  return {
    motion: null,
    pattern: null,
    displayName: null,
    numpadSequence: numpadSequence,
    matched: false
  }
}

// Check for partial motion pattern matches (for progress tracking)
export const detectPartialMotionPattern = (inputSequence, motionName, inputButtons) => {
  const pattern = MOTION_PATTERNS[motionName]
  if (!pattern) return { progress: 0, isValid: false }
  
  const numpadSequence = inputSequenceToNumpad(inputSequence, inputButtons)
  
  // Check how much of the pattern is completed
  let maxProgress = 0
  
  // Check all possible ending positions in the input sequence
  for (let i = 0; i < numpadSequence.length; i++) {
    let progress = 0
    let inputIndex = i
    
    // Try to match pattern from this position backwards
    for (let patternIndex = 0; patternIndex < pattern.length && inputIndex >= 0; patternIndex++) {
      if (numpadSequence[inputIndex] === pattern[pattern.length - 1 - patternIndex]) {
        progress++
        inputIndex--
      } else {
        break
      }
    }
    
    maxProgress = Math.max(maxProgress, progress)
  }
  
  return {
    progress: maxProgress,
    isValid: maxProgress > 0,
    total: pattern.length,
    percentage: (maxProgress / pattern.length) * 100
  }
}

// Special handling for charge motions (require holding)
export const isChargeMotion = (motionName) => {
  return motionName === 'CHARGE_B_F' || motionName === 'CHARGE_D_U'
}

// Validate charge motion with timing
export const validateChargeMotion = (inputHistory, motionName, inputButtons, chargeTime = 2000) => {
  if (!isChargeMotion(motionName)) {
    return false
  }
  
  const pattern = MOTION_PATTERNS[motionName]
  if (!pattern || pattern.length !== 2) {
    return false
  }
  
  const chargeDirection = pattern[0]
  const releaseDirection = pattern[1]
  
  // Find the most recent release direction
  let releaseIndex = -1
  for (let i = inputHistory.length - 1; i >= 0; i--) {
    const numpad = inputToNumpad(inputHistory[i].input, inputButtons)
    if (numpad === releaseDirection) {
      releaseIndex = i
      break
    }
  }
  
  if (releaseIndex === -1) {
    return false
  }
  
  // Look backwards from release to find charge
  let chargeStartTime = null
  let chargeEndTime = inputHistory[releaseIndex].timestamp
  
  for (let i = releaseIndex - 1; i >= 0; i--) {
    const numpad = inputToNumpad(inputHistory[i].input, inputButtons)
    if (numpad === chargeDirection) {
      if (chargeStartTime === null) {
        chargeStartTime = inputHistory[i].timestamp
      }
    } else if (chargeStartTime !== null) {
      // Found non-charge input, stop looking
      break
    }
  }
  
  if (chargeStartTime === null) {
    return false
  }
  
  const actualChargeTime = chargeEndTime - chargeStartTime
  return actualChargeTime >= chargeTime
}

// Basic timing window validation for motion inputs
export const validateMotionTiming = (inputSequence, motionName, maxTimeBetweenInputs = 500) => {
  if (!inputSequence || inputSequence.length < 2) {
    return true // Single inputs don't need timing validation
  }
  
  // Check if any two consecutive inputs are too far apart
  for (let i = 1; i < inputSequence.length; i++) {
    const prevInput = inputSequence[i - 1]
    const currentInput = inputSequence[i]
    
    // If inputs have timestamps, check timing
    if (prevInput.timestamp && currentInput.timestamp) {
      const timeDiff = currentInput.timestamp - prevInput.timestamp
      if (timeDiff > maxTimeBetweenInputs) {
        return false
      }
    }
  }
  
  return true
}

// Generate training patterns for motion inputs
export const generateMotionTrainingPatterns = (inputButtons, activeAttackButtons) => {
  const patterns = []
  
  // Add basic motion + attack combinations
  Object.entries(MOTION_PATTERNS).forEach(([motionName, motionPattern]) => {
    // Skip charge motions for basic training (they need special timing)
    if (isChargeMotion(motionName)) return
    
    // Convert numpad pattern to actual input buttons
    const inputPattern = motionPattern.map(numpad => {
      switch (numpad) {
        case '8': return inputButtons.up
        case '2': return inputButtons.down  
        case '4': return inputButtons.left
        case '6': return inputButtons.right
        case '1': return inputButtons.down // Simplified: treat diagonals as single directions for now
        case '3': return inputButtons.down
        case '7': return inputButtons.up
        case '9': return inputButtons.up
        default: return null
      }
    }).filter(input => input !== null)
    
    // Add motion + attack patterns
    activeAttackButtons.forEach(attackButton => {
      patterns.push([...inputPattern, attackButton])
    })
  })
  
  return patterns
}

// Create motion input display components
export const createMotionDisplay = (motionName, inputButtons) => {
  const pattern = MOTION_PATTERNS[motionName]
  if (!pattern) return null
  
  return {
    name: motionName,
    displayName: MOTION_NAMES[motionName],
    pattern: pattern,
    display: pattern.map(numpad => numpadToDisplay(numpad)).join(' '),
    inputs: pattern.map(numpad => {
      switch (numpad) {
        case '8': return inputButtons.up
        case '2': return inputButtons.down
        case '4': return inputButtons.left  
        case '6': return inputButtons.right
        case '1': return inputButtons.down // Simplified
        case '3': return inputButtons.down
        case '7': return inputButtons.up
        case '9': return inputButtons.up
        default: return null
      }
    }).filter(input => input !== null)
  }
}

// Generate custom training patterns based on selected types
export const generateCustomTrainingPatterns = (inputButtons, activeAttackButtons, customConfig) => {
  const patterns = []
  
  // Basic motion patterns
  if (customConfig.includeBasicMotions) {
    patterns.push(
      // Single movement inputs
      [inputButtons.up],
      [inputButtons.down], 
      [inputButtons.left],
      [inputButtons.right],
      // Single attack inputs
      [activeAttackButtons[0]],
      [activeAttackButtons[1]],
      // Basic movement + attack combinations
      [inputButtons.up, activeAttackButtons[0]],
      [inputButtons.down, activeAttackButtons[0]], 
      [inputButtons.left, activeAttackButtons[0]],
      [inputButtons.right, activeAttackButtons[0]]
    )
  }
  
  // Fighting game motion patterns
  if (customConfig.includeFightingGameMotions) {
    patterns.push(
      // Quarter-Circle Forward (QCF) - 236 + attack
      [inputButtons.down, inputButtons.right, activeAttackButtons[0]],
      [inputButtons.down, inputButtons.right, activeAttackButtons[1]],
      
      // Quarter-Circle Back (QCB) - 214 + attack  
      [inputButtons.down, inputButtons.left, activeAttackButtons[0]],
      [inputButtons.down, inputButtons.left, activeAttackButtons[1]],
      
      // Dragon Punch (DP) - 623 + attack
      [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]],
      [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[1]],
      
      // Half-Circle Forward (HCF) - 41236 + attack (simplified)
      [inputButtons.left, inputButtons.down, inputButtons.right, activeAttackButtons[0]],
      
      // Half-Circle Back (HCB) - 63214 + attack (simplified)
      [inputButtons.right, inputButtons.down, inputButtons.left, activeAttackButtons[0]],
      
      // Charge Back-Forward (simplified for training)
      [inputButtons.left, inputButtons.right, activeAttackButtons[0]],
      
      // Charge Down-Up (simplified for training)  
      [inputButtons.down, inputButtons.up, activeAttackButtons[0]],
      
      // Double Quarter-Circle Forward - 236236 + attack
      [inputButtons.down, inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]]
    )
  }
  
  // Combo training patterns
  if (customConfig.includeComboTraining) {
    patterns.push(
      // Basic 2-hit combos
      [activeAttackButtons[0], activeAttackButtons[0]], // double attack
      [activeAttackButtons[0], activeAttackButtons[1]], // first + second
      [activeAttackButtons[1], activeAttackButtons[0]], // second + first
      
      // 3-hit combos
      [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[0]], // triple first attack
      [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]], // LP -> MP -> LP
      [activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]], // MP -> LP -> MP
      [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[2] || activeAttackButtons[1]], // LP -> MP -> HP/MP
      
      // 4-hit combos
      [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[1]], // LP LP MP MP
      [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]], // LP MP LP MP
      [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[2] || activeAttackButtons[1], activeAttackButtons[0]], // LP MP HP LP
      
      // 5-hit combos
      [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[1], activeAttackButtons[0]], // LP LP MP MP LP
      [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]], // LP MP LP MP LP
      
      // Movement + attack combos (2-3 hits)
      [inputButtons.up, activeAttackButtons[0]], // up + attack
      [inputButtons.down, activeAttackButtons[1]], // down + different attack
      [inputButtons.left, activeAttackButtons[0], activeAttackButtons[1]], // left + LP + MP
      [inputButtons.right, activeAttackButtons[1], activeAttackButtons[0]], // right + MP + LP
      
      // Complex movement + attack combos (4-6 hits)
      [inputButtons.up, activeAttackButtons[0], inputButtons.down, activeAttackButtons[1]], // up LP down MP
      [inputButtons.left, activeAttackButtons[0], activeAttackButtons[1], inputButtons.right], // left LP MP right
      [inputButtons.down, activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[1], inputButtons.up], // down LP LP MP up
      [inputButtons.right, activeAttackButtons[1], inputButtons.left, activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]], // right MP left LP MP LP
      
      // Mixed directional + attack combos (6+ hits)
      [inputButtons.up, inputButtons.down, activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]], // up down LP MP LP MP
      [inputButtons.left, inputButtons.right, inputButtons.left, activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]], // left right left LP MP LP
      [activeAttackButtons[0], inputButtons.up, activeAttackButtons[1], inputButtons.down, activeAttackButtons[0], inputButtons.left, activeAttackButtons[1]], // LP up MP down LP left MP
      
      // Pure directional combinations
      [inputButtons.up, inputButtons.down], // up + down
      [inputButtons.left, inputButtons.right], // left + right
      [inputButtons.up, activeAttackButtons[0], inputButtons.down] // up + attack + down
    )
  }

  // Custom combos from user
  if (customConfig.includeCustomCombo && customConfig.customCombo) {
    patterns.push(customConfig.customCombo.inputs)
  }
  
  return patterns
}

// Filter training patterns based on difficulty level
export const filterPatternsByDifficulty = (patterns, difficulty) => {
  return patterns.filter(pattern => {
    const length = pattern.length
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return length === 1 // Only single inputs
      case 'medium':
        return length === 2 // Only 2-input patterns
      case 'hard':
        return length >= 3 && length <= 4 // 3-4 input patterns
      default:
        return true // Return all patterns if difficulty is unknown
    }
  })
}

// Generate difficulty-appropriate training patterns
export const generateDifficultyBasedPatterns = (inputButtons, activeAttackButtons, mode, difficulty) => {
  let allPatterns = []
  
  // Base patterns for different modes
  switch (mode) {
    case 'motion':
      allPatterns = [
        // Single movement inputs (Easy)
        [inputButtons.up],
        [inputButtons.down],
        [inputButtons.left],
        [inputButtons.right],
        // Single attack inputs (Easy)
        [activeAttackButtons[0]],
        [activeAttackButtons[1]],
        // 2-input movement + attack (Medium)
        [inputButtons.up, activeAttackButtons[0]],
        [inputButtons.down, activeAttackButtons[0]],
        [inputButtons.left, activeAttackButtons[0]],
        [inputButtons.right, activeAttackButtons[0]],
        [inputButtons.up, activeAttackButtons[1]],
        [inputButtons.down, activeAttackButtons[1]],
        [inputButtons.left, activeAttackButtons[1]],
        [inputButtons.right, activeAttackButtons[1]],
        // 3-input motion patterns (Hard)
        [inputButtons.down, inputButtons.right, activeAttackButtons[0]], // QCF + LP
        [inputButtons.down, inputButtons.left, activeAttackButtons[0]], // QCB + LP
        [inputButtons.left, inputButtons.right, activeAttackButtons[0]], // Charge B-F + LP
        [inputButtons.down, inputButtons.up, activeAttackButtons[0]], // Charge D-U + LP
        // 4-input motion patterns (Hard)
        [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // DP + LP
        [inputButtons.left, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // HCF + LP (simplified)
        [inputButtons.right, inputButtons.down, inputButtons.left, activeAttackButtons[0]], // HCB + LP (simplified)
      ]
      break

    case 'motions':
      allPatterns = [
        // Single attack inputs (Easy - rare but possible for basic training)
        [activeAttackButtons[0]],
        [activeAttackButtons[1]],
        // 2-input charge motions (Medium)
        [inputButtons.left, inputButtons.right], // Charge B-F
        [inputButtons.down, inputButtons.up], // Charge D-U
        [inputButtons.left, activeAttackButtons[0]], // Left + attack
        [inputButtons.right, activeAttackButtons[0]], // Right + attack
        [inputButtons.up, activeAttackButtons[0]], // Up + attack
        [inputButtons.down, activeAttackButtons[0]], // Down + attack
        // 3-input quarter circles (Hard)
        [inputButtons.down, inputButtons.right, activeAttackButtons[0]], // QCF + LP
        [inputButtons.down, inputButtons.right, activeAttackButtons[1]], // QCF + MP
        [inputButtons.down, inputButtons.left, activeAttackButtons[0]], // QCB + LP
        [inputButtons.down, inputButtons.left, activeAttackButtons[1]], // QCB + MP
        // 4-input complex motions (Hard)
        [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // DP + LP
        [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[1]], // DP + MP
        [inputButtons.left, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // HCF + LP
        [inputButtons.right, inputButtons.down, inputButtons.left, activeAttackButtons[0]], // HCB + LP
      ]
      break

    case 'combos':
      allPatterns = [
        // Single attack inputs (Easy)
        [activeAttackButtons[0]],
        [activeAttackButtons[1]],
        // 2-hit combos (Medium)
        [activeAttackButtons[0], activeAttackButtons[0]], // double attack
        [activeAttackButtons[0], activeAttackButtons[1]], // first + second
        [activeAttackButtons[1], activeAttackButtons[0]], // second + first
        [inputButtons.up, activeAttackButtons[0]], // up + attack
        [inputButtons.down, activeAttackButtons[1]], // down + attack
        [inputButtons.left, inputButtons.right], // left + right
        [inputButtons.up, inputButtons.down], // up + down
        // 3-hit combos (Hard)
        [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[0]], // triple attack
        [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]], // LP -> MP -> LP
        [activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]], // MP -> LP -> MP
        [inputButtons.left, activeAttackButtons[0], activeAttackButtons[1]], // left + LP + MP
        [inputButtons.right, activeAttackButtons[1], activeAttackButtons[0]], // right + MP + LP
        [inputButtons.up, activeAttackButtons[0], inputButtons.down], // up + attack + down
        // 4-hit combos (Hard)
        [activeAttackButtons[0], activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[1]], // LP LP MP MP
        [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]], // LP MP LP MP
        [inputButtons.up, activeAttackButtons[0], inputButtons.down, activeAttackButtons[1]], // up LP down MP
        [inputButtons.left, activeAttackButtons[0], activeAttackButtons[1], inputButtons.right], // left LP MP right
      ]
      break

    case 'custom':
      allPatterns = [
        // Single inputs (Easy)
        [inputButtons.up],
        [inputButtons.down],
        [inputButtons.left],
        [inputButtons.right],
        [activeAttackButtons[0]],
        [activeAttackButtons[1]],
        // 2-input combinations (Medium)
        [inputButtons.up, activeAttackButtons[0]],
        [inputButtons.down, activeAttackButtons[0]],
        [inputButtons.left, activeAttackButtons[0]],
        [inputButtons.right, activeAttackButtons[0]],
        [activeAttackButtons[0], activeAttackButtons[1]],
        [inputButtons.up, inputButtons.down],
        [inputButtons.left, inputButtons.right],
        // 3-input combinations (Hard)
        [inputButtons.down, inputButtons.right, activeAttackButtons[0]], // QCF + LP
        [inputButtons.down, inputButtons.left, activeAttackButtons[0]], // QCB + LP
        [inputButtons.up, activeAttackButtons[0], inputButtons.down],
        [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0]],
        // 4-input combinations (Hard)
        [inputButtons.right, inputButtons.down, inputButtons.right, activeAttackButtons[0]], // DP + LP
        [activeAttackButtons[0], activeAttackButtons[1], activeAttackButtons[0], activeAttackButtons[1]],
        [inputButtons.up, activeAttackButtons[0], inputButtons.down, activeAttackButtons[1]],
        [inputButtons.left, activeAttackButtons[0], activeAttackButtons[1], inputButtons.right],
      ]
      break

    default:
      allPatterns = [
        [inputButtons.up],
        [inputButtons.down],
        [inputButtons.left],
        [inputButtons.right],
        [activeAttackButtons[0]],
        [activeAttackButtons[1]]
      ]
  }
  
  // Filter patterns based on difficulty
  const filteredPatterns = filterPatternsByDifficulty(allPatterns, difficulty)
  
  // Ensure we always have at least a few patterns
  if (filteredPatterns.length === 0) {
    console.warn(`No patterns found for difficulty ${difficulty}, falling back to single inputs`)
    return [
      [inputButtons.up],
      [inputButtons.down],
      [inputButtons.left],
      [inputButtons.right],
      [activeAttackButtons[0]],
      [activeAttackButtons[1]]
    ]
  }
  
  return filteredPatterns
}

export default {
  MOTION_PATTERNS,
  MOTION_NAMES,
  inputToNumpad,
  numpadToDisplay,
  inputSequenceToNumpad,
  matchesMotionPattern,
  detectMotionPattern,
  detectPartialMotionPattern,
  isChargeMotion,
  validateChargeMotion,
  generateMotionTrainingPatterns,
  generateCustomTrainingPatterns,
  createMotionDisplay,
  filterPatternsByDifficulty,
  generateDifficultyBasedPatterns
}
