import { AfterViewInit, Component, Input } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Cell, SearchSpeed, ShortestPathService } from '../../services/shortestPathService';
import { Algorithms } from '../../constants/algorithms';


const CELL_WIDTH = 25.6;
const CELL_HEIGHT = 25.6;
const CELLS_COUNT = 1104;

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.less']
})
export class BoardComponent implements AfterViewInit {


  @Input() selectedAlgorithm: string = Algorithms.BFS;

  height: number = 24;
  width: number = 46;
  startIdx: number = 0;
  finishIdx: number = CELLS_COUNT - 1;
  cells: Cell[] = Array<Cell>(CELLS_COUNT);

  private isMouseDown: boolean = false;
  private isDragging = false;
  private searchInProgress: boolean = false;

  constructor(private shortestPathService: ShortestPathService) {
    for (let i = 0; i < CELLS_COUNT; ++i) {
      this.cells[i] = {
        index: i,
        isVisited: false,
        isWall: false,
        parentIdx: -1
      };
    }

    this.cells[0].isStart = true;
    this.cells[CELLS_COUNT - 1].isFinish = true;
  }

  ngAfterViewInit(): void {
    console.log("after view init");
    this.initMouseEvents();
    //this.setBoardDimensions();

    this.shortestPathService.visitedCell.subscribe((cellIdx) => {
      if (cellIdx == this.startIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'search-animation 1.5s forwards';
      this.cells[cellIdx].isVisited = true;
    });

    this.shortestPathService.path.subscribe((cellIdx) => {
      if (cellIdx == this.finishIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'path-found-animation 1s forwards';
    })
  }

  visualizeSearch = async (): Promise<void> => {
    if (this.searchInProgress)
      return;

    this.disableMouseEvents();
    this.shortestPathService.searchSpeed = SearchSpeed.Fast;
    this.shortestPathService.configure(this.cells, this.startIdx, this.finishIdx, this.width, this.height);
    this.searchInProgress = true;
    await this.shortestPathService.bfs();
    this.enableMouseEvents();
    this.searchInProgress = false;
  }

  visualizePath(e: Event) {
    if (this.searchInProgress)
      return;

    this.shortestPathService.getPath();
  }

  clearBoard = () => {
    if (this.searchInProgress)
      return;

    this.cells.forEach(cell => {
      let cellEl = document.getElementById(cell.index.toString());
      cellEl!.style.animation = "";
      cell.isVisited = false;
      cell.isWall = false;
      cell.parentIdx = -1;
    });
  }

  clearWalls = () => {
    this.cells.forEach(cell => {
      if (!cell.isWall)
        return;
      let cellEl = document.getElementById(cell.index.toString());
      cellEl!.style.animation = "";
      cell.isVisited = false;
      cell.isWall = false;
      cell.parentIdx = -1;
    });
  }

  setBoardDimensions = () => {
    var boardEl = document.getElementsByClassName("board")[0] as HTMLElement;
    this.width = Math.floor(boardEl.offsetWidth / CELL_WIDTH);
    this.height = Math.floor(boardEl.offsetHeight / CELL_HEIGHT);
    console.log(boardEl, boardEl.offsetWidth / CELL_WIDTH, this.width, this.height);
  }

  //#region : Mouse Events
  initMouseEvents = () => {
    const allCells = Array.from(document.getElementsByClassName('cell'));
    allCells.forEach(cell => {
      cell.addEventListener('mouseup', () => this.isMouseDown = false);
      cell.addEventListener('mousedown', () => this.mouseDownEvent(cell as HTMLElement));
      cell.addEventListener('mousemove', () => this.mouseMoveEvent(cell as HTMLElement));
    });
  }

  private mouseDownEvent = (cell: HTMLElement) => {
    let isStartPoint = +cell.id === this.startIdx;
    let isFinishPoint = +cell.id === this.finishIdx;
    if (isStartPoint || isFinishPoint)  // we dont consider as a click down because it is handled by cdk drop library
      return;

    if (this.cells[+cell.id].isWall) {
      this.cells[+cell.id].isWall = false;
      cell.style.animation = '';
    }
    else {
      this.cells[+cell.id].isWall = true;
      cell.style.animation = 'wall-animation 0.4s forwards';
    }
    this.isMouseDown = true;
  }

  private mouseMoveEvent = (cell: HTMLElement) => {
    if (this.isDragging) // the start/finish point is moving
      return;

    if (+cell.id === this.startIdx || +cell.id === this.finishIdx)
      return;

    if (this.isMouseDown) {
      if (this.cells[+cell.id].isWall) {
        this.cells[+cell.id].isWall = false;
        cell.style.animation = '';
      }
      else {
        this.cells[+cell.id].isWall = true;
        cell.style.animation = 'wall-animation 0.4s forwards';
      }
    }
  }

  private disableMouseEvents = (): void => {
    document.addEventListener('mouseup', this.disableMouseEvent, true);
    document.addEventListener('mousedown', this.disableMouseEvent, true);
    document.addEventListener('mousemove', this.disableMouseEvent, true);
  }

  private enableMouseEvents = (): void => {
    document.removeEventListener('mouseup', this.disableMouseEvent, true);
    document.removeEventListener('mousedown', this.disableMouseEvent, true);
    document.removeEventListener('mousemove', this.disableMouseEvent, true);
  }

  private disableMouseEvent = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  }
  //#endregion

  //#region : drag and drop functionality
  onDragStarted = () => {
    this.isDragging = true;
  }

  onDragEnded = () => {
    this.isDragging = false;
  }

  drop = (event: CdkDragDrop<number>) => {
    let currentIdx = event.container.data;
    let previousIdx = event.previousContainer.data;
    let isStartPoint = this.cells[previousIdx].isStart;

    // we can only move start or finish point
    if (isStartPoint) {
      this.startIdx = currentIdx;
      this.cells[previousIdx].isStart = false;
      this.cells[currentIdx].isStart = true;
    }
    else {
      this.finishIdx = currentIdx;
      this.cells[previousIdx].isFinish = false;
      this.cells[currentIdx].isFinish = true;
    }
  }

  // checks if we can drop into this cell
  enterPredicate = (_: CdkDrag, drop: CdkDropList) => {
    let destisnationCellIdx = drop.data;
    return destisnationCellIdx != this.startIdx &&
      destisnationCellIdx != this.finishIdx &&
      this.cells[destisnationCellIdx].isWall == false;
  }
  //#endregion
}
