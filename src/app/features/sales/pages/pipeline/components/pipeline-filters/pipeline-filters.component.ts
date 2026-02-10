// pipeline-filters.component.ts (SIMPLIFIED)
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

export interface FilterState {
  search: string;
  owner: string | null;
  priority: string | null;
}

@Component({
  selector: 'app-pipeline-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select
  ],
  templateUrl: './pipeline-filters.component.html',
  styleUrl: './pipeline-filters.component.css'
})
export class PipelineFiltersComponent {
  // Inputs
  owners = input.required<string[]>();
  tags = input.required<string[]>();

  // Outputs
  filterChange = output<FilterState>();

  // Filter state
  searchQuery = signal('');
  selectedOwner = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);

  // Owner options
  get ownerOptions() {
    return [
      { label: 'All Owners', value: null },
      ...this.owners().map(owner => ({ label: owner, value: owner }))
    ];
  }

  // Priority options
  priorityOptions = [
    { label: 'All Priorities', value: null },
    { label: '🔴 High', value: 'high' },
    { label: '🟡 Medium', value: 'medium' },
    { label: '⚪ Low', value: 'low' }
  ];

  // Handle search change
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.emitFilters();
  }

  // Handle owner change
  onOwnerChange(value: string | null): void {
    this.selectedOwner.set(value);
    this.emitFilters();
  }

  // Handle priority change
  onPriorityChange(value: string | null): void {
    this.selectedPriority.set(value);
    this.emitFilters();
  }

  // Emit filter state
  private emitFilters(): void {
    this.filterChange.emit({
      search: this.searchQuery(),
      owner: this.selectedOwner(),
      priority: this.selectedPriority()
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedOwner.set(null);
    this.selectedPriority.set(null);
    this.emitFilters();
  }
}
