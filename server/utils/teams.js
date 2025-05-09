function joinTeam(socket, roomId, team) {
  if (socket.data.team == team) return
  if (socket.data.team) leaveTeam(socket, roomId)
  if (socket.data.teamMaster) leaveTeamMaster(socket, roomId)

  socket.data.team = team
  socket.data.teamMaster = false
  socket.join([roomId + 'team', roomId + team])
  socket.emit(`joined_${team}_team`, { name: socket.data.name, id: socket.id })
  socket
    .to(roomId)
    .emit(`joined_${team}_team`, { name: socket.data.name, id: socket.id })
}

function joinMaster(socket, roomId, team) {
  if (socket.data.team == team) return
  if (socket.data.teamMaster) leaveTeamMaster(socket, roomId)
  if (socket.data.team) leaveTeam(socket, roomId)

  socket.data.team = team
  socket.data.teamMaster = true
  socket.join([roomId + 'master', roomId + team])
  socket.emit(`joined_${team}_master`, {
    name: socket.data.name,
    id: socket.id,
  })
  socket
    .to(roomId)
    .emit(`joined_${team}_master`, { name: socket.data.name, id: socket.id })
}

function leaveTeam(socket, roomId) {
  socket.emit(`left_${socket.data.team}_team`, {
    name: socket.data.name,
    id: socket.id,
  })

  socket.to(roomId).emit(`left_${socket.data.team}_team`, {
    name: socket.data.name,
    id: socket.id,
  })
  
  socket.leave(roomId + 'team')
  socket.data.team = 'none'
}

function leaveTeamMaster(socket, roomId) {
  socket.emit(`left_${socket.data.team}_master`)
  socket.to(roomId).emit(`left_${socket.data.team}_master`)
  socket.leave(roomId + 'master')
  socket.data.teamMaster = false
}

module.exports = { joinTeam, joinMaster, leaveTeam, leaveTeamMaster }
