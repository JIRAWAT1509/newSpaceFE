import { Component, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Area, AreaStatus, AreaType } from '@core/models/area.model';

@Component({
  selector: 'app-marker-list-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marker-list-panel.component.html',
  styleUrl: './marker-list-panel.component.css'
})
export class MarkerListPanelComponent {
  activeAreas = input<Area[]>([]);
  inactiveAreas = input<Area[]>([]);
  selectedAreaId = input<string | null>(null);

  areaClicked = output<string>();
  addAreaClicked = output<void>();
  dragToMap = output<string>();
  dragToInactive = output<string>();
  areaActivated = output<string>();
  dragStarted = output<{ areaId: string; source: 'active' | 'inactive' }>();
  dragEnded = output<void>();

  activeListZone = viewChild<ElementRef>('activeListZone');
  inactiveListZone = viewChild<ElementRef>('inactiveListZone');

  expandedAreaId = signal<string | null>(null);
  isDraggingFromMap = signal<boolean>(false);
  isActiveZoneHovered = signal<boolean>(false);
  isInactiveZoneHovered = signal<boolean>(false);
  isOverMap = signal<boolean>(false); // Track if cursor is over map
  draggedAreaId: string | null = null;
  dragSource: 'active' | 'inactive' | null = null;

  onActiveAreaClick(areaId: string): void {
    const current = this.expandedAreaId();
    this.expandedAreaId.set(current === areaId ? null : areaId);
    this.areaClicked.emit(areaId);
  }

  onAreaClick(areaId: string): void {
    // Alias for onActiveAreaClick (for backward compatibility)
    this.onActiveAreaClick(areaId);
  }

  onInactiveAreaClick(areaId: string): void {
    const current = this.expandedAreaId();
    this.expandedAreaId.set(current === areaId ? null : areaId);
  }

  onDragStart(event: DragEvent, areaId: string, source: 'active' | 'inactive'): void {
    this.draggedAreaId = areaId;
    this.dragSource = source;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('areaId', areaId);
      event.dataTransfer.setData('source', source);

      // Create ghost image for dragging
      const dragImage = this.createDragGhost(areaId, source);
      event.dataTransfer.setDragImage(dragImage, 20, 20);

      // Remove ghost after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }

    this.dragStarted.emit({ areaId, source });
  }

  private createDragGhost(areaId: string, source: 'active' | 'inactive'): HTMLElement {
    const area = source === 'active'
      ? this.activeAreas().find(a => a.id === areaId)
      : this.inactiveAreas().find(a => a.id === areaId);

    if (!area) {
      const div = document.createElement('div');
      div.textContent = 'Dragging...';
      return div;
    }

    // Create list-style ghost (default)
    const ghost = document.createElement('div');
    ghost.id = 'drag-ghost-preview';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.padding = '12px 16px';
    ghost.style.background = 'white';
    ghost.style.border = '2px solid #3b82f6';
    ghost.style.borderRadius = '12px';
    ghost.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    ghost.style.fontSize = '14px';
    ghost.style.fontWeight = '600';
    ghost.style.zIndex = '10000';
    ghost.style.minWidth = '120px';

    const statusDot = `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${this.getStatusColor(area.status)}; flex-shrink: 0;"></div>`;
    const roomText = `<span style="flex: 1;">${area.roomNumber}</span>`;
    const typeLabel = `<span style="color: #6b7280; font-size: 12px; font-weight: 400;">${this.getTypeLabel(area.type)}</span>`;

    ghost.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        ${statusDot}
        <div style="display: flex; flex-direction: column; gap: 2px;">
          ${roomText}
          ${typeLabel}
        </div>
      </div>
    `;

    document.body.appendChild(ghost);
    return ghost;
  }

  onDragEnd(event: DragEvent): void {
    this.draggedAreaId = null;
    this.dragSource = null;
    this.isActiveZoneHovered.set(false);
    this.isInactiveZoneHovered.set(false);
    this.dragEnded.emit();
  }

  // Drop zone handlers for active list
  onActiveZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.isActiveZoneHovered.set(true);
  }

  onActiveZoneDragLeave(event: DragEvent): void {
    this.isActiveZoneHovered.set(false);
  }

  onActiveZoneDrop(event: DragEvent): void {
    event.preventDefault();
    this.isActiveZoneHovered.set(false);

    const areaId = event.dataTransfer?.getData('areaId');
    const source = event.dataTransfer?.getData('source');

    if (!areaId) return;

    // If from inactive → activate and add to center of map
    if (source === 'inactive') {
      this.areaActivated.emit(areaId);
    }
    // If already active → do nothing (already in active list)
  }

  // Drop zone handlers for inactive list
  onInactiveZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.isInactiveZoneHovered.set(true);
  }

  onInactiveZoneDragLeave(event: DragEvent): void {
    this.isInactiveZoneHovered.set(false);
  }

  onInactiveZoneDrop(event: DragEvent): void {
    event.preventDefault();
    this.isInactiveZoneHovered.set(false);

    const areaId = event.dataTransfer?.getData('areaId');
    const source = event.dataTransfer?.getData('source');

    if (!areaId) return;

    // If from active list OR from marker → deactivate
    if (source === 'active' || source === 'marker') {
      this.dragToInactive.emit(areaId);
    }
    // If already inactive → do nothing
  }

  onMoveToInactive(event: Event, areaId: string): void {
    event.stopPropagation();
    this.dragToInactive.emit(areaId);
    this.expandedAreaId.set(null);
  }

  onMoveToActive(event: Event, areaId: string): void {
    event.stopPropagation();
    this.areaActivated.emit(areaId);
    this.expandedAreaId.set(null);
  }

  onSeeMore(event: Event, areaId: string): void {
    event.stopPropagation();
    // TODO: Navigate to company data page
    console.log('See more for area:', areaId);
  }

  onAddAreaClick(): void {
    this.addAreaClicked.emit();
  }

  // Called from parent when marker is being dragged
  setDraggingFromMap(isDragging: boolean): void {
    this.isDraggingFromMap.set(isDragging);
  }

  // Called from parent to track if cursor is over map
  setIsOverMap(isOver: boolean): void {
    this.isOverMap.set(isOver);
  }

  getStatusColor(status: AreaStatus): string {
    const statusColors: { [key: string]: string } = {
      'vacant': '#80E08E',
      'leased': '#FFD05F',
      'quotation': '#4CA3FF',
      'unallocated': '#FF6384'
    };
    return statusColors[status] || '#9CA3AF';
  }

  getStatusLabel(status: AreaStatus): string {
    const statusLabels: { [key: string]: string } = {
      'vacant': 'ว่าง',
      'leased': 'เช่า',
      'quotation': 'คำใบเสนอราคา',
      'unallocated': 'ยังไม่พร้อม'
    };
    return statusLabels[status] || status;
  }

  getTypeLabel(type: AreaType): string {
    const typeLabels: { [key: string]: string } = {
      'log': 'Log',
      'kiosk': 'Kiosk',
      'open-plan': 'Open Plan'
    };
    return typeLabels[type] || type;
  }
}
