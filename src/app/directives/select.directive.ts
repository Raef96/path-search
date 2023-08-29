import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSelect]'
})
export class SelectDirective {

  @Input() isMouseClicked: boolean = false;
  isMouseDown = false;

  constructor(private el: ElementRef) {
  }

  @HostListener('mouseover', ['$event']) mouseOver(e: Event) {
    console.log('over', this.isMouseClicked)
    if (this.isMouseClicked == true) {
      console.log(this.el.nativeElement);
      this.el.nativeElement.style.transform = "scale(1.25)";
      this.el.nativeElement.style.background = "black";
    }
  }

  @HostListener('mouseleave', ['$event']) mouseLeave(e: Event) {
    this.el.nativeElement.style.transform = "scale(1)";
  }

  @HostListener('mousedown', ['$event']) mouseDown(e: Event) {
    this.isMouseDown = true;
    this.el.nativeElement.style.transform = "scale(1.25)";
    this.el.nativeElement.style.background = "black";
  }

  @HostListener('mouseup', ['$event']) mouseUp(e: Event) {
    this.isMouseDown = false;
    this.el.nativeElement.style.transform = "scale(1)";
  }
}
