/* layout-inquiry.component.ts */

import { Component, signal, computed, viewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Building } from '@core/models/building.model';
import { Branch } from '@core/models/branch.model';
import { Floor } from '@core/models/floor.model';
import { AddFloorModalComponent, AddFloorResult } from '../layout-master/components/area-filter-bar/components/add-floor-modal/add-floor-modal.component';
import { AddBuildingModalComponent, AddBuildingResult } from '../layout-master/components/area-filter-bar/components/add-building-modal/add-building-modal.component';
import { EditFloorModalComponent, EditFloorResult } from '../layout-master/components/area-filter-bar/components/edit-floor-modal/edit-floor-modal.component';
import { EditBuildingModalComponent, EditBuildingResult } from '../layout-master/components/area-filter-bar/components/edit-building-modal/edit-building-modal.component';
import { AreaDataService } from '@core/services/area/area-data.service';
import { MOCK_BRANCHES } from '@core/data/branch.mock';


type BuildingSortField = 'code' | 'nameTh' | 'nameEn' | 'isActive';
type FloorSortField = 'floorNumber' | 'buildingId' | 'unitCount' | 'isActive';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-layout-inquiry',
  imports: [CommonModule, FormsModule, SelectModule, AddFloorModalComponent, AddBuildingModalComponent, EditFloorModalComponent, EditBuildingModalComponent],
  templateUrl: './layout-inquiry.component.html',
  styleUrl: './layout-inquiry.component.css',
  standalone: true,
})
export class LayoutInquiryComponent {
  private areaDataService = inject(AreaDataService);

  selectedTab = signal<'buildings' | 'floors'>('buildings');
  selectedBranchId = signal<string>('');
  selectedBuildingId = signal<string>('');
  branches = signal<Branch[]>(MOCK_BRANCHES);

  readonly buildings = this.areaDataService.buildings;

  readonly allFloors = computed(() =>
    this.areaDataService.buildings().flatMap((b) => b.floors),
  );

  buildingSortField = signal<BuildingSortField | null>(null);
  buildingSortDirection = signal<SortDirection>(null);

  floorSortField = signal<FloorSortField | null>(null);
  floorSortDirection = signal<SortDirection>(null);

  addFloorModal = viewChild<AddFloorModalComponent>('addFloorModal');
  addBuildingModal = viewChild<AddBuildingModalComponent>('addBuildingModal');
  editFloorModal = viewChild<EditFloorModalComponent>('editFloorModal');
  editBuildingModal = viewChild<EditBuildingModalComponent>('editBuildingModal');


  filteredBuildings = computed(() => {
    const branchId = this.selectedBranchId();
    if (!branchId) {
      const active = this.buildings().filter((b) => b.isActive);
      const inactive = this.buildings().filter((b) => !b.isActive);
      return [...active, ...inactive];
    }
    return this.buildings().filter((b) => b.branchId === branchId && b.isActive);
  });


  sortedBuildings = computed(() => {
    const field = this.buildingSortField();
    const direction = this.buildingSortDirection();
    const branchId = this.selectedBranchId();
    const list = this.filteredBuildings();

    if (!field || !direction) {
      return list;
    }

    const sorted = [...list].sort((a, b) => {
      let aVal: any = (a as any)[field];
      let bVal: any = (b as any)[field];

      if (typeof aVal === 'boolean') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    if (!branchId) {
      const active = sorted.filter((b) => b.isActive);
      const inactive = sorted.filter((b) => !b.isActive);
      return [...active, ...inactive];
    }

    return sorted;
  });

  filteredFloors = computed(() => {
    const branchId = this.selectedBranchId();
    const buildingId = this.selectedBuildingId();
    const field = this.floorSortField();
    const direction = this.floorSortDirection();

    const buildingIds = this.buildings()
      .filter((b) => !branchId || b.branchId === branchId)
      .map((b) => b.id);

    let filtered = this.allFloors().filter((f) => buildingIds.includes(f.buildingId));

    if (buildingId) {
      filtered = filtered.filter((f) => f.buildingId === buildingId);
    }

    if (field && direction) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[field];
        let bVal: any = b[field];

        if (field === 'floorNumber' || field === 'unitCount') {
          aVal = Number(aVal ?? 0);
          bVal = Number(bVal ?? 0);
        } else if (field === 'isActive') {
          aVal = aVal ? 1 : 0;
          bVal = bVal ? 1 : 0;
        } else {
          aVal = this.getBuildingName(aVal).toLowerCase();
          bVal = this.getBuildingName(bVal).toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Always keep inactive floors at the bottom
    const active = filtered.filter((f) => f.isActive !== false);
    const inactive = filtered.filter((f) => f.isActive === false);
    return [...active, ...inactive];
  });

  constructor() {
    if (MOCK_BRANCHES.length > 0) {
      this.selectedBranchId.set(MOCK_BRANCHES[0].id);
    }
  }

  setTab(tab: 'buildings' | 'floors'): void {
    this.selectedTab.set(tab);
  }

  onBranchChange(branchId: string): void {
    this.selectedBranchId.set(branchId);
    this.selectedBuildingId.set('');
  }

  onBuildingChange(buildingId: string): void {
    this.selectedBuildingId.set(buildingId);
  }

  // ── Building Sort ──────────────────────────────────────────
  sortBuildingsBy(field: BuildingSortField): void {
    const current = this.buildingSortField();
    const dir = this.buildingSortDirection();

    if (current === field) {
      if (dir === null) this.buildingSortDirection.set('asc');
      else if (dir === 'asc') this.buildingSortDirection.set('desc');
      else {
        this.buildingSortDirection.set(null);
        this.buildingSortField.set(null);
      }
    } else {
      this.buildingSortField.set(field);
      this.buildingSortDirection.set('asc');
    }
  }

  getBuildingSortIcon(field: BuildingSortField): string {
    if (this.buildingSortField() !== field) return 'pi-sort-alt';
    return this.buildingSortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt'
      : 'pi-sort-amount-down';
  }

  // ── Floor Sort ─────────────────────────────────────────────
  sortFloorsBy(field: FloorSortField): void {
    const current = this.floorSortField();
    const dir = this.floorSortDirection();

    if (current === field) {
      if (dir === null) this.floorSortDirection.set('asc');
      else if (dir === 'asc') this.floorSortDirection.set('desc');
      else {
        this.floorSortDirection.set(null);
        this.floorSortField.set(null);
      }
    } else {
      this.floorSortField.set(field);
      this.floorSortDirection.set('asc');
    }
  }

  getFloorSortIcon(field: FloorSortField): string {
    if (this.floorSortField() !== field) return 'pi-sort-alt';
    return this.floorSortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt'
      : 'pi-sort-amount-down';
  }

  // ── Floor Order Controls ────────────────────────────────────
  private swapFloorsByIds(idA: string, idB: string): void {
    const buildings = this.areaDataService.buildings();
    const building = buildings.find((b) => b.floors.some((f) => f.id === idA));
    if (!building) return;

    const floors = [...building.floors];
    const idxA = floors.findIndex((f) => f.id === idA);
    const idxB = floors.findIndex((f) => f.id === idB);
    if (idxA === -1 || idxB === -1) return;

    [floors[idxA], floors[idxB]] = [floors[idxB], floors[idxA]];

    this.areaDataService.reorderFloors(building.id, floors);
  }

  moveFloorUp(index: number): void {
    if (index === 0) return;
    const floors = this.filteredFloors();
    this.swapFloorsByIds(floors[index].id, floors[index - 1].id);
  }

  moveFloorDown(index: number): void {
    const floors = this.filteredFloors();
    if (index === floors.length - 1) return;
    this.swapFloorsByIds(floors[index].id, floors[index + 1].id);
  }

  moveFloorToTop(index: number): void {
    if (index === 0) return;
    const ids = this.filteredFloors().map((f) => f.id);
    for (let i = index; i > 0; i--) {
      this.swapFloorsByIds(ids[i], ids[i - 1]);
      [ids[i], ids[i - 1]] = [ids[i - 1], ids[i]];
    }
  }

  moveFloorToBottom(index: number): void {
    const ids = this.filteredFloors().map((f) => f.id);
    const last = ids.length - 1;
    if (index === last) return;
    for (let i = index; i < last; i++) {
      this.swapFloorsByIds(ids[i], ids[i + 1]);
      [ids[i], ids[i + 1]] = [ids[i + 1], ids[i]];
    }
  }

  // ── Building Actions ────────────────────────────────────────
  onAddBuilding(): void {
    this.addBuildingModal()?.open();
  }

  onBuildingCreated(result: AddBuildingResult): void {
    this.areaDataService.addBuilding(result.building);
  }

  onAddBuildingModalClosed(): void {}

  toggleBuildingActive(buildingId: string): void {
    this.areaDataService.toggleBuildingActive(buildingId);
  }

  onEditBuilding(building: Building): void {
    this.editBuildingModal()?.open(building);
  }

  onBuildingUpdated(result: EditBuildingResult): void {
    this.areaDataService.updateBuilding(result.building);
  }

  onEditBuildingModalClosed(): void {}

  // ── Floor Actions ───────────────────────────────────────────
  onAddFloor(): void {
    let buildingId = this.selectedBuildingId();
    if (!buildingId && this.filteredBuildings().length > 0) {
      buildingId = this.filteredBuildings()[0].id;
    }

    if (buildingId) {
      const existingFloorNumbers = this.allFloors()
        .filter((f) => f.buildingId === buildingId)
        .map((f) => f.floorNumber);
      this.addFloorModal()?.open(buildingId, existingFloorNumbers);
    }
  }

  onFloorCreated(result: AddFloorResult): void {
    this.areaDataService.addFloor(result.floor);
  }

  onAddFloorModalClosed(): void {}

  onEditFloor(floor: Floor): void {
    this.editFloorModal()?.open(floor);
  }

  onFloorUpdated(result: EditFloorResult): void {
    this.areaDataService.updateFloor(result.floor);
  }

  onEditFloorModalClosed(): void {}

  toggleFloorActive(floorId: string): void {
    this.areaDataService.toggleFloorActive(floorId);
  }

  getBuildingName(buildingId: string): string {
    const building = this.buildings().find((b) => b.id === buildingId);
    return building?.nameTh || 'Unknown Building';
  }
}
