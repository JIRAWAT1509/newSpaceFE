/* floor-plan.component.ts */

import {
  Component,
  OnInit,
  input,
  output,
  signal,
  computed,
  effect,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AreaMarkerComponent } from './../area-marker/area-marker.component';
import { FloorStatusBarComponent } from './../floor-status-bar/floor-status-bar.component';
import { EditFloorModalComponent } from './../edit-floor-modal/edit-floor-modal.component';
import {
  AreaDataService,
  FloorWithAreas,
  StatusDistribution,
} from '@core/services/area/area-data.service';
import { Area, AreaStatus } from '@core/models/area.model';
import { ActionType } from '../../../area-filter-bar/area-filter-bar.component';

// ── Single source of truth — ห้าม hardcode branches/buildings ที่นี่ ──────────
import { MOCK_BRANCHES } from '@core/data/branch.mock';

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
    EditFloorModalComponent,
  ],
  templateUrl: './floor-plan.component.html',
  styleUrl: './floor-plan.component.css',
})
export class FloorPlanComponent implements OnInit {
  selectedFilters = input<AreaStatus[]>([]);
  selectedTypeFilters = input<ActionType[]>([]);
  selectedAreaId = input<string | null>(null);
  draftFloorPlanImage = signal<string | null>(null);

  areaSelected = output<string | null>();

  currentFloor = signal<FloorWithAreas | null>(null);
  areas = signal<Area[]>([]);
  zoomLevel = signal<number>(1.0);
  panOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  showFilterBar = signal<boolean>(true);
  showEditModal = signal<boolean>(false);

  selectedBuildingId = signal<string>('');
  selectedBranchId = signal<string>('');
  selectedFloorId = signal<string>('');

  currentFloorImage = computed<string>(() => {
    const draft = this.draftFloorPlanImage();
    if (draft && draft.startsWith('data:')) return draft;
    return 'assets/floorPlan1.png';
  });

  editFloorModal = viewChild<EditFloorModalComponent>('editFloorModal');

  visibleAreas = computed<Area[]>(() => {
    let areas = this.areas().filter((a) => a.isActive);

    const selectedId = this.selectedAreaId();
    if (selectedId) {
      return areas.filter((a) => a.id === selectedId);
    }

    const statusFilters = this.selectedFilters();
    if (statusFilters.length > 0) {
      areas = areas.filter((a) => statusFilters.includes(a.status));
    }

    const typeFilters = this.selectedTypeFilters();
    if (typeFilters.length > 0) {
      areas = areas.filter((a) => typeFilters.includes(a.type as ActionType));
    }

    return areas;
  });

  floorStatusDistribution = computed<StatusDistribution[]>(() => {
    const floor = this.currentFloor();
    if (!floor) return [];
    return this.areaDataService.getStatusDistribution(floor);
  });

  constructor(private areaDataService: AreaDataService) {
    effect(() => {
      const floorId = this.areaDataService.currentFloorId();
      if (floorId && floorId !== this.selectedFloorId()) {
        const building = this.areaDataService.building();
        const floor = building.floors.find((f) => f.id === floorId);
        if (floor) {
          this.currentFloor.set(floor);
          this.selectedFloorId.set(floor.id);
          const areas = this.areaDataService.getAreasForCurrentContext(floor);
          this.areas.set(areas);
          setTimeout(() => this.resetZoom(), 100);
        }
      }
    });

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
    if (!building?.floors?.length) {
      console.warn('No floors available');
      return;
    }

    this.selectedBuildingId.set(building.id);
    this.selectedBranchId.set(building.branchId);

    const currentFloorId = this.areaDataService.currentFloorId();
    const activeFloors = building.floors.filter((f) => f.isActive !== false);

    if (!activeFloors.length) {
      console.warn('No active floors available');
      return;
    }

    const floor = currentFloorId
      ? (activeFloors.find((f) => f.id === currentFloorId) ?? activeFloors[0])
      : activeFloors[0];

    this.currentFloor.set(floor);
    this.selectedFloorId.set(floor.id);
    this.areaDataService.setCurrentFloor(floor.id);

    const areas = this.areaDataService.getAreasForCurrentContext(floor);
    this.areas.set(areas);

    setTimeout(() => this.resetZoom(), 100);
  }

  private zoomToArea(areaId: string): void {
    const area = this.areas().find((a) => a.id === areaId);
    if (!area) return;

    const doZoom = () => {
      const container = document.querySelector('.floor-plan-container');
      const image = container?.querySelector(
        '.floor-plan-image',
      ) as HTMLImageElement | null;
      if (!container || !image) return;

      this.zoomLevel.set(1.8);

      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      const imageW = image.naturalWidth || image.offsetWidth;
      const imageH = image.naturalHeight || image.offsetHeight;

      const markerX = (area.position.x / 100) * imageW;
      const markerY = (area.position.y / 100) * imageH;

      this.panOffset.set({
        x: containerCenterX - markerX,
        y: containerCenterY - markerY,
      });
    };

    const image = document.querySelector(
      '.floor-plan-image',
    ) as HTMLImageElement | null;
    if (image && image.complete && image.naturalWidth > 0) {
      doZoom();
    } else if (image) {
      image.onload = () => doZoom();
    }
  }

  // ── Branch options — ดึงจาก MOCK_BRANCHES (single source of truth) ──────────
  getBranchOptions(): { label: string; value: string }[] {
    return MOCK_BRANCHES.filter((b) => b.id !== '') // ตัด "All" ออก
      .map((b) => ({ label: b.nameTh, value: b.id }));
  }

  onBranchChanged(branchId: string): void {
    this.selectedBranchId.set(branchId);
    const building = this.areaDataService
      .buildings()
      .find((b) => b.branchId === branchId && b.isActive);
    if (building) {
      this.onBuildingChanged(building.id);
    }
  }

  // ── Building options — filter ตาม branch ที่เลือก ────────────────────────────
  getBuildingOptions(): BuildingOption[] {
    const selectedBranch = this.selectedBranchId();
    return this.areaDataService
      .buildings()
      .filter((b) => b.branchId === selectedBranch && b.isActive)
      .map((b) => ({ label: `${b.code} - ${b.nameTh}`, value: b.id }));
  }

  onBuildingChanged(buildingId: string): void {
    this.selectedBuildingId.set(buildingId);
    this.areaDataService.setCurrentBuilding(buildingId);

    const building = this.areaDataService
      .buildings()
      .find((b) => b.id === buildingId);
    if (building && building.branchId !== this.selectedBranchId()) {
      this.selectedBranchId.set(building.branchId);
    }

    this.loadFloorData();
  }

  // ── Floor options ──────────────────────────────────────────────────────────
  getFloorOptions(): FloorOption[] {
    return this.getFloors()
      .filter((floor) => floor.isActive !== false)
      .map((floor) => ({
        label: `Fl. ${floor.floorNumber}`,
        value: floor.id,
      }));
  }

  onFloorChanged(floorId: string): void {
    this.draftFloorPlanImage.set(null);
    const building = this.areaDataService.building();
    const floor = building.floors.find((f) => f.id === floorId);
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
    const floors = this.getFloors().filter((f) => f.isActive !== false); // ← filter
    if (!floors.length) return;
    const currentFloor = this.currentFloor();
    if (!currentFloor) return;
    const currentIndex = floors.findIndex((f) => f.id === currentFloor.id);
    const nextIndex = currentIndex >= floors.length - 1 ? 0 : currentIndex + 1;
    this.onFloorChanged(floors[nextIndex].id);
  }

  goToPreviousFloor(): void {
    const floors = this.getFloors().filter((f) => f.isActive !== false); // ← filter
    if (!floors.length) return;
    const currentFloor = this.currentFloor();
    if (!currentFloor) return;
    const currentIndex = floors.findIndex((f) => f.id === currentFloor.id);
    const prevIndex = currentIndex <= 0 ? floors.length - 1 : currentIndex - 1;
    this.onFloorChanged(floors[prevIndex].id);
  }

  // ── Zoom & Pan ─────────────────────────────────────────────────────────────
  onZoomIn(): void {
    this.zoomLevel.set(Math.min(this.zoomLevel() + 0.1, 3.0));
  }

  onZoomOut(): void {
    this.zoomLevel.set(Math.max(this.zoomLevel() - 0.1, 0.5));
  }

  resetZoom(): void {
    this.zoomLevel.set(1.0);
    this.panOffset.set({ x: 0, y: 0 });
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.zoomLevel.set(Math.max(0.5, Math.min(3.0, this.zoomLevel() + delta)));
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
      this.panOffset.set({
        x: event.clientX - this.panStartX,
        y: event.clientY - this.panStartY,
      });
      event.preventDefault();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isPanning = false;
  }

  // ── Marker helpers ─────────────────────────────────────────────────────────
  onMarkerClicked(areaId: string): void {
    const currentSelectedId = this.selectedAreaId();
    this.areaSelected.emit(currentSelectedId === areaId ? null : areaId);
  }

  shouldPulseMarker(area: Area): boolean {
    const selectedId = this.selectedAreaId();
    if (selectedId === area.id) return true;
    if (area.currentTenant?.hasWarning) return true;
    const filters = this.selectedFilters();
    if (filters.length === 0) return false;
    return filters.includes(area.status);
  }

  // ── Filter bar ─────────────────────────────────────────────────────────────
  toggleFilterBar(): void {
    this.showFilterBar.set(!this.showFilterBar());
  }

  // ── Edit modal ─────────────────────────────────────────────────────────────
  onEditAreas(): void {
    const modal = this.editFloorModal();
    if (modal) {
      modal.open();
    } else {
      console.warn('EditFloorModal not found');
    }
  }

  onEditModalClose(): void {}

  onEditModalSave(changes: any): void {
    const floor = this.currentFloor();
    if (!floor) return;

    if (
      Object.keys(changes.positions).length > 0 ||
      Object.keys(changes.activeStates).length > 0
    ) {
      const updatedAreas = this.areas().map((area) => ({
        ...area,
        position: changes.positions[area.id] ?? area.position,
        isActive:
          changes.activeStates[area.id] !== undefined
            ? changes.activeStates[area.id]
            : area.isActive,
      }));
      updatedAreas.forEach((area) => this.areaDataService.updateArea(area));
    }

    const newAreas: Area[] = changes.newAreas ?? [];
    newAreas.forEach((newArea) => this.areaDataService.addArea(newArea));

    if (changes.floorPlanImage) {
      this.draftFloorPlanImage.set(changes.floorPlanImage);
    }

    this.loadFloorData();
  }

  getFloors(): FloorWithAreas[] {
    return this.areaDataService.getFloors();
  }
}
