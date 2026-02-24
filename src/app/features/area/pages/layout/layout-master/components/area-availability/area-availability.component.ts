import { Component, OnInit, output, signal, computed, input, ElementRef, AfterViewInit, OnDestroy, effect, ChangeDetectorRef } from '@angular/core';
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

  selectedStatuses = signal<Set<AreaStatus>>(new Set());

  // ✅ computed จาก service โดยตรง — reactive ตาม building/floor ที่เปลี่ยน
  mainStatusDistribution = computed(() => {
    return this.mode() === 'per-building'
      ? this.areaDataService.buildingStatusDistribution()
      : this.areaDataService.currentFloorStatusDistribution();
  });

  hasSelection = computed(() => this.selectedStatuses().size > 0);

  filterChanged = output<FilterChangeEvent>();

  private configCheckInterval?: Subscription;
  private lastConfigHash: string = '';

  constructor(
    private areaDataService: AreaDataService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    // ✅ effect จะ re-run อัตโนมัติทุกครั้งที่ mainStatusDistribution เปลี่ยน
    // (เช่น เวลา toggle ตึก) เพื่อ trigger change detection
    effect(() => {
      this.mainStatusDistribution(); // track dependency
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.configCheckInterval = interval(1000).subscribe(() => {
      this.checkAndApplyConfigChanges();
    });
  }

  ngAfterViewInit(): void {
    this.applyScopedColors();
  }

  ngOnDestroy(): void {
    if (this.configCheckInterval) {
      this.configCheckInterval.unsubscribe();
    }
  }

  private checkAndApplyConfigChanges(): void {
    const areaConfig = getAreaAvailabilityConfig();
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
      this.cdr.markForCheck();
    }
  }

  private applyScopedColors(): void {
    const areaConfig = getAreaAvailabilityConfig();
    const container = this.elementRef.nativeElement.querySelector('.area-availability-container');
    if (container && areaConfig.colors) {
      applyModuleScopedColors(container, 'areaAvailability', areaConfig.colors);
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
    if (this.isSelected(statusId)) classes.push('active');
    if (this.shouldDim(statusId)) classes.push('dimmed');
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
