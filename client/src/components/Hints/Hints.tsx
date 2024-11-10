import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";
import { HintType } from "@/types";
import HintForm from "../HintForm/HintForm";

export default function Hints({ roomId }: { roomId: string }) {
  const { teamMaster, team } = UseAppContext();
  
  const [started, setStarted] = useState<boolean>(false);
  const [hints, setHints] = useState<HintType[]>([]);
  
  useEffect(() => {
    socket.on("game_started", () => {
      setStarted(true);
      setHints([]);
    });
  }, []);

  useEffect(() => {
    socket.on("receive_hint", (data) => setHints([...hints, data]));
  }, [hints]);
  
  return (
    <>
      {started && (
        <div className="flex flex-col items-center gap-4 mt-2 md:mt-0 w-full">
          {teamMaster != "none" && (
            <HintForm roomId={roomId} />
          )}

          {team != "none" && (
            <h2 className="text-2xl font-semibold self-start md:self-center">Dicas</h2>
          )}
          
          <ul className="w-full flex flex-col gap-2">
            {hints.map((hintObj, idx) => (
              <Hint key={idx} team={hintObj.team} hint={hintObj.hint} quantity={hintObj.quantity} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export function Hint({ team, hint, quantity }: {
  team: string;
  hint: string;
  quantity: number;
}) {
  const classes = team == "blue" ? "bg-blue-500" : "bg-red-500";
  const teamName = team == "blue" ? "Time Azul" : "Time Vermelho";

  return (
    <li className={`flex items-center justify-between w-full text-white py-1 rounded ${classes}`}>
      <span className="w-5/12 text-center border-r-2">{teamName}</span>
      <span className="w-6/12 text-center border-r-2">{hint}</span>
      <span className="w-1/12 text-center">{quantity}</span>
    </li>
  );
}