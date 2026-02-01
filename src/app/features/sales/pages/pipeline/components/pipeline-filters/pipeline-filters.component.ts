// pipeline-filters.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

interface SelectOption {
  label: string;
  value: string;
}

export interface FilterState {
  search: string;
  owner: string | null;
  priority: string | null;
  tags: string[];
}

@Component({
  selector: 'app-pipeline-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
    IconField,
    InputIcon
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
  searchValue = signal('');
  selectedOwner = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);

  // Priority options
  priorityOptions: SelectOption[] = [
    { label: 'All Priorities', value: '' },
    { label: '🔴 High Priority', value: 'high' },
    { label: '🟡 Medium Priority', value: 'medium' },
    { label: '⚪ Low Priority', value: 'low' }
  ];

  // Get owner options
  getOwnerOptions(): SelectOption[] {
    return [
      { label: 'All Owners', value: '' },
      ...this.owners().map(owner => ({ label: owner, value: owner }))
    ];
  }

  // Handle search input
  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.emitFilterChange();
  }

  // Handle owner change
  onOwnerChange(value: string): void {
    this.selectedOwner.set(value || null);
    this.emitFilterChange();
  }

  // Handle priority change
  onPriorityChange(value: string): void {
    this.selectedPriority.set(value || null);
    this.emitFilterChange();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchValue.set('');
    this.selectedOwner.set(null);
    this.selectedPriority.set(null);
    this.emitFilterChange();
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return !!(
      this.searchValue() ||
      this.selectedOwner() ||
      this.selectedPriority()
    );
  }

  // Emit filter change
  private emitFilterChange(): void {
    this.filterChange.emit({
      search: this.searchValue(),
      owner: this.selectedOwner(),
      priority: this.selectedPriority(),
      tags: []
    });
  }
}
