import { useState, useEffect, useCallback, useRef } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export const useGamepad = () => {
  const [gamepads, setGamepads] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const previousStateRef = useRef({})
  const inputCallbackRef = useRef(null)

  // Get gamepad button mappings from settings store
  const { gamepadButtons, setGamepadButton } = useSettingsStore()

  // Default gamepad button mappings for common fighting game controllers
  const defaultButtonMappings = {
    // Face buttons (Xbox style)
    0: 'lp', // A button -> Light Punch
    1: 'lk', // B button -> Light Kick
    2: 'mp', // X button -> Medium Punch
    3: 'mk', // Y button -> Medium Kick
    
    // Shoulder buttons
    4: 'hp', // Left Bumper -> Heavy Punch
    5: 'hk', // Right Bumper -> Heavy Kick
    
    // Start/Select
    8: 'start',
    9: 'select',
    
    // Stick buttons
    10: 'ls', // Left Stick
    11: 'rs', // Right Stick
    
    // D-pad (handled separately via axes for movement)
    12: 'up',
    13: 'down', 
    14: 'left',
    15: 'right'
  }

  // Use gamepad mappings from settings, fall back to defaults
  const buttonMappings = gamepadButtons || defaultButtonMappings

  // Direction mapping from analog stick
  const mapDirection = useCallback((x, y, deadzone = 0.3) => {
    if (Math.abs(x) < deadzone && Math.abs(y) < deadzone) {
      return []
    }
    
    const directions = []
    
    // Use threshold-based detection for cleaner 4-directional input
    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal movement is dominant
      if (x > deadzone) directions.push('right')
      if (x < -deadzone) directions.push('left')
    } else {
      // Vertical movement is dominant
      if (y > deadzone) directions.push('down')
      if (y < -deadzone) directions.push('up')
    }
    
    return directions
  }, [])

  // Detect gamepad connection/disconnection
  useEffect(() => {
    const handleGamepadConnected = (event) => {
      setIsConnected(true)
      updateGamepads()
    }

    const handleGamepadDisconnected = (event) => {
      setIsConnected(false)
      updateGamepads()
    }

    const updateGamepads = () => {
      const connectedGamepads = navigator.getGamepads().filter(gp => gp !== null)
      setGamepads(connectedGamepads)
      // Update connection status based on actual connected gamepads
      setIsConnected(connectedGamepads.length > 0)
    }

    // Initial check for connected gamepads
    updateGamepads()

    // Add event listeners
    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    // Poll for gamepad updates to ensure we catch all connections
    const pollInterval = setInterval(updateGamepads, 1000)

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      clearInterval(pollInterval)
    }
  }, [])

  // Set input callback for handling input events
  const setInputCallback = useCallback((callback) => {
    inputCallbackRef.current = callback
  }, [])

  // Get current gamepad state (for display purposes)
  const getGamepadInputs = useCallback(() => {
    const inputs = []
    
    // Get fresh gamepad data
    const freshGamepads = navigator.getGamepads().filter(gp => gp !== null)
    
    freshGamepads.forEach(gamepad => {
      if (!gamepad) return

      // Check button presses
      gamepad.buttons.forEach((button, index) => {
        if (button.pressed && buttonMappings[index]) {
          inputs.push(buttonMappings[index])
        }
      })

      // Check analog stick for movement
      if (gamepad.axes.length >= 2) {
        const leftStickX = gamepad.axes[0]
        const leftStickY = gamepad.axes[1]
        const directions = mapDirection(leftStickX, leftStickY)
        inputs.push(...directions)
      }

      // Check D-pad (if available as axes)
      if (gamepad.axes.length >= 4) {
        const dpadX = gamepad.axes[2]
        const dpadY = gamepad.axes[3]
        
        if (Math.abs(dpadX) > 0.5) {
          inputs.push(dpadX > 0 ? 'right' : 'left')
        }
        if (Math.abs(dpadY) > 0.5) {
          inputs.push(dpadY > 0 ? 'down' : 'up')
        }
      }
    })

    return inputs
  }, [mapDirection])

  // Process gamepad state changes and trigger input events
  const processGamepadState = useCallback(() => {
    if (!isConnected || !inputCallbackRef.current) return

    const freshGamepads = navigator.getGamepads().filter(gp => gp !== null)
    
    freshGamepads.forEach((gamepad, gamepadIndex) => {
      if (!gamepad) return

      const gamepadId = `gamepad_${gamepadIndex}`
      const previousState = previousStateRef.current[gamepadId] || {}
      const currentState = {}

      // Check button state changes
      gamepad.buttons.forEach((button, index) => {
        const buttonName = buttonMappings[index]
        if (!buttonName) return

        const wasPressed = previousState[`button_${index}`] || false
        const isPressed = button.pressed

        currentState[`button_${index}`] = isPressed

        // Trigger input event on button press (not release)
        if (isPressed && !wasPressed) {
          inputCallbackRef.current(buttonName)
        }
      })

      // Check analog stick state changes
      if (gamepad.axes.length >= 2) {
        const leftStickX = gamepad.axes[0]
        const leftStickY = gamepad.axes[1]
        const directions = mapDirection(leftStickX, leftStickY)
        
        const previousDirections = previousState.directions || []
        
        // Find new directions that weren't active before
        directions.forEach(direction => {
          if (!previousDirections.includes(direction)) {
            inputCallbackRef.current(direction)
          }
        })

        currentState.directions = directions
      }

      // Check D-pad state changes (if available as axes)
      if (gamepad.axes.length >= 4) {
        const dpadX = gamepad.axes[2]
        const dpadY = gamepad.axes[3]
        
        const dpadDirections = []
        if (Math.abs(dpadX) > 0.5) {
          dpadDirections.push(dpadX > 0 ? 'right' : 'left')
        }
        if (Math.abs(dpadY) > 0.5) {
          dpadDirections.push(dpadY > 0 ? 'down' : 'up')
        }

        const previousDpadDirections = previousState.dpadDirections || []
        
        // Find new D-pad directions that weren't active before
        dpadDirections.forEach(direction => {
          if (!previousDpadDirections.includes(direction)) {
            inputCallbackRef.current(direction)
          }
        })

        currentState.dpadDirections = dpadDirections
      }

      previousStateRef.current[gamepadId] = currentState
    })
  }, [isConnected, mapDirection])

  // Start gamepad polling when connected
  useEffect(() => {
    if (!isConnected) return

    const pollInterval = setInterval(processGamepadState, 16) // ~60fps polling
    return () => clearInterval(pollInterval)
  }, [isConnected, processGamepadState])

  return {
    gamepads,
    isConnected,
    getGamepadInputs,
    setInputCallback,
    buttonMappings,
    setGamepadButton
  }
}
