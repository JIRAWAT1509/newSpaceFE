// monthly-breakdown-modal.component.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { MonthlyBreakdown, MONTH_NAMES_EN, MONTH_NAMES_TH } from '@core/models/budget.model';

@Component({
  selector: 'app-monthly-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumber, Button],
  templateUrl: './monthly-breakdown-modal.component.html',
  styleUrl: './monthly-breakdown-modal.component.css'
})
export class MonthlyBreakdownModalComponent {
  // Inputs
  companyName = input.required<string>();
  year = input.required<number>();
  yearlyForecast = input.required<number>();
  currentBreakdown = input.required<MonthlyBreakdown[]>();

  // Outputs
  close = output<void>();
  save = output<MonthlyBreakdown[]>();

  // Local breakdown copy for editing
  months = signal<MonthlyBreakdown[]>([]);

  // Validation trigger
  private validationTrigger = signal(0);

  ngOnInit(): void {
    // Deep copy the current breakdown
    this.months.set(this.currentBreakdown().map(m => ({ ...m })));
  }

  // Computed: Total of all months
  totalMonthlyForecast = computed(() => {
    this.validationTrigger();
    return this.months().reduce((sum, m) => sum + m.forecast, 0);
  });

  // Computed: Difference from yearly
  difference = computed(() => {
    return this.totalMonthlyForecast() - this.yearlyForecast();
  });

  // Computed: Is balanced
  isBalanced = computed(() => {
    return Math.abs(this.difference()) < 0.01; // Allow tiny rounding difference
  });

  // Computed: Validation
  isValid = computed(() => {
    this.validationTrigger();

    // All months must have positive forecast
    const allPositive = this.months().every(m => m.forecast > 0);

    // Total must match yearly (or be very close)
    return allPositive && this.isBalanced();
  });

  // Update month forecast
  updateMonthForecast(monthIndex: number, value: number): void {
    this.months.update(months => {
      const updated = [...months];
      updated[monthIndex] = { ...updated[monthIndex], forecast: value || 0 };
      return updated;
    });
    this.validationTrigger.update(v => v + 1);
  }

  // Distribute evenly across all months
  distributeEvenly(): void {
    const monthlyAmount = this.yearlyForecast() / 12;
    this.months.update(months =>
      months.map(m => ({ ...m, forecast: monthlyAmount }))
    );
    this.validationTrigger.update(v => v + 1);
  }

  // Auto-balance: adjust last month to match total
  autoBalance(): void {
    const currentTotal = this.months().reduce((sum, m, idx) =>
      idx < 11 ? sum + m.forecast : sum, 0
    );
    const lastMonthAmount = this.yearlyForecast() - currentTotal;

    this.months.update(months => {
      const updated = [...months];
      updated[11] = { ...updated[11], forecast: Math.max(0, lastMonthAmount) };
      return updated;
    });
    this.validationTrigger.update(v => v + 1);
  }

  // Get month display name
  getMonthName(month: MonthlyBreakdown): string {
    return `${MONTH_NAMES_EN[month.month - 1]} (${MONTH_NAMES_TH[month.month - 1]})`;
  }

  // Get status color
  getStatusColor(): string {
    if (this.isBalanced()) return 'success';
    return this.difference() > 0 ? 'danger' : 'warning';
  }

  // Get status text
  getStatusText(): string {
    if (this.isBalanced()) return 'Balanced';
    const diff = Math.abs(this.difference());
    if (this.difference() > 0) {
      return `Over by ${this.formatCurrency(diff)}`;
    }
    return `Under by ${this.formatCurrency(diff)}`;
  }

  // Handle save
  onSave(): void {
    if (this.isValid()) {
      this.save.emit(this.months());
    }
  }

  // Handle close
  onClose(): void {
    this.close.emit();
  }

  // Prevent closing when clicking inside modal
  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString()}`;
  }

  // Math for template
  Math = Math;
}
