import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTrainingStore = create(
  persist(
    (set, get) => ({
      // Current training session
      currentSession: null,
      isTraining: false,
      sessionStartTime: null,
      
      // Leaderboard data
      leaderboard: [],
      
      // Training session data
      sessions: [],
      
      // Actions
      startTrainingSession: (mode, difficulty, targetInputs = 10) => {
        const sessionId = `session_${Date.now()}`
        const session = {
          id: sessionId,
          mode,
          difficulty,
          startTime: Date.now(),
          endTime: null,
          targetInputs: targetInputs,
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
          sessionStartTime: Date.now()
        })
        
        return session
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
          sessions: updatedSessions,
          leaderboard: updatedLeaderboard
        })
        
        return completedSession
      },
      
      updateSessionScore: (scoreUpdate) => {
        const { currentSession } = get()
        if (!currentSession) return
        
        set({
          currentSession: {
            ...currentSession,
            score: {
              ...currentSession.score,
              ...scoreUpdate
            }
          }
        })
      },
      
      addSessionInput: (input) => {
        const { currentSession } = get()
        if (!currentSession) return
        
        const newTotalInputs = currentSession.score.totalInputs + 1
        const newAccuracy = (newTotalInputs / newTotalInputs) * 100 // For now, all inputs are correct
        const newMaxCombo = Math.max(currentSession.score.maxCombo || 0, newTotalInputs) // Max combo is longest sequence
        
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
              maxCombo: newMaxCombo, // Track longest sequence
              points: newTotalInputs * 10 // Simple scoring: 10 points per input
            }
          }
        })
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
      name: 'speed-motioner-training',
      partialize: (state) => ({
        leaderboard: state.leaderboard,
        sessions: state.sessions,
        currentSession: state.currentSession,
        isTraining: state.isTraining,
        sessionStartTime: state.sessionStartTime
      })
    }
  )
)