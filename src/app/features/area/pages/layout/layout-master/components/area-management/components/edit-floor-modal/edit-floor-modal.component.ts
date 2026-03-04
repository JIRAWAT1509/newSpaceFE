/*edit-floor-modal.component.ts */

import { Component, input, output, signal, computed, effect, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { EditableFloorPlanComponent } from './../editable-floor-plan/editable-floor-plan.component';
import { MarkerListPanelComponent } from './../marker-list-panel/marker-list-panel.component';
import { AddAreaWizardComponent } from './../add-area-wizard/add-area-wizard.component';
import { Area, AreaStatus } from '@core/models/area.model';
import { Floor } from '@core/models/floor.model';
import { MarkerDragEvent } from '../area-marker/area-marker.component';

interface DraftChanges {
  floorId:        string;
  positions:      { [areaId: string]: { x: number; y: number } };
  activeStates:   { [areaId: string]: boolean };
  floorPlanImage?: string;
  newAreas:       Area[];
}

@Component({
  selector: 'app-edit-floor-modal',
  standalone: true,
  imports: [
    CommonModule, DialogModule,
    EditableFloorPlanComponent, MarkerListPanelComponent, AddAreaWizardComponent
  ],
  templateUrl: './edit-floor-modal.component.html',
  styleUrl: './edit-floor-modal.component.css'
})
export class EditFloorModalComponent {
  visible         = signal<boolean>(false);
  currentFloor    = input<Floor | null>(null);
  areas           = input<Area[]>([]);
  parentDraftImage = input<string | null>(null);  // ✅ รับจาก floor-plan

  closed = output<void>();
  saved  = output<DraftChanges>();

  editableAreas     = signal<Area[]>([]);
  selectedAreaId    = signal<string | null>(null);
  showCloseWarning  = false;
  showAddAreaWizard = signal<boolean>(false);
  hasDraftChanges   = signal<boolean>(false);

  draftFloorPlanImage = signal<string | null>(null);  // ✅ local upload

  // ✅ template ใช้ตัวนี้
  effectiveDraftImage = computed(() =>
    this.draftFloorPlanImage() ?? this.parentDraftImage() ?? null
  );

  markerListPanel = viewChild<MarkerListPanelComponent>('markerListPanel');

  private originalAreas:   Area[] = [];
  private newlyAddedAreas: Area[] = [];

  open(): void {
    this.initializeEditableAreas();
    this.visible.set(true);
  }

  activeAreas   = computed(() => this.editableAreas().filter(a => a.isActive));
  inactiveAreas = computed(() => this.editableAreas().filter(a => !a.isActive));

  hasChanges = computed(() => {
    const changes = this.getChanges();
    return Object.keys(changes.positions).length > 0
        || Object.keys(changes.activeStates).length > 0
        || changes.newAreas.length > 0
        || !!this.draftFloorPlanImage();
  });

  constructor() {
    effect(() => {
      const areas = this.areas();
      if (areas.length > 0 && !this.visible()) {
        this.initializeEditableAreas();
      }
    });
  }

  private initializeEditableAreas(): void {
    this.editableAreas.set(JSON.parse(JSON.stringify(this.areas())));
    this.originalAreas      = JSON.parse(JSON.stringify(this.areas()));
    this.newlyAddedAreas    = [];
    this.draftFloorPlanImage.set(null);  // ✅ reset draft image
    this.hasDraftChanges.set(false);
  }

  private getChanges(): DraftChanges {
    const floor = this.currentFloor();
    if (!floor) return { floorId: '', positions: {}, activeStates: {}, newAreas: [] };

    const positions:    { [key: string]: { x: number; y: number } } = {};
    const activeStates: { [key: string]: boolean } = {};

    this.editableAreas().forEach(area => {
      const original = this.originalAreas.find(a => a.id === area.id);
      if (!original) return; // ข้าม new areas

      if (area.position.x !== original.position.x || area.position.y !== original.position.y) {
        positions[area.id] = { x: area.position.x, y: area.position.y };
      }
      if (area.isActive !== original.isActive) {
        activeStates[area.id] = area.isActive;
      }
    });

    return {
      floorId: floor.id,
      positions,
      activeStates,
      floorPlanImage: this.draftFloorPlanImage() ?? undefined,  // ✅
      newAreas: [...this.newlyAddedAreas]
    };
  }

  onMarkerDragged(event: MarkerDragEvent): void {
    const areas = this.editableAreas();
    const index = areas.findIndex(a => a.id === event.areaId);
    if (index !== -1) {
      areas[index].position = event.position;
      this.editableAreas.set([...areas]);
      this.hasDraftChanges.set(true);
    }
  }

  onMarkerClicked(areaId: string): void {
    this.selectedAreaId.set(this.selectedAreaId() === areaId ? null : areaId);
  }

  onAreaListClick(areaId: string): void {
    this.selectedAreaId.set(areaId);
  }

  onDragAreaToMap(areaId: string): void {
    const areas = this.editableAreas();
    const area  = areas.find(a => a.id === areaId);
    if (!area) return;
    if (area.isActive) { this.selectedAreaId.set(areaId); return; }

    const index = areas.findIndex(a => a.id === areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status   = this.calculateStatusOnActivation(area);
      this.editableAreas.set([...areas]);
      this.hasDraftChanges.set(true);
    }
  }

  onDragAreaToInactive(areaId: string): void {
    const areas = this.editableAreas();
    const index = areas.findIndex(a => a.id === areaId);
    if (index !== -1) {
      areas[index].isActive = false;
      this.editableAreas.set([...areas]);
      this.hasDraftChanges.set(true);
      if (this.selectedAreaId() === areaId) this.selectedAreaId.set(null);
    }
  }

  private calculateStatusOnActivation(area: Area): AreaStatus {
    if (area.currentTenant && new Date(area.currentTenant.leaseEnd) > new Date()) {
      return 'leased';
    }
    if (area.monthlyRent && area.monthlyRent > 0) return 'vacant';
    return 'unallocated';
  }

  onAreaActivated(areaId: string): void {
    const areas = this.editableAreas();
    const area  = areas.find(a => a.id === areaId);
    if (!area) return;
    const index = areas.findIndex(a => a.id === areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status   = this.calculateStatusOnActivation(area);
      areas[index].position = { x: 50, y: 50 };
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(areaId);
      this.hasDraftChanges.set(true);
    }
  }

  onAreaDroppedOnMap(event: { areaId: string; position: { x: number; y: number } }): void {
    const areas = this.editableAreas();
    const area  = areas.find(a => a.id === event.areaId);
    if (!area) return;
    const index = areas.findIndex(a => a.id === event.areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status   = area.isActive ? area.status : this.calculateStatusOnActivation(area);
      areas[index].position = event.position;
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(event.areaId);
      this.hasDraftChanges.set(true);
    }
  }

  onCursorOverMap(isOverMap: boolean): void    { this.markerListPanel()?.setIsOverMap(isOverMap); }
  onMarkerDragStarted(areaId: string): void    { this.markerListPanel()?.setDraggingFromMap(true); }
  onMarkerDragEnded(): void                    { this.markerListPanel()?.setDraggingFromMap(false); }
  onMarkerDraggedOutside(areaId: string): void { this.onDragAreaToInactive(areaId); }

  // ✅ อ่านไฟล์ภาพและ set เป็น base64
  onUploadPlan(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.draftFloorPlanImage.set(result);
      this.hasDraftChanges.set(true);
    };
    reader.readAsDataURL(file);
  }

  onAddAreaClicked(): void {
    this.showAddAreaWizard.set(true);
  }

  onAddAreaWizardClose(newArea?: Area): void {
    this.showAddAreaWizard.set(false);
    if (newArea) {
      const floor = this.currentFloor();
      if (floor) {
        const latestVersion = floor.floorPlanVersions.find(v => v.validUntil === null)
          ?? floor.floorPlanVersions[0];
        newArea.floorPlanVersionId = latestVersion?.id ?? '';
        newArea.floorId = floor.id;
      }
      const areas = this.editableAreas();
      areas.push(newArea);
      this.editableAreas.set([...areas]);
      this.newlyAddedAreas.push({ ...newArea });
      this.hasDraftChanges.set(true);
    }
  }

  onCancel(): void {
    if (this.hasChanges()) {
      this.showCloseWarning = true;
    } else {
      this.confirmCancel();
    }
  }

  confirmCancel(): void {
    this.showCloseWarning = false;
    this.initializeEditableAreas();
    this.visible.set(false);
    this.closed.emit();
  }

  onClose(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  onSave(): void {
    const changes = this.getChanges();

    // sync position ล่าสุดของ newAreas
    changes.newAreas = changes.newAreas.map(newArea => {
      const current = this.editableAreas().find(a => a.id === newArea.id);
      return current ? { ...current } : newArea;
    });

    this.saved.emit(changes);
    this.initializeEditableAreas();
    this.visible.set(false);
    this.closed.emit();
  }

  onModalHide(): void {
    if (!this.showCloseWarning) this.onClose();
  }
}
