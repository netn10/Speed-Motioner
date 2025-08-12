import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import GameCanvas from './components/GameCanvas'
import TrainingMenu from './components/TrainingMenu'
import Settings from './components/Settings'
import Leaderboard from './components/Leaderboard'
import { useSettingsStore } from './stores/settingsStore'
import './App.css'



const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useSettingsStore()

  const handleTitleClick = () => {
    navigate('/')
  }

  return (
    <header className="App-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px' }}>
      <div className="header-content" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', display: 'flex', width: '100%', maxWidth: '1200px', position: 'relative' }}>
        <div className="header-title" onClick={handleTitleClick} style={{ textAlign: 'center' }}>
          <h1>Speed Motioner</h1>
          <p>Fighting Game Training Tool</p>
        </div>
        <div className="header-controls" style={{ position: 'absolute', right: '0', display: 'flex' }}>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

function App() {
  const { theme } = useSettingsStore()

  return (
    <Router>
      <div className={`App ${theme}`}>
        <AppHeader />
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
