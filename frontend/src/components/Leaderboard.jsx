import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '../stores/trainingStore'
import { useSettingsStore } from '../stores/settingsStore'
import './Leaderboard.css'

const Leaderboard = () => {
    const navigate = useNavigate()
    const { theme } = useSettingsStore()
    const {
        leaderboard,
        sessions,
        getLeaderboardByMode,
        getLeaderboardByDifficulty,
        clearLeaderboard,
        clearSessions
    } = useTrainingStore()

    const [activeTab, setActiveTab] = useState('leaderboard')
    const [filterMode, setFilterMode] = useState('all')
    const [filterDifficulty, setFilterDifficulty] = useState('all')

    const modes = [
        { id: 'all', name: 'All Modes' },
        { id: 'motion', name: 'Motion Training' },
        { id: 'combos', name: 'Combo Training' },
        { id: 'custom', name: 'Custom Challenge' }
    ]

    const difficulties = [
        { id: 'all', name: 'All Difficulties' },
        { id: 'easy', name: 'Easy' },
        { id: 'medium', name: 'Medium' },
        { id: 'hard', name: 'Hard' }
    ]

    const getFilteredLeaderboard = () => {
        let filtered = [...leaderboard]

        if (filterMode !== 'all') {
            filtered = filtered.filter(entry => entry.mode === filterMode)
        }

        if (filterDifficulty !== 'all') {
            filtered = filtered.filter(entry => entry.difficulty === filterDifficulty)
        }

        return filtered
    }

    const getFilteredSessions = () => {
        let filtered = [...sessions]

        if (filterMode !== 'all') {
            filtered = filtered.filter(session => session.mode === filterMode)
        }

        if (filterDifficulty !== 'all') {
            filtered = filtered.filter(session => session.difficulty === filterDifficulty)
        }

        return filtered
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getModeIcon = (mode) => {
        const icons = {
            motion: '🥋',
            blocking: '🛡️',
            punishing: '⚡',
            combos: '🔥'
        }
        return icons[mode] || '🎮'
    }

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: '#4CAF50',
            medium: '#FF9800',
            hard: '#F44336'
        }
        return colors[difficulty] || '#666'
    }

    return (
        <div className={`leaderboard ${theme}`}>
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h2>Training Records</h2>
                    <button className="back-button" onClick={() => navigate('/')}>
                        ← Back to Menu
                    </button>
                </div>

                <div className="leaderboard-tabs">
                    <button
                        className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        🏆 Leaderboard
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📊 Session History
                    </button>
                </div>

                <div className="leaderboard-filters">
                    <div className="filter-group">
                        <label>Mode:</label>
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value)}
                            className="filter-select"
                        >
                            {modes.map(mode => (
                                <option key={mode.id} value={mode.id}>{mode.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Difficulty:</label>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="filter-select"
                        >
                            {difficulties.map(difficulty => (
                                <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {activeTab === 'leaderboard' && (
                    <div className="leaderboard-content">
                        {getFilteredLeaderboard().length === 0 ? (
                            <div className="empty-state">
                                <h3>No Records Yet</h3>
                                <p>Complete some training sessions to see your best scores here!</p>
                                <button
                                    className="start-training-button"
                                    onClick={() => navigate('/')}
                                >
                                    Start Training
                                </button>
                            </div>
                        ) : (
                            <div className="leaderboard-table">
                                <div className="table-header">
                                    <div className="rank-col">Rank</div>
                                    <div className="player-col">Player</div>
                                    <div className="mode-col">Mode</div>
                                    <div className="difficulty-col">Difficulty</div>
                                    <div className="score-col">Points</div>
                                    <div className="combo-col">Max Combo</div>
                                    <div className="time-col">Time</div>
                                    <div className="date-col">Date</div>
                                </div>

                                {getFilteredLeaderboard().map((entry, index) => (
                                    <div key={entry.id} className="table-row">
                                        <div className="rank-col">
                                            <span className={`rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="player-col">{entry.playerName}</div>
                                        <div className="mode-col">
                                            <span className="mode-badge">
                                                {getModeIcon(entry.mode)} {entry.mode}
                                            </span>
                                        </div>
                                        <div className="difficulty-col">
                                            <span
                                                className="difficulty-badge"
                                                style={{ backgroundColor: getDifficultyColor(entry.difficulty) }}
                                            >
                                                {entry.difficulty}
                                            </span>
                                        </div>
                                        <div className="score-col">
                                            <span className="score">{entry.score.toLocaleString()}</span>
                                        </div>
                                        <div className="combo-col">{entry.maxCombo}</div>
                                        <div className="time-col">{formatTime(entry.timeElapsed)}</div>
                                        <div className="date-col">{entry.date}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {getFilteredLeaderboard().length > 0 && (
                            <div className="leaderboard-actions">
                                <button
                                    className="clear-button"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear the leaderboard? This cannot be undone.')) {
                                            clearLeaderboard()
                                        }
                                    }}
                                >
                                    Clear Leaderboard
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-content">
                        {getFilteredSessions().length === 0 ? (
                            <div className="empty-state">
                                <h3>No Training History</h3>
                                <p>Your completed training sessions will appear here.</p>
                                <button
                                    className="start-training-button"
                                    onClick={() => navigate('/')}
                                >
                                    Start Training
                                </button>
                            </div>
                        ) : (
                            <div className="history-list">
                                {getFilteredSessions().map((session) => (
                                    <div key={session.id} className="history-item">
                                        <div className="history-header">
                                            <div className="history-mode">
                                                {getModeIcon(session.mode)} {session.mode}
                                            </div>
                                            <div
                                                className="history-difficulty"
                                                style={{ color: getDifficultyColor(session.difficulty) }}
                                            >
                                                {session.difficulty}
                                            </div>
                                            <div className="history-date">
                                                {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()}
                                            </div>
                                        </div>

                                        <div className="history-stats">
                                            <div className="stat">
                                                <span className="stat-label">Points:</span>
                                                <span className="stat-value">{(session.score.points || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Accuracy:</span>
                                                <span className="stat-value">{session.score.accuracy.toFixed(1)}%</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Max Combo:</span>
                                                <span className="stat-value">{session.score.maxCombo}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Total Inputs:</span>
                                                <span className="stat-value">{session.score.totalInputs}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Duration:</span>
                                                <span className="stat-value">{formatTime(session.score.timeElapsed)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {getFilteredSessions().length > 0 && (
                            <div className="history-actions">
                                <button
                                    className="clear-button"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear your training history? This cannot be undone.')) {
                                            clearSessions()
                                        }
                                    }}
                                >
                                    Clear History
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Leaderboard