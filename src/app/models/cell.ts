export interface Cell {
  index: number
  parentIdx: number
  isWall?: boolean
  isStart?: boolean
  isFinish?: boolean
  isVisited?: boolean
}

export const defaultCell: Partial<Cell> = {
  parentIdx: -1,
  isWall: false,
  isVisited: false,
}

export enum SearchSpeed {
  Fast = 1,
  Moderate = 50,
  Slow = 100,
}
