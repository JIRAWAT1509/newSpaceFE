/* edit-floor-modal.component.ts */

import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  viewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { EditableFloorPlanComponent } from './../editable-floor-plan/editable-floor-plan.component';
import { MarkerListPanelComponent } from './../marker-list-panel/marker-list-panel.component';
import { AddAreaWizardComponent } from './../add-area-wizard/add-area-wizard.component';
import { Area, AreaStatus } from '@core/models/area.model';
import { Floor } from '@core/models/floor.model';
import { MarkerDragEvent } from '../area-marker/area-marker.component';
import { AreaDataService } from '@core/services/area/area-data.service';

interface DraftChanges {
  floorId: string;
  positions: { [areaId: string]: { x: number; y: number } };
  activeStates: { [areaId: string]: boolean };
  floorPlanImage?: string;
}

// ✅ แยก image ออกจาก draft เพื่อไม่ให้ช้าตอน drag
interface DraftMeta {
  floorId: string;
  positions: { [areaId: string]: { x: number; y: number } };
  activeStates: { [areaId: string]: boolean };
}

@Component({
  selector: 'app-edit-floor-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    EditableFloorPlanComponent,
    MarkerListPanelComponent,
    AddAreaWizardComponent,
  ],
  templateUrl: './edit-floor-modal.component.html',
  styleUrl: './edit-floor-modal.component.css',
})
export class EditFloorModalComponent {
  private areaDataService = inject(AreaDataService);

  visible = signal<boolean>(false);
  currentFloor = input<Floor | null>(null);
  areas = input<Area[]>([]);
  parentDraftImage = input<string | null>(null); // ✅ รับรูป draft จาก parent

  closed = output<void>();
  saved = output<DraftChanges>();

  editableAreas = signal<Area[]>([]);
  selectedAreaId = signal<string | null>(null);
  showCloseWarning = false;
  showAddAreaWizard = signal<boolean>(false);
  hasDraftChanges = signal<boolean>(false);
  localDraftImage = signal<string | null>(null); // ✅ รูปที่ upload ใหม่ใน modal

  markerListPanel = viewChild<MarkerListPanelComponent>('markerListPanel');

  private originalAreas: Area[] = [];
  private draftKey = '';
  private imageKey = ''; // ✅ key แยกสำหรับ image

  activeAreas = computed(() => this.editableAreas().filter((a) => a.isActive));
  inactiveAreas = computed(() =>
    this.editableAreas().filter((a) => !a.isActive),
  );

  // ✅ รูปที่จะแสดงใน modal: ถ้า upload ใหม่ใช้อันนั้น ถ้าไม่มีใช้จาก parent
  effectiveDraftImage = computed<string | null>(
    () => this.localDraftImage() ?? this.parentDraftImage(),
  );

  hasChanges = computed(() => {
    const changes = this.getChanges();
    return (
      Object.keys(changes.positions).length > 0 ||
      Object.keys(changes.activeStates).length > 0 ||
      !!changes.floorPlanImage
    );
  });

  constructor() {
    effect(() => {
      const floor = this.currentFloor();
      const areas = this.areas();
      if (floor && areas.length > 0) {
        this.draftKey = `floor-edit-draft-${floor.id}`;
        this.imageKey = `floor-edit-image-${floor.id}`; // ✅
        this.loadDraft();
      }
    });
  }

  open(): void {
    this.initializeEditableAreas();
    const floor = this.currentFloor();
    if (floor) {
      this.draftKey = `floor-edit-draft-${floor.id}`;
      this.imageKey = `floor-edit-image-${floor.id}`; // ✅
      this.loadDraft();
    }
    this.visible.set(true);
  }

  private loadDraft(): void {
    const draft = localStorage.getItem(this.draftKey);

    // ✅ โหลด image แยก key ไม่ต้อง parse ทั้งก้อน
    const savedImage = localStorage.getItem(this.imageKey);
    if (savedImage) {
      this.localDraftImage.set(savedImage);
    }

    if (draft) {
      try {
        const draftData: DraftMeta = JSON.parse(draft);
        const areasWithDraft = this.areas().map((area) => ({
          ...area,
          position: draftData.positions[area.id] || area.position,
          isActive:
            draftData.activeStates[area.id] !== undefined
              ? draftData.activeStates[area.id]
              : area.isActive,
        }));
        this.editableAreas.set(areasWithDraft);
        this.originalAreas = JSON.parse(JSON.stringify(this.areas()));
        this.hasDraftChanges.set(true);
      } catch (e) {
        this.initializeEditableAreas();
      }
    } else {
      this.initializeEditableAreas();
    }
  }

  private initializeEditableAreas(): void {
    this.editableAreas.set(JSON.parse(JSON.stringify(this.areas())));
    this.originalAreas = JSON.parse(JSON.stringify(this.areas()));
    this.localDraftImage.set(null);
    this.hasDraftChanges.set(false);
  }

  // ✅ saveDraft บันทึกเฉพาะ positions/activeStates (ไม่รวม image → ไม่ช้า)
  private saveDraft(): void {
    const changes = this.getMeta();
    if (
      Object.keys(changes.positions).length > 0 ||
      Object.keys(changes.activeStates).length > 0
    ) {
      localStorage.setItem(this.draftKey, JSON.stringify(changes));
      this.hasDraftChanges.set(true);
    }
  }

  // ✅ บันทึก image แยก (เรียกเฉพาะตอน upload ไม่ใช่ตอน drag)
  private saveImageDraft(base64: string): void {
    try {
      localStorage.setItem(this.imageKey, base64);
      this.hasDraftChanges.set(true);
    } catch (e) {
      // quota exceeded → เก็บใน memory อย่างเดียว
      console.warn('localStorage quota exceeded, image stored in memory only');
    }
  }

  private clearDraft(): void {
    localStorage.removeItem(this.draftKey);
    localStorage.removeItem(this.imageKey); // ✅ clear image key ด้วย
    this.hasDraftChanges.set(false);
    this.localDraftImage.set(null);
  }

  // ✅ getMeta: เฉพาะ positions/activeStates (เร็ว)
  private getMeta(): DraftMeta {
    const floor = this.currentFloor();
    if (!floor) return { floorId: '', positions: {}, activeStates: {} };

    const positions: { [key: string]: { x: number; y: number } } = {};
    const activeStates: { [key: string]: boolean } = {};

    this.editableAreas().forEach((area) => {
      const original = this.originalAreas.find((a) => a.id === area.id);
      if (!original) {
        activeStates[area.id] = area.isActive;
        positions[area.id] = { x: area.position.x, y: area.position.y };
        return;
      }
      if (
        area.position.x !== original.position.x ||
        area.position.y !== original.position.y
      ) {
        positions[area.id] = { x: area.position.x, y: area.position.y };
      }
      if (area.isActive !== original.isActive) {
        activeStates[area.id] = area.isActive;
      }
    });

    return { floorId: floor.id, positions, activeStates };
  }

  private getChanges(): DraftChanges {
    const meta = this.getMeta();
    return {
      ...meta,
      floorPlanImage: this.localDraftImage() ?? undefined,
    };
  }

  private applyChangesToService(): void {
    this.editableAreas().forEach((editedArea) => {
      const original = this.originalAreas.find((a) => a.id === editedArea.id);

      // ✅ Area ใหม่ที่ไม่มีใน original → addArea แทน updateArea
      if (!original) {
        this.areaDataService.addArea({ ...editedArea });
        return;
      }

      const positionChanged =
        editedArea.position.x !== original.position.x ||
        editedArea.position.y !== original.position.y;
      const activeChanged = editedArea.isActive !== original.isActive;

      if (positionChanged || activeChanged) {
        this.areaDataService.updateArea({ ...editedArea });
      }
    });
  }

  onMarkerDragged(event: MarkerDragEvent): void {
    const areas = this.editableAreas();
    const index = areas.findIndex((a) => a.id === event.areaId);
    if (index !== -1) {
      areas[index] = { ...areas[index], position: { ...event.position } };
      this.editableAreas.set([...areas]);
      this.saveDraft(); // ✅ เร็วขึ้นเพราะไม่รวม image
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
    const area = areas.find((a) => a.id === areaId);
    if (!area) return;
    if (area.isActive) {
      this.selectedAreaId.set(areaId);
      return;
    }
    const index = areas.findIndex((a) => a.id === areaId);
    if (index !== -1) {
      areas[index] = {
        ...areas[index],
        isActive: true,
        status: this.calculateStatusOnActivation(area),
      };
      this.editableAreas.set([...areas]);
      this.saveDraft();
    }
  }

  onDragAreaToInactive(areaId: string): void {
    const areas = this.editableAreas();
    const index = areas.findIndex((a) => a.id === areaId);
    if (index !== -1) {
      areas[index] = { ...areas[index], isActive: false };
      this.editableAreas.set([...areas]);
      this.saveDraft();
      if (this.selectedAreaId() === areaId) this.selectedAreaId.set(null);
    }
  }

  private calculateStatusOnActivation(area: Area): AreaStatus {
    if (area.currentTenant) {
      if (new Date(area.currentTenant.leaseEnd) > new Date()) return 'leased';
    }
    if (area.monthlyRent && area.monthlyRent > 0) return 'vacant';
    return 'unallocated';
  }

  onAreaActivated(areaId: string): void {
    const areas = this.editableAreas();
    const area = areas.find((a) => a.id === areaId);
    if (!area) return;
    const index = areas.findIndex((a) => a.id === areaId);
    if (index !== -1) {
      areas[index] = {
        ...areas[index],
        isActive: true,
        status: this.calculateStatusOnActivation(area),
        position: { x: 50, y: 50 },
      };
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(areaId);
      this.saveDraft();
    }
  }

  onAreaDroppedOnMap(event: {
    areaId: string;
    position: { x: number; y: number };
  }): void {
    const areas = this.editableAreas();
    const area = areas.find((a) => a.id === event.areaId);
    if (!area) return;
    const index = areas.findIndex((a) => a.id === event.areaId);
    if (index !== -1) {
      areas[index] = {
        ...areas[index],
        isActive: true,
        status: area.isActive
          ? area.status
          : this.calculateStatusOnActivation(area),
        position: { ...event.position },
      };
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(event.areaId);
      this.saveDraft();
    }
  }

  onCursorOverMap(isOverMap: boolean): void {
    this.markerListPanel()?.setIsOverMap(isOverMap);
  }
  onMarkerDragStarted(areaId: string): void {
    this.markerListPanel()?.setDraggingFromMap(true);
  }
  onMarkerDragEnded(): void {
    this.markerListPanel()?.setDraggingFromMap(false);
  }
  onMarkerDraggedOutside(areaId: string): void {
    this.onDragAreaToInactive(areaId);
  }

  // ✅ บันทึก image แยก key ไม่กระทบ drag performance
  onUploadPlan(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.localDraftImage.set(base64);
      this.saveImageDraft(base64); // ✅ แยก call
    };
    reader.readAsDataURL(file);
  }

  onAddAreaClicked(): void {
    this.showAddAreaWizard.set(true);
  }

  onAddAreaWizardClose(newArea?: Area): void {
    this.showAddAreaWizard.set(false);
    if (newArea) {
      this.editableAreas.set([...this.editableAreas(), newArea]);
      this.saveDraft();
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
    this.clearDraft();
    this.visible.set(false);
    this.closed.emit();
  }

  onClose(): void {
    this.saveDraft();
    this.visible.set(false);
    this.closed.emit();
  }

  onSave(): void {
    this.applyChangesToService();
    const changes = this.getChanges();
    this.saved.emit(changes);
    this.clearDraft();
    this.visible.set(false);
    this.closed.emit();
  }

  onModalHide(): void {
    if (!this.showCloseWarning) {
      this.onClose();
    }
  }
}
