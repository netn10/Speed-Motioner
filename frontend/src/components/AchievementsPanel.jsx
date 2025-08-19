import React, { useState } from 'react'
import { useAchievementStore } from '../stores/achievementStore'
import { useSettingsStore } from '../stores/settingsStore'
import './AchievementsPanel.css'

const AchievementsPanel = () => {
  const { 
    unlockedAchievements, 
    totalPoints, 
    getAllAchievements, 
    getAchievementProgress,
    stats
  } = useAchievementStore()
  const { theme } = useSettingsStore()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const allAchievements = getAllAchievements()
  const categories = ['all', 'training', 'accuracy', 'speed', 'combo', 'character', 'special']

  const filteredAchievements = selectedCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(achievement => achievement.category === selectedCategory)

  const getCategoryIcon = (category) => {
    const icons = {
      all: '🏆',
      training: '🎯',
      accuracy: '🎯',
      speed: '⚡',
      combo: '🔗',
      character: '🥋',
      special: '⭐'
    }
    return icons[category] || '🏆'
  }

  const getCategoryStats = () => {
    const totalAchievements = allAchievements.length
    const unlockedCount = unlockedAchievements.length
    const completionRate = ((unlockedCount / totalAchievements) * 100).toFixed(1)
    
    return { totalAchievements, unlockedCount, completionRate }
  }

  const { totalAchievements, unlockedCount, completionRate } = getCategoryStats()

  return (
    <div className={`achievements-panel ${theme}`}>
      <div className="achievements-header">
        <div className="header-stats">
          <h2>Achievements</h2>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{unlockedCount}</span>
              <span className="stat-label">Unlocked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{completionRate}%</span>
              <span className="stat-label">Complete</span>
            </div>
          </div>
        </div>
        <div className="progress-ring">
          <svg width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="#ffd700"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${completionRate * 2.199} 219.9`}
              strokeDashoffset="0"
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="progress-text">{completionRate}%</div>
        </div>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <span className="category-name">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => {
          const isUnlocked = unlockedAchievements.includes(achievement.id)
          const progress = getAchievementProgress(achievement.id)
          
          return (
            <div
              key={achievement.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon-container">
                <div className="achievement-icon">
                  {achievement.icon}
                </div>
                {isUnlocked && (
                  <div className="unlock-badge">✓</div>
                )}
              </div>
              
              <div className="achievement-content">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-meta">
                  <div className="achievement-category">
                    <span className="category-icon">{getCategoryIcon(achievement.category)}</span>
                    <span>{achievement.category}</span>
                  </div>
                  <div className="achievement-points">
                    {achievement.points} pts
                  </div>
                </div>
                
                {!isUnlocked && progress > 0 && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(progress)}%</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="achievements-stats">
        <h3>Training Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-number">{stats.sessionsCompleted}</span>
              <span className="stat-label">Sessions Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-number">{stats.maxAccuracy}%</span>
              <span className="stat-label">Best Accuracy</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-info">
              <span className="stat-number">{stats.maxCombo}</span>
              <span className="stat-label">Max Combo</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🥋</div>
            <div className="stat-info">
              <span className="stat-number">{stats.charactersUsed.length}</span>
              <span className="stat-label">Characters Used</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementsPanel