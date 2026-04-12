import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-sidebar-filters',
  templateUrl: './sidebar-filters.component.html',
  styleUrls: ['./sidebar-filters.component.css']
})
export class SidebarFiltersComponent {
  @Input() title = 'Filters';
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onApply(): void {
    this.apply.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
