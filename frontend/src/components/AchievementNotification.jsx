import React, { useEffect, useState } from 'react'
import { useAchievementStore } from '../stores/achievementStore'
import { useSettingsStore } from '../stores/settingsStore'
import './AchievementNotification.css'

const AchievementNotification = () => {
  const { newlyUnlocked, clearNewlyUnlocked, getAllAchievements } = useAchievementStore()
  const { theme } = useSettingsStore()
  const [currentNotification, setCurrentNotification] = useState(null)
  const [queue, setQueue] = useState([])

  const allAchievements = getAllAchievements()

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const achievementData = newlyUnlocked.map(id => 
        allAchievements.find(achievement => achievement.id === id)
      ).filter(Boolean)
      
      setQueue(prev => [...prev, ...achievementData])
      clearNewlyUnlocked()
    }
  }, [newlyUnlocked, allAchievements, clearNewlyUnlocked])

  useEffect(() => {
    if (queue.length > 0 && !currentNotification) {
      const nextAchievement = queue[0]
      setCurrentNotification(nextAchievement)
      setQueue(prev => prev.slice(1))

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setCurrentNotification(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [queue, currentNotification])

  const handleClose = () => {
    setCurrentNotification(null)
  }

  if (!currentNotification) return null

  return (
    <div className={`achievement-notification ${theme}`}>
      <div className="notification-content">
        <div className="achievement-icon">
          {currentNotification.icon}
        </div>
        <div className="achievement-info">
          <div className="achievement-header">
            <span className="achievement-unlocked">Achievement Unlocked!</span>
            <button className="close-btn" onClick={handleClose}>×</button>
          </div>
          <h3 className="achievement-name">{currentNotification.name}</h3>
          <p className="achievement-description">{currentNotification.description}</p>
          <div className="achievement-points">+{currentNotification.points} points</div>
        </div>
      </div>
      <div className="notification-progress"></div>
    </div>
  )
}

export default AchievementNotification