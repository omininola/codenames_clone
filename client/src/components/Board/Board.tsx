"use client"

import { socket } from "@/utils/socket";
import { useParams } from "next/navigation";

export default function Board(){
  const { roomId }: { roomId: string; } = useParams();

  const handleStart = () => {
    socket.emit("start_game", { roomId });
  }
  
  return (
    <section>
      <button onClick={handleStart} className="border-2 p-2 rounded">Começar</button>

    </section>
  );
}