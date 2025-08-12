import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GameCanvas from './components/GameCanvas'
import TrainingMenu from './components/TrainingMenu'
import Settings from './components/Settings'
import Leaderboard from './components/Leaderboard'
import { useSettingsStore } from './stores/settingsStore'
import './App.css'

// Import test functions for debugging
import './test/timer-test'
import './test/progress-test'
import './test/wrong-input-test'
import './test/timeout-test'
import './test/training-completion-test'

function App() {
  const { theme } = useSettingsStore()

  return (
    <Router>
      <div className={`App ${theme}`}>
        <header className="App-header">
          <h1>Speed Motioner</h1>
          <p>Fighting Game Training Tool</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TrainingMenu />} />
            <Route path="/game" element={<GameCanvas />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
