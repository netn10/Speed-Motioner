// Simple sound manager using Web Audio API for lightweight sound effects
class SoundManager {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.volume = 0.5
    this.sounds = new Map()
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      // Create audio context on user interaction
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
      
      // Pre-generate sound buffers
      await this.generateSounds()
    } catch (error) {
      console.warn('Audio not supported:', error)
      this.enabled = false
    }
  }

  async generateSounds() {
    if (!this.audioContext) return

    // Generate different types of sounds
    this.sounds.set('hit', this.generateTone(800, 0.1, 'sine'))
    this.sounds.set('miss', this.generateTone(200, 0.2, 'square'))
    this.sounds.set('perfect', this.generateChord([800, 1000, 1200], 0.15))
    this.sounds.set('combo', this.generateTone(1200, 0.1, 'triangle'))
    this.sounds.set('achievement', this.generateVictorySound())
    this.sounds.set('beat', this.generateTone(600, 0.05, 'sine'))
    this.sounds.set('countdown', this.generateTone(1000, 0.1, 'triangle'))
    this.sounds.set('start', this.generateStartSound())
    this.sounds.set('button', this.generateTone(400, 0.05, 'sine'))
    this.sounds.set('whoosh', this.generateWhoosh())
  }

  generateTone(frequency, duration, type = 'sine') {
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let value = 0

      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'triangle':
          value = 2 * Math.abs(2 * (frequency * t % 1) - 1) - 1
          break
        case 'sawtooth':
          value = 2 * (frequency * t % 1) - 1
          break
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(
        1,
        Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.05))
      )
      data[i] = value * envelope * 0.3
    }

    return buffer
  }

  generateChord(frequencies, duration) {
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let value = 0

      // Sum all frequencies
      frequencies.forEach(freq => {
        value += Math.sin(2 * Math.PI * freq * t)
      })
      value /= frequencies.length

      // Apply envelope
      const envelope = Math.min(
        1,
        Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.05))
      )
      data[i] = value * envelope * 0.2
    }

    return buffer
  }

  generateVictorySound() {
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.5
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    // Victory melody: C-E-G-C (major chord arpeggio)
    const frequencies = [523.25, 659.25, 783.99, 1046.50]
    const noteLength = length / frequencies.length

    for (let i = 0; i < length; i++) {
      const noteIndex = Math.floor(i / noteLength)
      const noteTime = (i % noteLength) / sampleRate
      const frequency = frequencies[noteIndex] || frequencies[frequencies.length - 1]
      
      const value = Math.sin(2 * Math.PI * frequency * noteTime)
      const envelope = Math.exp(-noteTime * 3) // Exponential decay
      
      data[i] = value * envelope * 0.2
    }

    return buffer
  }

  generateStartSound() {
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.3
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Rising frequency from 400 to 800 Hz
      const frequency = 400 + (400 * t / duration)
      const value = Math.sin(2 * Math.PI * frequency * t)
      const envelope = 1 - (t / duration) // Fade out
      
      data[i] = value * envelope * 0.2
    }

    return buffer
  }

  generateWhoosh() {
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.2
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // White noise filtered for whoosh effect
      let value = (Math.random() * 2 - 1)
      
      // Low-pass filter effect
      const frequency = 200 + (1000 * Math.exp(-t * 5))
      value *= Math.sin(2 * Math.PI * frequency * t) * 0.5
      
      const envelope = Math.exp(-t * 8)
      data[i] = value * envelope * 0.1
    }

    return buffer
  }

  async play(soundName, volume = 1) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
      return
    }

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const buffer = this.sounds.get(soundName)
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      gainNode.gain.value = this.volume * volume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  // Convenience methods
  playHit() { this.play('hit') }
  playMiss() { this.play('miss') }
  playPerfect() { this.play('perfect') }
  playCombo() { this.play('combo') }
  playAchievement() { this.play('achievement') }
  playBeat() { this.play('beat', 0.3) }
  playCountdown() { this.play('countdown') }
  playStart() { this.play('start') }
  playButton() { this.play('button', 0.2) }
  playWhoosh() { this.play('whoosh') }
}

// Create singleton instance
const soundManager = new SoundManager()

// Initialize on first user interaction
let initialized = false
const initializeOnInteraction = async () => {
  if (!initialized) {
    await soundManager.initialize()
    initialized = true
    
    // Remove listeners after initialization
    document.removeEventListener('click', initializeOnInteraction)
    document.removeEventListener('keydown', initializeOnInteraction)
    document.removeEventListener('touchstart', initializeOnInteraction)
  }
}

// Add event listeners for user interaction
document.addEventListener('click', initializeOnInteraction)
document.addEventListener('keydown', initializeOnInteraction)
document.addEventListener('touchstart', initializeOnInteraction)

export default soundManager