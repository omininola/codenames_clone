import { socket } from '@/utils/socket'
import { UseAppContext } from '@/context'
import { useEffect, useState } from 'react'

export default function PassTurnButton({ roomId }: { roomId: string }) {
  const { team } = UseAppContext()

  const [turn, setTurn] = useState<boolean>(false)
  const [initialGuess, setInitialGuess] = useState<boolean>(false)

  useEffect(() => {
    socket.on('update_words', () => setInitialGuess(true))
  }, [])

  useEffect(() => {
    socket.on('change_turn', (data) => {
      if (team === data) setTurn(true)
      else setTurn(false)
      setInitialGuess(false)
    })
  }, [team])

  function handleClick() {
    socket.emit('send_guess', { roomId, team })
  }

  return (
    <>
      {turn && initialGuess && (
        <button onClick={handleClick} className="border-2 py-1 px-2 rounded">
          Passar o turno
        </button>
      )}
    </>
  )
}
