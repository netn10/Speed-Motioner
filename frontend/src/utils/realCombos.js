// Real Fighting Game Combos and Motion Inputs
// This file contains actual combos from popular fighting games

/**
 * Real combo definitions with motion inputs and attack buttons
 * Using numpad notation for directions:
 * 7 8 9    ↖ ↑ ↗
 * 4 5 6    ← N →  (5 = neutral)
 * 1 2 3    ↙ ↓ ↘
 */

// Attack button definitions for different fighting games
export const ATTACK_TYPES = {
  // Street Fighter style (6 buttons)
  SF: {
    LP: 'Light Punch',
    MP: 'Medium Punch', 
    HP: 'Heavy Punch',
    LK: 'Light Kick',
    MK: 'Medium Kick',
    HK: 'Heavy Kick'
  },
  // King of Fighters style (4 buttons)
  KOF: {
    LP: 'Light Punch',
    HP: 'Heavy Punch',
    LK: 'Light Kick', 
    HK: 'Heavy Kick'
  },
  // Tekken style (4 buttons)
  TEKKEN: {
    LP: 'Left Punch',
    RP: 'Right Punch',
    LK: 'Left Kick',
    RK: 'Right Kick'
  }
}

// Real fighting game combos organized by game and character
export const REAL_COMBOS = {
  // Street Fighter combos
  STREET_FIGHTER: {
    RYU: {
      // Basic combos
      'Hadoken': {
        name: 'Hadoken',
        notation: '236+P',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + punch',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Shoryuken': {
        name: 'Shoryuken (Dragon Punch)',
        notation: '623+P', 
        inputs: ['6', '2', '3', 'LP'],
        description: 'Dragon punch motion + punch',
        difficulty: 'Medium',
        type: 'Special'
      },
      'Tatsumaki': {
        name: 'Tatsumaki Senpukyaku',
        notation: '214+K',
        inputs: ['2', '1', '4', 'LK'],
        description: 'Quarter-circle back + kick',
        difficulty: 'Easy', 
        type: 'Special'
      },
      // Combos
      'Basic Target Combo': {
        name: 'Basic Target Combo',
        notation: 'MP, HP',
        inputs: ['MP', 'HP'],
        description: 'Medium punch into heavy punch',
        difficulty: 'Easy',
        type: 'Target Combo'
      },
      'Cr.MK into Hadoken': {
        name: 'Crouch MK into Hadoken',
        notation: '2MK, 236+P',
        inputs: ['2', 'MK', '2', '3', '6', 'LP'],
        description: 'Crouch medium kick cancelled into hadoken',
        difficulty: 'Medium',
        type: 'Cancel Combo'
      },
      'Jump-in Combo': {
        name: 'Jump-in Combo',
        notation: 'j.HP, 2MP, 236+P',
        inputs: ['9', 'HP', '2', 'MP', '2', '3', '6', 'LP'],
        description: 'Jumping heavy punch, crouch medium punch, hadoken',
        difficulty: 'Medium',
        type: 'Jump Combo'
      },
      'Shinku Hadoken': {
        name: 'Shinku Hadoken (Super)',
        notation: '236236+P',
        inputs: ['2', '3', '6', '2', '3', '6', 'LP'],
        description: 'Double quarter-circle forward + punch',
        difficulty: 'Hard',
        type: 'Super'
      }
    },
    KEN: {
      'Hadoken': {
        name: 'Hadoken',
        notation: '236+P',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + punch',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Shoryuken': {
        name: 'Shoryuken',
        notation: '623+P',
        inputs: ['6', '2', '3', 'HP'],
        description: 'Dragon punch motion + punch',
        difficulty: 'Medium',
        type: 'Special'
      },
      'Tatsumaki': {
        name: 'Tatsumaki Senpukyaku',
        notation: '214+K',
        inputs: ['2', '1', '4', 'MK'],
        description: 'Quarter-circle back + kick',
        difficulty: 'Easy',
        type: 'Special'
      }
    },
    CHUN_LI: {
      'Kikoken': {
        name: 'Kikoken',
        notation: '236+P',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + punch',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Spinning Bird Kick': {
        name: 'Spinning Bird Kick',
        notation: '214+K',
        inputs: ['2', '1', '4', 'LK'],
        description: 'Quarter-circle back + kick',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Lightning Legs': {
        name: 'Lightning Legs',
        notation: 'K×5',
        inputs: ['LK', 'LK', 'LK', 'LK', 'LK'],
        description: 'Rapidly tap kick button',
        difficulty: 'Medium',
        type: 'Special'
      }
    }
  },
  
  // King of Fighters combos
  KING_OF_FIGHTERS: {
    KYO: {
      'Fireball': {
        name: '108 Shiki: Yamibarai',
        notation: '236+A',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + A',
        difficulty: 'Easy',
        type: 'Special'
      },
      'DP': {
        name: '100 Shiki: Oniyaki',
        notation: '623+A',
        inputs: ['6', '2', '3', 'LP'],
        description: 'Dragon punch motion + A',
        difficulty: 'Medium',
        type: 'Special'
      },
      'Basic Combo': {
        name: 'Basic Chain',
        notation: '5A, 5B, 236+A',
        inputs: ['LP', 'HP', '2', '3', '6', 'LP'],
        description: 'Standing A, standing B, fireball',
        difficulty: 'Medium',
        type: 'Chain Combo'
      }
    },
    IORI: {
      'Fireball': {
        name: '108 Shiki: Yamibarai',
        notation: '236+A',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + A',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Command Grab': {
        name: 'Sakahagi',
        notation: '63214+A',
        inputs: ['6', '3', '2', '1', '4', 'LP'],
        description: 'Half-circle back + A',
        difficulty: 'Hard',
        type: 'Command Grab'
      }
    }
  },
  
  // Tekken combos (simplified for 2D training)
  TEKKEN: {
    KAZUYA: {
      'EWGF': {
        name: 'Electric Wind God Fist',
        notation: 'f,n,d,df+RP',
        inputs: ['6', '5', '2', '3', 'RP'],
        description: 'Forward, neutral, down, down-forward + right punch (frame perfect)',
        difficulty: 'Very Hard',
        type: 'Special'
      },
      'Basic Combo': {
        name: 'Basic Launcher Combo',
        notation: 'df+LP, LP, RP, LK',
        inputs: ['3', 'LP', 'LP', 'RP', 'LK'],
        description: 'Down-forward left punch, left punch, right punch, left kick',
        difficulty: 'Medium',
        type: 'Combo'
      }
    },
    JIN: {
      'EWHF': {
        name: 'Electric Wind Hook Fist',
        notation: 'f,n,d,df+RP',
        inputs: ['6', '5', '2', '3', 'RP'],
        description: 'Forward, neutral, down, down-forward + right punch',
        difficulty: 'Very Hard',
        type: 'Special'
      }
    }
  },

  // Guilty Gear combos
  GUILTY_GEAR: {
    SOL: {
      'Gunflame': {
        name: 'Gunflame',
        notation: '236+P',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + punch',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Volcanic Viper': {
        name: 'Volcanic Viper',
        notation: '623+P',
        inputs: ['6', '2', '3', 'HP'],
        description: 'Dragon punch motion + punch',
        difficulty: 'Medium',
        type: 'Special'
      },
      'Basic Combo': {
        name: 'Basic Gatling',
        notation: '5P, 5K, 2D, 236+P',
        inputs: ['LP', 'LK', '2', 'HK', '2', '3', '6', 'LP'],
        description: 'Punch, kick, crouch heavy slash, gunflame',
        difficulty: 'Medium',
        type: 'Gatling Combo'
      }
    }
  },

  // BlazBlue combos
  BLAZBLUE: {
    RAGNA: {
      'Dead Spike': {
        name: 'Dead Spike',
        notation: '236+A',
        inputs: ['2', '3', '6', 'LP'],
        description: 'Quarter-circle forward + A',
        difficulty: 'Easy',
        type: 'Special'
      },
      'Infernal Divider': {
        name: 'Infernal Divider',
        notation: '623+C',
        inputs: ['6', '2', '3', 'HP'],
        description: 'Dragon punch motion + C',
        difficulty: 'Medium',
        type: 'Special'
      }
    }
  }
}

// Combo categories for training progression
export const COMBO_CATEGORIES = {
  BEGINNER: {
    name: 'Beginner Combos',
    description: 'Basic motions and simple combos',
    maxInputs: 4,
    combos: []
  },
  INTERMEDIATE: {
    name: 'Intermediate Combos', 
    description: 'Multi-hit combos with cancels',
    maxInputs: 8,
    combos: []
  },
  ADVANCED: {
    name: 'Advanced Combos',
    description: 'Complex combos with difficult timing',
    maxInputs: 12,
    combos: []
  },
  EXPERT: {
    name: 'Expert Combos',
    description: 'Frame-perfect execution required',
    maxInputs: 20,
    combos: []
  }
}

// Convert button names to actual input buttons
export const convertComboToInputs = (combo, inputButtons, attackButtons) => {
  return combo.inputs.map(input => {
    // Handle directional inputs (numpad notation)
    switch (input) {
      case '1': return inputButtons.down // ↙ simplified to down
      case '2': return inputButtons.down
      case '3': return inputButtons.down // ↘ simplified to down  
      case '4': return inputButtons.left
      case '5': return null // neutral - skip
      case '6': return inputButtons.right
      case '7': return inputButtons.up // ↖ simplified to up
      case '8': return inputButtons.up
      case '9': return inputButtons.up // ↗ simplified to up
      
      // Handle attack buttons
      case 'LP': return attackButtons.lp || attackButtons[0]
      case 'MP': return attackButtons.mp || attackButtons[1]
      case 'HP': return attackButtons.hp || attackButtons[2]
      case 'LK': return attackButtons.lk || attackButtons[3]
      case 'MK': return attackButtons.mk || attackButtons[4] 
      case 'HK': return attackButtons.hk || attackButtons[5]
      case 'RP': return attackButtons.rp || attackButtons[1] // Tekken right punch
      case 'RK': return attackButtons.rk || attackButtons[3] // Tekken right kick
      
      default: return null
    }
  }).filter(input => input !== null)
}

// Get combos by difficulty
export const getCombosByDifficulty = (difficulty) => {
  const allCombos = []
  
  // Flatten all combos from all games/characters
  Object.values(REAL_COMBOS).forEach(game => {
    Object.values(game).forEach(character => {
      Object.values(character).forEach(combo => {
        allCombos.push(combo)
      })
    })
  })
  
  // Filter by difficulty
  return allCombos.filter(combo => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return combo.difficulty === 'Easy'
      case 'medium': 
        return combo.difficulty === 'Medium' || combo.difficulty === 'Easy'
      case 'hard':
        return combo.difficulty === 'Hard' || combo.difficulty === 'Medium' || combo.difficulty === 'Easy'
      case 'expert':
        return true // All difficulties
      default:
        return combo.difficulty === 'Easy'
    }
  })
}

// Get combos by type
export const getCombosByType = (type) => {
  const allCombos = []
  
  Object.values(REAL_COMBOS).forEach(game => {
    Object.values(game).forEach(character => {
      Object.values(character).forEach(combo => {
        allCombos.push(combo)
      })
    })
  })
  
  return allCombos.filter(combo => combo.type === type)
}

// Get all available combo types
export const getComboTypes = () => {
  const types = new Set()
  
  Object.values(REAL_COMBOS).forEach(game => {
    Object.values(game).forEach(character => {
      Object.values(character).forEach(combo => {
        types.add(combo.type)
      })
    })
  })
  
  return Array.from(types)
}

// Get random combo by difficulty
export const getRandomComboByDifficulty = (difficulty) => {
  const combos = getCombosByDifficulty(difficulty)
  return combos[Math.floor(Math.random() * combos.length)]
}

// Create training patterns from real combos
export const generateRealComboTrainingPatterns = (inputButtons, attackButtons, difficulty = 'medium') => {
  // Safety checks
  if (!inputButtons || !attackButtons) {
    console.warn('Invalid parameters for generateRealComboTrainingPatterns')
    return []
  }
  
  // Ensure we have enough attack buttons
  const safeAttackButtons = [...attackButtons]
  while (safeAttackButtons.length < 6) {
    safeAttackButtons.push(safeAttackButtons[0] || 'Space') // Use first button or Space as fallback
  }
  
  const combos = getCombosByDifficulty(difficulty)
  
  if (!combos || combos.length === 0) {
    console.warn('No combos found for difficulty:', difficulty)
    return []
  }
  
  return combos.map(combo => {
    const inputs = convertComboToInputs(combo, inputButtons, {
      lp: safeAttackButtons[0],
      mp: safeAttackButtons[1], 
      hp: safeAttackButtons[2],
      lk: safeAttackButtons[3],
      mk: safeAttackButtons[4],
      hk: safeAttackButtons[5],
      rp: safeAttackButtons[1], // Tekken style
      rk: safeAttackButtons[3]
    })
    
    return {
      ...combo,
      convertedInputs: inputs,
      displaySequence: inputs.map(input => {
        if (input === inputButtons.up) return '↑'
        if (input === inputButtons.down) return '↓'
        if (input === inputButtons.left) return '←'
        if (input === inputButtons.right) return '→'
        if (input === attackButtons[0]) return 'LP'
        if (input === attackButtons[1]) return 'MP'
        if (input === attackButtons[2]) return 'HP'
        if (input === attackButtons[3]) return 'LK'
        if (input === attackButtons[4]) return 'MK'
        if (input === attackButtons[5]) return 'HK'
        return '?'
      }).join(' ')
    }
  })
}

export default {
  REAL_COMBOS,
  ATTACK_TYPES,
  COMBO_CATEGORIES,
  convertComboToInputs,
  getCombosByDifficulty,
  getCombosByType,
  getComboTypes,
  getRandomComboByDifficulty,
  generateRealComboTrainingPatterns
}