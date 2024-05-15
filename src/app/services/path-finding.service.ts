import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Cell, SearchSpeed } from "../models/cell";
import { priorityQueue, PriorityQueueWithTieBreak } from "../utils/priority-queue";


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
    this.cells = [...cells];
    this.startIdx = startIdx;
    this.finishIdx = finishIdx;
    this.height = height;
    this.width = width;
    this.searchSpeed = searchSpeed;
    this._isConfigured = this.isConfigured();
  }

  private isConfigured = (): boolean =>
    this.cells != null &&
    this.cells.length >= 2 &&
    this.startIdx >= 0 &&
    this.finishIdx >= 0 &&
    this.width > 0 &&
    this.height > 0;

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

  private getNeighbours = (cellIdx: number): number[] => {
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

  manhattanDistance = (cellIdx: number, targetIdx: number): number => {
    let [r, c] = [Math.floor(cellIdx / this.width), cellIdx % this.width];
    let [tr, tc] = [Math.floor(targetIdx / this.width), targetIdx % this.width];
    return Math.abs(tr - r) + Math.abs(tc - c);
  }

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  //#region algorithms
  aStar = async (): Promise<void> => {
    let queue = new PriorityQueueWithTieBreak<number, number, number>();
    queue.enqueueWithTieBreak(this.startIdx, 0, this.manhattanDistance(this.startIdx, this.finishIdx));
    this.cells[this.startIdx].cost = 0;
    let currentIdx = -1;
    while (!queue.isEmpty()) {
      currentIdx = queue.dequeue()!;
      if (currentIdx === this.finishIdx)
        break;
      if (this.cells[currentIdx].isVisited === true)
        continue;

      this.cells[currentIdx].isVisited = true;
      this._vistedCell.next(currentIdx);

      let neighbours = this.getNeighbours(currentIdx);
      neighbours.forEach(nIdx => {
        if (this.cells[nIdx].isVisited === true)
          return;

        if (this.cells[nIdx].cost == null) {
          this.cells[nIdx].cost = this.cells[currentIdx].cost! + 1;
          this.cells[nIdx].parentIdx = currentIdx;
        }
        else {
          if (this.cells[currentIdx].cost! + 1 < this.cells[nIdx].cost!) {
            this.cells[nIdx].parentIdx = currentIdx;
          }
          this.cells[nIdx].cost = Math.min(this.cells[nIdx].cost!, this.cells[currentIdx].cost! + 1);
        }

        let hurestic = this.manhattanDistance(nIdx, this.finishIdx);
        let fScore = this.cells[nIdx].cost! + hurestic;
        queue.enqueueWithTieBreak(nIdx, fScore, hurestic);
      });

      await this.delay(this.searchSpeed);
    }
    this.pathIsFound = currentIdx == this.finishIdx;
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

  dfs = async () => {
    if (!this._isConfigured)
      throw new Error("The service in not well configured.");

    let stack = [this.startIdx];
    let currentIdx = this.startIdx;
    while (stack.length > 0) {
      currentIdx = stack.pop()!;
      if (currentIdx === this.finishIdx)
        break;
      if (this.cells[currentIdx].isVisited === true)
        continue;

      this.cells[currentIdx].isVisited = true;
      this._vistedCell.next(currentIdx);

      let neighbours = this.getNeighbours(currentIdx);
      neighbours.forEach(nIdx => {
        if (this.cells[nIdx].isVisited === true)
          return;
        stack.push(nIdx);
        this.cells[nIdx].parentIdx = currentIdx;
      });
      await this.delay(this.searchSpeed);
    }
    this.pathIsFound = currentIdx == this.finishIdx;
  }

  dijkistra = async (): Promise<void> => {
    let queue = new priorityQueue<number, number>();
    queue.enqueue(this.startIdx, 0);
    this.cells[this.startIdx].cost = 0;
    let currentIdx = -1;
    while (!queue.isEmpty()) {
      currentIdx = queue.dequeue()!;
      if (currentIdx === this.finishIdx)
        break;
      if (this.cells[currentIdx].isVisited === true)
        continue;

      this.cells[currentIdx].isVisited = true;
      this._vistedCell.next(currentIdx);

      let neighbours = this.getNeighbours(currentIdx);
      neighbours.forEach(nIdx => {
        // update the costs
        if (this.cells[nIdx].cost == null) {
          this.cells[nIdx].cost = this.cells[currentIdx].cost! + 1;
        }
        else {
          this.cells[nIdx].cost = Math.min(this.cells[nIdx].cost!, this.cells[currentIdx].cost! + 1)
        }
        queue.enqueue(nIdx, this.cells[nIdx].cost!);
        if (this.cells[nIdx].parentIdx === -1) {
          this.cells[nIdx].parentIdx = currentIdx;
        }
      });
      await this.delay(this.searchSpeed);
    }
    this.pathIsFound = currentIdx == this.finishIdx;
  }

  greedy = async () => {
    let queue = new priorityQueue<number, number>();
    queue.enqueue(this.startIdx, 0);
    this.cells[this.startIdx].cost = 0;
    let currentIdx = -1;
    while (!queue.isEmpty()) {
      currentIdx = queue.dequeue()!;
      if (currentIdx === this.finishIdx)
        break;
      if (this.cells[currentIdx].isVisited === true)
        continue;

      this.cells[currentIdx].isVisited = true;
      this._vistedCell.next(currentIdx);

      let neighbours = this.getNeighbours(currentIdx);
      neighbours.forEach(nIdx => {
        queue.enqueue(nIdx, this.manhattanDistance(nIdx, this.finishIdx));
        if (this.cells[nIdx].cost == null) {
          this.cells[nIdx].cost = this.cells[currentIdx].cost! + 1;
          this.cells[nIdx].parentIdx = currentIdx;
        }
        else {
          if (this.cells[currentIdx].cost! + 1 < this.cells[nIdx].cost!) {
            this.cells[nIdx].parentIdx = currentIdx;
          }
          this.cells[nIdx].cost = Math.min(this.cells[nIdx].cost!, this.cells[currentIdx].cost! + 1);
        }
      });
      await this.delay(this.searchSpeed);
    }
    this.pathIsFound = currentIdx == this.finishIdx;
  }
  //#endregion
}
