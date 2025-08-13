import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { GameManager } from './gameManager.js'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Serve static files from the public directory
app.use(express.static('public'))

// Game manager instance
const gameManager = new GameManager()

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Speed Motioner Backend is running' })
})

app.get('/api/game-state', (req, res) => {
  res.json(gameManager.getGameState())
})

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Join game room
  socket.join('game')
  
  // Handle player input
  socket.on('input', (data) => {
    const { key, timestamp } = data
    const result = gameManager.processInput(socket.id, key, timestamp)
    
    // Broadcast input result to all players
    io.to('game').emit('inputResult', {
      playerId: socket.id,
      input: key,
      result: result,
      timestamp: timestamp
    })
    
    // Update game state
    io.to('game').emit('gameState', gameManager.getGameState())
  })
  
  // Handle player movement
  socket.on('playerMove', (position) => {
    gameManager.updatePlayerPosition(socket.id, position)
    socket.broadcast.to('game').emit('opponentMove', {
      playerId: socket.id,
      position: position
    })
  })
  
  // Handle training mode selection
  socket.on('setTrainingMode', (mode) => {
    gameManager.setTrainingMode(socket.id, mode)
    io.to('game').emit('trainingModeChanged', mode)
  })
  
  // Handle difficulty selection
  socket.on('setDifficulty', (difficulty) => {
    gameManager.setDifficulty(socket.id, difficulty)
    io.to('game').emit('difficultyChanged', difficulty)
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    gameManager.removePlayer(socket.id)
    socket.broadcast.to('game').emit('playerDisconnected', socket.id)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Speed Motioner Backend running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready for connections`)
  console.log(`🌐 Health check available at http://localhost:${PORT}/api/health`)
})
