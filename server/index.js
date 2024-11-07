const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const leaveTeam = (socket, data) => {
  socket.data.team = "";
  socket.emit(`left_${data.team}_team`, { name: data.name, id: socket.id })
  socket.to(data.roomId).emit(`left_${data.team}_team`, { name: data.name, id: socket.id })
};

const leaveTeamMaster = (socket, data) => {
  socket.data.teamMaster = "";
  socket.emit(`left_${data.teamMaster}_master`);
  socket.to(data.roomId).emit(`left_${data.teamMaster}_master`);
};

io.on("connection", (socket) => {
  
  socket.on("join_room", async (data) => {
    socket.join(data.roomId);
    socket.data.name = data.name;

    const sockets = await socket.in(data.roomId).fetchSockets();
    const users = sockets.map(s => ({ name: s.data.name, id: s.id }));
    users.push({ name: data.name, id: socket.id });
    
    socket.emit("joined_room", users);
    socket.to(data.roomId).emit("joined_room", users);
  });

  socket.on("join_blue_team", (data) => {
    if (data.team == "blue") return;
    if (data.teamMaster) leaveTeamMaster(socket, data);
    if (data.team == "red") leaveTeam(socket, data);

    socket.data.team = "blue";
    socket.to(data.roomId).emit("joined_blue_team", { name: data.name, id: socket.id });
  });
  
  socket.on("join_red_team", (data) => {
    if (data.team == "red") return;
    if (data.teamMaster) leaveTeamMaster(socket, data);
    if (data.team == "blue") leaveTeam(socket, data);

    socket.data.team = "red";
    socket.to(data.roomId).emit("joined_red_team", { name: data.name, id: socket.id });
  });

  socket.on("join_blue_master", (data) => {
    if (data.teamMaster == "blue") return;
    if (data.team) leaveTeam(socket, data);
    if (data.teamMaster == "red") leaveTeamMaster(socket, data);

    socket.data.teamMaster = "blue";
    socket.to(data.roomId).emit("joined_blue_master", { name: data.name, id: socket.id });
  });

  socket.on("join_red_master", (data) => {
    if (data.teamMaster == "red") return;
    if (data.team) leaveTeam(socket, data);
    if (data.teamMaster == "blue") leaveTeamMaster(socket, data);

    socket.data.teamMaster = "red";
    socket.to(data.roomId).emit("joined_red_master", { name: data.name, id: socket.id });
  });

  socket.on("start_game", async (data) => {
    console.log("COMEÇOOOUUUU");

    const sockets = await socket.in(data.roomId).fetchSockets();
    const users = sockets.map(s => ({ name: s.data.name, id: s.id, team: s.data.team, teamMaster: s.data.teamMaster }));
    users.push({ name: socket.data.name, id: socket.id, team: socket.data.team, teamMaster: socket.data.teamMaster});

    console.log(users);
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});