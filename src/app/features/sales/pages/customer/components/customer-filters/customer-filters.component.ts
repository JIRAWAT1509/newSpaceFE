// customer-filters.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import {
  Customer,
  CustomerClass,
  CustomerStatus,
  CustomerSegment,
  CLASS_DEFINITIONS,
  STATUS_LABELS
} from '@core/models/customer.model';

export interface CustomerFilters {
  search: string;
  classes: CustomerClass[];
  statuses: CustomerStatus[];
  segments: CustomerSegment[];
  owners: string[];
}

@Component({
  selector: 'app-customer-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelect],
  templateUrl: './customer-filters.component.html',
  styleUrl: './customer-filters.component.css'
})
export class CustomerFiltersComponent {
  // Inputs
  customers = input.required<Customer[]>();
  uniqueOwners = input.required<string[]>();
  availableSegments = input.required<CustomerSegment[]>();
  currentFilters = input.required<CustomerFilters>();

  // Outputs
  filtersChange = output<CustomerFilters>();
  clearFilters = output<void>();

  // Local state for form inputs
  searchText = signal<string>('');
  selectedClasses = signal<CustomerClass[]>([]);
  selectedStatuses = signal<CustomerStatus[]>([]);
  selectedSegments = signal<CustomerSegment[]>([]);
  selectedOwners = signal<string[]>([]);

  // Filter options
  classOptions = CLASS_DEFINITIONS.map(c => ({
    label: `${c.class} - ${c.nameTh}`,
    value: c.class,
    color: c.color,
    bgColor: c.bgColor
  }));

  statusOptions = Object.entries(STATUS_LABELS).map(([key, value]) => ({
    label: `${value.th} (${value.en})`,
    value: key as CustomerStatus,
    color: value.color
  }));

  // Sync local state with parent filters
  ngOnInit(): void {
    const filters = this.currentFilters();
    this.searchText.set(filters.search);
    this.selectedClasses.set(filters.classes);
    this.selectedStatuses.set(filters.statuses);
    this.selectedSegments.set(filters.segments);
    this.selectedOwners.set(filters.owners);
  }

  // Search
  onSearchChange(value: string): void {
    this.searchText.set(value);
    this.emitFilters();
  }

  // Class filter
  onClassChange(event: any): void {
    this.selectedClasses.set(event.value || []);
    this.emitFilters();
  }

  // Status filter
  onStatusChange(event: any): void {
    this.selectedStatuses.set(event.value || []);
    this.emitFilters();
  }

  // Segment filter
  onSegmentChange(event: any): void {
    this.selectedSegments.set(event.value || []);
    this.emitFilters();
  }

  // Owner filter
  onOwnerChange(event: any): void {
    this.selectedOwners.set(event.value || []);
    this.emitFilters();
  }

  // Emit filters to parent
  emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchText(),
      classes: this.selectedClasses(),
      statuses: this.selectedStatuses(),
      segments: this.selectedSegments(),
      owners: this.selectedOwners()
    });
  }

  // Clear all filters
  onClearFilters(): void {
    this.searchText.set('');
    this.selectedClasses.set([]);
    this.selectedStatuses.set([]);
    this.selectedSegments.set([]);
    this.selectedOwners.set([]);
    this.clearFilters.emit();
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return this.searchText().length > 0 ||
           this.selectedClasses().length > 0 ||
           this.selectedStatuses().length > 0 ||
           this.selectedSegments().length > 0 ||
           this.selectedOwners().length > 0;
  }
}
