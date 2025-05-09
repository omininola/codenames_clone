import { socket } from '@/utils/socket'

export default function StartButton({
  roomId,
  gameOver,
}: {
  roomId: string
  gameOver: boolean
}) {
  function handleStart() {
    socket.emit('start_game', { roomId })
  }

  return (
    <button onClick={handleStart} className="border-2 p-2 rounded">
      {gameOver ? 'Resetar' : 'Iniciar'}
    </button>
  )
}
