// top-customers-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopCustomer } from '@core/models/dashboard.types';

@Component({
  selector: 'app-top-customers-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-customers-table.component.html',
  styleUrl: './top-customers-table.component.css'
})
export class TopCustomersTableComponent {

  @Input() customers: TopCustomer[] = [];
  @Input() isLoading: boolean = false;

  sortColumn: string = 'arr';
  sortDirection: 'asc' | 'desc' = 'desc';

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }

    this.customers.sort((a, b) => {
      let aVal: any = a[column as keyof TopCustomer];
      let bVal: any = b[column as keyof TopCustomer];

      if (column === 'name') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'pi pi-sort-alt';
    return this.sortDirection === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down';
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  getClassBadgeClass(className: string): string {
    const classMap: Record<string, string> = {
      'A': 'class-a',
      'B': 'class-b',
      'C': 'class-c',
      'D': 'class-d'
    };
    return classMap[className] || 'class-d';
  }

  getRiskBadgeClass(risk: string): string {
    const riskMap: Record<string, string> = {
      'low': 'risk-low',
      'medium': 'risk-medium',
      'high': 'risk-high'
    };
    return riskMap[risk] || 'risk-low';
  }
}
