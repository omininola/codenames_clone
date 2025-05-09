import { useEffect, useState } from 'react'
import { socket } from '@/utils/socket'
import { UseAppContext } from '@/context'

export default function HintForm({ roomId }: { roomId: string }) {
  const { teamMaster, team } = UseAppContext()

  const [turn, setTurn] = useState<boolean>(false)

  useEffect(() => {
    socket.on('change_turn', (dataTeam) => {
      if (team === dataTeam) setTurn(true)
      else setTurn(false)
    })
  }, [team])

  function handleHint(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTurn(false)

    const formData = new FormData(e.currentTarget)
    const hint = (formData.get('hint') as string).toUpperCase()
    const quantity = formData.get('quantity') as string

    e.currentTarget.reset()
    socket.emit('send_hint', {
      roomId,
      hint: { hint, quantity, team },
    })
  }

  return (
    <>
      {teamMaster && (
        <form
          onSubmit={handleHint}
          className="flex items-center justify-center gap-2 rounded w-1/2 md:w-full"
        >
          <input
            className="uppercase border-2 p-1 rounded text-black"
            type="text"
            name="hint"
            id="hint"
            placeholder="Escreva sua palavra..."
            multiple
            autoComplete="off"
            required
          />
          <input
            className="border-2 p-1 rounded w-12 text-black"
            type="number"
            name="quantity"
            id="quantity"
            placeholder="0"
            min={1}
            required
          />
          <button
            type="submit"
            className="border-2 px-2 py-1 rounded disabled:text-gray-400"
            disabled={!turn}
          >
            Enviar
          </button>
        </form>
      )}
    </>
  )
}
