/* editable-floor-plan.component.ts */

import {
  Component,
  input,
  output,
  signal,
  computed,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AreaMarkerComponent,
  MarkerDragEvent,
} from '../area-marker/area-marker.component';
import { Area } from '@core/models/area.model';
import { Floor } from '@core/models/floor.model';

@Component({
  selector: 'app-editable-floor-plan',
  standalone: true,
  imports: [CommonModule, AreaMarkerComponent],
  templateUrl: './editable-floor-plan.component.html',
  styleUrl: './editable-floor-plan.component.css',
})
export class EditableFloorPlanComponent {
  floor = input<Floor | null>(null);
  activeAreas = input<Area[]>([]);
  selectedAreaId = input<string | null>(null);
  draftFloorPlanImage = input<string | null>(null); // ✅ เพิ่ม

  markerDragged = output<MarkerDragEvent>();
  markerClicked = output<string>();
  uploadPlan = output<File>();
  areaDroppedOnMap = output<{
    areaId: string;
    position: { x: number; y: number };
  }>();
  cursorOverMap = output<boolean>();
  markerDragStarted = output<string>();
  markerDragEnded = output<void>();
  markerDraggedOutside = output<string>();

  floorImage = viewChild<ElementRef>('floorImage');
  fileInput = viewChild<ElementRef>('fileInput');
  floorPlanContainer = viewChild<ElementRef>('floorPlanContainer');

  zoomLevel = signal<number>(1.0);
  panOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  isDragOver = signal<boolean>(false);
  ghostMarkerPosition = signal<{ x: number; y: number } | null>(null);
  draggedAreaId = signal<string | null>(null);

  // ✅ เช็ค draftFloorPlanImage ก่อน ถ้ามีให้ใช้เลย
  currentFloorImage = computed<string>(() => {
    const draft = this.draftFloorPlanImage();
    if (draft) return draft;

    const floorData = this.floor();
    if (!floorData?.floorPlanVersions?.length) return '';
    const currentVersion = floorData.floorPlanVersions.find(
      (v) => v.validUntil === null,
    );
    return (
      currentVersion?.planImage || floorData.floorPlanVersions[0].planImage
    );
  });

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  onZoomIn(): void {
    this.zoomLevel.set(Math.min(this.zoomLevel() + 0.1, 3.0));
  }

  onZoomOut(): void {
    this.zoomLevel.set(Math.max(this.zoomLevel() - 0.1, 0.5));
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.zoomLevel.set(Math.max(0.5, Math.min(3.0, this.zoomLevel() + delta)));
  }

  onMouseDown(event: MouseEvent): void {
    if (
      event.button === 0 &&
      !(event.target as HTMLElement).closest('.area-marker')
    ) {
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
      const validTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
      ];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, or SVG)');
        return;
      }
      this.uploadPlan.emit(file);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.isDragOver.set(true);
    this.cursorOverMap.emit(true);
    this.updateGhostMarkerPosition(event);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (!target.closest('.floor-plan-container')) {
      this.isDragOver.set(false);
      this.ghostMarkerPosition.set(null);
      this.cursorOverMap.emit(false);
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
      if (areaId) this.draggedAreaId.set(areaId);
    }
  }

  private calculateDropPosition(
    event: DragEvent,
  ): { x: number; y: number } | null {
    const floorImageEl = this.floorImage();
    if (!floorImageEl) return null;

    const imageRect = (
      floorImageEl.nativeElement as HTMLImageElement
    ).getBoundingClientRect();
    const mouseX = event.clientX - imageRect.left;
    const mouseY = event.clientY - imageRect.top;

    return {
      x: Math.max(5, Math.min(95, (mouseX / imageRect.width) * 100)),
      y: Math.max(5, Math.min(95, (mouseY / imageRect.height) * 100)),
    };
  }

  getGhostMarkerStyle(): any {
    const pos = this.ghostMarkerPosition();
    if (!pos) return { display: 'none' };
    return { left: pos.x + '%', top: pos.y + '%', display: 'block' };
  }

  getDraggedArea(): any {
    const areaId = this.draggedAreaId();
    if (!areaId) return null;
    return this.activeAreas().find((a) => a.id === areaId);
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      vacant: '#80E08E',
      leased: '#FFD05F',
      quotation: '#4CA3FF',
      unallocated: '#FF6384',
    };
    return statusColors[status] || '#9CA3AF';
  }
}
