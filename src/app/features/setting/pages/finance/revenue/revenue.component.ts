// revenue.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { RevenueFormDrawerComponent } from './component/revenue-form-drawer/revenue-form-drawer.component';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, RevenueFormDrawerComponent],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.css'
})
export class RevenueComponent implements OnInit {
  // ==================== STATE MANAGEMENT ====================
  activeCategory: 'revenue' | 'revenue-type' | 'business-revenue' = 'revenue';
  searchQuery: string = '';

revenueDrawerOpen = false;
revenueDrawerMode: 'create' | 'edit' = 'create';
selectedRevenue: any = null;


  // ==================== DATA COUNTS ====================
  revenueCount: number = 0;
  revenueTypeCount: number = 0;
  businessRevenueCount: number = 0;

  // ==================== DATA ARRAYS ====================
  revenues: any[] = [];
  revenueTypes: any[] = [];
  businessRevenues: any[] = [];

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadMockData();
  }

  // ==================== CATEGORY SELECTION ====================
  selectCategory(category: 'revenue' | 'revenue-type' | 'business-revenue'): void {
    this.activeCategory = category;
    this.searchQuery = ''; // Clear search when switching categories
  }

  // ==================== MOCK DATA LOADER ====================
  loadMockData(): void {
    // Mock Revenue Data (รายได้)
    this.revenues = [
      {
        REVENUE_CODE: 'REV001',
        REVENUE_NAME: 'ค่าเช่าพื้นที่',
        REVENUE_TYPE: 'RT01',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      },
      {
        REVENUE_CODE: 'REV002',
        REVENUE_NAME: 'ค่าบริการส่วนกลาง',
        REVENUE_TYPE: 'RT02',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      }
    ];
    this.revenueCount = this.revenues.length;

    // Mock Revenue Type Data (ประเภทรายได้และกลุ่มรายได้)
    this.revenueTypes = [
      {
        TYPE_CODE: 'RT01',
        TYPE_NAME: 'รายได้จากการเช่า',
        GROUP_NAME: 'รายได้หลัก',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      },
      {
        TYPE_CODE: 'RT02',
        TYPE_NAME: 'รายได้จากบริการ',
        GROUP_NAME: 'รายได้เสริม',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      }
    ];
    this.revenueTypeCount = this.revenueTypes.length;

    // Mock Business Revenue Data (ประเภทธุรกิจและรายได้)
    this.businessRevenues = [
      {
        BUSINESS_TYPE: 'BT01',
        BUSINESS_NAME: 'ร้านอาหาร',
        REVENUE_CODE: 'REV001',
        REVENUE_NAME: 'ค่าเช่าพื้นที่',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      },
      {
        BUSINESS_TYPE: 'BT02',
        BUSINESS_NAME: 'ร้านค้าปลีก',
        REVENUE_CODE: 'REV001',
        REVENUE_NAME: 'ค่าเช่าพื้นที่',
        STATUS: 'A',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/'
      }
    ];
    this.businessRevenueCount = this.businessRevenues.length;
  }

  // ==================== FILTERING ====================
  getFilteredRevenues(): any[] {
    if (!this.searchQuery.trim()) {
      return this.revenues;
    }
    const query = this.searchQuery.toLowerCase();
    return this.revenues.filter(item =>
      item.REVENUE_CODE.toLowerCase().includes(query) ||
      item.REVENUE_NAME.toLowerCase().includes(query)
    );
  }

  getFilteredRevenueTypes(): any[] {
    if (!this.searchQuery.trim()) {
      return this.revenueTypes;
    }
    const query = this.searchQuery.toLowerCase();
    return this.revenueTypes.filter(item =>
      item.TYPE_CODE.toLowerCase().includes(query) ||
      item.TYPE_NAME.toLowerCase().includes(query)
    );
  }

  getFilteredBusinessRevenues(): any[] {
    if (!this.searchQuery.trim()) {
      return this.businessRevenues;
    }
    const query = this.searchQuery.toLowerCase();
    return this.businessRevenues.filter(item =>
      item.BUSINESS_NAME.toLowerCase().includes(query) ||
      item.REVENUE_NAME.toLowerCase().includes(query)
    );
  }

  // ==================== CRUD OPERATIONS (Placeholders) ====================
openAddModal(): void {
  if (this.activeCategory === 'revenue') {
    this.revenueDrawerMode = 'create';
    this.selectedRevenue = null;
    this.revenueDrawerOpen = true;
  }
  // TODO: Add other categories later
}


editItem(item: any): void {
  if (this.activeCategory === 'revenue') {
    this.revenueDrawerMode = 'edit';
    this.selectedRevenue = item;
    this.revenueDrawerOpen = true;
  }
}

onRevenueDrawerClose(): void {
  this.revenueDrawerOpen = false;
  this.selectedRevenue = null;
}

onRevenueDrawerSave(event: any): void {
  const { data, mode } = event;
  if (mode === 'create') {
    this.revenues = [data, ...this.revenues];
  } else {
    const idx = this.revenues.findIndex(r => r.REVENUE_CODE === data.REVENUE_CODE);
    if (idx !== -1) this.revenues[idx] = data;
  }
  this.revenueCount = this.revenues.length;
}

  deleteItem(item: any): void {
    console.log('Delete Item:', item);
    // TODO: Implement delete functionality
  }

  // ==================== HELPERS ====================
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const match = dateString.match(/\/Date\((\d+)\)\//);
    if (match) {
      const timestamp = parseInt(match[1]);
      const date = new Date(timestamp);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return dateString;
  }

  getStatusLabel(status: string): string {
    return status === 'A' ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}
