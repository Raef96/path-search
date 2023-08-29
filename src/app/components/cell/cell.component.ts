import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.less']
})
export class CellComponent implements OnInit {

  @Input() index: number = -1;
  @Input() isStart: boolean = true;
  @Input() isFinish: boolean = false;
  @Input() isMousePressed: boolean = false;

  @ViewChild('div') cell!: ElementRef<HTMLElement>;

  public isWall: boolean = false;
  public isVisited: boolean = false;
  public inPath: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  setVisted() {
    if (!this.isStart && !this.isFinish) {
      this.cell.nativeElement.style.background = "#3f3fd3a8";
    }

    this.isVisited = true;
  }

  setPath = () : void=> {
    if (!this.isStart && !this.isFinish) {
      this.cell.nativeElement.style.backgroundColor = "#ebd197";
    }

    this.inPath = true;
  }

  getCellType = (): string => {
    return 'cell' + (this.isStart ? ' start' :
      this.isFinish ? ' finish' :
        this.inPath ? ' path' : '');
  }


  @HostListener('mouseover', ['$event']) mouseOver(e: Event) {
    if (!this.isMousePressed || this.isStart || this.isFinish) return;

    if (this.isWall) {
      this.isWall = false;
      this.cell.nativeElement.style.backgroundColor = "white";
      this.cell.nativeElement.style.border = "1px solid rgb(175, 216, 248)";
      return;
    }

    this.isWall = true;
    this.cell.nativeElement.style.background = "rgb(11, 52, 70)";
    this.cell.nativeElement.style.border = "1px solid rgb(11, 52, 71)";
  }

  @HostListener('mousedown', ['$event']) mouseDown(e: Event) {
    if (this.isStart || this.isFinish) return;

    if (this.isWall) {
      this.isWall = false;
      this.cell.nativeElement.style.background = "white";
      this.cell.nativeElement.style.border = "1px solid rgb(175, 216, 248)";
      return;
    }

    this.isWall = true;
    this.cell.nativeElement.style.background = "rgb(11, 52, 70)";
    this.cell.nativeElement.style.border = "1px solid rgb(11, 52, 71)";
  }
}
