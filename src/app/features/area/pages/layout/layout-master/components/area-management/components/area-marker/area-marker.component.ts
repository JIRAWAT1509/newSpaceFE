import { Component, input, output, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Area } from '@core/models/area.model';

export interface MarkerPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface MarkerDragEvent {
  areaId: string;
  position: MarkerPosition;
}

@Component({
  selector: 'app-area-marker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-marker.component.html',
  styleUrl: './area-marker.component.css'
})
export class AreaMarkerComponent {
  area = input.required<Area>();
  zoomLevel = input.required<number>();
  isSelected = input<boolean>(false);
  isDraggable = input<boolean>(true);
  shouldPulse = input<boolean>(false);

  markerDragged = output<MarkerDragEvent>();
  markerClicked = output<string>();
  markerDragStart = output<string>(); // Native HTML5 drag start
  markerDragEnd = output<void>(); // Native HTML5 drag end
  markerDraggedOutside = output<string>(); // Emitted when dragged outside map and released

  markerElement = viewChild<ElementRef>('markerElement');

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private containerRect: DOMRect | null = null;
  private clickStartPos = { x: 0, y: 0 }; // Track click position to detect drag vs click

  constructor() {
    effect(() => {
      const area = this.area();
      this.updateMarkerPosition();
    });
  }

  getMarkerStyle(): any {
    const area = this.area();
    const hasWarning = area.currentTenant?.hasWarning || false;
    const statusColor = this.getStatusColor();

    // Determine pulse color based on warning or status
    let pulseColor = statusColor;
    if (hasWarning) {
      pulseColor = '#DC2626'; // Red for warnings
    }

    // Convert hex to RGB for CSS variables
    const rgb = this.hexToRgb(pulseColor);

    return {
      left: area.position.x + '%',
      top: area.position.y + '%',
      '--pulse-color-10': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      '--pulse-color-30': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      '--pulse-color-50': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
      '--pulse-color-60': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
      '--pulse-color-70': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  getStatusColor(): string {
    const statusColors: { [key: string]: string } = {
      'vacant': '#80E08E',
      'leased': '#FFD05F',
      'quotation': '#4CA3FF',
      'unallocated': '#FF6384',
      'inactive': '#9CA3AF'
    };
    return statusColors[this.area().status] || '#9CA3AF';
  }

  hasWarning(): boolean {
    return this.area().currentTenant?.hasWarning || false;
  }

  onMarkerClick(event: MouseEvent): void {
    // Only emit click if we didn't drag
    const dragDistance = Math.sqrt(
      Math.pow(event.clientX - this.clickStartPos.x, 2) +
      Math.pow(event.clientY - this.clickStartPos.y, 2)
    );

    if (!this.isDragging && dragDistance < 5) {
      event.stopPropagation();
      this.markerClicked.emit(this.area().id);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isDraggable()) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.clickStartPos = { x: event.clientX, y: event.clientY };

    const container = (event.target as HTMLElement).closest('.floor-plan-container');
    if (container) {
      this.containerRect = container.getBoundingClientRect();
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.containerRect) return;

    event.preventDefault();

    // Get floor plan image element
    const container = document.querySelector('.floor-plan-container');
    const floorImage = container?.querySelector('.floor-plan-image') as HTMLImageElement;

    if (!floorImage) return;

    const imageRect = floorImage.getBoundingClientRect();

    // Calculate raw mouse position relative to image
    const rawMouseX = event.clientX - imageRect.left;
    const rawMouseY = event.clientY - imageRect.top;

    // Check if cursor is outside image bounds
    const isOutsideImage =
      rawMouseX < 0 ||
      rawMouseX > imageRect.width ||
      rawMouseY < 0 ||
      rawMouseY > imageRect.height;

    if (isOutsideImage) {
      // Don't update position while outside
      return;
    }

    // The marker has transform: translate(-50%, -100%)
    // This means the marker's anchor point is at its bottom-center
    // CSS positioning: marker's top-left corner is at (x%, y%)
    // After transform: marker's bottom-center is at (x%, y%)

    // To make cursor appear at the bottom-center of marker:
    // We use raw mouse position directly as the position percentage
    // The CSS transform will handle placing the marker correctly

    // Convert to percentage
    let newX = (rawMouseX / imageRect.width) * 100;
    let newY = (rawMouseY / imageRect.height) * 100;

    // Clamp to valid range
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    this.area().position.x = newX;
    this.area().position.y = newY;

    this.updateMarkerPosition();
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();

      this.isDragging = false;

      // Check if released outside the map area
      const container = document.querySelector('.floor-plan-container');
      const floorImage = container?.querySelector('.floor-plan-image') as HTMLImageElement;

      if (floorImage) {
        const imageRect = floorImage.getBoundingClientRect();
        const mouseX = event.clientX - imageRect.left;
        const mouseY = event.clientY - imageRect.top;

        const isOutsideImage =
          mouseX < 0 ||
          mouseX > imageRect.width ||
          mouseY < 0 ||
          mouseY > imageRect.height;

        if (isOutsideImage) {
          // Released outside map - deactivate
          this.markerDraggedOutside.emit(this.area().id);
          document.removeEventListener('mousemove', this.onMouseMove);
          document.removeEventListener('mouseup', this.onMouseUp);
          return;
        }
      }

      // Released inside map - update position
      this.markerDragged.emit({
        areaId: this.area().id,
        position: {
          x: this.area().position.x,
          y: this.area().position.y
        }
      });

      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  };

  private updateMarkerPosition(): void {
    // Force Angular to detect changes
  }

  // Native HTML5 drag events (for dragging marker to panels)
  onDragStartNative(event: DragEvent): void {
    if (!this.isDraggable()) return;

    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('areaId', this.area().id);
      event.dataTransfer.setData('source', 'marker');
    }

    this.markerDragStart.emit(this.area().id);
  }

  onDragEndNative(event: DragEvent): void {
    this.markerDragEnd.emit();
  }
}
