import { useEffect, useState } from 'react'
import { socket } from '@/utils/socket'
import { UseAppContext } from '@/context'
import { WordType } from '@/types'

import StartButton from '../StartButton/StartButton'
import Word from '../Word/Word'

export default function Board({ roomId }: { roomId: string }) {
  const { team } = UseAppContext()

  const [words, setWords] = useState<WordType[]>([])
  const [turn, setTurn] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)

  useEffect(() => {
    socket.on('game_started', (data) => {
      setWords(data)
      setGameOver(false)
    })

    socket.on('game_over', (data) => {
      setWords(data.words)
      setGameOver(true)
    })
  }, [])

  useEffect(() => {
    socket.on('update_words', (wordObjData) => {
      const wordToUpdate = words.find(
        (wordObj) => wordObj.word === wordObjData.word,
      )
      if (wordToUpdate) wordToUpdate.team = wordObjData.team

      setWords([...words])
    })
  }, [words])

  useEffect(() => {
    socket.on('change_turn', (data) => {
      if (team === data) setTurn(true)
      else setTurn(false)
    })
  }, [team])

  return (
    <section className="flex flex-col gap-4 w-full">
      {(words.length === 0 || gameOver) && (
        <StartButton roomId={roomId} gameOver={gameOver} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {words.map((word) => (
          <Word
            key={word.word}
            word={word}
            turn={turn}
            roomId={roomId}
            gameOver={gameOver}
          />
        ))}
      </div>
    </section>
  )
}
