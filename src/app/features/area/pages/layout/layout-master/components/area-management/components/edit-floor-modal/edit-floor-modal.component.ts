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
  floorId: string;
  positions: { [areaId: string]: { x: number; y: number } };
  activeStates: { [areaId: string]: boolean };
  floorPlanImage?: string;
}

@Component({
  selector: 'app-edit-floor-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    EditableFloorPlanComponent,
    MarkerListPanelComponent,
    AddAreaWizardComponent
  ],
  templateUrl: './edit-floor-modal.component.html',
  styleUrl: './edit-floor-modal.component.css'
})
export class EditFloorModalComponent {
  visible = input.required<boolean>();
  currentFloor = input<Floor | null>(null);
  areas = input<Area[]>([]);

  closed = output<void>();
  saved = output<DraftChanges>();

  editableAreas = signal<Area[]>([]);
  selectedAreaId = signal<string | null>(null);
  showCloseWarning = false;
  showAddAreaWizard = signal<boolean>(false);

  markerListPanel = viewChild<MarkerListPanelComponent>('markerListPanel');

  private originalAreas: Area[] = [];
  private draftKey = '';

  activeAreas = computed(() =>
    this.editableAreas().filter(a => a.isActive)
  );

  inactiveAreas = computed(() =>
    this.editableAreas().filter(a => !a.isActive)
  );

  hasChanges = computed(() => {
    return JSON.stringify(this.getChanges()) !== JSON.stringify({});
  });

  hasDraftChanges = signal<boolean>(false);

  constructor() {
    effect(() => {
      const floor = this.currentFloor();
      const areas = this.areas();

      if (floor && areas.length > 0) {
        this.draftKey = `floor-edit-draft-${floor.id}`;
        this.loadDraft();
      }
    });
  }

  private loadDraft(): void {
    const draft = localStorage.getItem(this.draftKey);
    if (draft) {
      try {
        const draftData: DraftChanges = JSON.parse(draft);
        const areasWithDraft = this.areas().map(area => {
          const draftPosition = draftData.positions[area.id];
          const draftActive = draftData.activeStates[area.id];

          return {
            ...area,
            position: draftPosition || area.position,
            isActive: draftActive !== undefined ? draftActive : area.isActive
          };
        });

        this.editableAreas.set(areasWithDraft);
        this.originalAreas = JSON.parse(JSON.stringify(this.areas()));
        this.hasDraftChanges.set(true);
      } catch (e) {
        console.error('Failed to load draft:', e);
        this.initializeEditableAreas();
      }
    } else {
      this.initializeEditableAreas();
    }
  }

  private initializeEditableAreas(): void {
    this.editableAreas.set(JSON.parse(JSON.stringify(this.areas())));
    this.originalAreas = JSON.parse(JSON.stringify(this.areas()));
  }

  private saveDraft(): void {
    const changes = this.getChanges();
    if (Object.keys(changes.positions).length > 0 || Object.keys(changes.activeStates).length > 0) {
      localStorage.setItem(this.draftKey, JSON.stringify(changes));
      this.hasDraftChanges.set(true);
    }
  }

  private clearDraft(): void {
    localStorage.removeItem(this.draftKey);
    this.hasDraftChanges.set(false);
  }

  private getChanges(): DraftChanges {
    const floor = this.currentFloor();
    if (!floor) return { floorId: '', positions: {}, activeStates: {} };

    const positions: { [key: string]: { x: number; y: number } } = {};
    const activeStates: { [key: string]: boolean } = {};

    this.editableAreas().forEach(area => {
      const original = this.originalAreas.find(a => a.id === area.id);
      if (!original) return;

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
      activeStates
    };
  }

  onMarkerDragged(event: MarkerDragEvent): void {
    const areas = this.editableAreas();
    const index = areas.findIndex(a => a.id === event.areaId);

    if (index !== -1) {
      areas[index].position = event.position;
      this.editableAreas.set([...areas]);
      this.saveDraft();
    }
  }

  onMarkerClicked(areaId: string): void {
    const current = this.selectedAreaId();
    this.selectedAreaId.set(current === areaId ? null : areaId);
  }

  onAreaListClick(areaId: string): void {
    this.selectedAreaId.set(areaId);
  }

  onDragAreaToMap(areaId: string): void {
    const areas = this.editableAreas();
    const area = areas.find(a => a.id === areaId);

    if (!area) return;

    // Check if already active and has marker on map
    if (area.isActive) {
      // Already on map - just select it
      this.selectedAreaId.set(areaId);
      console.log('Area already on map, selected:', areaId);
      return;
    }

    // Calculate status when activating
    const newStatus = this.calculateStatusOnActivation(area);

    const index = areas.findIndex(a => a.id === areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status = newStatus;
      this.editableAreas.set([...areas]);
      this.saveDraft();
      console.log(`Area ${area.roomNumber} activated with status: ${newStatus}`);
    }
  }

  onDragAreaToInactive(areaId: string): void {
    const areas = this.editableAreas();
    const index = areas.findIndex(a => a.id === areaId);

    if (index !== -1) {
      areas[index].isActive = false;
      this.editableAreas.set([...areas]);
      this.saveDraft();

      // Deselect if this was selected
      if (this.selectedAreaId() === areaId) {
        this.selectedAreaId.set(null);
      }
    }
  }

  private calculateStatusOnActivation(area: Area): AreaStatus {
    // Has tenant with valid lease
    if (area.currentTenant) {
      const leaseEnd = new Date(area.currentTenant.leaseEnd);
      const now = new Date();

      // Check if lease is still valid
      if (leaseEnd > now) {
        return 'leased';
      }
    }

    // Check if has quotation (you'd need to add this field to Area model)
    // For now, default logic:

    // If has monthlyRent set but no tenant, might be ready for rent
    if (area.monthlyRent && area.monthlyRent > 0) {
      return 'vacant';
    }

    // Not ready yet
    return 'unallocated';
  }

  onAreaActivated(areaId: string): void {
    // This is called when dragging from inactive panel to active panel
    // Place at visual center (50%, 50%)
    const areas = this.editableAreas();
    const area = areas.find(a => a.id === areaId);

    if (!area) return;

    // Calculate status when activating
    const newStatus = this.calculateStatusOnActivation(area);

    const index = areas.findIndex(a => a.id === areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status = newStatus;
      areas[index].position = { x: 50, y: 50 }; // Center of view
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(areaId);
      this.saveDraft();
      console.log(`Area ${area.roomNumber} activated at center with status: ${newStatus}`);
    }
  }

  onAreaDroppedOnMap(event: { areaId: string; position: { x: number; y: number } }): void {
    const areas = this.editableAreas();
    const area = areas.find(a => a.id === event.areaId);

    if (!area) return;

    // Check if already active
    if (area.isActive) {
      // Already on map - just update position and select
      const index = areas.findIndex(a => a.id === event.areaId);
      if (index !== -1) {
        areas[index].position = event.position;
        this.editableAreas.set([...areas]);
        this.selectedAreaId.set(event.areaId);
        this.saveDraft();
        console.log(`Area ${area.roomNumber} position updated`);
      }
      return;
    }

    // Was inactive - activate it with calculated status
    const newStatus = this.calculateStatusOnActivation(area);

    const index = areas.findIndex(a => a.id === event.areaId);
    if (index !== -1) {
      areas[index].isActive = true;
      areas[index].status = newStatus;
      areas[index].position = event.position;
      this.editableAreas.set([...areas]);
      this.selectedAreaId.set(event.areaId);
      this.saveDraft();
      console.log(`Area ${area.roomNumber} activated at dropped position with status: ${newStatus}`);
    }
  }

  onCursorOverMap(isOverMap: boolean): void {
    const panel = this.markerListPanel();
    if (panel) {
      panel.setIsOverMap(isOverMap);
    }
  }

  onMarkerDragStarted(areaId: string): void {
    const panel = this.markerListPanel();
    if (panel) {
      panel.setDraggingFromMap(true);
    }
  }

  onMarkerDragEnded(): void {
    const panel = this.markerListPanel();
    if (panel) {
      panel.setDraggingFromMap(false);
    }
  }

  onMarkerDraggedOutside(areaId: string): void {
    // Marker was dragged outside map and released - deactivate it
    this.onDragAreaToInactive(areaId);
  }

  onUploadPlan(file: File): void {
    // TODO: Implement floor plan upload
    console.log('Upload plan:', file.name);
  }

  onAddAreaClicked(): void {
    this.showAddAreaWizard.set(true);
  }

  onAddAreaWizardClose(newArea?: Area): void {
    this.showAddAreaWizard.set(false);

    if (newArea) {
      const areas = this.editableAreas();
      areas.push(newArea);
      this.editableAreas.set([...areas]);
      this.saveDraft();

      console.log('Area added as draft:', newArea.roomNumber);
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
    this.closed.emit();
  }

  onClose(): void {
    this.saveDraft();
    console.log('Draft saved');
    this.closed.emit();
  }

  onSave(): void {
    const changes = this.getChanges();
    this.saved.emit(changes);
    this.clearDraft();

    console.log('Changes saved successfully');

    this.closed.emit();
  }

  onModalHide(): void {
    if (!this.showCloseWarning) {
      this.onClose();
    }
  }
}
