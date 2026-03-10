// vendor-maintenance.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  VendorContract,
  PMTask,
  VendorStats,
  ContractType,
  ContractStatus,
  TYPE_COLORS,
  TYPE_BG,
  computeStatus,
  getDaysUntil
} from '../../../../core/models/vendor-contract.model';

import {
  MOCK_VENDOR_CONTRACTS,
  MOCK_PM_TASKS,
  computeVendorStats
} from '../../../../core/data/vendor-contract.mock';

import { VendorKpiCardsComponent } from './components/vendor-kpi-cards/vendor-kpi-cards.component';
import { VendorTableComponent } from './components/vendor-table/vendor-table.component';
import { ExpiryTrackerComponent } from './components/expiry-tracker/expiry-tracker.component';
import { PmTableComponent } from './components/pm-table/pm-table.component';
import { VendorDrawerComponent } from './components/vendor-drawer/vendor-drawer.component';
import { VendorDetailModalComponent } from './components/vendor-detail-modal/vendor-detail-modal.component';

type ViewTab = 'dashboard' | 'contracts' | 'pm';

@Component({
  selector: 'app-vendor-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VendorKpiCardsComponent,
    VendorTableComponent,
    ExpiryTrackerComponent,
    PmTableComponent,
    VendorDrawerComponent,
    VendorDetailModalComponent
  ],
  templateUrl: './vendor-maintenance.component.html',
  styleUrl: './vendor-maintenance.component.css'
})
export class VendorMaintenanceComponent implements OnInit {

  // ==================== STATE ====================

  // Data
  contracts = signal<VendorContract[]>([]);
  pmTasks = signal<PMTask[]>([]);

  // UI State
  isLoading = signal<boolean>(false);
  activeView = signal<ViewTab>('dashboard');

  // Drawer
  isDrawerOpen = signal<boolean>(false);
  drawerMode = signal<'create' | 'edit'>('create');
  selectedContractId = signal<string | null>(null);

  // Detail Modal
  isDetailModalOpen = signal<boolean>(false);
  detailContractId = signal<string | null>(null);

  // Delete confirm
  deleteConfirmId = signal<string | null>(null);

  // Filters
  searchQuery = signal<string>('');
  filterType = signal<string>('');
  filterStatus = signal<string>('');

  // ==================== COMPUTED ====================

  stats = computed<VendorStats>(() => computeVendorStats(this.contracts()));

  filteredContracts = computed(() => {
    let result = this.contracts();
    const q = this.searchQuery().toLowerCase();
    if (q) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.building.toLowerCase().includes(q)
      );
    }
    const ft = this.filterType();
    if (ft) {
      result = result.filter(c => c.type === ft);
    }
    const fs = this.filterStatus();
    if (fs) {
      result = result.filter(c => computeStatus(c) === fs);
    }
    return result;
  });

  dashboardContracts = computed(() => {
    return this.filteredContracts().slice(0, 8);
  });

  selectedContract = computed(() => {
    const id = this.selectedContractId();
    if (!id) return null;
    return this.contracts().find(c => c.id === id) || null;
  });

  detailContract = computed(() => {
    const id = this.detailContractId();
    if (!id) return null;
    return this.contracts().find(c => c.id === id) || null;
  });

  // PM stats
  pmStats = computed(() => {
    const tasks = this.pmTasks();
    return {
      total: tasks.length,
      overdue: tasks.filter(t => t.status === 'Overdue').length,
      dueSoon: tasks.filter(t => t.status === 'Due Soon').length,
      scheduled: tasks.filter(t => t.status === 'Scheduled').length
    };
  });

  // Alert counts
  expiredCount = computed(() => this.contracts().filter(c => computeStatus(c) === 'Expired').length);
  expiring30Count = computed(() => this.contracts().filter(c => {
    const days = getDaysUntil(c.end);
    return days >= 0 && days <= 30;
  }).length);

  // Type mix for donut chart
  typeMix = computed(() => {
    const counts: Record<string, number> = {};
    this.contracts().forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    const total = this.contracts().length;
    const items = Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: TYPE_COLORS[type] || '#64748b'
    }));
    return items.sort((a, b) => b.count - a.count);
  });

  // SVG donut chart data
  donutSegments = computed(() => {
    const total = this.contracts().length;
    if (total === 0) return [];
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return this.typeMix().map(item => {
      const dashArray = (item.percent / 100) * circumference;
      const dashOffset = circumference - offset;
      offset += dashArray;
      return {
        ...item,
        dashArray,
        dashOffset: circumference - (offset - dashArray),
        strokeDasharray: `${dashArray} ${circumference - dashArray}`,
        strokeDashoffset: circumference - (offset - dashArray)
      };
    });
  });

  // Budget breakdown (by type value totals)
  budgetMix = computed(() => {
    const totals: Record<string, number> = {};
    this.contracts().forEach(c => {
      totals[c.type] = (totals[c.type] || 0) + c.value;
    });
    const max = Math.max(...Object.values(totals), 1);
    return Object.entries(totals).map(([type, value]) => ({
      type,
      value,
      percent: Math.round((value / max) * 100),
      color: TYPE_COLORS[type] || '#64748b'
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  });

  // Upcoming PM mini list for dashboard
  upcomingPMMini = computed(() => {
    return this.pmTasks()
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
      .slice(0, 5);
  });

  TYPE_COLORS = TYPE_COLORS;
  contractTypes: ContractType[] = ['Software', 'Hardware', 'Disposable', 'MA', 'Preventive', 'SLA', 'Consulting'];
  contractStatuses: ContractStatus[] = ['Active', 'Expiring', 'Expired', 'Draft'];

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadData();
  }

  // ==================== DATA LOADING ====================

  loadData(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.contracts.set([...MOCK_VENDOR_CONTRACTS]);
      this.pmTasks.set([...MOCK_PM_TASKS]);
      this.isLoading.set(false);
    }, 400);
  }

  // ==================== VIEW TABS ====================

  setView(view: ViewTab): void {
    this.activeView.set(view);
  }

  // ==================== FILTERS ====================

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onFilterType(event: Event): void {
    this.filterType.set((event.target as HTMLSelectElement).value);
  }

  onFilterStatus(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterType.set('');
    this.filterStatus.set('');
  }

  // ==================== DRAWER ====================

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedContractId.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(contractId: string): void {
    this.drawerMode.set('edit');
    this.selectedContractId.set(contractId);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => this.selectedContractId.set(null), 300);
  }

  // ==================== DETAIL MODAL ====================

  openDetailModal(contractId: string): void {
    this.detailContractId.set(contractId);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    setTimeout(() => this.detailContractId.set(null), 300);
  }

  // ==================== CRUD ====================

  createContract(data: Partial<VendorContract>): void {
    const newContract: VendorContract = {
      id: `C${String(this.contracts().length + 1).padStart(3, '0')}`,
      name: data.name || '',
      type: data.type || 'Software',
      building: data.building || '',
      vendor: data.vendor || '',
      vendorContact: data.vendorContact || '',
      vendorPhone: data.vendorPhone || '',
      vendorEmail: data.vendorEmail || '',
      vendorAddress: data.vendorAddress || '',
      owner: data.owner || '',
      dept: data.dept || '',
      ownerEmail: data.ownerEmail || '',
      value: data.value || 0,
      recurring: data.recurring || 'Annual',
      payment: data.payment || 'Net 30',
      autoRenew: data.autoRenew || 'No',
      penalty: data.penalty || 'None',
      start: data.start || '',
      end: data.end || '',
      noticePeriod: data.noticePeriod || 30,
      status: data.status || 'Active',
      category: data.category || '',
      priority: data.priority || 'Medium',
      pmFreq: data.pmFreq || 'N/A',
      technician: data.technician || '',
      detail: data.detail || ''
    };
    this.contracts.update(list => [...list, newContract]);
    this.closeDrawer();
  }

  updateContract(contractId: string, data: Partial<VendorContract>): void {
    this.contracts.update(list =>
      list.map(c => c.id === contractId ? { ...c, ...data } : c)
    );
    this.closeDrawer();
  }

  deleteContract(contractId: string): void {
    this.deleteConfirmId.set(contractId);
  }

  confirmDelete(): void {
    const id = this.deleteConfirmId();
    if (id) {
      this.contracts.update(list => list.filter(c => c.id !== id));
      this.deleteConfirmId.set(null);
    }
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  // ==================== PM TASKS ====================

  markPMDone(taskId: string): void {
    this.pmTasks.update(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' as const } : t)
    );
  }

  deletePMTask(taskId: string): void {
    this.pmTasks.update(tasks => tasks.filter(t => t.id !== taskId));
  }

  // ==================== HELPERS ====================

  formatCurrency(value: number): string {
    if (value >= 1000000) return '฿' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '฿' + (value / 1000).toFixed(0) + 'K';
    return '฿' + value.toLocaleString();
  }

  getPMStatusClass(status: string): string {
    switch (status) {
      case 'Overdue': return 'pm-overdue';
      case 'Due Soon': return 'pm-due-soon';
      case 'Scheduled': return 'pm-scheduled';
      default: return 'pm-completed';
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  exportContracts(): void {
    alert('Export functionality will be available in production.');
  }

  // Math for template
  Math = Math;
}
