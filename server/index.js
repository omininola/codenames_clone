const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const { joinRoom, leaveRoom } = require('./utils/room')
const { joinTeam, joinMaster } = require('./utils/teams')
const { startGame, sendHint, sendGuess } = require('./utils/game')

const app = express()
app.use(cors())
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

let globalWords = []
let teamPlaying = 'blue'
let blueWords = 9
let redWords = 8
let playsQuantity = 0
let lastHintQuantity = 0

function resetVariables() {
  globalWords = []
  teamPlaying = 'blue'
  blueWords = 9
  redWords = 8
  playsQuantity = 0
  lastHintQuantity = 0
}

io.on('connection', (socket) => {
  socket.on('join_room', (data) => joinRoom(socket, data))
  socket.on('leave_room', (data) => leaveRoom(socket, data.roomId))
  socket.on('join_blue_team', (roomId) => joinTeam(socket, roomId, 'blue'))
  socket.on('join_red_team', (roomId) => joinTeam(socket, roomId, 'red'))
  socket.on('join_blue_master', (roomId) => joinMaster(socket, roomId, 'blue'))
  socket.on('join_red_master', (roomId) => joinMaster(socket, roomId, 'red'))

  socket.on('start_game', async (data) => {
    resetVariables()
    globalWords = await startGame(socket, data.roomId, teamPlaying, blueWords, redWords)
  })

  socket.on('send_hint', (data) => {
    lastHintQuantity = data.hint.quantity
    sendHint(socket, data.roomId, data.hint)
  })

  socket.on('send_guess', (data) => sendGuess(
    socket,
    data.roomId,
    globalWords,
    data.word,
    teamPlaying,
    playsQuantity,
    lastHintQuantity,
    blueWords,
    redWords,
  ))
})

server.listen(4000, () => {
  console.log('Server is running on port 4000')
})
