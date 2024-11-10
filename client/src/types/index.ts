export type PlayerType = {
  name: string;
  id: string;
}

export type WordType = {
  word: string;
  team: string;
  revealed: boolean;
}

export type HintType = {
  hint: string;
  quantity: number;
  team: string;
}