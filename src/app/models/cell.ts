export interface Cell {
  index: number
  parentIdx: number
  isWall?: boolean
  isStart?: boolean
  isFinish?: boolean
  isVisited?: boolean
  cost?: number
}

export const defaultCell: Partial<Cell> = {
  parentIdx: -1,
  isWall: false,
  isVisited: false,
}

export enum SearchSpeed {
  Fast = 1,
  Moderate = 100,
  Slow = 200,
}
