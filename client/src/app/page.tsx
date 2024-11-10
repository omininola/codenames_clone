"use client";

import { useRouter } from "next/navigation";
import { socket } from "../utils/socket";
import { UseAppContext } from "@/context";

export default function Home() {
  const { setName } = UseAppContext();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const roomId = formData.get("roomId") as string;
    const name = formData.get("name") as string;

    setName(name);

    socket.emit("join_room", { roomId, name });
    router.push(`/room/${roomId}`);
  }

  return (
    <main className="flex flex-col justify-center items-center gap-4 min-h-screen max-w-6xl mx-auto p-4">
      <h1 className="text-center text-2xl font-semibold">Codenames da galera!</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex flex-col">
          <label htmlFor="roomId">ID da sala</label>
          <input className="border-2 p-2 text-black rounded" type="text" name="roomId" id="roomId" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="name">Seu nome</label>
          <input className="border-2 p-2 text-black rounded" type="text" name="name" id="name" />
        </div>

        <button className="border-2 p-2 rounded transition hover:bg-white hover:text-black" type="submit">Entrar</button>
      </form>
    </main>
  );
}
