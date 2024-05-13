import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SearchSpeed } from './models/cell';
import { Algorithms } from './constants/algorithms';
import { MazeType, MazeLabel } from './constants/mazes';
import { Option } from './components/dropdown/dropdown.component';
import { BoardComponent } from './components/board/board.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('board') board!: BoardComponent;

  algorithmOptions: Option[] = [
    { id: 0, label: Algorithms.A_STAR },
    { id: 1, label: Algorithms.BFS },
    { id: 2, label: Algorithms.DFS },
    { id: 3, label: Algorithms.DIJKISTRA },
    { id: 4, label: Algorithms.GREEDY }
  ];

  mazeOptions: Option[] = [
    { id: MazeType.RANDOM, label: MazeLabel.RANDOM },
    { id: MazeType.RECURSIVE, label: MazeLabel.RECURSIVE }
  ];

  speedOptions: Option[] = [
    { id: SearchSpeed.Fast, label: "Fast" },
    { id: SearchSpeed.Moderate, label: "Medium" },
    { id: SearchSpeed.Slow, label: "Slow" }
  ]

  title = 'path-search';
  selectedAlgorithm: string = this.algorithmOptions[0].label;
  selectedMaze: Option = this.mazeOptions[0];
  selectedSpeed: SearchSpeed = this.speedOptions[0].id;

  constructor() {
  }

  ngAfterViewInit(): void {
  }

  selectAlgorithm = (option: Option): void => {
    this.selectedAlgorithm = option.label;
  }

  selectMaze = (option: Option): void => {
    this.selectedMaze = option;
  }

  selectSpeed = (option: Option): void => {
    this.selectedSpeed = option.id;
  }

  visualize = async (event: Event): Promise<void> => {
    await this.board.visualizeSearch()
  }

  clearBoard = (): void => {
    this.board.clearBoard();
  }
  clearSearch = (): void => {
    this.board.clearSearch();
  }

  generateMaze = (): void => {
    this.board.generateMaze(this.selectedMaze.id);
  }
}
