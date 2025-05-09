import { useEffect, useState } from 'react'
import { socket } from '@/utils/socket'
import { PlayerType } from '@/types'

export default function Players() {
  const [players, setPlayers] = useState<PlayerType[]>([])

  useEffect(() => {
    socket.on('send_users', (data) => setPlayers(data))
  }, [players])

  return (
    <div>
      <h2 className="text-xl text-center font-semibold mb-2">Players</h2>
      {players.length > 0 && (
        <ul className="flex flex-col items-center gap-1">
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
