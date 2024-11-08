"use client"

import Board from "@/components/Board/Board";
import Team from "@/components/Team/Team";
import { UseAppContext } from "@/context";
import { PlayerType } from "@/types";
import { socket } from "@/utils/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage(){
  const context = UseAppContext();
  const name = context?.name || socket.id;
  const { roomId }: { roomId: string; } = useParams();
  const [players, setplayers] = useState<PlayerType[]>([]);

  useEffect(() => {
    socket.emit("join_room", { roomId, name });
    if (name && socket.id) setplayers([{ name, id: socket.id }]);
    
    socket.on("joined_room", data => {
      setplayers(data);
    });
  }, [roomId, name]);

  return (
    <main className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between border-b-2 mb-4">
        <h1 className="text-2xl font-semibold my-4">Sala: {roomId}</h1>
        
        <div className="w-4/6">
          <h2 className="text-center font-semibold">Players</h2>
          {
            players.length > 0 &&
            <ul className="flex flex-wrap items-center justify-center gap-4">
              {
                players.map((player) => (
                  <li key={player.id}>{player.name}</li>
                ))
              }
            </ul>
          }
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <Team team="blue" roomId={roomId} />
        <Board />
        <Team team="red" roomId={roomId} />
      </div>
    </main>
  );
}