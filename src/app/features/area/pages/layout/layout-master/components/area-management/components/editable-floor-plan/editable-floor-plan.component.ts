import { Component, input, output, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaMarkerComponent, MarkerDragEvent } from '../area-marker/area-marker.component';
import { Area } from '@core/models/area.model';
import { Floor } from '@core/models/floor.model';

@Component({
  selector: 'app-editable-floor-plan',
  standalone: true,
  imports: [CommonModule, AreaMarkerComponent],
  templateUrl: './editable-floor-plan.component.html',
  styleUrl: './editable-floor-plan.component.css'
})
export class EditableFloorPlanComponent {
  floor = input<Floor | null>(null);
  areas = input<Area[]>([]);
  selectedAreaId = input<string | null>(null);

  markerDragged = output<MarkerDragEvent>();
  markerClicked = output<string>();
  uploadPlan = output<File>();
  areaDroppedOnMap = output<{ areaId: string; position: { x: number; y: number } }>();
  cursorOverMap = output<boolean>(); // Notify when cursor enters/leaves map during drag
  markerDragStarted = output<string>(); // Notify when marker drag starts
  markerDragEnded = output<void>(); // Notify when marker drag ends
  markerDraggedOutside = output<string>(); // Notify when marker dragged outside map

  floorImage = viewChild<ElementRef>('floorImage');
  fileInput = viewChild<ElementRef>('fileInput');
  floorPlanContainer = viewChild<ElementRef>('floorPlanContainer');

  zoomLevel = signal<number>(1.0);
  panOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drag-drop state
  isDragOver = signal<boolean>(false);
  ghostMarkerPosition = signal<{ x: number; y: number } | null>(null);
  draggedAreaId = signal<string | null>(null);

  // Computed: only active areas should show markers
  activeAreas = computed(() => this.areas().filter(a => a.isActive));

  currentFloorImage = computed<string>(() => {
    const floorData = this.floor();
    if (!floorData?.floorPlanVersions || floorData.floorPlanVersions.length === 0) {
      return '';
    }

    const currentVersion = floorData.floorPlanVersions.find(v => v.validUntil === null);
    return currentVersion?.planImage || floorData.floorPlanVersions[0].planImage;
  });

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  onZoomIn(): void {
    const newZoom = Math.min(this.zoomLevel() + 0.1, 3.0);
    this.zoomLevel.set(newZoom);
  }

  onZoomOut(): void {
    const newZoom = Math.max(this.zoomLevel() - 0.1, 0.5);
    this.zoomLevel.set(newZoom);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3.0, this.zoomLevel() + delta));
    this.zoomLevel.set(newZoom);
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0 && !(event.target as HTMLElement).closest('.area-marker')) {
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

  onMarkerDragged(event: MarkerDragEvent): void {
    this.markerDragged.emit(event);
  }

  onMarkerClicked(areaId: string): void {
    this.markerClicked.emit(areaId);
  }

  onMarkerDragStart(areaId: string): void {
    this.markerDragStarted.emit(areaId);
  }

  onMarkerDragEnd(): void {
    this.markerDragEnded.emit();
  }

  onMarkerDraggedOutside(areaId: string): void {
    this.markerDraggedOutside.emit(areaId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, or SVG)');
        return;
      }

      // Check if dimensions differ significantly (simple approach: check file size as proxy)
      // If we want precise dimension check, we'd need to load image and compare
      this.uploadPlan.emit(file);

      // Reset input
      input.value = '';
    }
  }

  // ========== Drag-Drop Handlers ==========

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    this.isDragOver.set(true);
    this.cursorOverMap.emit(true); // Cursor entered map
    this.updateGhostMarkerPosition(event);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const target = event.target as HTMLElement;

    // Check if really leaving the drop zone
    if (!target.closest('.floor-plan-container')) {
      this.isDragOver.set(false);
      this.ghostMarkerPosition.set(null);
      this.cursorOverMap.emit(false); // Cursor left map
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragOver.set(false);
    this.ghostMarkerPosition.set(null);

    if (!event.dataTransfer) return;

    const areaId = event.dataTransfer.getData('areaId');

    if (!areaId) return;

    // Calculate drop position
    const position = this.calculateDropPosition(event);

    if (position) {
      this.areaDroppedOnMap.emit({ areaId, position });
    }
  }

  private updateGhostMarkerPosition(event: DragEvent): void {
    const position = this.calculateDropPosition(event);
    if (position) {
      this.ghostMarkerPosition.set(position);

      const areaId = event.dataTransfer?.getData('areaId');
      if (areaId) {
        this.draggedAreaId.set(areaId);
      }
    }
  }

  private calculateDropPosition(event: DragEvent): { x: number; y: number } | null {
    // Get the floor-plan-content element (the transformed container)
    const floorPlanContent = (event.currentTarget as HTMLElement).querySelector('.floor-plan-content') as HTMLElement;
    if (!floorPlanContent) return null;

    const floorImage = this.floorImage();
    if (!floorImage) return null;

    const imageEl = floorImage.nativeElement as HTMLImageElement;
    const imageRect = imageEl.getBoundingClientRect();

    // Get exact cursor position relative to the actual image
    const mouseX = event.clientX - imageRect.left;
    const mouseY = event.clientY - imageRect.top;

    // Convert to percentage based on actual image dimensions
    const percentX = (mouseX / imageRect.width) * 100;
    const percentY = (mouseY / imageRect.height) * 100;

    // Clamp to 5-95% range
    const clampedX = Math.max(5, Math.min(95, percentX));
    const clampedY = Math.max(5, Math.min(95, percentY));

    return { x: clampedX, y: clampedY };
  }

  getGhostMarkerStyle(): any {
    const pos = this.ghostMarkerPosition();
    if (!pos) return { display: 'none' };

    return {
      left: pos.x + '%',
      top: pos.y + '%',
      display: 'block'
    };
  }

  getDraggedArea(): any {
    const areaId = this.draggedAreaId();
    if (!areaId) return null;

    return this.areas().find(a => a.id === areaId);
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'vacant': '#80E08E',
      'leased': '#FFD05F',
      'quotation': '#4CA3FF',
      'unallocated': '#FF6384'
    };
    return statusColors[status] || '#9CA3AF';
  }
}
