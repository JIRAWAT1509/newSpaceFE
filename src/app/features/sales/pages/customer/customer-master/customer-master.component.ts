// customer-master.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Models
import {
  Customer,
  CustomerClass,
  CustomerStatus,
  CustomerSegment,
  calculateCustomerClass,
  calculateChurnRisk,
  CUSTOMER_SEGMENTS
} from '@core/models/customer.model';

// Mock Data
import {
  MOCK_CUSTOMERS,
  MOCK_CUSTOMER_STATS,
  MOCK_CSAT_TREND,
  MOCK_CHURN_DATA
} from '@core/data/customer.mock';

import { MOCK_AREAS } from '@core/data/areas.mock';
import { MOCK_FLOOR } from '@core/data/floor.mock';
import { MOCK_BUILDING } from '@core/data/building.mock';

// Child Components
import { CustomerStatsComponent } from './../components/customer-stats/customer-stats.component';
import { CustomerTableComponent } from './../components/customer-table/customer-table.component';
import { CustomerDrawerComponent } from './../components/customer-drawer/customer-drawer.component';
import { CustomerFiltersComponent } from './../components/customer-filters/customer-filters.component';
import { CsatChartComponent, CSATTrendData } from './../components/csat-chart/csat-chart.component';
import { ChurnChartComponent, ChurnData } from './../components/churn-chart/churn-chart.component';
import { CustomerDetailModalComponent } from './components/customer-detail-modal/customer-detail-modal.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';

export interface CustomerFilters {
  search: string;
  classes: CustomerClass[];
  statuses: CustomerStatus[];
  segments: CustomerSegment[];
  owners: string[];
}

@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomerStatsComponent,
    CustomerTableComponent,
    CustomerDrawerComponent,
    CustomerFiltersComponent,
    CsatChartComponent,
    ChurnChartComponent,
    CustomerDetailModalComponent,
    ConfirmationModalComponent,
    WarningModalComponent
  ],
  templateUrl: './customer-master.component.html',
  styleUrl: './customer-master.component.css'
})
export class CustomerMasterComponent implements OnInit {

  // ==================== STATE ====================

  // Data
  customers = signal<Customer[]>([]);
  availableSegments = signal<CustomerSegment[]>([...CUSTOMER_SEGMENTS]);

  // UI State
  isLoading = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);
  drawerMode = signal<'create' | 'edit'>('create');
  selectedCustomerId = signal<string | null>(null);
  isDetailModalOpen = signal<boolean>(false);
  detailModalCustomerId = signal<string | null>(null);

  // Modal state
  showConfirmModal = signal<boolean>(false);
  pendingDeleteCustomerId = signal<string | null>(null);
  showMessageModal = signal<boolean>(false);
  messageTitle = signal<string>('');
  messageText = signal<string>('');

  // Filters
  filters = signal<CustomerFilters>({
    search: '',
    classes: [],
    statuses: [],
    segments: [],
    owners: []
  });

  // Stats
  stats = signal(MOCK_CUSTOMER_STATS);
  csatTrend = signal<CSATTrendData[]>(MOCK_CSAT_TREND);
  churnData = signal<ChurnData>(MOCK_CHURN_DATA);

  // ==================== COMPUTED ====================

  // Filtered & sorted customers
  filteredCustomers = computed(() => {
    let result = this.customers();
    const currentFilters = this.filters();

    // Search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      result = result.filter(c =>
        c.companyName?.toLowerCase().includes(searchLower) ||
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Class filter
    if (currentFilters.classes.length > 0) {
      result = result.filter(c => currentFilters.classes.includes(c.class));
    }

    // Status filter
    if (currentFilters.statuses.length > 0) {
      result = result.filter(c => currentFilters.statuses.includes(c.status));
    }

    // Segment filter
    if (currentFilters.segments.length > 0) {
      result = result.filter(c => currentFilters.segments.includes(c.segment));
    }

    // Owner filter
    if (currentFilters.owners.length > 0) {
      result = result.filter(c => currentFilters.owners.includes(c.owner));
    }

    return result;
  });

  // Selected customer
  selectedCustomer = computed(() => {
    const id = this.selectedCustomerId();
    if (!id) return null;
    return this.customers().find(c => c.id === id) || null;
  });

  // Detail modal customer
  detailModalCustomer = computed(() => {
    const id = this.detailModalCustomerId();
    if (!id) return null;
    return this.customers().find(c => c.id === id) || null;
  });

  // Unique owners for filter
  uniqueOwners = computed(() => {
    const owners = new Set(this.customers().map(c => c.owner));
    return Array.from(owners).sort();
  });

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadCustomers();
  }

  // ==================== DATA LOADING ====================

  loadCustomers(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.customers.set([...MOCK_CUSTOMERS]);
      this.isLoading.set(false);
    }, 500);
  }

  // ==================== FILTER MANAGEMENT ====================

  onFiltersChange(newFilters: CustomerFilters): void {
    this.filters.set(newFilters);
  }

  clearFilters(): void {
    this.filters.set({
      search: '',
      classes: [],
      statuses: [],
      segments: [],
      owners: []
    });
  }

  // ==================== DRAWER MANAGEMENT ====================

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedCustomerId.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(customerId: string): void {
    this.drawerMode.set('edit');
    this.selectedCustomerId.set(customerId);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      this.selectedCustomerId.set(null);
    }, 300);
  }

  // ==================== DETAIL MODAL MANAGEMENT ====================

  openDetailModal(customerId: string): void {
    this.detailModalCustomerId.set(customerId);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      this.detailModalCustomerId.set(null);
    }, 300);
  }

  // ==================== CUSTOMER CRUD ====================

  createCustomer(customerData: Partial<Customer>): void {
    this.isLoading.set(true);

    setTimeout(() => {
      // Calculate class and churn risk
      const arr = customerData.arr || 0;
      const csat = customerData.csat || 3.0;
      const overduePayments = customerData.overduePayments || 0;
      const lastContactDays = 0;

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        firstName: customerData.firstName!,
        lastName: customerData.lastName!,
        companyName: customerData.companyName,
        businessType: customerData.businessType,
        channel: customerData.channel!,
        status: customerData.status!,
        email: customerData.email,
        phone: customerData.phone,
        interestedAreas: customerData.interestedAreas || [],
        budget: customerData.budget,
        expectedClosingDate: customerData.expectedClosingDate,
        remark: customerData.remark,
        segment: customerData.segment!,
        owner: customerData.owner || 'System',
        ownerId: customerData.ownerId || 'system',
        arr: arr,
        csat: csat,
        class: calculateCustomerClass(arr, overduePayments, csat),
        churnRisk: calculateChurnRisk(csat, overduePayments, lastContactDays),
        nextAction: customerData.nextAction,
        overduePayments: overduePayments,
        activeContracts: customerData.activeContracts || 0,
        totalRevenue: customerData.totalRevenue || 0,
        lastContactDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to list
      this.customers.update(customers => [...customers, newCustomer]);

      // Update stats
      this.updateStats();

      // Add segment if new
      if (customerData.segment && !this.availableSegments().includes(customerData.segment)) {
        this.availableSegments.update(segments => [...segments, customerData.segment!]);
      }

      this.isLoading.set(false);
      this.closeDrawer();

      console.log('Customer created:', newCustomer);
    }, 500);
  }

  updateCustomer(customerId: string, updates: Partial<Customer>): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.customers.update(customers =>
        customers.map(c => {
          if (c.id === customerId) {
            const updated = { ...c, ...updates };

            // Recalculate class and churn risk
            updated.class = calculateCustomerClass(
              updated.arr,
              updated.overduePayments,
              updated.csat
            );

            const lastContactDays = updated.lastContactDate
              ? Math.floor((Date.now() - new Date(updated.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
              : 999;

            updated.churnRisk = calculateChurnRisk(
              updated.csat,
              updated.overduePayments,
              lastContactDays
            );

            updated.updatedAt = new Date().toISOString();

            return updated;
          }
          return c;
        })
      );

      // Update stats
      this.updateStats();

      // Add segment if new
      if (updates.segment && !this.availableSegments().includes(updates.segment)) {
        this.availableSegments.update(segments => [...segments, updates.segment!]);
      }

      this.isLoading.set(false);
      this.closeDrawer();

      console.log('Customer updated:', customerId);
    }, 500);
  }

  deleteCustomer(customerId: string): void {
    this.pendingDeleteCustomerId.set(customerId);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
    const customerId = this.pendingDeleteCustomerId();
    if (!customerId) return;

    this.showConfirmModal.set(false);
    this.isLoading.set(true);

    setTimeout(() => {
      this.customers.update(customers =>
        customers.filter(c => c.id !== customerId)
      );

      // Update stats
      this.updateStats();

      this.isLoading.set(false);
      this.pendingDeleteCustomerId.set(null);

      this.showMessage('ลบสำเร็จ', 'ลบข้อมูลลูกค้าเรียบร้อยแล้ว');
      console.log('Customer deleted:', customerId);
    }, 300);
  }

  onCancelDelete(): void {
    this.showConfirmModal.set(false);
    this.pendingDeleteCustomerId.set(null);
  }

  showMessage(title: string, message: string): void {
    this.messageTitle.set(title);
    this.messageText.set(message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
  }

  // ==================== STATS UPDATE ====================

  updateStats(): void {
    const allCustomers = this.customers();

    // Calculate average CSAT
    const totalCSAT = allCustomers.reduce((sum, c) => sum + c.csat, 0);
    const avgCSAT = allCustomers.length > 0 ? totalCSAT / allCustomers.length : 0;

    // Count active deals
    const activeDeals = allCustomers.reduce((sum, c) => sum + c.activeContracts, 0);

    // Update stats
    this.stats.update(stats => ({
      ...stats,
      totalCustomers: allCustomers.length,
      averageCSAT: Number(avgCSAT.toFixed(1)),
      activeDeals: activeDeals
    }));

    // Update CSAT trend (add current month)
    const currentMonth = new Date().toLocaleString('en', { month: 'short' });
    this.csatTrend.update(trend => {
      const lastMonth = trend[trend.length - 1];
      if (lastMonth.month !== currentMonth) {
        return [...trend.slice(1), { month: currentMonth, value: Number(avgCSAT.toFixed(1)) }];
      }
      return trend.map((item, index) =>
        index === trend.length - 1
          ? { ...item, value: Number(avgCSAT.toFixed(1)) }
          : item
      );
    });
  }

  // ==================== EXPORT ====================

  exportCustomers(): void {
    console.log('Exporting customers...', this.filteredCustomers());
    this.showMessage('กำลังพัฒนา', 'ฟีเจอร์ส่งออกข้อมูลจะพร้อมใช้งานเร็วๆ นี้');
  }

  // Math for template
  Math = Math;
}
