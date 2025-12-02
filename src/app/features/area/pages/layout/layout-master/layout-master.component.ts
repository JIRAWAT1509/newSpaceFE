import { Component, signal, viewChild } from '@angular/core';
import { AreaAvailabilityComponent, FilterChangeEvent as StatusFilterChangeEvent } from './components/area-availability/area-availability.component';
import { AreaManagementComponent } from './components/area-management/area-management.component';
import { AreaFloorDataComponent } from './components/area-floor-data/area-floor-data.component';
import { AreaFilterBarComponent, FilterChangeEvent as TypeFilterChangeEvent, ActionType } from './components/area-filter-bar/area-filter-bar.component';
import { AddFloorModalComponent, AddFloorResult } from './components//area-filter-bar/components/add-floor-modal/add-floor-modal.component';
import { AreaStatus } from '@core/models/area.model';
import { AreaDataService, FloorWithAreas } from '@core/services/area/area-data.service';

@Component({
  selector: 'app-layout-master',
  standalone: true,
  imports: [
    AreaAvailabilityComponent,
    AreaFilterBarComponent,
    AreaManagementComponent,
    AreaFloorDataComponent,
    AddFloorModalComponent
  ],
  templateUrl: './layout-master.component.html',
  styleUrl: './layout-master.component.css',
})
export class LayoutMasterComponent {
  selectedStatusFilters = signal<AreaStatus[]>([]);
  selectedTypeFilters = signal<ActionType[]>([]);
  searchQuery = signal<string>('');
  selectedAreaId = signal<string | null>(null);

  addFloorModal = viewChild<AddFloorModalComponent>('addFloorModal');

  constructor(private areaDataService: AreaDataService) {}

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

  onCreateFloorClicked(): void {
    const building = this.areaDataService.building();
    const existingFloorNumbers = building.floors.map(f => f.floorNumber);

    const modal = this.addFloorModal();
    if (modal) {
      modal.open(building.id, existingFloorNumbers);
    }
  }

  onFloorCreated(result: AddFloorResult): void {
    const newFloor = result.floor;

    // Add floor to service
    this.areaDataService.addFloor(newFloor);

    // Switch to new floor
    this.areaDataService.setCurrentFloor(newFloor.id);

    // Open edit modal if requested
    if (result.shouldOpenEditModal) {
      setTimeout(() => {
        const event = new CustomEvent('openEditModal');
        window.dispatchEvent(event);
      }, 100);
    }
  }

  onAddFloorModalClosed(): void {
    console.log('Add floor modal closed');
  }
}
