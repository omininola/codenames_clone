const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { readFile } = require('fs/promises');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

let globalWords = [];

let teamPlaying = "blue";
let blueWords = 9;
let redWords = 8;
let playsQuantity = 0;
let lastHintQuantity = 0;

const getWords = async () => {
  const usedWords = [];
  const blueTeamWords = [];
  const redTeamWords = [];
  const neutralWords = [];
  let assassinWord = {};

  const gameWords = [];

  const file = await readFile("./words.txt", "utf-8");
  const words = file.split("\n").map(word => word.trim());

  // Blue team words
  while (blueTeamWords.length < 9) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (usedWords.includes(words[randomIndex])) return;
    usedWords.push(words[randomIndex]);
    blueTeamWords.push({ word: words[randomIndex], team: "blue"});
    words.splice(randomIndex, 1);
  };

  // Red team words
  while (redTeamWords.length < 8) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (usedWords.includes(words[randomIndex])) return;
    usedWords.push(words[randomIndex]);
    redTeamWords.push({ word: words[randomIndex], team: "red" });
    words.splice(randomIndex, 1);   
  };

  // Neutral words
  while (neutralWords.length < 7) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (usedWords.includes(words[randomIndex])) return;
    usedWords.push(words[randomIndex]);
    neutralWords.push({ word: words[randomIndex], team: "white" });
  };

  // Assassin word
  while (!assassinWord.word && !assassinWord.team) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (usedWords.includes(words[randomIndex])) return;
    usedWords.push(words[randomIndex]);
    assassinWord = { word: words[randomIndex], team: "black" };
  };

  gameWords.push(...blueTeamWords, ...redTeamWords, ...neutralWords, assassinWord);
  gameWords.map(wordObj => ({ word: wordObj.word, team: wordObj.team, revealed: false }));
  const gameWordsShuffled = shuffleArray(gameWords);

  globalWords = gameWordsShuffled;
  return globalWords;
}

function shuffleArray(array) {
  let shuffledArray = [...array];
  let currentIndex = shuffledArray.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex], shuffledArray[currentIndex]];
  }

  return shuffledArray;
}

const leaveTeam = (socket, roomId) => {
  socket.emit(`left_${socket.data.team}_team`, { name: socket.data.name, id: socket.id })
  socket.to(roomId).emit(`left_${socket.data.team}_team`, { name: socket.data.name, id: socket.id })
  socket.leave(roomId+"team");
  socket.data.team = "";
};

const leaveTeamMaster = (socket, roomId) => {
  socket.emit(`left_${socket.data.teamMaster}_master`);
  socket.to(roomId).emit(`left_${socket.data.teamMaster}_master`);
  socket.leave(roomId+"master");
  socket.data.teamMaster = "";
};

const fetchAndSendUsers = async (socket, roomId, joining) => {
  const sockets = await socket.in(roomId).fetchSockets();
  let users = sockets.map(s => ({ name: s.data.name, id: s.id }));

  if (joining) users.push({ name: socket.data.name, id: socket.id });
  else users = users.filter(u => u.id !== socket.id);

  socket.emit("send_users", users);
  socket.to(roomId).emit("send_users", users);
}

const gameOver = (socket, data) => {
  playsQuantity = 0;
  lastHintQuantity = 0;

  socket.emit("game_over", { team: data.team, words: data.words });
  socket.to(data.roomId).emit("game_over", { team: data.team, words: data.words });
}

io.on("connection", (socket) => {
  
  socket.on("join_room", async (data) => {
    socket.join(data.roomId);

    if (!data.name) {
      const file = await readFile("./names.txt", "utf-8");
      const names = file.split("\n").map(name => name.trim());
      const randomIndex = Math.floor(Math.random() * names.length);
      data.name = names[randomIndex];
    }

    socket.data.name = data.name;
    fetchAndSendUsers(socket, data.roomId, true);
  });

  socket.on("leave_room", async (data) => {
    if (socket.data.team) leaveTeam(socket, data);
    if (socket.data.teamMaster) leaveTeamMaster(socket, data);

    fetchAndSendUsers(socket, data.roomId, false);

    socket.leave(data.roomId);
  });

  socket.on("join_blue_team", (roomId) => {
    if (socket.data.team == "blue") return;
    if (socket.data.team) leaveTeam(socket, roomId);
    if (socket.data.teamMaster) leaveTeamMaster(socket, roomId);

    socket.data.team = "blue";
    socket.join([roomId+"team", roomId+"blue"]);
    socket.emit("joined_blue_team", { name: socket.data.name, id: socket.id });
    socket.to(roomId).emit("joined_blue_team", { name: socket.data.name, id: socket.id });
  });
  
  socket.on("join_red_team", (roomId) => {
    if (socket.data.team == "red") return;
    if (socket.data.team) leaveTeam(socket, roomId);
    if (socket.data.teamMaster) leaveTeamMaster(socket, roomId);

    socket.data.team = "red";
    socket.join([roomId+"team", roomId+"red"]);
    socket.emit("joined_red_team", { name: socket.data.name, id: socket.id });
    socket.to(roomId).emit("joined_red_team", { name: socket.data.name, id: socket.id });
  });

  socket.on("join_blue_master", (roomId) => {
    if (socket.data.teamMaster == "blue") return;
    if (socket.data.teamMaster) leaveTeamMaster(socket, roomId);
    if (socket.data.team) leaveTeam(socket, roomId);

    socket.data.teamMaster = "blue";
    socket.join([roomId+"master", roomId+"blue"]);
    socket.emit("joined_blue_master", { name: socket.data.name, id: socket.id });
    socket.to(roomId).emit("joined_blue_master", { name: socket.data.name, id: socket.id });
  });

  socket.on("join_red_master", (roomId) => {
    if (socket.data.teamMaster == "red") return;
    if (socket.data.teamMaster) leaveTeamMaster(socket, roomId);
    if (socket.data.team) leaveTeam(socket, roomId);

    socket.data.teamMaster = "red";
    socket.join([roomId+"master", roomId+"red"]);
    socket.emit("joined_red_master", { name: socket.data.name, id: socket.id });
    socket.to(roomId).emit("joined_red_master", { name: socket.data.name, id: socket.id });
  });

  socket.on("start_game", async (data) => { 
    globalWords = [];
    teamPlaying = "blue";
    blueWords = 9;
    redWords = 8;
    playsQuantity = 0;
    lastHintQuantity = 0;

    let words = await getWords();
    
    while (!words) {
      words = await getWords();
    }

    if (socket.data.team) socket.emit("game_started", words.map(wordObj => ({ word: wordObj.word, team: "" })));
    if (socket.data.teamMaster) socket.emit("game_started", words);
    
    socket.to(data.roomId+"team").emit("game_started", words.map(word => ({ word: word.word, team: "" })));
    socket.to(data.roomId+"master").emit("game_started", words);

    socket.emit("change_turn", teamPlaying);
    socket.to(data.roomId).emit("change_turn", teamPlaying);

    socket.emit("update_score", { blue: blueWords, red: redWords });
    socket.to(data.roomId).emit("update_score", { blue: blueWords, red: redWords });
  });

  socket.on("send_hint", (data) => {
    lastHintQuantity = data.hint.quantity;
    socket.emit("receive_hint", data.hint);
    socket.to(data.roomId).emit("receive_hint", data.hint);
  });

  socket.on("send_guess", async (data) => {
    const words = globalWords;
    if (!words) return;

    const otherTeam = teamPlaying == "blue" ? "red" : "blue";

    if (data.word == undefined) {
      socket.emit("change_turn", otherTeam);
      socket.to(data.roomId).emit("change_turn", otherTeam);
      return;
    }

    const word = words.find(wordObj => wordObj.word.toUpperCase() == data.word.toUpperCase());
    if (!word) return;

    playsQuantity++;

    if (word.team == "blue" && teamPlaying == "blue") blueWords--;
    if (word.team == "red" && teamPlaying == "red") redWords--;

    socket.emit("update_words", word);
    socket.to(data.roomId+"team").emit("update_words", word);

    socket.emit("update_score", { blue: blueWords, red: redWords });
    socket.to(data.roomId).emit("update_score", { blue: blueWords, red: redWords });

    // Check if the team has won
    if (blueWords == 0 || redWords == 0) {
      const dataToSend = { roomId: data.roomId, team: teamPlaying, words };
      gameOver(socket, dataToSend);
    }

    // Check if the word is assassin
    if (word.team == "black") {
      const dataToSend = { roomId: data.roomId, team: otherTeam, words };
      gameOver(socket, dataToSend);
    }

    // Check if the word is on the other team or its white
    if (word.team == "white" || word.team == otherTeam || playsQuantity > lastHintQuantity) {
      teamPlaying = otherTeam;
      playsQuantity = 0;
      lastHintQuantity = 0;
      socket.emit("change_turn", otherTeam);
      socket.to(data.roomId).emit("change_turn", otherTeam);
    }
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});