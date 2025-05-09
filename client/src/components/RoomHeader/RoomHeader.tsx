import { useEffect, useState } from 'react'
import { socket } from '@/utils/socket'

import PassTurnButton from '../PassTurnButton/PassTurnButton'

export default function RoomHeader({
  roomId,
  children,
}: {
  roomId: string
  children: React.ReactNode
}) {
  const [message, setMessage] = useState<string>('')
  const [messageClasses, setMessageClasses] = useState<string>('')

  useEffect(() => {
    socket.on('game_started', () => setMessage(''))
    socket.on('game_over', (data) => parseMessage(data.team, false))
    socket.on('change_turn', (data) => parseMessage(data, true))
  }, [])

  function parseMessage(team: string, turning: boolean) {
    let teamName
    if (team === 'blue') {
      setMessageClasses('bg-blue-500')
      teamName = 'Azul'
    } else {
      setMessageClasses('bg-red-500')
      teamName = 'Vermelho'
    }

    if (turning) setMessage(`Vez do time ${teamName}`)
    else setMessage(`O time ${teamName} ganhou!`)
  }

  return (
    <header>
      <div className="flex items-center justify-between pb-4 mb-4 border-b-2">
        <h1 className="text-2xl font-semibold">Sala: {roomId}</h1>

        <PassTurnButton roomId={roomId} />

        {message && (
          <h2
            className={`text-white text-xl font-semibold py-1 px-2 rounded ${messageClasses}`}
          >
            {message}
          </h2>
        )}
      </div>

      <div className="flex justify-between gap-4">{children}</div>
    </header>
  )
}
