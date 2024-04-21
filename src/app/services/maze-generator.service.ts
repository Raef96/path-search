import { Injectable } from '@angular/core';
import { Numbers } from '../utils/numbers';
import { MazeType, Orientation } from '../constants/mazes';


@Injectable({
  providedIn: 'root'
})
export class MazeGeneratorService {

  private wallsIdx: number[] = [];
  private cellsIdx: number[] = [];
  private width: number = -1;
  private height: number = -1;

  constructor() { }

  generate = (
    width: number,
    height: number,
    excludedCellsIdx: number[],
    mazeType: MazeType,
    orientation: Orientation = Orientation.HORIZONTAL
  ): number[] => {

    if (width <= 0 || height <= 0) {
      throw Error(`Invalid board dimensions (${width}, ${height}).`);
    }

    this.width = width;
    this.height = height;

    this.wallsIdx = [];
    let cellsCount = width * height;
    this.cellsIdx = Array.from({ length: cellsCount }, (_, index) => index);

    if (mazeType === MazeType.RANDOM) {
      this.randomMaze(cellsCount, excludedCellsIdx);
    }

    if (mazeType === MazeType.RECURSIVE) {
      this.recursiveMaze(0, 23, 0, 57, false, orientation, excludedCellsIdx);
    }

    return this.wallsIdx;
  }

  private randomMaze = (cellsCount: number, excludedCellsIdx: number[] = []) => {
    let wallsCount = Numbers.getRandom(200, cellsCount / 2);
    for (let i = 0; i < wallsCount; ++i) {
      let idx = Numbers.getRandom(0, cellsCount - 1);
      if (!excludedCellsIdx.includes(idx)) {
        this.wallsIdx.push(idx);
      }
    }
  }

  private recursiveMaze = (
    rowStart: number,
    rowEnd: number,
    colStart: number,
    colEnd: number,
    surroundingWalls: boolean,
    orientation: Orientation,
    excludedCellsIdx: number[],
  ): void => {

    if (rowEnd < rowStart || colEnd < colStart) {
      return;
    }

    if (!surroundingWalls) {

      this.cellsIdx.forEach(cellIdx => {
        if (excludedCellsIdx.includes(cellIdx))
          return;

        let r = Math.floor(cellIdx / this.width); // cellIdx = width * (r - 1) + c
        let c = cellIdx % this.width;

        if (r === 0 || c === 0 || r === this.height - 1 || c === this.width - 1) {
          this.wallsIdx.push(cellIdx);
        }
      });
      surroundingWalls = true;
    }

    if (orientation === Orientation.HORIZONTAL) {
      let possibleRows: number[] = [];
      for (let number = rowStart; number <= rowEnd; number += 2) { // dont select the last row
        possibleRows.push(number);
      }

      let possibleCols: number[] = [];
      for (let number = colStart + 1; number <= colEnd + 1; number += 2) { // select the last column
        possibleCols.push(number);
      }

      let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
      let randomColIndex = Math.floor(Math.random() * possibleCols.length);
      let rowRandom = possibleRows[randomRowIndex];
      let colRandom = possibleCols[randomColIndex];

      this.cellsIdx.forEach(cellIdx => {
        let r = Math.floor(cellIdx / this.width); // cellIdx = width * (r - 1) + c
        let c = cellIdx % this.width;

        if (r === rowRandom && c !== colRandom && c >= colStart - 1 && c <= colEnd + 1
          && !excludedCellsIdx.includes(cellIdx)) {
          this.wallsIdx.push(cellIdx);
        }
      });

      if (rowRandom - 2 - rowStart > colEnd - colStart) {
        this.recursiveMaze(rowStart, rowRandom - 2, colStart, colEnd, surroundingWalls, orientation, excludedCellsIdx);
      }
      else {
        this.recursiveMaze(rowStart, rowRandom - 2, colStart, colEnd, surroundingWalls, Orientation.VERTICAL, excludedCellsIdx);
      }
      if (rowEnd - (rowRandom + 2) > colEnd - colStart) {
        this.recursiveMaze(rowRandom + 2, rowEnd, colStart, colEnd, surroundingWalls, orientation, excludedCellsIdx);
      }
      else {
        this.recursiveMaze(rowRandom + 2, rowEnd, colStart, colEnd, surroundingWalls, Orientation.VERTICAL, excludedCellsIdx);
      }
    }
    else {

      let possibleCols: number[] = [];
      for (let number = colStart; number <= colEnd; number += 2) {
        possibleCols.push(number);
      }

      let possibleRows: number[] = [];
      for (let number = rowStart + 1; number <= rowEnd + 1; number += 2) {
        possibleRows.push(number);
      }

      let randomColIndex = Math.floor(Math.random() * possibleCols.length);
      let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
      let colRandom = possibleCols[randomColIndex];
      let rowRandom = possibleRows[randomRowIndex];

      this.cellsIdx.forEach(idx => {
        let r = Math.floor(idx / this.width); // cellIdx = width * (r - 1) + c
        let c = idx % this.width;

        if (c === colRandom && r !== rowRandom && r >= rowStart - 1 && r <= rowEnd + 1
          && !excludedCellsIdx.includes(idx)) {
          this.wallsIdx.push(idx);
        }
      });

      if (rowEnd - rowStart > colRandom - 2 - colStart) {
        this.recursiveMaze(rowStart, rowEnd, colStart, colRandom - 2, surroundingWalls, Orientation.HORIZONTAL, excludedCellsIdx);
      }
      else {
        this.recursiveMaze(rowStart, rowEnd, colStart, colRandom - 2, surroundingWalls, orientation, excludedCellsIdx);
      }
      if (rowEnd - rowStart > colEnd - (colRandom + 2)) {
        this.recursiveMaze(rowStart, rowEnd, colRandom + 2, colEnd, surroundingWalls, Orientation.HORIZONTAL, excludedCellsIdx);
      }
      else {
        this.recursiveMaze(rowStart, rowEnd, colRandom + 2, colEnd, surroundingWalls, orientation, excludedCellsIdx);
      }
    }
  }
}
