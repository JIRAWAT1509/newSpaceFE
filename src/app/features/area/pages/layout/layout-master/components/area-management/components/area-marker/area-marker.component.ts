/* area-marker.component.ts */

import {
  Component,
  input,
  output,
  ElementRef,
  viewChild,
  effect,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Area } from '@core/models/area.model';

export interface MarkerPosition {
  x: number;
  y: number;
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
  styleUrl: './area-marker.component.css',
})
export class AreaMarkerComponent {
  area = input.required<Area>();
  zoomLevel = input.required<number>();
  isSelected = input<boolean>(false);
  isDraggable = input<boolean>(true);
  shouldPulse = input<boolean>(false);
  @Input() contentDiv?: HTMLDivElement;

  markerDragged = output<MarkerDragEvent>();
  markerClicked = output<string>();
  markerDragStart = output<string>();
  markerDragEnd = output<void>();
  markerDraggedOutside = output<string>();

  markerElement = viewChild<ElementRef>('markerElement');

  private isDragging = false;
  private dragOffsetX = 0; // ✅ offset จาก center ของ marker ถึง cursor
  private dragOffsetY = 0;

  getMarkerStyle(): any {
    const area = this.area();
    const hasWarning = area.currentTenant?.hasWarning || false;
    const statusColor = this.getStatusColor();
    let pulseColor = hasWarning ? '#DC2626' : statusColor;
    const rgb = this.hexToRgb(pulseColor);

    return {
      left: area.position.x + '%',
      top: area.position.y + '%',
      '--pulse-color-10': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      '--pulse-color-30': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      '--pulse-color-50': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
      '--pulse-color-60': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
      '--pulse-color-70': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  getStatusColor(): string {
    const statusColors: { [key: string]: string } = {
      vacant: '#80E08E',
      leased: '#FFD05F',
      quotation: '#4CA3FF',
      unallocated: '#FF6384',
      inactive: '#9CA3AF',
    };
    return statusColors[this.area().status] || '#9CA3AF';
  }

  hasWarning(): boolean {
    return this.area().currentTenant?.hasWarning || false;
  }

  onMarkerClick(event: MouseEvent): void {
    if (!this.isDragging) {
      event.stopPropagation();
      this.markerClicked.emit(this.area().id);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isDraggable()) return;

    event.preventDefault();
    event.stopPropagation();

    // ✅ คำนวณ offset จาก cursor ถึง anchor point ของ marker บน image
    const floorImage = this.getFloorImage();
    if (!floorImage) return;

    const imageRect = floorImage.getBoundingClientRect();
    const zoom = this.zoomLevel();

    // ตำแหน่ง anchor (%) × ขนาด image จริง = pixel position บน image
    const area = this.area();
    const markerPxX = (area.position.x / 100) * imageRect.width;
    const markerPxY = (area.position.y / 100) * imageRect.height;

    // ตำแหน่ง cursor บน image (ยังไม่ zoom)
    const cursorX = (event.clientX - imageRect.left) / zoom;
    const cursorY = (event.clientY - imageRect.top) / zoom;

    // ✅ offset = cursor - marker anchor → ใช้หักตอน drag
    this.dragOffsetX = cursorX - markerPxX;
    this.dragOffsetY = cursorY - markerPxY;

    this.isDragging = false; // จะ set true เมื่อ move จริง

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    event.preventDefault();
    this.isDragging = true;

    const floorImage = this.getFloorImage();
    if (!floorImage) return;

    const imageRect = floorImage.getBoundingClientRect();
    const zoom = this.zoomLevel();

    // cursor บน image space (unzoomed)
    const cursorX = (event.clientX - imageRect.left) / zoom;
    const cursorY = (event.clientY - imageRect.top) / zoom;

    // ✅ หัก offset ออก ให้ marker ไม่กระโดด
    const markerX = cursorX - this.dragOffsetX;
    const markerY = cursorY - this.dragOffsetY;

    // Check bounds (image space)
    const imageW = imageRect.width / zoom;
    const imageH = imageRect.height / zoom;
    const isOutside =
      markerX < 0 || markerX > imageW || markerY < 0 || markerY > imageH;

    if (isOutside) return;

    // Convert to percentage
    const newX = Math.max(2, Math.min(98, (markerX / imageW) * 100));
    const newY = Math.max(2, Math.min(98, (markerY / imageH) * 100));

    this.area().position.x = newX;
    this.area().position.y = newY;
  };

  private onMouseUp = (event: MouseEvent): void => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    if (!this.isDragging) {
      this.isDragging = false;
      return;
    }

    const floorImage = this.getFloorImage();
    if (floorImage) {
      const imageRect = floorImage.getBoundingClientRect();
      const zoom = this.zoomLevel();
      const cursorX = (event.clientX - imageRect.left) / zoom;
      const cursorY = (event.clientY - imageRect.top) / zoom;
      const imageW = imageRect.width / zoom;
      const imageH = imageRect.height / zoom;

      const isOutside =
        cursorX < 0 || cursorX > imageW || cursorY < 0 || cursorY > imageH;

      if (isOutside) {
        this.isDragging = false;
        this.markerDraggedOutside.emit(this.area().id);
        return;
      }
    }

    this.markerDragged.emit({
      areaId: this.area().id,
      position: { x: this.area().position.x, y: this.area().position.y },
    });

    this.isDragging = false;
  };

  private getFloorImage(): HTMLImageElement | null {
    // ✅ หา image จาก contentDiv ที่ส่งมา หรือ query จาก DOM
    if (this.contentDiv) {
      return this.contentDiv.querySelector(
        '.floor-plan-image',
      ) as HTMLImageElement;
    }
    return document.querySelector('.floor-plan-image') as HTMLImageElement;
  }

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
