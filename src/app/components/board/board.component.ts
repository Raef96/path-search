import { AfterViewInit, Component, Input } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Algorithms } from '../../constants/algorithms';
import { MazeType, Orientation } from '../../constants/mazes';
import { Cell, defaultCell, SearchSpeed } from '../../models/cell';
import { PathFindingService } from '../../services/path-finding.service';
import { MazeGeneratorService } from '../../services/maze-generator.service';


const CELL_WIDTH = 25.6;
const CELL_HEIGHT = 25.6;
const CELLS_COUNT = 58 * 24; // width * height

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.less']
})
export class BoardComponent implements AfterViewInit {

  @Input() selectedAlgorithm: string = Algorithms.BFS;
  @Input() searchSpeed: SearchSpeed = SearchSpeed.Fast;

  height: number = 24;
  width: number = 58;
  startIdx: number = 0;
  finishIdx: number = 181;
  cells: Cell[] = Array<Cell>(CELLS_COUNT);

  private isMouseDown: boolean = false;
  private isDragging = false;
  private searchInProgress: boolean = false;

  constructor(
    private PathFindingService: PathFindingService,
    private mazeGeneratorService: MazeGeneratorService) {
    let parentIdx = -1;
    this.cells = Array.from({ length: CELLS_COUNT }, (_, index) => ({ ...defaultCell, parentIdx, index }));
    this.cells[this.startIdx].isStart = true;
    this.cells[this.finishIdx].isFinish = true;
  }

  ngAfterViewInit(): void {
    console.log("after view init");
    this.initMouseEvents();
    //this.setBoardDimensions();

    this.PathFindingService.visitedCell.subscribe((cellIdx) => {
      if (cellIdx == this.startIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'search-animation 1.5s forwards';
      this.cells[cellIdx].isVisited = true;
    });

    this.PathFindingService.path.subscribe((cellIdx) => {
      if (cellIdx == this.finishIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'path-found-animation 1s forwards';
    })
  }

  visualizeSearch = async (): Promise<void> => {
    if (this.searchInProgress)
      return;

    this.clearSearch();
    this.disableMouseEvents();
    this.PathFindingService.configure(this.cells, this.startIdx, this.finishIdx, this.width, this.height, this.searchSpeed);
    this.searchInProgress = true;
    await this.runSearch(this.selectedAlgorithm);
    if (this.PathFindingService.pathIsFound) {
      await this.PathFindingService.getPath();
    }
    this.searchInProgress = false;
    this.enableMouseEvents();
  }

  runSearch = (algorithm: string) => {
    switch (algorithm) {
      case Algorithms.A_STAR:
        return this.PathFindingService.aStar();
      case Algorithms.BFS:
        return this.PathFindingService.bfs();
      case Algorithms.DFS:
        return this.PathFindingService.dfs();
      case Algorithms.DIJKISTRA:
        return this.PathFindingService.dijkistra();
      case Algorithms.GREEDY:
        return this.PathFindingService.greedy();
      default:
        throw new Error(`No Matching algorithm for ${algorithm}`);
    }
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
      cell.cost = undefined;
    });
  }

  clearWalls = () => {
    if (this.searchInProgress)
      return;

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

  clearSearch = (): void => {
    if (this.searchInProgress)
      return;

    this.cells.forEach(cell => {
      if (cell.isVisited === true) {
        let cellEl = document.getElementById(cell.index.toString());
        cellEl!.style.animation = "";
        cell.isVisited = false;
        cell.parentIdx = -1;
        cell.cost = undefined;
      }
    });
  }

  generateMaze = async (mazeType: MazeType, orientation: Orientation = Orientation.HORIZONTAL): Promise<void> => {
    if (this.searchInProgress)
      return;

    this.clearWalls();
    let wallsIdxToAnimate = this.mazeGeneratorService.generate(this.width, this.height, [this.startIdx, this.finishIdx], mazeType, orientation);
    for (let idx of wallsIdxToAnimate) {
      this.cells[idx].isWall = true;
      await this.delay(5);
      let el = document.getElementById(idx.toString());
      el!.style.animation = 'wall-animation 0.4s forwards';
    }
  }

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
