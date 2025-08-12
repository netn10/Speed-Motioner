export class GameManager {
  constructor() {
    this.players = new Map()
    this.gameState = {
      status: 'waiting',
      players: [],
      trainingMode: 'motion',
      difficulty: 'medium'
    }
    
    // Training patterns for different modes
    this.trainingPatterns = {
      motion: [
        ['w', 'j'], // up + attack
        ['s', 'j'], // down + attack
        ['a', 'j'], // left + attack
        ['d', 'j'], // right + attack
        ['up', 'j'], // arrow up + attack
        ['down', 'j'], // arrow down + attack
        ['left', 'j'], // arrow left + attack
        ['right', 'j'], // arrow right + attack
        ['w', 'k'], // up + special
        ['s', 'k'], // down + special
        ['a', 'k'], // left + special
        ['d', 'k'], // right + special
        ['up', 'k'], // arrow up + special
        ['down', 'k'], // arrow down + special
        ['left', 'k'], // arrow left + special
        ['right', 'k'], // arrow right + special
        ['w', 's', 'j'], // up + down + attack
        ['a', 'd', 'j'], // left + right + attack
        ['up', 'down', 'j'], // arrow up + down + attack
        ['left', 'right', 'j'], // arrow left + right + attack
      ],
      combos: [
        ['j', 'j', 'j'], // triple attack
        ['j', 'k', 'j'], // attack + special + attack
        ['k', 'j', 'k'], // special + attack + special
        ['w', 'j', 's', 'j'], // up attack + down attack
        ['up', 'j', 'down', 'j'], // arrow up attack + down attack
      ],
      custom: [
        ['w'], // up
        ['s'], // down
        ['a'], // left
        ['d'], // right
        ['up'], // arrow up
        ['down'], // arrow down
        ['left'], // arrow left
        ['right'], // arrow right
        ['j'], // attack
        ['k'], // special
        ['w', 'j'], // up + attack
        ['s', 'j'], // down + attack
        ['a', 'j'], // left + attack
        ['d', 'j'], // right + attack
        ['j', 'j'], // double attack
        ['j', 'k'], // attack + special
        ['w', 's'], // up + down
        ['a', 'd'], // left + right
        ['w', 'j', 's'], // up + attack + down
        ['a', 'j', 'd'], // left + attack + right
      ]
    }
    
    // Difficulty settings
    this.difficultySettings = {
      easy: {
        inputWindow: 1000, // 1 second
        comboWindow: 2000, // 2 seconds
        requiredAccuracy: 0.7 // 70%
      },
      medium: {
        inputWindow: 500, // 0.5 seconds
        comboWindow: 1000, // 1 second
        requiredAccuracy: 0.8 // 80%
      },
      hard: {
        inputWindow: 200, // 0.2 seconds
        comboWindow: 500, // 0.5 seconds
        requiredAccuracy: 0.9 // 90%
      }
    }
  }
  
  addPlayer(playerId) {
    const player = {
      id: playerId,
      position: { x: 100, y: 300 },
      health: 100,
      inputs: [],
      currentCombo: [],
      comboCount: 0,
      maxCombo: 0,
      score: {
        totalInputs: 0,
        correctInputs: 0,
        comboCount: 0,
        maxCombo: 0,
        accuracy: 0,
        timeElapsed: 0
      },
      trainingMode: 'motion',
      difficulty: 'medium',
      lastInputTime: Date.now()
    }
    
    this.players.set(playerId, player)
    this.updateGameState()
    return player
  }
  
  removePlayer(playerId) {
    this.players.delete(playerId)
    this.updateGameState()
  }
  
  processInput(playerId, key, timestamp) {
    let player = this.players.get(playerId)
    
    if (!player) {
      player = this.addPlayer(playerId)
    }
    
    const currentTime = timestamp || Date.now()
    const timeDiff = currentTime - player.lastInputTime
    const settings = this.difficultySettings[player.difficulty]
    
    // Add input to player's input history
    player.inputs.push(key)
    player.inputs = player.inputs.slice(-50) // Keep last 50 inputs
    
    // Update combo tracking
    player.currentCombo.push(key)
    
    // Check if combo is valid (matches expected patterns)
    const isValidCombo = this.checkComboValidity(player.currentCombo, player.trainingMode)
    
    // Update combo count - only increment when user correctly performs expected sequence
    if (isValidCombo) {
      // This means the user correctly performed a complete expected input sequence
      player.comboCount++
      player.maxCombo = Math.max(player.maxCombo, player.comboCount)
      // Reset current combo after successful completion
      player.currentCombo = []
    } else {
      // Check if the current input is part of a valid pattern in progress
      const isPartialMatch = this.checkPartialComboValidity(player.currentCombo, player.trainingMode)
      if (!isPartialMatch) {
        // Reset combo if input doesn't match any expected pattern
        player.currentCombo = [key]
        player.comboCount = 0
      }
    }
    
    // Update score
    player.score.totalInputs++
    if (isValidCombo) {
      player.score.correctInputs++
    }
    player.score.comboCount = player.comboCount
    player.score.maxCombo = player.maxCombo
    player.score.accuracy = (player.score.correctInputs / player.score.totalInputs) * 100
    
    player.lastInputTime = currentTime
    
    // Reset combo if too much time has passed
    if (timeDiff > settings.comboWindow) {
      player.currentCombo = [key]
      player.comboCount = 0
    }
    
    this.players.set(playerId, player)
    this.updateGameState()
    
    return {
      valid: isValidCombo,
      comboCount: player.comboCount,
      accuracy: player.score.accuracy,
      timeDiff: timeDiff
    }
  }
  
  checkComboValidity(combo, trainingMode) {
    const patterns = this.trainingPatterns[trainingMode] || this.trainingPatterns.motion
    
    return patterns.some(pattern => {
      if (combo.length < pattern.length) return false
      
      const recentInputs = combo.slice(-pattern.length)
      return recentInputs.join('') === pattern.join('')
    })
  }
  
  checkPartialComboValidity(combo, trainingMode) {
    const patterns = this.trainingPatterns[trainingMode] || this.trainingPatterns.motion
    
    return patterns.some(pattern => {
      if (combo.length > pattern.length) return false
      
      // Check if the current combo is a prefix of any valid pattern
      return pattern.slice(0, combo.length).join('') === combo.join('')
    })
  }
  
  updatePlayerPosition(playerId, position) {
    const player = this.players.get(playerId)
    if (player) {
      player.position = position
      this.players.set(playerId, player)
    }
  }
  
  setTrainingMode(playerId, mode) {
    const player = this.players.get(playerId)
    if (player) {
      player.trainingMode = mode
      this.players.set(playerId, player)
      this.gameState.trainingMode = mode
    }
  }
  
  setDifficulty(playerId, difficulty) {
    const player = this.players.get(playerId)
    if (player) {
      player.difficulty = difficulty
      this.players.set(playerId, player)
      this.gameState.difficulty = difficulty
    }
  }
  
  updateGameState() {
    this.gameState.players = Array.from(this.players.values())
    this.gameState.status = this.players.size > 0 ? 'active' : 'waiting'
  }
  
  getGameState() {
    return this.gameState
  }
  
  getPlayer(playerId) {
    return this.players.get(playerId)
  }
  
  getAllPlayers() {
    return Array.from(this.players.values())
  }
}
