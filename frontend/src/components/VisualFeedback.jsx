import React, { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import './VisualFeedback.css'

const VisualFeedback = ({ 
  type = 'hit', // 'hit', 'miss', 'perfect', 'combo', 'achievement'
  message = '',
  position = 'center', // 'center', 'top', 'bottom'
  duration = 1000,
  onComplete
}) => {
  const { theme } = useSettingsStore()
  const [visible, setVisible] = useState(true)
  const [particles, setParticles] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    // Generate particles for certain feedback types
    if (type === 'perfect' || type === 'achievement' || type === 'combo') {
      generateParticles()
    }

    // Auto-hide after duration
    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) {
        setTimeout(onComplete, 300) // Wait for fade out animation
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete, type])

  const generateParticles = () => {
    const particleCount = type === 'achievement' ? 20 : 10
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 500,
        duration: 1000 + Math.random() * 1000,
        color: getParticleColor()
      })
    }

    setParticles(newParticles)
  }

  const getParticleColor = () => {
    switch (type) {
      case 'perfect':
        return ['#ffd700', '#ffb74d', '#fff']
      case 'achievement':
        return ['#4caf50', '#81c784', '#fff', '#ffd700']
      case 'combo':
        return ['#ff6b6b', '#ff8a80', '#fff']
      default:
        return ['#4ecdc4', '#80e5ff', '#fff']
    }
  }

  const getFeedbackClass = () => {
    const baseClass = `visual-feedback ${theme} ${type} position-${position}`
    return visible ? baseClass : `${baseClass} fade-out`
  }

  const getIcon = () => {
    switch (type) {
      case 'perfect':
        return '⭐'
      case 'hit':
        return '✓'
      case 'miss':
        return '✗'
      case 'combo':
        return '🔥'
      case 'achievement':
        return '🏆'
      default:
        return ''
    }
  }

  return (
    <div ref={containerRef} className={getFeedbackClass()}>
      {/* Main feedback content */}
      <div className="feedback-content">
        <div className="feedback-icon">
          {getIcon()}
        </div>
        {message && (
          <div className="feedback-message">
            {message}
          </div>
        )}
      </div>

      {/* Particles */}
      {particles.length > 0 && (
        <div className="particles-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color[Math.floor(Math.random() * particle.color.length)],
                animationDelay: `${particle.delay}ms`,
                animationDuration: `${particle.duration}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* Special effects for achievements */}
      {type === 'achievement' && (
        <div className="achievement-effect">
          <div className="achievement-rays">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="ray"
                style={{
                  transform: `rotate(${i * 45}deg)`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Combo multiplier effect */}
      {type === 'combo' && (
        <div className="combo-effect">
          <div className="combo-ring"></div>
          <div className="combo-ring delayed"></div>
        </div>
      )}
    </div>
  )
}

// Hook for managing multiple feedback instances
export const useVisualFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([])

  const showFeedback = (options) => {
    const id = Date.now() + Math.random()
    const feedback = {
      id,
      ...options,
      onComplete: () => {
        setFeedbacks(prev => prev.filter(f => f.id !== id))
        if (options.onComplete) {
          options.onComplete()
        }
      }
    }

    setFeedbacks(prev => [...prev, feedback])
    return id
  }

  const clearFeedback = (id) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  const clearAllFeedbacks = () => {
    setFeedbacks([])
  }

  const FeedbackRenderer = () => (
    <div className="feedback-renderer">
      {feedbacks.map(feedback => (
        <VisualFeedback key={feedback.id} {...feedback} />
      ))}
    </div>
  )

  return {
    showFeedback,
    clearFeedback,
    clearAllFeedbacks,
    FeedbackRenderer
  }
}

export default VisualFeedback