import { Subject } from 'rxjs';
import { Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';

import { CellComponent } from '../cell/cell.component';
import { ShortestPathService, Cell, SearchSpeed } from 'src/app/services/shortestPathService';


@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.less']
})
export class BoardComponent implements OnInit {

  @ViewChildren('cell') children!: QueryList<CellComponent>;

  height: number = 23;
  width: number = 50;
  rows: number[] = Array(this.height).fill(0).map((_, i) => i);
  columns: number[] = Array(this.width).fill(0).map((_, i) => i);
  startIdx: number = 520;
  finishIdx: number = 903;
  cells!: Array<CellComponent>;

  private _shortPathService: ShortestPathService;
  private _cells: Cell[] = [];
  private _isMouseDown: boolean = false;

  visited: Subject<number> = new Subject();


  constructor() {
    this._shortPathService = new ShortestPathService(this._cells, this.startIdx, this.finishIdx, this.width, this.height);
    this._shortPathService.searchSpeed = SearchSpeed.Fast;

    this._shortPathService.visitedCellIdx.subscribe((res) => {
      this.cells[res].setVisted();
    });
    this._shortPathService.shortPath.subscribe((res) => {
      this.cells[res].setPath();
    })
  }

  ngOnInit(): void {
  }

  searchMap = (e: Event): void => {
    this._cells = this.children.map(c => {
      return {
        index: c.index,
        isVisited: false,
        isWall: c.isWall,
        parentIdx: -1
      }
    });

    this._shortPathService.cells = this._cells;
    this._shortPathService.bfs();
  }

  shortPath(e: Event) {
    this._shortPathService.getShortPath();
  }

  ngAfterViewInit(): void {
    this.cells = this.children.toArray();
  }

  isStartPoint = (r: number, c: number) => {
    return r * this.width + c == this.startIdx;
  }

  isFinishPoint = (r: number, c: number) => {
    return r * this.width + c == this.finishIdx;
  }

  isMousePressed() {
    return this._isMouseDown;
  }

  @HostListener('mousedown', ['$event']) mouseDown(e: Event) {
    this._isMouseDown = true;
    e.stopPropagation();

  }

  @HostListener('mouseup', ['$event']) mouseUp(e: Event) {
    this._isMouseDown = false;
    e.stopPropagation();
  }
}
