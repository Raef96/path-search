import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Option {
  id: number
  label: string
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.less'
})
export class DropdownComponent {

  @Input() options: Option[] = [];
  @Input() selectedOption: Option | null = null;
  @Input('disabled') isDisabled: boolean = false;

  @Output() changed: EventEmitter<Option> = new EventEmitter<Option>();

  isSelected = (option: Option) =>
    this.selectedOption != null && this.selectedOption.id == option.id;

  select = (event: Event) => {
    let selectedValue = parseInt((event.target as HTMLSelectElement).value);
    this.selectedOption = this.options.filter(opt => opt.id == selectedValue)[0];
    this.changed.emit(this.selectedOption);
  }
}
