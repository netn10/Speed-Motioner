import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ACHIEVEMENTS = {
  // Basic Training Achievements
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first training session',
    icon: '🎯',
    category: 'training',
    requirement: { type: 'sessions_completed', value: 1 },
    points: 10
  },
  dedicated_trainee: {
    id: 'dedicated_trainee',
    name: 'Dedicated Trainee',
    description: 'Complete 10 training sessions',
    icon: '💪',
    category: 'training',
    requirement: { type: 'sessions_completed', value: 10 },
    points: 50
  },
  training_master: {
    id: 'training_master',
    name: 'Training Master',
    description: 'Complete 100 training sessions',
    icon: '🏆',
    category: 'training',
    requirement: { type: 'sessions_completed', value: 100 },
    points: 500
  },

  // Accuracy Achievements
  sharp_shooter: {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: 'Achieve 90% accuracy in a training session',
    icon: '🎯',
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 90 },
    points: 25
  },
  perfect_execution: {
    id: 'perfect_execution',
    name: 'Perfect Execution',
    description: 'Achieve 100% accuracy in a training session',
    icon: '⭐',
    category: 'accuracy',
    requirement: { type: 'accuracy', value: 100 },
    points: 100
  },
  consistency_king: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Achieve 90%+ accuracy in 5 consecutive sessions',
    icon: '👑',
    category: 'accuracy',
    requirement: { type: 'consecutive_high_accuracy', value: 5 },
    points: 200
  },

  // Speed Achievements
  lightning_fast: {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Complete a hard difficulty session in under 30 seconds',
    icon: '⚡',
    category: 'speed',
    requirement: { type: 'fast_completion', difficulty: 'hard', time: 30 },
    points: 75
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 50 inputs in under 1 minute',
    icon: '🔥',
    category: 'speed',
    requirement: { type: 'inputs_per_minute', value: 50 },
    points: 150
  },

  // Combo Achievements
  combo_starter: {
    id: 'combo_starter',
    name: 'Combo Starter',
    description: 'Achieve a 10-hit combo',
    icon: '🎮',
    category: 'combo',
    requirement: { type: 'max_combo', value: 10 },
    points: 30
  },
  combo_master: {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 50-hit combo',
    icon: '🔗',
    category: 'combo',
    requirement: { type: 'max_combo', value: 50 },
    points: 100
  },
  combo_legend: {
    id: 'combo_legend',
    name: 'Combo Legend',
    description: 'Achieve a 100-hit combo',
    icon: '🌟',
    category: 'combo',
    requirement: { type: 'max_combo', value: 100 },
    points: 300
  },


  // Special Achievements
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete training sessions at different times of day',
    icon: '🦉',
    category: 'special',
    requirement: { type: 'time_diversity', value: 4 },
    points: 60
  },
  perseverance: {
    id: 'perseverance',
    name: 'Perseverance',
    description: 'Continue training after failing 10 times',
    icon: '💎',
    category: 'special',
    requirement: { type: 'failed_attempts', value: 10 },
    points: 80
  },
  zen_master: {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Complete 50 custom challenge sessions',
    icon: '🧘',
    category: 'special',
    requirement: { type: 'custom_sessions', value: 50 },
    points: 200
  }
}

export const useAchievementStore = create(
  persist(
    (set, get) => ({
      // Achievement data
      unlockedAchievements: [],
      newlyUnlocked: [],
      totalPoints: 0,
      
      // Statistics for tracking achievements
      stats: {
        sessionsCompleted: 0,
        totalInputs: 0,
        totalCorrectInputs: 0,
        maxCombo: 0,
        maxAccuracy: 0,
        fastestCompletion: null,
        consecutiveHighAccuracy: 0,
        customSessions: 0,
        failedAttempts: 0,
        sessionTimes: [] // Track when sessions were completed
      },

      // Actions
      updateStats: (sessionData) => {
        const currentStats = get().stats
        const newStats = { ...currentStats }
        
        // Update basic stats
        newStats.sessionsCompleted++
        newStats.totalInputs += sessionData.totalInputs || 0
        newStats.totalCorrectInputs += sessionData.correctInputs || 0
        newStats.maxCombo = Math.max(newStats.maxCombo, sessionData.maxCombo || 0)
        newStats.maxAccuracy = Math.max(newStats.maxAccuracy, sessionData.accuracy || 0)
        
        
        // Track consecutive high accuracy
        if (sessionData.accuracy >= 90) {
          newStats.consecutiveHighAccuracy++
        } else {
          newStats.consecutiveHighAccuracy = 0
        }
        
        // Track custom sessions
        if (sessionData.mode === 'custom') {
          newStats.customSessions++
        }
        
        // Track session times for time diversity
        const currentHour = new Date().getHours()
        const timeSlot = Math.floor(currentHour / 6) // 4 time slots: 0-5, 6-11, 12-17, 18-23
        if (!newStats.sessionTimes.includes(timeSlot)) {
          newStats.sessionTimes.push(timeSlot)
        }
        
        // Track fastest completion
        if (sessionData.timeElapsed && sessionData.difficulty === 'hard') {
          if (!newStats.fastestCompletion || sessionData.timeElapsed < newStats.fastestCompletion) {
            newStats.fastestCompletion = sessionData.timeElapsed
          }
        }
        
        set({ stats: newStats })
        get().checkAchievements()
      },

      incrementFailedAttempts: () => {
        const currentStats = get().stats
        set({ 
          stats: { 
            ...currentStats, 
            failedAttempts: currentStats.failedAttempts + 1 
          } 
        })
        get().checkAchievements()
      },

      checkAchievements: () => {
        const { stats, unlockedAchievements } = get()
        const newlyUnlocked = []
        
        Object.values(ACHIEVEMENTS).forEach(achievement => {
          if (unlockedAchievements.includes(achievement.id)) return
          
          let unlocked = false
          const req = achievement.requirement
          
          switch (req.type) {
            case 'sessions_completed':
              unlocked = stats.sessionsCompleted >= req.value
              break
            case 'accuracy':
              unlocked = stats.maxAccuracy >= req.value
              break
            case 'consecutive_high_accuracy':
              unlocked = stats.consecutiveHighAccuracy >= req.value
              break
            case 'max_combo':
              unlocked = stats.maxCombo >= req.value
              break
            case 'custom_sessions':
              unlocked = stats.customSessions >= req.value
              break
            case 'failed_attempts':
              unlocked = stats.failedAttempts >= req.value
              break
            case 'time_diversity':
              unlocked = stats.sessionTimes.length >= req.value
              break
            case 'fast_completion':
              unlocked = req.difficulty && stats.fastestCompletion && 
                        stats.fastestCompletion <= req.time
              break
            case 'inputs_per_minute':
              // This would need session-specific tracking
              break
            default:
              break
          }
          
          if (unlocked) {
            newlyUnlocked.push(achievement.id)
          }
        })
        
        if (newlyUnlocked.length > 0) {
          const updatedUnlocked = [...unlockedAchievements, ...newlyUnlocked]
          const newPoints = newlyUnlocked.reduce((total, id) => {
            return total + ACHIEVEMENTS[id].points
          }, get().totalPoints)
          
          set({
            unlockedAchievements: updatedUnlocked,
            newlyUnlocked: newlyUnlocked,
            totalPoints: newPoints
          })
        }
      },

      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

      getAchievementProgress: (achievementId) => {
        const achievement = ACHIEVEMENTS[achievementId]
        if (!achievement) return 0
        
        const { stats } = get()
        const req = achievement.requirement
        
        switch (req.type) {
          case 'sessions_completed':
            return Math.min(100, (stats.sessionsCompleted / req.value) * 100)
          case 'accuracy':
            return Math.min(100, (stats.maxAccuracy / req.value) * 100)
          case 'max_combo':
            return Math.min(100, (stats.maxCombo / req.value) * 100)
          case 'custom_sessions':
            return Math.min(100, (stats.customSessions / req.value) * 100)
          default:
            return 0
        }
      },

      getUnlockedAchievements: () => {
        const { unlockedAchievements } = get()
        return unlockedAchievements.map(id => ACHIEVEMENTS[id]).filter(Boolean)
      },

      getAllAchievements: () => Object.values(ACHIEVEMENTS),

      resetAchievements: () => set({
        unlockedAchievements: [],
        newlyUnlocked: [],
        totalPoints: 0,
        stats: {
          sessionsCompleted: 0,
          totalInputs: 0,
          totalCorrectInputs: 0,
          maxCombo: 0,
          maxAccuracy: 0,
          fastestCompletion: null,
            consecutiveHighAccuracy: 0,
          customSessions: 0,
          failedAttempts: 0,
          sessionTimes: []
        }
      })
    }),
    {
      name: 'speed-motioner-achievements',
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        totalPoints: state.totalPoints,
        stats: state.stats
      })
    }
  )
)