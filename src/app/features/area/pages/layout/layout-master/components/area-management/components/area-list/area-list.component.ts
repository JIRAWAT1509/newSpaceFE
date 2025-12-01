import { Component, input, output, signal, effect, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AreaDataService } from '@core/services/area/area-data.service';
import { Area, AreaStatus } from '@core/models/area.model';
import { ActionType } from '../../../area-filter-bar/area-filter-bar.component';

interface SortOption {
  label: string;
  value: 'roomNumber' | 'status' | 'tenant';
}

@Component({
  selector: 'app-area-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './area-list.component.html',
  styleUrl: './area-list.component.css'
})
export class AreaListComponent {
  selectedAreaId = input<string | null>(null);
  statusFilters = input<AreaStatus[]>([]);
  typeFilters = input<ActionType[]>([]);
  searchQuery = input<string>('');

  areaSelected = output<string | null>();

  allAreas = signal<Area[]>([]);
  selectedSort = signal<'roomNumber' | 'status' | 'tenant'>('roomNumber');

  currentPage = signal<number>(1);
  itemsPerPage = 6;
  showPageDropdown = false;

  sortOptions: SortOption[] = [
    { label: 'Room Number', value: 'roomNumber' },
    { label: 'Status', value: 'status' },
    { label: 'Tenant Name', value: 'tenant' }
  ];

  filteredAreas = computed(() => {
    // Only show active areas (isActive = true)
    let areas = this.allAreas().filter(a => a.isActive);

    const statusFilters = this.statusFilters();
    if (statusFilters.length > 0) {
      areas = areas.filter(a => statusFilters.includes(a.status));
    }

    // Apply type filters (multi-select)
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

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredAreas().length / this.itemsPerPage))
  );

  pageRanges = computed(() => {
    const ranges = [];
    const total = this.totalPages();
    for (let i = 1; i <= total; i++) {
      const startItem = (i - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(i * this.itemsPerPage, this.totalItems());
      ranges.push({
        label: `${startItem}-${endItem}`,
        page: i
      });
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
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAreas().slice(startIndex, endIndex);
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.showPageDropdown = false;
  }

  constructor(private areaDataService: AreaDataService) {
    effect(() => {
      this.loadAreas();
    });

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
  }

  private loadAreas(): void {
    const building = this.areaDataService.building();
    if (!building.floors || building.floors.length === 0) {
      return;
    }

    const floor = building.floors[0];
    const areas = this.areaDataService.getAreasForCurrentContext(floor);
    this.allAreas.set(areas);
  }

  private sortAreas(areas: Area[], sortBy: 'roomNumber' | 'status' | 'tenant'): Area[] {
    const sorted = [...areas];

    switch (sortBy) {
      case 'roomNumber':
        return sorted.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));

      case 'tenant':
        return sorted.sort((a, b) => {
          const nameA = a.currentTenant?.name || '';
          const nameB = b.currentTenant?.name || '';
          return nameA.localeCompare(nameB);
        });

      default:
        return sorted;
    }
  }

  onSortChange(): void {
    this.currentPage.set(1);
  }

  isSelected(areaId: string): boolean {
    return this.selectedAreaId() === areaId;
  }

  onAreaClick(areaId: string): void {
    const currentSelectedId = this.selectedAreaId();
    if (currentSelectedId === areaId) {
      this.areaSelected.emit(null);
    } else {
      this.areaSelected.emit(areaId);
    }
  }

  onActionClick(event: MouseEvent, areaId: string): void {
    event.stopPropagation();
    console.log('Action clicked for area:', areaId);
  }

  goToPage(page: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const maxPages = this.totalPages();
    if (page >= 1 && page <= maxPages) {
      this.currentPage.set(page);
      this.showPageDropdown = false;
    }
  }

  nextPage(): void {
    const maxPages = this.totalPages();
    const current = this.currentPage();
    if (current < maxPages) {
      this.currentPage.set(current + 1);
    }
  }

  previousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }

  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    this.showPageDropdown = !this.showPageDropdown;
  }

  getStatusColor(status: AreaStatus): string {
    const statusColors: { [key: string]: string } = {
      'vacant': '#80E08E',
      'leased': '#FFD05F',
      'quotation': '#4CA3FF',
      'unallocated': '#FF6384',
      'inactive': '#9CA3AF'
    };
    return statusColors[status] || '#9CA3AF';
  }

  getStatusLabel(status: AreaStatus): string {
    const statusLabels: { [key: string]: string } = {
      'vacant': 'ว่าง',
      'leased': 'เช่า',
      'quotation': 'คำใบเสนอราคา',
      'unallocated': 'ยังไม่พร้อม',
      'inactive': 'ปิดชั่วคราว'
    };
    return statusLabels[status] || status;
  }

  getActionLabel(status: AreaStatus): string {
    const actionLabels: { [key: string]: string } = {
      'vacant': 'Log',
      'leased': 'Log',
      'quotation': 'OP',
      'unallocated': 'Kiosk',
      'inactive': 'View'
    };
    return actionLabels[status] || 'View';
  }
}
