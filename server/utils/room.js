const { readFile } = require('fs/promises')
const { leaveTeam, leaveTeamMaster } = require('./teams')

async function fetchAndSendUsers(socket, roomId, joining) {
  const sockets = await socket.in(roomId).fetchSockets()
  let users = sockets.map((s) => ({ name: s.data.name, id: s.id }))

  if (joining) users.push({ name: socket.data.name, id: socket.id })
  else users = users.filter((u) => u.id !== socket.id)

  socket.emit('send_users', users)
  socket.to(roomId).emit('send_users', users)
}

async function joinRoom(socket, data) {
  socket.join(data.roomId)

  if (data.name === '' || data.name === undefined) {
    let file

    try {
      file = await readFile('./names.txt', 'utf-8')
    } catch (e) {
      console.log('Error reading file:', e)
      return
    }

    const names = file.split('\n').map((name) => name.trim())
    const randomIndex = Math.floor(Math.random() * names.length)
    socket.data.name = names[randomIndex]
  } else socket.data.name = data.name
  fetchAndSendUsers(socket, data.roomId, true)
}

async function leaveRoom(socket, roomId) {
  if (socket.data.team) leaveTeam(socket, roomId)
  if (socket.data.teamMaster) leaveTeamMaster(socket, roomId)
  fetchAndSendUsers(socket, roomId, false)
  socket.leave(roomId)
}

module.exports = { joinRoom, leaveRoom }
