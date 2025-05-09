import { useEffect, useState } from 'react'
import { socket } from '@/utils/socket'
import { UseAppContext } from '@/context'
import { PlayerType } from '@/types'

export default function Team({
  teamColor,
  roomId,
}: {
  teamColor: 'blue' | 'red'
  roomId: string
}) {
  const { setTeam, team, setTeamMaster } = UseAppContext()

  const [players, setPlayers] = useState<PlayerType[]>([])
  const [master, setMaster] = useState<string>('')
  const [started, setStarted] = useState<boolean>(false)
  const [score, setScore] = useState<number>()

  const classes =
    teamColor === 'blue'
      ? 'bg-blue-500 border-2 border-blue-600'
      : 'bg-red-500 border-2 border-red-600'
  const scoreColor = teamColor === 'blue' ? 'text-blue-500' : 'text-red-500'
  const teamName = teamColor === 'blue' ? 'Azul' : 'Vermelho'

  useEffect(() => {
    socket.on('game_started', () => setStarted(true))
  }, [])

  useEffect(() => {
    socket.on(`joined_${teamColor}_master`, (data) => setMaster(data.name))
    socket.on(`left_${teamColor}_master`, () => setMaster(''))
    socket.on('update_score', (data) => {
      if (teamColor === 'blue') setScore(data.blue)
      else setScore(data.red)
    })
  }, [teamColor])

  useEffect(() => {
    socket.on(`joined_${teamColor}_team`, (data) =>
      setPlayers([...players, data]),
    )
    socket.on(`left_${teamColor}_team`, (data) =>
      setPlayers(players.filter((player) => player.id !== data.id)),
    )
  }, [players, teamColor])

  function handleJoinTeam() {
    socket.emit(`join_${teamColor}_team`, roomId)
    setTeam(teamColor)
    setTeamMaster(false)
  }

  function handleJoinMaster() {
    socket.emit(`join_${teamColor}_master`, roomId)
    setTeam(teamColor)
    setTeamMaster(true)
  }

  return (
    <div className={`w-1/3 md:w-1/5 text-white`}>
      <div className="flex items-center justify-around mb-2">
        <h1 className="text-center font-semibold">Team {teamName}</h1>
        {score && (
          <h1 className={`${scoreColor} text-2xl p-2 font-semibold`}>
            {score}
          </h1>
        )}
      </div>

      <div
        className={`${classes} flex flex-col justify-between gap-4 p-2 rounded`}
      >
        <div>
          <div className="flex flex-col md:flex-row justify-between gap-1 mb-1">
            <h2>Players</h2>

            {!started && team !== teamColor && (
              <button
                onClick={handleJoinTeam}
                className="text-sm border p-1 rounded"
              >
                Entrar
              </button>
            )}
          </div>

          {players.length > 0 && (
            <ul className="border rounded px-2 py-1">
              {players.map((player) => (
                <li className="truncate" key={player.id}>
                  {player.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-1">Mestre</h2>
          <p className="truncate">{master}</p>
          {!started && !master && (
            <button
              onClick={handleJoinMaster}
              className="text-sm border p-1 rounded w-full"
            >
              Entrar como mestre
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
