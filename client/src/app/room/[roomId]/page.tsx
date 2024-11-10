"use client"

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";

import RoomHeader from "@/components/RoomHeader/RoomHeader";
import Board from "@/components/Board/Board";
import Hints from "@/components/Hints/Hints";

export default function RoomPage(){
  const { name } = UseAppContext();
  const { roomId }: { roomId: string } = useParams();

  useEffect(() => {
    socket.emit("join_room", { roomId, name });

    return () => {
      socket.emit("leave_room", { roomId });
    }
  }, [roomId, name]);

  return (
    <main className="max-w-7xl mx-auto p-4">
      <RoomHeader roomId={roomId} />

      <div className="flex flex-col md:flex-row gap-4 border-t-2 mt-4 pt-4 md:w-full">
        <Board roomId={roomId} />
        <Hints roomId={roomId} />
      </div>
    </main>
  );
}