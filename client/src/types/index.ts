export type PlayerType = {
  id: string
  name: string
}

export type WordType = {
  word: string
  team: string
  revealed: boolean
}

export type HintType = {
  hint: string
  quantity: number
  team: string
}
