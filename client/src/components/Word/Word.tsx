import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";
import { WordType } from "@/types";

export default function Word({ roomId, word, turn, gameOver }: {
  roomId: string;
  word: WordType;
  turn: boolean;
  gameOver: boolean;
}) {
  const { teamMaster, team } = UseAppContext();
  
  let classes = "";
  switch (word.team) {
    case "blue":
      classes = "bg-blue-500 text-white border-2 border-blue-700";
      break;
    case "red":
      classes = "bg-red-500 text-white border-2 border-red-700";
      break;
    case "white":
      classes = "bg-gray-200 text-black";
      break;
    case "black":
      classes = "bg-gray-900 text-white border-2 border-slate-700";
      break;
    default:
      classes = "bg-gray-500 text-white hover:bg-gray-600";
      break;
  }

  function handleSelect(e: React.MouseEvent<HTMLButtonElement>) {
    if (team != "none" && turn) {
      const button = e.currentTarget;
      const word = button.textContent;
      socket.emit("send_guess", { roomId, word });
    }
  }
  
  return (
    <button onClick={handleSelect} className={`text-sm md:text-base w-1/6 h-16 p-1 md:p-2 rounded font-semibold break-words transition ${classes}`} key={word.word} disabled={
      !turn ||
      !team ||
      (word.team !== "" && teamMaster != word.team) ||
      gameOver
    }>
      {word.word.toUpperCase()}
    </button>
  );
}