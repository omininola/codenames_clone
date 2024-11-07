"use client"

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type UserContextType = {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  team: "blue" | "red" | undefined;
  setTeam: Dispatch<SetStateAction<"blue" | "red" | undefined>>;
  teamMaster: "blue" | "red" | undefined;
  setTeamMaster: Dispatch<SetStateAction<"blue" | "red" | undefined>>;
}

const AppContext = createContext<UserContextType | undefined>(undefined);

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string>("");
  const [team, setTeam] = useState<"blue" | "red" | undefined>(undefined);
  const [teamMaster, setTeamMaster] = useState<"blue" | "red" | undefined>(undefined);

  return (
    <AppContext.Provider value={{ name, setName, team, setTeam, teamMaster, setTeamMaster }}>
      {children}
    </AppContext.Provider>
  );
}

export function UseAppContext(){
  return useContext(AppContext);
}