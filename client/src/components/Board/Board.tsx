"use client"

import { UseAppContext } from "@/context";
import { WordType } from "@/types";
import { socket } from "@/utils/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Board(){
  const context = UseAppContext();
  const teamMaster = context?.teamMaster;
  const teamClient = context?.team;
  const { roomId }: { roomId: string; } = useParams();

  const [words, setWords] = useState<WordType[]>([]);

  const handleStart = () => {
    socket.emit("start_game", { roomId });
  }

  useEffect(() => {
    if (teamMaster) {
      socket.on("game_started", (data) => {
        setWords(data);
      });
    }

    if (teamClient) {
      socket.on("game_started", (data) => {
        data.map((word: WordType) => (word.team = ""));
        setWords(data);
      });
    }
  }, [teamMaster, teamClient]);
  
  return (
    <section className="w-4/6 flex flex-col gap-2">
      { words.length == 0 && <button onClick={handleStart} className="border-2 p-2 rounded mx-auto">Começar</button> }

      <div className="flex flex-wrap items-center justify-between gap-2">
        {
          words.map(word => {
            let classes = "";
            switch (word.team) {
              case "blue":
                classes = "bg-blue-500";
                break;
              case "red":
                classes = "bg-red-500";
                break;
              case "white":
                classes = "bg-white text-black border-2";
                break;
              case "black":
                classes = "bg-gray-900";
                break;
              default:
                classes = "bg-gray-500 hover:bg-gray-600";
                break;
            }

            if (teamMaster == word.team) classes += ` hover:bg-${teamMaster}-600`;

            return <button className={`w-1/6 h-16 p-2 rounded text-white font-semibold break-words transition ${classes}`} key={word.word} disabled={!teamClient && teamMaster !== word.team}>{word.word.toUpperCase()}</button>
          })
        }

      </div>

      { 
        words.length > 0 && teamMaster && 
        <form className="flex items-center justify-center gap-2 rounded">
          <input className="border-2 p-1 rounded" type="text" name="hint" id="hint" placeholder="Escreva sua palavra..." />

          <input className="border-2 p-1 rounded w-12" type="number" name="quantity" id="quantity" placeholder="0" />

          <button type="submit" className="border-2 px-2 py-1 rounded">Enviar</button>
        </form>
      }
    </section>
  );
}