"use client"

import { socket } from "@/utils/socket";
import { UseAppContext } from "@/context";
import { useEffect, useState } from "react";
import { PlayerType } from "@/types";

type TeamProps = {
  team: "blue" | "red";
  roomId: string;
}

export default function Team({ team, roomId }: TeamProps) {
  const context = UseAppContext();
  const name = context?.name || socket.id;
  const setTeam = context?.setTeam;
  const teamClient = context?.team;
  const teamMaster = context?.teamMaster;
  const setTeamMaster = context?.setTeamMaster;

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [master, setMaster] = useState<string>("");

  const color = team === "blue" ? "bg-blue-500" : "bg-red-500";
  const teamName = team === "blue" ? "Azul" : "Vermelho";
  
  const handleJoinTeam = () => {
    if (teamClient == team) return;

    const data = {
      roomId,
      team: teamClient,
      name,
      teamMaster
    }

    socket.emit(`join_${team}_team`, data);
    if (name && socket.id) setPlayers([...players, { name, id: socket.id }]);
    if (setTeamMaster) setTeamMaster(undefined);
    if (setTeam) setTeam(team);
  }

  const handleJoinMaster = () => {
    if (teamMaster == team) return;

    const data = {
      roomId,
      team: teamClient,
      name,
      teamMaster
    }

    socket.emit(`join_${team}_master`, data);
    if (name) setMaster(name);
    if (setTeam) setTeam(undefined);
    if (setTeamMaster) setTeamMaster(team);
  }

  useEffect(() => {
    socket.on(`joined_${team}_team`, (data) => {
      setPlayers([...players, data]);
    });

    socket.on(`left_${team}_team`, (data) => {
      setPlayers(players.filter(player => player.id !== data.id));
    });

    socket.on(`joined_${team}_master`, (data) => {
      setMaster(data.name);
    });

    socket.on(`left_${team}_master`, () => {
      console.log("left master ", team);
      
      setMaster("");
    });

  }, [players, team, name, roomId]);

  return (
    <div className={`w-1/6 p-2 ${color} text-white rounded`}>
      <h1 className="text-center">Team {teamName}</h1>

      <div className="flex flex-col justify-between gap-2">
        <div>
          <div className="flex flex-col md:flex-row justify-between">
            <h2>Operadores</h2>

            { teamClient !== team && <button onClick={handleJoinTeam} className="text-sm border p-1 rounded">Entrar</button> }
          </div>
          
          <ul>
            {
              players.map((player) => (
                <li key={player.id}>{player.name}</li>
              ))
            }
          </ul>
        </div>

        <div>
          <h2>Mestre</h2>

          <p>{master}</p>

          { !master && <button onClick={handleJoinMaster} className="text-sm border p-1 rounded w-full">Entrar como mestre</button> }
        </div>
      </div>
    </div>
  );
}