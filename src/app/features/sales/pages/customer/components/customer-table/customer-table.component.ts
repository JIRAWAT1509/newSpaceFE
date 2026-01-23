// customer-table.component.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Customer,
  CLASS_DEFINITIONS,
  STATUS_LABELS,
  CHURN_RISK_LABELS
} from '@core/models/customer.model';

type SortColumn = 'name' | 'class' | 'segment' | 'owner' | 'arr' | 'csat' | 'churnRisk' | 'nextAction';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.css'
})
export class CustomerTableComponent {
  // Inputs
  customers = input.required<Customer[]>();

  // Outputs
  editCustomer = output<string>();
  deleteCustomer = output<string>();
  viewCustomer = output<string>(); // New output for viewing customer details

  // Sorting state
  sortColumn = signal<SortColumn | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Sorted customers
  sortedCustomers = computed(() => {
    const customers = [...this.customers()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column || !direction) {
      return customers;
    }

    return customers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'name':
          aValue = this.getDisplayName(a).toLowerCase();
          bValue = this.getDisplayName(b).toLowerCase();
          break;
        case 'class':
          aValue = a.class;
          bValue = b.class;
          break;
        case 'segment':
          aValue = a.segment.toLowerCase();
          bValue = b.segment.toLowerCase();
          break;
        case 'owner':
          aValue = a.owner.toLowerCase();
          bValue = b.owner.toLowerCase();
          break;
        case 'arr':
          aValue = a.arr;
          bValue = b.arr;
          break;
        case 'csat':
          aValue = a.csat;
          bValue = b.csat;
          break;
        case 'churnRisk':
          const riskOrder = { low: 1, medium: 2, high: 3 };
          aValue = riskOrder[a.churnRisk];
          bValue = riskOrder[b.churnRisk];
          break;
        case 'nextAction':
          aValue = (a.nextAction || '').toLowerCase();
          bValue = (b.nextAction || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Toggle sort
  toggleSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      // Cycle through: asc -> desc -> null
      const current = this.sortDirection();
      if (current === 'asc') {
        this.sortDirection.set('desc');
      } else if (current === 'desc') {
        this.sortDirection.set(null);
        this.sortColumn.set(null);
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Get sort icon
  getSortIcon(column: SortColumn): string {
    if (this.sortColumn() !== column) {
      return 'pi-sort-alt';
    }
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }

  // Check if column is sorted
  isSorted(column: SortColumn): boolean {
    return this.sortColumn() === column;
  }

  // Get display name
  getDisplayName(customer: Customer): string {
    return customer.companyName || `${customer.firstName} ${customer.lastName}`;
  }

  // Get class info
  getClassInfo(classType: string) {
    return CLASS_DEFINITIONS.find(c => c.class === classType);
  }

  // Get status info
  getStatusInfo(status: string) {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS];
  }

  // Get churn risk info
  getChurnRiskInfo(risk: string) {
    return CHURN_RISK_LABELS[risk as keyof typeof CHURN_RISK_LABELS];
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `฿${(amount / 1000).toFixed(0)}K`;
  }

  // Format CSAT
  formatCSAT(score: number): string {
    return score.toFixed(1);
  }

  // Get CSAT stars
  getCSATStars(score: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(score) ? 1 : 0);
  }

  // Actions
  onEdit(customerId: string, event: Event): void {
    event.stopPropagation();
    this.editCustomer.emit(customerId);
  }

  onDelete(customerId: string, event: Event): void {
    event.stopPropagation();
    this.deleteCustomer.emit(customerId);
  }

  onRowClick(customerId: string): void {
    // Emit view customer event to show detail modal
    this.viewCustomer.emit(customerId);
  }
}
