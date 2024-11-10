import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";

export default function PassTurnButton({ roomId }: { roomId: string }) {
  const { team } = UseAppContext();

  function handleClick(){
    socket.emit("send_guess", { roomId, team });
  };

  return (
    <button onClick={handleClick} className="border-2 py-1 px-2 rounded">Passar o turno</button>
  );
}