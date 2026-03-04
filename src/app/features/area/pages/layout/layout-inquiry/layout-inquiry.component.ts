/* layout-inquiry.component.ts */

import { Component, signal, computed, viewChild } from '@angular/core';
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

// ── Mock data — imported from shared mock files (single source of truth) ──────
// ⚠️  ห้าม hard-code ข้อมูลใน component โดยตรง ให้แก้ไขที่ไฟล์ mock แทน:
//    - Branches  → @core/data/branch.mock.ts
//    - Buildings → @core/data/building.mock.ts
//    - Floors    → @core/data/floor.mock.ts
import { MOCK_BRANCHES } from '@core/data/branch.mock';
import { MOCK_BUILDINGS } from '@core/data/building.mock';
import { ALL_MOCK_FLOORS } from '@core/data/floor.mock';


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
  selectedTab = signal<'buildings' | 'floors'>('buildings');
  selectedBranchId = signal<string>('');
  selectedBuildingId = signal<string>('');
  branches = signal<Branch[]>(MOCK_BRANCHES);
  buildings = signal<Building[]>(MOCK_BUILDINGS);
  floors = signal<Floor[]>([...ALL_MOCK_FLOORS]);

  // Sorting signals for buildings
  buildingSortField = signal<BuildingSortField | null>(null);
  buildingSortDirection = signal<SortDirection>(null);

  // Sorting signals for floors
  floorSortField = signal<FloorSortField | null>(null);
  floorSortDirection = signal<SortDirection>(null);

  addFloorModal = viewChild<AddFloorModalComponent>('addFloorModal');
  addBuildingModal = viewChild<AddBuildingModalComponent>('addBuildingModal');
  editFloorModal = viewChild<EditFloorModalComponent>('editFloorModal');
  editBuildingModal = viewChild<EditBuildingModalComponent>('editBuildingModal');

  /**
   * filteredBuildings:
   * - branchId === '' (All): แสดงทุก building (รวม inactive) แต่ inactive อยู่ท้ายสุด
   * - branchId มีค่า: แสดงเฉพาะ active ของ branch นั้น
   */
  filteredBuildings = computed(() => {
    const branchId = this.selectedBranchId();
    if (!branchId) {
      // "All" branch: show active first, inactive last
      const active = this.buildings().filter((b) => b.isActive);
      const inactive = this.buildings().filter((b) => !b.isActive);
      return [...active, ...inactive];
    }
    // Specific branch: show only active buildings of that branch
    return this.buildings().filter((b) => b.branchId === branchId && b.isActive);
  });

  /**
   * sortedBuildings: apply sort on top of filteredBuildings,
   * but always keep inactive at bottom when viewing "All"
   */
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

    // When "All" branch: keep inactive at bottom regardless of sort
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

    let filtered = this.floors().filter((f) => buildingIds.includes(f.buildingId));

    if (buildingId) {
      filtered = filtered.filter((f) => f.buildingId === buildingId);
    }

    // Apply floor sort if active
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
          // buildingId → sort by building name
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
  private swapFloors(indexA: number, indexB: number): void {
    const floors = this.filteredFloors();
    const allFloors = [...this.floors()];

    const idxA = allFloors.findIndex((f) => f.id === floors[indexA].id);
    const idxB = allFloors.findIndex((f) => f.id === floors[indexB].id);

    if (idxA !== -1 && idxB !== -1) {
      [allFloors[idxA], allFloors[idxB]] = [allFloors[idxB], allFloors[idxA]];
      this.floors.set(allFloors);
    }
  }

  moveFloorToTop(index: number): void {
    if (index === 0) return;
    for (let i = index; i > 0; i--) {
      this.swapFloors(i, i - 1);
    }
  }

  moveFloorUp(index: number): void {
    if (index === 0) return;
    this.swapFloors(index, index - 1);
  }

  moveFloorDown(index: number): void {
    const last = this.filteredFloors().length - 1;
    if (index === last) return;
    this.swapFloors(index, index + 1);
  }

  moveFloorToBottom(index: number): void {
    const last = this.filteredFloors().length - 1;
    if (index === last) return;
    for (let i = index; i < last; i++) {
      this.swapFloors(i, i + 1);
    }
  }

  // ── Building Actions ────────────────────────────────────────
  onAddBuilding(): void {
    this.addBuildingModal()?.open();
  }

  onBuildingCreated(result: AddBuildingResult): void {
    this.buildings.update((buildings) => [...buildings, result.building]);
  }

  onAddBuildingModalClosed(): void {
    console.log('Add building modal closed');
  }

  toggleBuildingActive(buildingId: string): void {
    this.buildings.update((buildings) =>
      buildings.map((b) => (b.id === buildingId ? { ...b, isActive: !b.isActive } : b))
    );
  }

  toggleFloorActive(floorId: string): void {
    this.floors.update((floors) =>
      floors.map((f) => (f.id === floorId ? { ...f, isActive: !f.isActive } : f))
    );
  }

  onEditBuilding(building: Building): void {
    this.editBuildingModal()?.open(building);
  }

  onBuildingUpdated(result: EditBuildingResult): void {
    this.buildings.update((buildings) =>
      buildings.map((b) => (b.id === result.building.id ? result.building : b))
    );
  }

  onEditBuildingModalClosed(): void {
    console.log('Edit building modal closed');
  }

  // ── Floor Actions ───────────────────────────────────────────
  onAddFloor(): void {
    let buildingId = this.selectedBuildingId();
    if (!buildingId && this.filteredBuildings().length > 0) {
      buildingId = this.filteredBuildings()[0].id;
    }

    if (buildingId) {
      const existingFloorNumbers = this.floors()
        .filter((f) => f.buildingId === buildingId)
        .map((f) => f.floorNumber);
      this.addFloorModal()?.open(buildingId, existingFloorNumbers);
    }
  }

  onFloorCreated(result: AddFloorResult): void {
    this.floors.update((floors) => [...floors, result.floor]);
  }

  onAddFloorModalClosed(): void {
    console.log('Add floor modal closed');
  }

  onEditFloor(floor: Floor): void {
    this.editFloorModal()?.open(floor);
  }

  onFloorUpdated(result: EditFloorResult): void {
    this.floors.update((floors) =>
      floors.map((f) => (f.id === result.floor.id ? result.floor : f))
    );
  }

  onEditFloorModalClosed(): void {
    console.log('Edit floor modal closed');
  }

  getBuildingName(buildingId: string): string {
    const building = this.buildings().find((b) => b.id === buildingId);
    return building?.nameTh || 'Unknown Building';
  }
}
