/* C:\work\internship\newSpaceFE\src\app\features\area\pages\layout\layout-master\components\area-availability\area-availability.component.ts */

import { Component, OnInit, output, signal, computed, input, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaDataService, StatusDistribution } from '@core/services/area/area-data.service';
import { AreaStatus } from '@core/models/area.model';
import { getAreaAvailabilityConfig, applyModuleScopedColors, getAreaStatusIcon, getAreaStatusIconType } from '@core/services/ui-settings';
import { interval, Subscription } from 'rxjs';

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
export class AreaAvailabilityComponent implements OnInit, AfterViewInit, OnDestroy {
  mode = input<'per-building' | 'per-floor'>('per-building');

  statusDistribution = signal<StatusDistribution[]>([]);
  selectedStatuses = signal<Set<AreaStatus>>(new Set());

  // Show all 4 statuses (service now returns only 4 statuses, no 'inactive')
  mainStatusDistribution = computed(() => {
    return this.statusDistribution();
  });

  hasSelection = computed(() => this.selectedStatuses().size > 0);

  filterChanged = output<FilterChangeEvent>();

  private configCheckInterval?: Subscription;
  private lastConfigHash: string = '';

  constructor(
    private areaDataService: AreaDataService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStatusDistribution();
    // Check for config changes every 1 second (lightweight polling)
    this.configCheckInterval = interval(1000).subscribe(() => {
      this.checkAndApplyConfigChanges();
    });
  }

  ngAfterViewInit(): void {
    // Apply scoped CSS variables for Area Availability module
    this.applyScopedColors();
  }

  ngOnDestroy(): void {
    if (this.configCheckInterval) {
      this.configCheckInterval.unsubscribe();
    }
  }

  private checkAndApplyConfigChanges(): void {
    const areaConfig = getAreaAvailabilityConfig();
    // Create a hash of the config to detect changes (including icons)
    const configHash = JSON.stringify({
      colors: areaConfig.colors,
      labels: areaConfig.labels,
      labelsEn: areaConfig.labelsEn,
      statusIcons: areaConfig.statusIcons,
      statusIconTypes: areaConfig.statusIconTypes
    });

    if (configHash !== this.lastConfigHash) {
      this.lastConfigHash = configHash;
      this.applyScopedColors();
      // Reload status distribution to get updated labels and colors
      this.loadStatusDistribution();
      // Trigger change detection to update the view
      this.cdr.markForCheck();
    }
  }

  private applyScopedColors(): void {
    const areaConfig = getAreaAvailabilityConfig();
    const container = this.elementRef.nativeElement.querySelector('.area-availability-container');

    if (container && areaConfig.colors) {
      // Apply scoped colors to the container element
      applyModuleScopedColors(container, 'areaAvailability', areaConfig.colors);
    }
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

  getStatusIcon(statusId: AreaStatus): string {
    return getAreaStatusIcon(statusId, 'pi-building');
  }

  getStatusIconType(statusId: AreaStatus): 'library' | 'upload' {
    return getAreaStatusIconType(statusId);
  }
}
