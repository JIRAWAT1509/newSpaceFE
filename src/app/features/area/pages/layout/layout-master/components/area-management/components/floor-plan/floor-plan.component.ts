import { Component, OnInit, input, output, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AreaMarkerComponent } from './../area-marker/area-marker.component';
import { FloorStatusBarComponent } from './../floor-status-bar/floor-status-bar.component';
import { EditFloorModalComponent } from './../edit-floor-modal/edit-floor-modal.component';
import { AreaDataService, FloorWithAreas, StatusDistribution } from '@core/services/area/area-data.service';
import { Area, AreaStatus } from '@core/models/area.model';
import { Building } from '@core/models/building.model';
import { ActionType } from '../../../area-filter-bar/area-filter-bar.component';

interface FloorOption {
  label: string;
  value: string;
}

interface BuildingOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-floor-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    AreaMarkerComponent,
    FloorStatusBarComponent,
    EditFloorModalComponent
  ],
  templateUrl: './floor-plan.component.html',
  styleUrl: './floor-plan.component.css'
})
export class FloorPlanComponent implements OnInit {
  selectedFilters = input<AreaStatus[]>([]);
  selectedTypeFilters = input<ActionType[]>([]);
  selectedAreaId = input<string | null>(null);

  areaSelected = output<string | null>();

  // State
  currentBuilding = signal<Building | null>(null);
  currentFloor = signal<FloorWithAreas | null>(null);
  areas = signal<Area[]>([]);
  zoomLevel = signal<number>(1.0);
  panOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  showFilterBar = signal<boolean>(true);
  showEditModal = signal<boolean>(false);

  selectedBuildingId = signal<string>('');
  selectedFloorId = signal<string>('');

  // Computed
  currentFloorImage = computed<string>(() => {
    const floor = this.currentFloor();
    if (!floor) return '';

    const version = this.areaDataService.getLatestVersion(floor);
    return version?.planImage || '';
  });

  visibleAreas = computed<Area[]>(() => {
    let areas = this.areas();

    // Only show active areas (isActive = true)
    areas = areas.filter(a => a.isActive);

    // If area is selected, show only that area
    const selectedId = this.selectedAreaId();
    if (selectedId) {
      return areas.filter(a => a.id === selectedId);
    }

    // Apply status filters if any selected
    const statusFilters = this.selectedFilters();
    if (statusFilters.length > 0) {
      areas = areas.filter(a => statusFilters.includes(a.status));
    }

    // Apply type filters if any selected
    const typeFilters = this.selectedTypeFilters();
    if (typeFilters.length > 0) {
      areas = areas.filter(a => {
        const actionLabel = this.getActionLabel(a.status);
        return typeFilters.includes(actionLabel as ActionType);
      });
    }

    return areas;
  });

  floorStatusDistribution = computed<StatusDistribution[]>(() => {
    const floor = this.currentFloor();
    if (!floor) return [];
    return this.areaDataService.getStatusDistribution(floor);
  });

  constructor(private areaDataService: AreaDataService) {
    // Watch for current floor changes from service
    effect(() => {
      const floorId = this.areaDataService.currentFloorId();
      if (floorId && floorId !== this.selectedFloorId()) {
        const building = this.areaDataService.building();
        const floor = building.floors.find(f => f.id === floorId);
        if (floor) {
          this.currentFloor.set(floor);
          this.selectedFloorId.set(floor.id);
          const areas = this.areaDataService.getAreasForCurrentContext(floor);
          this.areas.set(areas);
          setTimeout(() => this.resetZoom(), 100);
        }
      }
    });

    // Watch for area selection changes
    effect(() => {
      const areaId = this.selectedAreaId();
      if (areaId) {
        setTimeout(() => this.zoomToArea(areaId), 50);
      } else {
        this.resetZoom();
      }
    });
  }

  ngOnInit(): void {
    this.loadFloorData();
  }

  private loadFloorData(): void {
    const building = this.areaDataService.building();
    if (!building.floors || building.floors.length === 0) {
      console.warn('No floors available');
      return;
    }

    this.currentBuilding.set(building);
    this.selectedBuildingId.set(building.id);

    // Use current floor from service if available
    const currentFloorId = this.areaDataService.currentFloorId();
    const floor = currentFloorId
      ? building.floors.find(f => f.id === currentFloorId) || building.floors[0]
      : building.floors[0];

    this.currentFloor.set(floor);
    this.selectedFloorId.set(floor.id);
    this.areaDataService.setCurrentFloor(floor.id);

    const areas = this.areaDataService.getAreasForCurrentContext(floor);
    this.areas.set(areas);

    setTimeout(() => this.resetZoom(), 100);
  }

  private zoomToArea(areaId: string): void {
    const area = this.areas().find(a => a.id === areaId);
    if (!area) return;

    this.zoomLevel.set(1.8);

    const container = document.querySelector('.floor-plan-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    const imageSizeEstimate = 800;
    const markerX = (area.position.x / 100) * imageSizeEstimate;
    const markerY = (area.position.y / 100) * imageSizeEstimate;

    const offsetX = containerCenterX - markerX;
    const offsetY = containerCenterY - markerY;

    this.panOffset.set({ x: offsetX, y: offsetY });
  }

  private getActionLabel(status: AreaStatus): string {
    const actionLabels: { [key: string]: string } = {
      'vacant': 'Log',
      'leased': 'Log',
      'quotation': 'OP',
      'unallocated': 'Kiosk',
      'inactive': 'View'
    };
    return actionLabels[status] || 'View';
  }

  getBuildingOptions(): BuildingOption[] {
    const building = this.currentBuilding();
    if (!building) return [];

    return [{
      label: `${building.code} - ${building.name}`,
      value: building.id
    }];
  }

  onBuildingChanged(buildingId: string): void {
    this.selectedBuildingId.set(buildingId);
    console.log('Building changed:', buildingId);
  }

  getFloorOptions(): FloorOption[] {
    return this.getFloors().map(floor => ({
      label: `Fl. ${floor.floorNumber}`,
      value: floor.id
    }));
  }

  onFloorChanged(floorId: string): void {
    const building = this.areaDataService.building();
    const floor = building.floors.find(f => f.id === floorId);

    if (floor) {
      this.currentFloor.set(floor);
      this.selectedFloorId.set(floor.id);
      this.areaDataService.setCurrentFloor(floor.id);
      const areas = this.areaDataService.getAreasForCurrentContext(floor);
      this.areas.set(areas);
      this.resetZoom();
    }
  }

  goToNextFloor(): void {
    const floors = this.getFloors();
    if (floors.length === 0) return;

    const currentFloor = this.currentFloor();
    if (!currentFloor) return;

    const currentIndex = floors.findIndex(f => f.id === currentFloor.id);
    const nextIndex = currentIndex >= floors.length - 1 ? 0 : currentIndex + 1;
    this.onFloorChanged(floors[nextIndex].id);
  }

  goToPreviousFloor(): void {
    const floors = this.getFloors();
    if (floors.length === 0) return;

    const currentFloor = this.currentFloor();
    if (!currentFloor) return;

    const currentIndex = floors.findIndex(f => f.id === currentFloor.id);
    const prevIndex = currentIndex <= 0 ? floors.length - 1 : currentIndex - 1;
    this.onFloorChanged(floors[prevIndex].id);
  }

  onZoomIn(): void {
    const newZoom = Math.min(this.zoomLevel() + 0.1, 3.0);
    this.zoomLevel.set(newZoom);
  }

  onZoomOut(): void {
    const newZoom = Math.max(this.zoomLevel() - 0.1, 0.5);
    this.zoomLevel.set(newZoom);
  }

  resetZoom(): void {
    this.zoomLevel.set(1.0);
    this.panOffset.set({ x: 0, y: 0 });
  }

  onMarkerClicked(areaId: string): void {
    const currentSelectedId = this.selectedAreaId();
    if (currentSelectedId === areaId) {
      this.areaSelected.emit(null);
    } else {
      this.areaSelected.emit(areaId);
    }
  }

  shouldPulseMarker(area: Area): boolean {
    const selectedId = this.selectedAreaId();

    if (selectedId === area.id) {
      return true;
    }

    // Always pulse warnings
    if (area.currentTenant?.hasWarning) {
      return true;
    }

    const filters = this.selectedFilters();

    if (filters.length === 0) {
      return false;
    }

    return filters.includes(area.status);
  }

  toggleFilterBar(): void {
    this.showFilterBar.set(!this.showFilterBar());
  }

  onEditAreas(): void {
    this.showEditModal.set(true);
  }

  onEditModalClose(): void {
    this.showEditModal.set(false);
  }

  onEditModalSave(changes: any): void {
    console.log('Saving changes:', changes);
    // TODO: Apply changes to service
    this.showEditModal.set(false);
    this.loadFloorData();
  }

  getFloors(): FloorWithAreas[] {
    return this.areaDataService.getFloors();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3.0, this.zoomLevel() + delta));
    this.zoomLevel.set(newZoom);
  }

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffset().x;
      this.panStartY = event.clientY - this.panOffset().y;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      const newX = event.clientX - this.panStartX;
      const newY = event.clientY - this.panStartY;
      this.panOffset.set({ x: newX, y: newY });
      event.preventDefault();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isPanning = false;
  }
}
