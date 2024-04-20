import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Option } from './components/dropdown/dropdown.component';
import { Algorithms } from './constants/algorithms';
import { BoardComponent } from './components/board/board.component';
import { MazeType, MazeLabel } from './constants/mazes';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('board') board!: BoardComponent;

  algorithmOptions: Option[] = [
    { id: 0, label: Algorithms.BFS },
    { id: 1, label: Algorithms.DFS },
    { id: 2, label: Algorithms.DIJKISTRA },
    { id: 3, label: Algorithms.A_STAR }
  ];

  mazeOptions: Option[] = [
    { id: MazeType.RANDOM, label: MazeLabel.RANDOM },
    { id: MazeType.RECURSIVE, label: MazeLabel.RECURSIVE }
  ];

  speedOptions: Option[] = [
    { id: 0, label: "Fast" },
    { id: 1, label: "Medium" },
    { id: 2, label: "Slow" }
  ]

  title = 'path-search';
  selectedAlgorithm: Option = this.algorithmOptions[0];
  selectedMaze: Option = this.mazeOptions[0];
  selectedSpeed: Option = this.speedOptions[0];

  constructor() {
  }

  ngAfterViewInit(): void {
  }

  selectAlgorithm = (option: Option): void => {
    this.selectedAlgorithm = option;
  }

  selectMaze = (option: Option): void => {
    this.selectedMaze = option;
  }

  selectSpeed = (option: Option): void => {
    this.selectedSpeed = option;
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
