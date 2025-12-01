import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloorWithAreas } from '@core/services/area/area-data.service';

interface FloorOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-floor-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './floor-selector.component.html',
  styleUrl: './floor-selector.component.css'
})
export class FloorSelectorComponent {
  floors = input.required<FloorWithAreas[]>();
  selectedFloorId = input.required<string>();

  floorChanged = output<string>();

  floorOptions = computed<FloorOption[]>(() => {
    return this.floors().map(floor => ({
      label: floor.floorName,
      value: floor.id
    }));
  });

  currentFloorIndex = computed<number>(() => {
    return this.floors().findIndex(f => f.id === this.selectedFloorId());
  });

  canGoUp = computed<boolean>(() => {
    return this.floors().length > 0;
  });

  canGoDown = computed<boolean>(() => {
    return this.floors().length > 0;
  });

  onFloorSelect(floorId: string): void {
    this.floorChanged.emit(floorId);
  }

  goToNextFloor(): void {
    const floors = this.floors();
    if (floors.length === 0) return;

    const currentIndex = this.currentFloorIndex();
    // Wrap around: if at top, go to bottom
    const nextIndex = currentIndex >= floors.length - 1 ? 0 : currentIndex + 1;
    this.floorChanged.emit(floors[nextIndex].id);
  }

  goToPreviousFloor(): void {
    const floors = this.floors();
    if (floors.length === 0) return;

    const currentIndex = this.currentFloorIndex();
    // Wrap around: if at bottom, go to top
    const prevIndex = currentIndex <= 0 ? floors.length - 1 : currentIndex - 1;
    this.floorChanged.emit(floors[prevIndex].id);
  }
}
