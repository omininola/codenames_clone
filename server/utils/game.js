const { readFile } = require('fs/promises')

function addWord(words, teamWordsArray, team) {
  const randomIndex = Math.floor(Math.random() * words.length)
  teamWordsArray.push({ word: words[randomIndex], team })
  words.splice(randomIndex, 1)
}

async function getWords() {
  const gameWords = []
  const blueTeamWords = []
  const redTeamWords = []
  const neutralWords = []
  const assassinWords = []

  let file
  try {
    file = await readFile('./words.txt', 'utf-8')
  } catch (e) {
    console.log('Error reading file:', e)
    return
  }

  const words = file.split('\n').map((word) => word.trim())

  // Blue team words
  while (blueTeamWords.length < 9) addWord(words, blueTeamWords, 'blue')

  // Red team words
  while (redTeamWords.length < 8) addWord(words, redTeamWords, 'red')

  // Neutral words
  while (neutralWords.length < 7) addWord(words, neutralWords, 'white')

  // Assassin word
  while (assassinWords.length < 1) addWord(words, assassinWords, 'black')

  gameWords.push(
    ...blueTeamWords,
    ...redTeamWords,
    ...neutralWords,
    ...assassinWords,
  )

  const gameWordsShuffled = shuffleArray(gameWords)
  return gameWordsShuffled
}

function shuffleArray(array) {
  let shuffledArray = [...array]
  let currentIndex = shuffledArray.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ]
  }

  return shuffledArray
}

function gameOver(socket, data) {
  playsQuantity = 0
  lastHintQuantity = 0

  socket.emit('game_over', { team: data.team, words: data.words })
  socket
    .to(data.roomId)
    .emit('game_over', { team: data.team, words: data.words })
}

async function startGame(socket, roomId, teamPlaying, blueWords, redWords) {
  let words
  while (!words) words = await getWords()

  if (socket.data.teamMaster) socket.emit('game_started', words)
  else socket.emit(
      'game_started',
      words.map((wordObj) => ({ word: wordObj.word, team: '' })),
    ) 

  socket.to(roomId + 'team').emit(
    'game_started',
    words.map((word) => ({ word: word.word, team: '' })),
  )
  socket.to(roomId + 'master').emit('game_started', words)

  socket.emit('change_turn', teamPlaying)
  socket.to(roomId).emit('change_turn', teamPlaying)

  socket.emit('update_score', { blue: blueWords, red: redWords })
  socket.to(roomId).emit('update_score', { blue: blueWords, red: redWords })

  return words
}

function sendHint(socket, roomId, hint) {
  socket.emit('receive_hint', hint)
  socket.to(roomId).emit('receive_hint', hint)
}

function sendGuess(socket, roomId, words, wordGuessed, teamPlaying, playsQuantity, lastHintQuantity, blueWords, redWords) {
  const otherTeam = teamPlaying == 'blue' ? 'red' : 'blue'

  if (wordGuessed == undefined) {
    socket.emit('change_turn', otherTeam)
    socket.to(roomId).emit('change_turn', otherTeam)
    return
  }

  let word
  try {
    word = words.find(
      (wordObj) => wordObj.word.toUpperCase() == wordGuessed.toUpperCase(),
    )
    if (!word) throw new Error('Word not found')
  } catch (e) {
    console.log('Error finding word:', e)
    return
  }
  console.log(word);

  playsQuantity++
  if (word.team == 'blue' && teamPlaying == 'blue') blueWords--
  if (word.team == 'red' && teamPlaying == 'red') redWords--

  socket.emit('update_words', word)
  socket.to(roomId + 'team').emit('update_words', word)

  socket.emit('update_score', { blue: blueWords, red: redWords })
  socket
    .to(roomId)
    .emit('update_score', { blue: blueWords, red: redWords })

  // Check if the team has won
  if (blueWords == 0 || redWords == 0) {
    const dataToSend = { roomId: roomId, team: teamPlaying, words }
    gameOver(socket, dataToSend)
  }

  // Check if the word is assassin
  if (word.team == 'black') {
    const dataToSend = { roomId: roomId, team: otherTeam, words }
    gameOver(socket, dataToSend)
  }

  console.log(playsQuantity);
  console.log(lastHintQuantity);
  

  // Check if the word is on the other team or its white
  if (
    word.team == 'white' ||
    word.team == otherTeam ||
    playsQuantity > lastHintQuantity
  ) {
    teamPlaying = otherTeam
    playsQuantity = 0
    lastHintQuantity = 0
    socket.emit('change_turn', otherTeam)
    socket.to(roomId).emit('change_turn', otherTeam)
  }
}

module.exports = { startGame, sendHint, sendGuess }
