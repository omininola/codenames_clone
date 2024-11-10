import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";

import PassTurnButton from "../PassTurnButton/PassTurnButton";
import Team from "../Team/Team";
import Players from "../Players/Players";

export default function RoomHeader({ roomId }: { roomId: string }) {
  const { team } = UseAppContext();
  
  const [turn, setTurn] = useState<boolean>(false);
  const [initialGuess, setInitialGuess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageClasses, setMessageClasses] = useState<string>("");

  function parseMessage(team: string, turning: boolean) {
    switch (team) {
      case "blue":
        setMessageClasses("bg-blue-500");
        if (turning) setMessage("Vez do time Azul");
        else setMessage("O time Azul ganhou!");
        break;
      case "red":
        setMessageClasses("bg-red-500");
        if (turning) setMessage("Vez do time Vermelho");
        else setMessage("O time Vermelho ganhou!");
        break;
    }
  };

  useEffect(() => {
    socket.on("game_started", () => setMessage(""));
    socket.on("update_words", () => setInitialGuess(true));
    socket.on("game_over", (data) => {
      setTurn(false);
      parseMessage(data.team, false)
    });
  }, []);

  useEffect(() => {
    socket.on("change_turn", (data) => {
      if (team == data) setTurn(true);
      else setTurn(false);
      setInitialGuess(false);
      parseMessage(data, true);
    });
  }, [team]);
  
  return (
    <header>
      <div className="flex items-center justify-between pb-4 mb-4 border-b-2">
        <h1 className="text-2xl font-semibold">Sala: {roomId}</h1>
        
        {turn && initialGuess && (
          <PassTurnButton roomId={roomId} />
        )}

        {message && (
          <h2 className={`text-white text-xl font-semibold py-1 px-2 rounded ${messageClasses}`}>{message}</h2>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <Team teamColor="blue" roomId={roomId} />
        <Players />
        <Team teamColor="red" roomId={roomId} />
      </div>
    </header>
  );
}