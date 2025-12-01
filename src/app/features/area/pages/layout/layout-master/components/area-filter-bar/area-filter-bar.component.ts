import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ActionType = 'Log' | 'Kiosk' | 'OP';

export interface FilterChangeEvent {
  selectedTypes: ActionType[];
  searchQuery: string;
}

@Component({
  selector: 'app-area-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-filter-bar.component.html',
  styleUrl: './area-filter-bar.component.css'
})
export class AreaFilterBarComponent {
  selectedTypes = signal<ActionType[]>([]);
  searchQuery = '';

  filterChanged = output<FilterChangeEvent>();

  isTypeSelected(type: ActionType): boolean {
    return this.selectedTypes().includes(type);
  }

  onTypeToggle(type: ActionType): void {
    const current = [...this.selectedTypes()];
    const index = current.indexOf(type);

    if (index > -1) {
      // Remove if already selected
      current.splice(index, 1);
    } else {
      // Add if not selected
      current.push(type);
    }

    this.selectedTypes.set(current);
    this.emitFilterChange();
  }

  clearTypeFilters(): void {
    this.selectedTypes.set([]);
    this.emitFilterChange();
  }

  onSearchChange(): void {
    this.emitFilterChange();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterChanged.emit({
      selectedTypes: this.selectedTypes(),
      searchQuery: this.searchQuery
    });
  }
}
