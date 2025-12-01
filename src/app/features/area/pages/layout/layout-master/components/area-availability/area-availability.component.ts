import { Component, OnInit, output, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaDataService, StatusDistribution } from '@core/services/area/area-data.service';
import { AreaStatus } from '@core/models/area.model';

export interface FilterChangeEvent {
  selectedStatuses: AreaStatus[];
}

@Component({
  selector: 'app-area-availability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-availability.component.html',
  styleUrl: './area-availability.component.css'
})
export class AreaAvailabilityComponent implements OnInit {
  mode = input<'per-building' | 'per-floor'>('per-building');

  statusDistribution = signal<StatusDistribution[]>([]);
  selectedStatuses = signal<Set<AreaStatus>>(new Set());

  // Show all 4 statuses (service now returns only 4 statuses, no 'inactive')
  mainStatusDistribution = computed(() => {
    return this.statusDistribution();
  });

  hasSelection = computed(() => this.selectedStatuses().size > 0);

  filterChanged = output<FilterChangeEvent>();

  constructor(private areaDataService: AreaDataService) {}

  ngOnInit(): void {
    this.loadStatusDistribution();
  }

  private loadStatusDistribution(): void {
    const building = this.areaDataService.building();
    if (!building.floors || building.floors.length === 0) {
      console.warn('No floors available');
      return;
    }

    if (this.mode() === 'per-building') {
      // Aggregate all floors
      const distribution = this.areaDataService.getBuildingStatusDistribution();
      this.statusDistribution.set(distribution);
    } else {
      // Per-floor (for future use)
      const floor = building.floors[0];
      const distribution = this.areaDataService.getStatusDistribution(floor);
      this.statusDistribution.set(distribution);
    }
  }

  toggleFilter(statusId: AreaStatus): void {
    const current = new Set(this.selectedStatuses());
    if (current.has(statusId)) {
      current.delete(statusId);
    } else {
      current.add(statusId);
    }
    this.selectedStatuses.set(current);
    this.emitFilterChange();
  }

  isSelected(statusId: AreaStatus): boolean {
    return this.selectedStatuses().has(statusId);
  }

  shouldDim(statusId: AreaStatus): boolean {
    return this.hasSelection() && !this.isSelected(statusId);
  }

  getStatusCardClasses(statusId: AreaStatus): string {
    const classes = ['status-card'];
    if (this.isSelected(statusId)) {
      classes.push('active');
    }
    if (this.shouldDim(statusId)) {
      classes.push('dimmed');
    }
    return classes.join(' ');
  }

  private emitFilterChange(): void {
    this.filterChanged.emit({
      selectedStatuses: Array.from(this.selectedStatuses())
    });
  }

  getBarWidth(status: StatusDistribution): number {
    return status.percentage;
  }

  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(0)}%`;
  }
}
