import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTrainingStore = create(
  persist(
    (set, get) => ({
      // Current training session
      currentSession: null,
      isTraining: false,
      sessionStartTime: null,
      lastUpdateTime: null,
      
      // Leaderboard data
      leaderboard: [],
      
      // Training session data
      sessions: [],
      
      // Custom combos management
      customCombos: [],
      
      // Actions
      startTrainingSession: (mode, difficulty, targetInputs = 10, customTiming = null, customConfig = null) => {
        const sessionId = `session_${Date.now()}`
        const now = Date.now()
        const session = {
          id: sessionId,
          mode,
          difficulty,
          startTime: now,
          endTime: null,
          targetInputs: targetInputs,
          customTiming: customTiming, // Store custom timing for custom mode
          customConfig: customConfig, // Store custom challenge configuration
          score: {
            totalInputs: 0,
            correctInputs: 0,
            accuracy: 0,
            maxCombo: 0,
            timeElapsed: 0,
            points: 0
          },
          inputs: []
        }
        

        
        set({
          currentSession: session,
          isTraining: true,
          sessionStartTime: now,
          lastUpdateTime: now
        })
        
        // Immediately update timer to start counting
        setTimeout(() => {
          const { currentSession: current, sessionStartTime: startTime } = get()
          if (current && startTime) {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000)
            set({
              currentSession: {
                ...current,
                score: {
                  ...current.score,
                  timeElapsed
                }
              }
            })
          }
        }, 100)
        
        return session
      },
      
      updateSessionTimer: () => {
        const { currentSession, sessionStartTime } = get()
        if (!currentSession || !sessionStartTime) return
        
        const now = Date.now()
        const timeElapsed = Math.floor((now - sessionStartTime) / 1000) // Convert to seconds
        
        set({
          lastUpdateTime: now,
          currentSession: {
            ...currentSession,
            score: {
              ...currentSession.score,
              timeElapsed
            }
          }
        })
      },
      
      endTrainingSession: (finalScore) => {
        const { currentSession, sessions, leaderboard } = get()
        
        if (!currentSession) return null
        
        const endTime = Date.now()
        const timeElapsed = endTime - currentSession.startTime
        
        const completedSession = {
          ...currentSession,
          endTime,
          score: {
            ...finalScore,
            timeElapsed: Math.floor(timeElapsed / 1000) // Convert to seconds
          }
        }
        
        // Add to sessions history
        const updatedSessions = [completedSession, ...sessions].slice(0, 100) // Keep last 100 sessions
        
        // Add to leaderboard if score is good enough
        const leaderboardEntry = {
          id: completedSession.id,
          playerName: 'Player', // Could be customizable later
          mode: completedSession.mode,
          difficulty: completedSession.difficulty,
          score: completedSession.score.points || 0, // Use points as primary score
          accuracy: completedSession.score.accuracy,
          maxCombo: completedSession.score.maxCombo,
          timeElapsed: completedSession.score.timeElapsed,
          date: new Date(completedSession.startTime).toLocaleDateString(),
          timestamp: completedSession.startTime
        }
        
        const updatedLeaderboard = [...leaderboard, leaderboardEntry]
          .sort((a, b) => b.score - a.score) // Sort by accuracy descending
          .slice(0, 50) // Keep top 50 entries
        
        set({
          currentSession: null,
          isTraining: false,
          sessionStartTime: null,
          lastUpdateTime: null,
          sessions: updatedSessions,
          leaderboard: updatedLeaderboard
        })
        
        return completedSession
      },
      
      updateSessionScore: (scoreUpdate) => {
        console.log('🔄 updateSessionScore called with:', scoreUpdate)
        const { currentSession } = get()
        if (!currentSession) {
          console.log('❌ No current session, cannot update score')
          return
        }
        
        console.log('📊 Current session score before update:', currentSession.score)
        const updatedScore = {
          ...currentSession.score,
          ...scoreUpdate
        }
        console.log('📊 Updated session score:', updatedScore)
        
        set({
          currentSession: {
            ...currentSession,
            score: updatedScore
          }
        })
      },
      
      addSessionInput: (input) => {
        const { currentSession } = get()
        if (!currentSession) return
        
        const newTotalInputs = currentSession.score.totalInputs + 1
        const newAccuracy = (newTotalInputs / newTotalInputs) * 100 // For now, all inputs are correct
        const newComboCount = newTotalInputs // Current combo is the total sequence length
        // Don't update maxCombo here - it should only be updated when valid combos are completed
        const newMaxCombo = currentSession.score.maxCombo || 0
        
        set({
          currentSession: {
            ...currentSession,
            inputs: [...currentSession.inputs, {
              input,
              timestamp: Date.now() - currentSession.startTime
            }],
            score: {
              ...currentSession.score,
              totalInputs: newTotalInputs,
              correctInputs: newTotalInputs, // For now, all inputs are correct
              accuracy: newAccuracy,
              comboCount: newComboCount, // Current combo count
              maxCombo: newMaxCombo, // Keep existing max combo (only update on valid completions)
              points: newTotalInputs * 10 // Simple scoring: 10 points per input
            }
          }
        })
      },
      
      // Custom combos management
      saveCustomCombo: (combo) => {
        const { customCombos } = get()
        const newCombo = {
          id: `combo_${Date.now()}`,
          name: combo.name,
          inputs: combo.inputs,
          description: combo.description || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        const updatedCombos = [newCombo, ...customCombos]
        set({ customCombos: updatedCombos })
        return newCombo
      },
      
      updateCustomCombo: (comboId, updates) => {
        const { customCombos } = get()
        const updatedCombos = customCombos.map(combo => 
          combo.id === comboId 
            ? { ...combo, ...updates, updatedAt: Date.now() }
            : combo
        )
        set({ customCombos: updatedCombos })
      },
      
      deleteCustomCombo: (comboId) => {
        const { customCombos } = get()
        const updatedCombos = customCombos.filter(combo => combo.id !== comboId)
        set({ customCombos: updatedCombos })
      },
      
      getCustomCombo: (comboId) => {
        const { customCombos } = get()
        return customCombos.find(combo => combo.id === comboId)
      },
      
      getAllCustomCombos: () => {
        const { customCombos } = get()
        return customCombos
      },
      
      clearCustomCombos: () => {
        set({ customCombos: [] })
      },
      
      getLeaderboardByMode: (mode) => {
        const { leaderboard } = get()
        return leaderboard.filter(entry => entry.mode === mode)
      },
      
      getLeaderboardByDifficulty: (difficulty) => {
        const { leaderboard } = get()
        return leaderboard.filter(entry => entry.difficulty === difficulty)
      },
      
      getPersonalBest: (mode, difficulty) => {
        const { leaderboard } = get()
        const filtered = leaderboard.filter(entry => 
          entry.mode === mode && entry.difficulty === difficulty
        )
        return filtered.length > 0 ? filtered[0] : null
      },
      
      clearLeaderboard: () => set({ leaderboard: [] }),
      
      clearSessions: () => set({ sessions: [] })
    }),
    {
      name: 'speed-motioner-training'
    }
  )
)

