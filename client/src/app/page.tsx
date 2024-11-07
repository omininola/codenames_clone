"use client";

import { useRouter } from "next/navigation";
import { socket } from "../utils/socket";
import { UseAppContext } from "@/context";

export default function Home() {
  const context = UseAppContext();
  const setName = context?.setName;
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const roomId = formData.get("roomId") as string;
    const name = formData.get("name") as string;

    if (setName) setName(name);

    socket.emit("join_room", { roomId, name });
    router.push(`/room/${roomId}`);
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-center text-2xl font-semibold">Codenames da galera</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex flex-col">
          <label htmlFor="roomId">ID da sala</label>
          <input className="border-2 p-2" type="text" name="roomId" id="roomId" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="name">Seu nome</label>
          <input className="border-2 p-2" type="text" name="name" id="name" />
        </div>

        <button className="border-2 p-2 rounded" type="submit">Entrar</button>
      </form>
    </main>
  );
}
