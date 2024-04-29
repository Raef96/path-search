import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Cell, SearchSpeed } from "../models/cell";


@Injectable({
  providedIn: 'root'
})
export class PathFindingService {
  private _path: Subject<number>;
  private _vistedCell: Subject<number>;
  private _isConfigured: boolean = false;


  path: Observable<number>;
  visitedCell: Observable<number>;

  cells: Cell[] = [];
  startIdx: number = -1;
  finishIdx: number = -1;
  height: number = -1;
  width: number = -1;
  searchSpeed: SearchSpeed = SearchSpeed.Fast;
  pathIsFound: boolean = false;


  constructor() {
    this._vistedCell = new Subject<number>();
    this.visitedCell = this._vistedCell.asObservable();
    this._path = new Subject<number>();
    this.path = this._path.asObservable();
  }

  configure(cells: Cell[], startIdx: number, finishIdx: number, width: number, height: number, searchSpeed: SearchSpeed = SearchSpeed.Fast) {
    this.cells = cells;
    this.startIdx = startIdx;
    this.finishIdx = finishIdx;
    this.height = height;
    this.width = width;
    this.searchSpeed = searchSpeed;

    this._isConfigured = this.isConfigured();
  }

  bfs = async (): Promise<void> => {
    if (!this._isConfigured)
      throw new Error("The service in not well configured.");

    let cellIdx = -1;
    let queue: number[] = [this.startIdx];
    while (queue.length > 0) {
      cellIdx = queue.shift()!;
      if (cellIdx == this.finishIdx) break;
      if (this.cells[cellIdx].isVisited == true) continue;

      this.cells[cellIdx].isVisited = true;
      this._vistedCell.next(cellIdx);

      let neighboursIdx = this.getNeighbours(cellIdx);
      for (let nIdx of neighboursIdx) {
        queue.push(nIdx);
        if (this.cells[nIdx].parentIdx == -1)
          this.cells[nIdx].parentIdx = cellIdx;
      }

      await this.delay(this.searchSpeed);
    }
    this.pathIsFound = cellIdx == this.finishIdx;
  }

  getPath = async (): Promise<void> => {
    if (!this._isConfigured)
      throw new Error("The service in not well configured.");

    let path = this.findPath();
    for (let cellIdx of path) {
      this._path.next(cellIdx);
      await this.delay(100);
    }
  }

  private findPath = (): number[] => {
    let cellsPathIdx: number[] = [];
    let cellIdx = this.finishIdx;
    let count = 0;
    while (cellIdx != this.startIdx && count < this.width * this.height) {
      cellsPathIdx.push(cellIdx);
      cellIdx = this.cells[cellIdx].parentIdx!;
      count++;
    }

    return cellsPathIdx.reverse();
  }

  private getNeighbours = (cellIdx: number) : number[] => {
    let x = Math.floor(cellIdx / this.width);
    let y = cellIdx % this.width;
    let neighboursIdx: number[] = [];

    if (x - 1 >= 0 && !this.cells[(x - 1) * this.width + y].isWall) // up
      neighboursIdx.push((x - 1) * this.width + y);
    if (y + 1 < this.width && !this.cells[cellIdx + 1].isWall) // right
      neighboursIdx.push(cellIdx + 1);
    if (x + 1 < this.height && !this.cells[(x + 1) * this.width + y].isWall) // down
      neighboursIdx.push((x + 1) * this.width + y);
    if (y - 1 >= 0 && !this.cells[cellIdx - 1].isWall) // left
      neighboursIdx.push(cellIdx - 1);

    return neighboursIdx;
  }

  private isConfigured = (): boolean =>
    this.cells != null &&
    this.cells.length >= 2 &&
    this.startIdx >= 0 &&
    this.finishIdx >= 0 &&
    this.width > 0 &&
    this.height > 0;

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
