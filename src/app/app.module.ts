import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { SelectDirective } from './directives/select.directive';
import { CellComponent } from './components/cell/cell.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PointerComponent } from './components/pointer/pointer.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    SelectDirective,
    CellComponent,
    PointerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
