/* layout-master.component.ts */

import { Component, signal, viewChild, computed } from '@angular/core';
import { AreaAvailabilityComponent, FilterChangeEvent as StatusFilterChangeEvent } from './components/area-availability/area-availability.component';
import { AreaManagementComponent } from './components/area-management/area-management.component';
import { AreaFloorDataComponent } from './components/area-floor-data/area-floor-data.component';
import { AreaFilterBarComponent, FilterChangeEvent as TypeFilterChangeEvent, ActionType } from './components/area-filter-bar/area-filter-bar.component';
import { AddFloorModalComponent, AddFloorResult } from './components/area-filter-bar/components/add-floor-modal/add-floor-modal.component';
import { AddBuildingModalComponent, AddBuildingResult } from './components/area-filter-bar/components/add-building-modal/add-building-modal.component';
import { AreaStatus } from '@core/models/area.model';
import { AreaDataService } from '@core/services/area/area-data.service';

@Component({
  selector: 'app-layout-master',
  standalone: true,
  imports: [
    AreaAvailabilityComponent,
    AreaFilterBarComponent,
    AreaManagementComponent,
    AreaFloorDataComponent,
    AddFloorModalComponent,
    AddBuildingModalComponent,
  ],
  templateUrl: './layout-master.component.html',
  styleUrl: './layout-master.component.css',
})
export class LayoutMasterComponent {
  selectedStatusFilters = signal<AreaStatus[]>([]);
  selectedTypeFilters = signal<ActionType[]>([]);
  searchQuery = signal<string>('');
  selectedAreaId = signal<string | null>(null);

  addFloorModal    = viewChild<AddFloorModalComponent>('addFloorModal');
  addBuildingModal = viewChild<AddBuildingModalComponent>('addBuildingModal');

  constructor(private areaDataService: AreaDataService) {}

  onStatusFilterChanged(event: StatusFilterChangeEvent): void {
    this.selectedStatusFilters.set(event.selectedStatuses);
  }

  onTypeFilterChanged(event: TypeFilterChangeEvent): void {
    this.selectedTypeFilters.set(event.selectedTypes);
    this.searchQuery.set(event.searchQuery);
  }

  onAreaSelected(areaId: string | null): void {
    this.selectedAreaId.set(areaId);
  }

  onBackToGeneral(): void {
    this.selectedAreaId.set(null);
  }

  onCreateFloorClicked(): void {
    const building = this.areaDataService.building();
    const existingFloorNumbers = building.floors.map(f => f.floorNumber);
    this.addFloorModal()?.open(building.id, existingFloorNumbers);
  }

  onFloorCreated(result: AddFloorResult): void {
    this.areaDataService.addFloor(result.floor);
    this.areaDataService.setCurrentFloor(result.floor.id);
    if (result.shouldOpenEditModal) {
      setTimeout(() => window.dispatchEvent(new CustomEvent('openEditModal')), 100);
    }
  }

  onAddFloorModalClosed(): void {
    console.log('Add floor modal closed');
  }

  onCreateBuildingClicked(): void {
    this.addBuildingModal()?.open();
  }

  // ✅ เรียก service จริง
  onBuildingCreated(result: AddBuildingResult): void {
    this.areaDataService.addBuilding(result.building);
  }

  onAddBuildingModalClosed(): void {
    console.log('Add building modal closed');
  }

  currentFloorId = computed(() => {
    const floor = this.areaDataService.getCurrentFloor();
    return floor?.id || 'floor-2m';
  });
}
