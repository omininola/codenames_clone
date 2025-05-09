const { readFile, writeFile } = require('fs/promises')

async function getWords() {
  const file = await readFile('./words2.txt', 'utf-8')
  const words = file.split('\n').map((word) => word.trim())

  const usedWords = []

  words.forEach((word) => {
    if (usedWords.includes(word)) {
      console.error('Duplicate word found:', word)
      return
    }

    if (/[$&+,:;=?@#|'<>.\-^*()%!]/.test(word)) {
      console.error('Special character found:', word)
      return
    }

    usedWords.push(word)
  })

  console.log(
    'All words are unique and do not contain special characters, inserting them into words.txt',
  )
  await writeFile('./words.txt', usedWords.join('\n'))
}

getWords()
