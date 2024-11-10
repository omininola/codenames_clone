"use client"

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type UserContextType = {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  team: "blue" | "red" | "none";
  setTeam: Dispatch<SetStateAction<"blue" | "red" | "none">>;
  teamMaster: "blue" | "red" | "none";
  setTeamMaster: Dispatch<SetStateAction<"blue" | "red" | "none">>;
}

const AppContext = createContext<UserContextType>({
  name: "",
  setName: () => {},
  team: "none",
  setTeam: () => {},
  teamMaster: "none",
  setTeamMaster: () => {},
});

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string>("");
  const [team, setTeam] = useState<"blue" | "red" | "none">("none");
  const [teamMaster, setTeamMaster] = useState<"blue" | "red" | "none">("none");

  return (
    <AppContext.Provider value={{ name, setName, team, setTeam, teamMaster, setTeamMaster }}>
      {children}
    </AppContext.Provider>
  );
}

export function UseAppContext(){
  return useContext(AppContext);
}