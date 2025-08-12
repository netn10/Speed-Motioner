import React, { useState, useEffect } from 'react'
import { useGamepad } from '../hooks/useGamepad'
import './GamepadStatus.css'

const GamepadStatus = () => {
  const { gamepads, isConnected, getGamepadInputs } = useGamepad()
  const [currentInputs, setCurrentInputs] = useState([])

  // Poll for current inputs to show real-time feedback
  useEffect(() => {
    if (!isConnected) return

    const pollInputs = () => {
      const inputs = getGamepadInputs()
      setCurrentInputs(inputs)
    }

    const interval = setInterval(pollInputs, 100)
    return () => clearInterval(interval)
  }, [isConnected, getGamepadInputs])

  // Don't show anything - remove the debug overlay
  return null
}

export default GamepadStatus
