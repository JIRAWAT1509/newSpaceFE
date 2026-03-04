/* area-list\area-list.component.ts */

import {
  Component,
  input,
  output,
  signal,
  effect,
  computed,
  HostListener,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ← เพิ่ม
import { SelectModule } from 'primeng/select';
import { AreaDataService } from '@core/services/area/area-data.service';
import { Area, AreaStatus } from '@core/models/area.model';
import { getBranchById } from '@core/data/area-index'; // ← เพิ่ม
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
  styleUrl: './area-list.component.css',
})
export class AreaListComponent {
  selectedAreaId = input<string | null>(null);
  statusFilters = input<AreaStatus[]>([]);
  typeFilters = input<ActionType[]>([]);
  searchQuery = input<string>('');

  areaSelected = output<string | null>();

  editAreaModal = viewChild<EditAreaModalComponent>('editAreaModal');

  selectedSort = signal<'roomNumber' | 'status' | 'tenant'>('roomNumber');
  expandedAreaId = signal<string | null>(null);
  currentPage = signal<number>(1);
  itemsPerPage = 5;
  showPageDropdown = false;

  sortOptions: SortOption[] = [
    { label: 'Room Number', value: 'roomNumber' },
    { label: 'Status', value: 'status' },
    { label: 'Tenant Name', value: 'tenant' },
  ];

  // ── Reactive source — computed จาก service signal โดยตรง ──────────────
  allAreas = computed(() => {
    const floor =
      this.areaDataService.currentFloor() ??
      this.areaDataService.floors()[0] ??
      null;
    if (!floor) return [];
    return this.areaDataService.getAreasForCurrentContext(floor);
  });

  // ── Building / Floor display ───────────────────────────────────────────
  currentBuildingName = computed(() => {
    const b = this.areaDataService.building();
    return b ? `${b.code} - ${b.nameTh}` : '-';
  });

  currentFloorName = computed(() => {
    const floor = this.areaDataService.getCurrentFloor();
    return floor ? floor.floorNameTh || `ชั้น ${floor.floorNumber}` : '-';
  });

  // ── Filtered + sorted ─────────────────────────────────────────────────
  filteredAreas = computed(() => {
    let areas = this.allAreas().filter((a) => a.isActive);

    const statusFilters = this.statusFilters();
    if (statusFilters.length > 0) {
      areas = areas.filter((a) => statusFilters.includes(a.status));
    }

    const typeFilters = this.typeFilters();
    if (typeFilters.length > 0) {
      areas = areas.filter((a) => {
        const actionLabel = this.getActionLabel(a.status);
        return typeFilters.includes(actionLabel as ActionType);
      });
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      areas = areas.filter(
        (a) =>
          a.roomNumber.toLowerCase().includes(query) ||
          a.currentTenant?.name.toLowerCase().includes(query) ||
          a.currentTenant?.nameTh?.toLowerCase().includes(query) ||
          a.currentTenant?.nameEn?.toLowerCase().includes(query) ||
          this.getStatusLabel(a.status).toLowerCase().includes(query),
      );
    }

    return this.sortAreas(areas, this.selectedSort());
  });

  // ── Pagination ────────────────────────────────────────────────────────
  totalItems = computed(() => this.filteredAreas().length);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredAreas().length / this.itemsPerPage)),
  );

  pageRanges = computed(() => {
    const ranges = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      const startItem = (i - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(i * this.itemsPerPage, this.totalItems());
      ranges.push({ label: `${startItem}-${endItem}`, page: i });
    }
    return ranges;
  });

  currentPageRange = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0-0';
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage() * this.itemsPerPage, total);
    return `${start}-${end}`;
  });

  paginatedAreas = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAreas().slice(start, start + this.itemsPerPage);
  });

  // ── Effects ───────────────────────────────────────────────────────────
  constructor(
    private areaDataService: AreaDataService,
    private router: Router, // ← เพิ่ม
  ) {
    // Reset page เมื่อ filter เปลี่ยน
    effect(
      () => {
        this.statusFilters();
        this.typeFilters();
        this.searchQuery();
        this.currentPage.set(1);
      },
      { allowSignalWrites: true },
    );

    // Guard ไม่ให้ currentPage เกิน totalPages
    effect(
      () => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (current > total) this.currentPage.set(Math.max(1, total));
      },
      { allowSignalWrites: true },
    );

    // Jump ไปหน้าที่มี selectedArea
    effect(
      () => {
        const selectedId = this.selectedAreaId();
        if (!selectedId) return;
        const index = this.filteredAreas().findIndex(
          (a) => a.id === selectedId,
        );
        if (index === -1) return;
        const targetPage = Math.floor(index / this.itemsPerPage) + 1;
        if (this.currentPage() !== targetPage) this.currentPage.set(targetPage);
      },
      { allowSignalWrites: true },
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────
  onEditArea(area: Area, event: Event): void {
    event.stopPropagation();
    this.editAreaModal()?.open(area);
  }

  onAreaSaved(updatedArea: Area): void {
    this.areaDataService.updateArea(updatedArea);
  }

  // ── ทำใบเสนอราคา ─────────────────────────────────────────────────────
  /**
   * Navigate ไปหน้า Contract Management พร้อมส่ง area data ผ่าน router state
   * contract-management จะรับ state นี้แล้วเปิด modal อัตโนมัติ
   */
  onCreateQuotation(area: Area, event: Event): void {
    event.stopPropagation();

    // ดึง building/floor/branch จาก service
    const building = this.areaDataService.building();
    const floor = this.areaDataService.getCurrentFloor();

    // lookup branch name จาก building.branchId → MOCK_BRANCHES
    const branch = building ? getBranchById(building.branchId) : null;

    // สร้าง prefill payload ที่ตรงกับ field ใน generalDetailForm
    const areaData = {
      branch: branch?.name ?? '', // ✅ สาขา เช่น "สาขา สีลม"
      areaBuilding: building?.code ?? '',
      areaFloor: floor?.floorNumber?.toString() ?? '',
      areaUnitNumber: area.roomNumber,
      areaTotal: area.size ?? '',
      areaMonthlyRent: area.monthlyRent ?? '',
      areaType: area.type ?? '',
      // tenant info (ถ้ามี)
      contactName: area.currentTenant?.nameTh ?? area.currentTenant?.name ?? '',
      contactPhone: area.currentTenant?.contactPhone ?? '',
    };

    this.router.navigate(['/contract/management'], {
      state: {
        autoOpenQuotation: true, // flag บอก contract page ว่าให้เปิด modal
        areaData, // ข้อมูล pre-fill
      },
    });
  }

  // ── Sort ──────────────────────────────────────────────────────────────
  private sortAreas(
    areas: Area[],
    sortBy: 'roomNumber' | 'status' | 'tenant',
  ): Area[] {
    const sorted = [...areas];
    switch (sortBy) {
      case 'roomNumber':
        return sorted.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'tenant':
        return sorted.sort((a, b) =>
          (a.currentTenant?.name || '').localeCompare(
            b.currentTenant?.name || '',
          ),
        );
      default:
        return sorted;
    }
  }

  onSortChange(): void {
    this.currentPage.set(1);
  }

  // ── Selection / Expand ────────────────────────────────────────────────
  isSelected(areaId: string): boolean {
    return this.selectedAreaId() === areaId;
  }
  isExpanded(areaId: string): boolean {
    return this.expandedAreaId() === areaId;
  }

  onAreaClick(areaId: string): void {
    this.areaSelected.emit(this.selectedAreaId() === areaId ? null : areaId);
    this.expandedAreaId.set(this.expandedAreaId() === areaId ? null : areaId);
  }

  // ── Pagination controls ───────────────────────────────────────────────
  goToPage(page: number, event?: Event): void {
    event?.stopPropagation();
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.showPageDropdown = false;
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update((p) => p + 1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    this.showPageDropdown = !this.showPageDropdown;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showPageDropdown = false;
  }

  // ── Display helpers ───────────────────────────────────────────────────
  getStatusColor(status: AreaStatus): string {
    const map: Record<string, string> = {
      vacant: '#80E08E',
      leased: '#FFD05F',
      quotation: '#4CA3FF',
      unallocated: '#FF6384',
      inactive: '#9CA3AF',
    };
    return map[status] || '#9CA3AF';
  }

  getStatusLabel(status: AreaStatus): string {
    const map: Record<string, string> = {
      vacant: 'ว่าง',
      leased: 'เช่า',
      quotation: 'คำใบเสนอราคา',
      unallocated: 'ยังไม่พร้อม',
      inactive: 'ปิดชั่วคราว',
    };
    return map[status] || status;
  }

  getActionLabel(status: AreaStatus): string {
    const map: Record<string, string> = {
      vacant: 'Log',
      leased: 'Log',
      quotation: 'OP',
      unallocated: 'Kiosk',
      inactive: 'View',
    };
    return map[status] || 'View';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      log: 'Log',
      kiosk: 'Kiosk',
      'open-plan': 'Open Plan',
    };
    return map[type] || type;
  }

  formatNumber(num: number | undefined): string {
    if (!num) return 'N/A';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
}
