/* area-list\area-list.component.ts */

import { Component, input, output, signal, effect, computed, HostListener, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AreaDataService } from '@core/services/area/area-data.service';
import { Area, AreaStatus } from '@core/models/area.model';
import { ActionType } from '../../../area-filter-bar/area-filter-bar.component';
import { EditAreaModalComponent } from '../edit-area-modal/edit-area-modal.component';

interface SortOption {
  label: string;
  value: 'roomNumber' | 'status' | 'tenant';
}

@Component({
  selector: 'app-area-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, EditAreaModalComponent],
  templateUrl: './area-list.component.html',
  styleUrl: './area-list.component.css'
})
export class AreaListComponent {
  selectedAreaId = input<string | null>(null);
  statusFilters = input<AreaStatus[]>([]);
  typeFilters = input<ActionType[]>([]);
  searchQuery = input<string>('');

  areaSelected = output<string | null>();

  editAreaModal = viewChild<EditAreaModalComponent>('editAreaModal');

  allAreas = signal<Area[]>([]);
  selectedSort = signal<'roomNumber' | 'status' | 'tenant'>('roomNumber');
  expandedAreaId = signal<string | null>(null);
  currentPage = signal<number>(1);
  itemsPerPage = 10;
  showPageDropdown = false;

  sortOptions: SortOption[] = [
    { label: 'Room Number', value: 'roomNumber' },
    { label: 'Status', value: 'status' },
    { label: 'Tenant Name', value: 'tenant' }
  ];

  // ✅ Building + Floor computed
  currentBuildingName = computed(() => {
    const b = this.areaDataService.building();
    return b ? `${b.code} - ${b.nameTh}` : '-';
  });

  currentFloorName = computed(() => {
    const floor = this.areaDataService.getCurrentFloor();
    return floor ? (floor.floorNameTh || `ชั้น ${floor.floorNumber}`) : '-';
  });

  filteredAreas = computed(() => {
    let areas = this.allAreas().filter(a => a.isActive);

    const statusFilters = this.statusFilters();
    if (statusFilters.length > 0) {
      areas = areas.filter(a => statusFilters.includes(a.status));
    }

    const typeFilters = this.typeFilters();
    if (typeFilters.length > 0) {
      areas = areas.filter(a => {
        const actionLabel = this.getActionLabel(a.status);
        return typeFilters.includes(actionLabel as ActionType);
      });
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      areas = areas.filter(a =>
        a.roomNumber.toLowerCase().includes(query) ||
        a.currentTenant?.name.toLowerCase().includes(query) ||
        a.currentTenant?.nameTh?.toLowerCase().includes(query) ||
        a.currentTenant?.nameEn?.toLowerCase().includes(query) ||
        this.getStatusLabel(a.status).toLowerCase().includes(query)
      );
    }

    return this.sortAreas(areas, this.selectedSort());
  });

  totalItems = computed(() => this.filteredAreas().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAreas().length / this.itemsPerPage)));

  pageRanges = computed(() => {
    const ranges = [];
    const total = this.totalPages();
    for (let i = 1; i <= total; i++) {
      const startItem = (i - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(i * this.itemsPerPage, this.totalItems());
      ranges.push({ label: `${startItem}-${endItem}`, page: i });
    }
    return ranges;
  });

  currentPageRange = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0-0';
    const current = this.currentPage();
    const startItem = (current - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(current * this.itemsPerPage, total);
    return `${startItem}-${endItem}`;
  });

  paginatedAreas = computed(() => {
    const current = this.currentPage();
    const startIndex = (current - 1) * this.itemsPerPage;
    return this.filteredAreas().slice(startIndex, startIndex + this.itemsPerPage);
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.showPageDropdown = false;
  }

  constructor(private areaDataService: AreaDataService) {
    effect(() => { this.loadAreas(); });

    effect(() => {
      this.statusFilters();
      this.typeFilters();
      this.searchQuery();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });

    effect(() => {
      const total = this.totalPages();
      const current = this.currentPage();
      if (current > total) {
        this.currentPage.set(Math.max(1, total));
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const selectedId = this.selectedAreaId();
      if (selectedId) {
        const areas = this.filteredAreas();
        const areaIndex = areas.findIndex(a => a.id === selectedId);
        if (areaIndex !== -1) {
          const targetPage = Math.floor(areaIndex / this.itemsPerPage) + 1;
          if (this.currentPage() !== targetPage) {
            this.currentPage.set(targetPage);
          }
        }
      }
    }, { allowSignalWrites: true });
  }

  private loadAreas(): void {
    const floor = this.areaDataService.getCurrentFloor();
    if (!floor) {
      // fallback to first floor
      const building = this.areaDataService.building();
      if (!building?.floors?.length) return;
      const firstFloor = building.floors[0];
      const areas = this.areaDataService.getAreasForCurrentContext(firstFloor);
      this.allAreas.set(areas);
      return;
    }
    const areas = this.areaDataService.getAreasForCurrentContext(floor);
    this.allAreas.set(areas);
  }

  // ✅ Edit Area
  onEditArea(area: Area, event: Event): void {
    event.stopPropagation();
    this.editAreaModal()?.open(area);
  }

  onAreaSaved(updatedArea: Area): void {
    this.areaDataService.updateArea(updatedArea);
    this.loadAreas();
  }

  private sortAreas(areas: Area[], sortBy: 'roomNumber' | 'status' | 'tenant'): Area[] {
    const sorted = [...areas];
    switch (sortBy) {
      case 'roomNumber': return sorted.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
      case 'status': return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'tenant': return sorted.sort((a, b) => (a.currentTenant?.name || '').localeCompare(b.currentTenant?.name || ''));
      default: return sorted;
    }
  }

  onSortChange(): void { this.currentPage.set(1); }
  isSelected(areaId: string): boolean { return this.selectedAreaId() === areaId; }
  isExpanded(areaId: string): boolean { return this.expandedAreaId() === areaId; }

  onAreaClick(areaId: string): void {
    this.areaSelected.emit(this.selectedAreaId() === areaId ? null : areaId);
    this.expandedAreaId.set(this.expandedAreaId() === areaId ? null : areaId);
  }

  goToPage(page: number, event?: Event): void {
    event?.stopPropagation();
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.showPageDropdown = false;
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }

  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    this.showPageDropdown = !this.showPageDropdown;
  }

  getStatusColor(status: AreaStatus): string {
    const map: Record<string, string> = {
      'vacant': '#80E08E', 'leased': '#FFD05F',
      'quotation': '#4CA3FF', 'unallocated': '#FF6384', 'inactive': '#9CA3AF'
    };
    return map[status] || '#9CA3AF';
  }

  getStatusLabel(status: AreaStatus): string {
    const map: Record<string, string> = {
      'vacant': 'ว่าง', 'leased': 'เช่า',
      'quotation': 'คำใบเสนอราคา', 'unallocated': 'ยังไม่พร้อม', 'inactive': 'ปิดชั่วคราว'
    };
    return map[status] || status;
  }

  getActionLabel(status: AreaStatus): string {
    const map: Record<string, string> = {
      'vacant': 'Log', 'leased': 'Log', 'quotation': 'OP', 'unallocated': 'Kiosk', 'inactive': 'View'
    };
    return map[status] || 'View';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = { 'log': 'Log', 'kiosk': 'Kiosk', 'open-plan': 'Open Plan' };
    return map[type] || type;
  }

  formatNumber(num: number | undefined): string {
    if (!num) return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}
