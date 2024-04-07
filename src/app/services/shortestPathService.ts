import { Observable, Subject } from "rxjs";

export interface Cell {
  index: number;
  isVisited: boolean;
  isWall: boolean;
  parentIdx: number;
}

export enum SearchSpeed {
  Fast = 1,
  Moderate = 50,
  Slow = 100,
}

export class ShortestPathService {
  public cells: Cell[];
  public startIdx: number;
  public finishIdx: number;
  public height: number;
  public width: number;
  public searchSpeed: SearchSpeed = SearchSpeed.Fast;

  public shortPath: Observable<number>;
  public visitedCellIdx: Observable<number>;

  private _vistedCell: Subject<number>;
  private _shortPath: Subject<number>;


  constructor(cells: Cell[], startIdx: number, finishIdx: number, width: number, height: number) {
    this.cells = cells;
    this.startIdx = startIdx;
    this.finishIdx = finishIdx;
    this.height = height;
    this.width = width;

    this._vistedCell = new Subject<number>();
    this.visitedCellIdx = this._vistedCell.asObservable();
    this._shortPath = new Subject<number>();
    this.shortPath = this._shortPath.asObservable();
  }

  bfs = async () => {
    let queue: number[] = [this.startIdx];

    while (queue.length > 0) {
      let cellIdx = queue.shift()!;
      if (cellIdx == this.finishIdx) break;
      if (this.cells[cellIdx].isVisited == true) continue;

      this.cells[cellIdx].isVisited = true;
      this._vistedCell.next(cellIdx);

      let neighboursIdx = this.getNeighbours(cellIdx);
      for (let nIdx of neighboursIdx) {
        queue.push(nIdx);
        if (this.cells[nIdx].parentIdx == -1) this.cells[nIdx].parentIdx = cellIdx;
      }

      await this.delay(this.searchSpeed);
    }
  }

  getShortPath = async (): Promise<void> => {
    let path = this.shortestPath();
    for (let cellIdx of path) {
      this._shortPath.next(cellIdx);
      await this.delay(100);
    }
  }

  private shortestPath = (): number[] => {
    let cellsPathIdx = [];
    let cellIdx = this.finishIdx;
    let count = 0;
    while (cellIdx != this.startIdx && count < this.width * this.height) {
      cellsPathIdx.push(cellIdx);
      cellIdx = this.cells[cellIdx].parentIdx;
      count++;
    }

    return cellsPathIdx.reverse();
  }

  private getNeighbours = (cellIdx: number) => {
    let x = Math.floor(cellIdx / this.width);
    let y = cellIdx % this.width;
    let neighboursIdx = [];

    if (x - 1 >= 0 && !this.cells[(x - 1) * this.width + y].isWall) neighboursIdx.push((x - 1) * this.width + y);
    if (x + 1 < this.height && !this.cells[(x + 1) * this.width + y].isWall) neighboursIdx.push((x + 1) * this.width + y);
    if (y - 1 >= 0 && !this.cells[cellIdx - 1].isWall) neighboursIdx.push(cellIdx - 1);
    if (y + 1 < this.width && !this.cells[cellIdx + 1].isWall) neighboursIdx.push(cellIdx + 1);

    return neighboursIdx;
  }

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
