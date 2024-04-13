import { AfterViewInit, Component} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Cell, SearchSpeed, ShortestPathService } from '../../services/shortestPathService';


const CELL_WIDTH = 25.6;
const CELL_HEIGHT = 25.6;
const CELLS_COUNT = 1104;

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.less']
})
export class BoardComponent implements AfterViewInit {

  height: number = 24;
  width: number = 46;
  startIdx: number = 0;
  finishIdx: number = CELLS_COUNT - 1;
  cellsIdx: number[] = Array(this.height * this.width);
  cells: Cell[] = Array<Cell>(CELLS_COUNT);

  private shortPathService!: ShortestPathService;
  private isMouseDown: boolean = false;
  private isDragging = false;

  constructor() {
    this.shortPathService = new ShortestPathService(this.cells, this.startIdx, this.finishIdx, this.width, this.height);
    for (let i = 0; i < CELLS_COUNT; ++i) {
      this.cellsIdx[i] = i;
      this.cells[i] = {
        index: i,
        isVisited: false,
        isWall: false,
        parentIdx: -1
      };

      if (i == 0) this.cells[0].isStart = true;
      if (i == CELLS_COUNT - 1) this.cells[CELLS_COUNT - 1].isFinish = true;
    }
  }

  ngAfterViewInit(): void {
    console.log("after view init");
    this.initializeMouseEvents();
    //this.setBoardDimensions();

    this.shortPathService.visitedCellIdx.subscribe((cellIdx) => {
      if (cellIdx == this.startIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'search-animation 1.5s forwards';
      this.cells[cellIdx].isVisited = true;
    });

    this.shortPathService.shortPath.subscribe((cellIdx) => {
      if (cellIdx == this.finishIdx)
        return;

      var cell = document.getElementById(cellIdx.toString());
      cell!.style.animation = 'path-found-animation 1s forwards';
    })
  }


  initializeMouseEvents = () => {
    const allCells = Array.from(document.getElementsByClassName('cellIdx'));
    allCells.forEach(cell => {
      cell.addEventListener('mousedown', () => {
        let isStartPoint = +cell.id === this.startIdx;
        let isFinishPoint = +cell.id === this.finishIdx;
        if (isStartPoint || isFinishPoint)  // we dont consider as a click down because it is handled by cdk drop library
          return;

        if (this.cells[+cell.id].isWall) {
          this.cells[+cell.id].isWall = false;
          (cell as HTMLElement).style.animation = '';
        }
        else {
          this.cells[+cell.id].isWall = true;
          console.log('animation');
          (cell as HTMLElement).style.animation = 'wall-animation 0.4s forwards';
        }
        this.isMouseDown = true;
      });

      cell.addEventListener('mouseup', () => {
        this.isMouseDown = false;
      });

      cell.addEventListener('mousemove', () => {
        if (this.isDragging) // the start/finish point is moving
          return;

        if (+cell.id === this.startIdx || +cell.id === this.finishIdx)
          return;

        if (this.isMouseDown) {
          if (this.cells[+cell.id].isWall) {
            this.cells[+cell.id].isWall = false;
            (cell as HTMLElement).style.animation = '';
          }
          else {
            this.cells[+cell.id].isWall = true;
            (cell as HTMLElement).style.animation = 'wall-animation 0.4s forwards';
          }
        }
      });
    });
  }

  visualizeSearch = (e: Event): void => {
    this.shortPathService.searchSpeed = SearchSpeed.Fast;
    this.shortPathService.cells = this.cells;
    this.shortPathService.startIdx = this.startIdx;
    this.shortPathService.finishIdx = this.finishIdx;
    this.shortPathService.width = this.width;
    this.shortPathService.height = this.height;
    this.shortPathService.bfs();
  }

  visualizePath(e: Event) {
    this.shortPathService.getShortPath();
  }

  setBoardDimensions = () => {
    var boardEl = document.getElementsByClassName("board")[0] as HTMLElement;
    this.width = Math.floor(boardEl.offsetWidth / CELL_WIDTH);
    this.height = Math.floor(boardEl.offsetHeight / CELL_HEIGHT);
    console.log(boardEl, boardEl.offsetWidth / CELL_WIDTH, this.width, this.height);
  }

  //#region: drag and drop functionality
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
