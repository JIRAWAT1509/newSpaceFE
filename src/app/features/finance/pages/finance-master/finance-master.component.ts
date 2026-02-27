// src/app/features/finance/finance-master.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceDashboardComponent } from './components/finance-dashboard/finance-dashboard.component';
import { InvoiceManagementComponent } from './components/invoice-management/invoice-management.component';
import { PreReceiptManagementComponent } from './components/pre-receipt-management/pre-receipt-management.component'; // ✅ import
import { ReceiptManagementComponent } from './components/receipt-management/receipt-management.component';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-finance-master',
  standalone: true,
  imports: [
    CommonModule,
    FinanceDashboardComponent,
    InvoiceManagementComponent,
    PreReceiptManagementComponent, // ✅ เพิ่มใน imports
    ReceiptManagementComponent
  ],
  templateUrl: './finance-master.component.html',
  styleUrl: './finance-master.component.css'
})
export class FinanceMasterComponent {
  activeTab = signal<string>('dashboard');

  tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'pi-chart-bar' },
    { id: 'invoices', label: 'รอออกใบแจ้งหนี้', icon: 'pi-money-bill' },
    { id: 'pre-receipts', label: 'รอออกใบเสร็จรับเงิน', icon: 'pi-clock' }, // ✅ ตรวจสอบ id
    { id: 'receipts', label: 'ประวัติใบเสร็จรับเงิน', icon: 'pi-receipt' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  isActiveTab(tabId: string): boolean {
    return this.activeTab() === tabId;
  }
}

