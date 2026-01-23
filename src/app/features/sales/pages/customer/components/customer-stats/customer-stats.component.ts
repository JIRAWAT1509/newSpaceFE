// customer-stats.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CustomerStats {
  totalCustomers: number;
  averageCSAT: number;
  csatTrend: number; // percentage change
  churnRate: number;
  churnTrend: number; // percentage change
  activeDeals: number;
  dealsTrend: number; // percentage change
}

@Component({
  selector: 'app-customer-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-stats.component.html',
  styleUrl: './customer-stats.component.css'
})
export class CustomerStatsComponent {
  stats = input.required<CustomerStats>();

  isPositiveTrend(value: number): boolean {
    return value > 0;
  }

  formatTrend(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }
}
