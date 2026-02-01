// budget-bar.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BudgetBarSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-budget-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-bar.component.html',
  styleUrl: './budget-bar.component.css'
})
export class BudgetBarComponent {
  // Inputs
  actual = input.required<number>();
  forecast = input.required<number>();
  size = input<BudgetBarSize>('medium');
  showLabel = input<boolean>(true);
  showValues = input<boolean>(true);
  showPercentage = input<boolean>(true);
  label = input<string>('');

  // Computed percentage
  percentage = computed(() => {
    const forecast = this.forecast();
    const actual = this.actual();

    if (forecast === 0) return 0;
    return Math.round((actual / forecast) * 100);
  });

  // Format currency
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `฿${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `฿${(amount / 1000).toFixed(0)}K`;
    }
    return `฿${amount.toLocaleString()}`;
  }

  // Get status color based on percentage
  getStatusColor(): string {
    const pct = this.percentage();
    if (pct >= 90) return 'success';
    if (pct >= 70) return 'warning';
    return 'danger';
  }
}
