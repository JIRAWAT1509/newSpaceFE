import { Component, signal } from '@angular/core';
import { AreaAvailabilityComponent, FilterChangeEvent as StatusFilterChangeEvent } from './components/area-availability/area-availability.component';
import { AreaManagementComponent } from './components/area-management/area-management.component';
import { AreaFloorDataComponent } from './components/area-floor-data/area-floor-data.component';
import { AreaFilterBarComponent, FilterChangeEvent as TypeFilterChangeEvent, ActionType } from './components/area-filter-bar/area-filter-bar.component';
import { AreaStatus } from '@core/models/area.model';

@Component({
  selector: 'app-layout-master',
  standalone: true,
  imports: [
    AreaAvailabilityComponent,
    AreaFilterBarComponent,
    AreaManagementComponent,
    AreaFloorDataComponent
  ],
  templateUrl: './layout-master.component.html',
  styleUrl: './layout-master.component.css',
})
export class LayoutMasterComponent {
  selectedStatusFilters = signal<AreaStatus[]>([]);
  selectedTypeFilters = signal<ActionType[]>([]);
  searchQuery = signal<string>('');
  selectedAreaId = signal<string | null>(null);

  onStatusFilterChanged(event: StatusFilterChangeEvent): void {
    console.log('Status filter changed:', event);
    this.selectedStatusFilters.set(event.selectedStatuses);
  }

  onTypeFilterChanged(event: TypeFilterChangeEvent): void {
    console.log('Type filter changed:', event);
    this.selectedTypeFilters.set(event.selectedTypes);
    this.searchQuery.set(event.searchQuery);
  }

  onAreaSelected(areaId: string | null): void {
    console.log('Area selected:', areaId);
    this.selectedAreaId.set(areaId);
  }

  onBackToGeneral(): void {
    this.selectedAreaId.set(null);
  }
}
