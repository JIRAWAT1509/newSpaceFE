import { Component, input, output, signal } from '@angular/core';
import { FloorPlanComponent } from './components/floor-plan/floor-plan.component';
import { AreaListComponent } from './components/area-list/area-list.component';
import { AreaStatus } from '@core/models/area.model';
import { ActionType } from '../area-filter-bar/area-filter-bar.component';

@Component({
  selector: 'app-area-management',
  standalone: true,
  imports: [FloorPlanComponent, AreaListComponent],
  templateUrl: './area-management.component.html',
  styleUrl: './area-management.component.css'
})
export class AreaManagementComponent {
  selectedStatusFilters = input<AreaStatus[]>([]);
  selectedTypeFilters = input<ActionType[]>([]);
  searchQuery = input<string>('');

  selectedAreaId = signal<string | null>(null);

  areaSelected = output<string | null>();

  onAreaSelected(areaId: string | null): void {
    // Toggle selection: if clicking same area, deselect
    if (this.selectedAreaId() === areaId) {
      this.selectedAreaId.set(null);
      this.areaSelected.emit(null);
    } else {
      this.selectedAreaId.set(areaId);
      this.areaSelected.emit(areaId);
    }
  }
}
