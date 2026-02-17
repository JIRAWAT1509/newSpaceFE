// budget-summary.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Company, validateBudgetSum } from '@core/models/budget.model';

@Component({
  selector: 'app-budget-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-summary.component.html',
  styleUrl: './budget-summary.component.css'
})
export class BudgetSummaryComponent {
  // Inputs
  company = input.required<Company>();

  // Computed: Total team budgets
  totalTeamBudgets = computed(() => {
    return this.company().teams.reduce((sum, team) => sum + team.budget.forecast, 0);
  });

  // Computed: Validation result
  validation = computed(() => {
    const companyBudget = this.company().budget.forecast;
    const teamTotal = this.totalTeamBudgets();
    return validateBudgetSum(companyBudget, teamTotal);
  });

  // Computed: Status type
  statusType = computed(() => {
    const validation = this.validation();
    if (validation.valid) return 'balanced';
    if (validation.difference > 0) {
      // Check if over or under
      return this.totalTeamBudgets() > this.company().budget.forecast ? 'over' : 'under';
    }
    return 'under';
  });

  // Format currency
  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString()}`;
  }

  // Get status icon
  getStatusIcon(): string {
    switch (this.statusType()) {
      case 'balanced': return 'pi-check-circle';
      case 'over': return 'pi-exclamation-triangle';
      case 'under': return 'pi-info-circle';
      default: return 'pi-circle';
    }
  }

  // Get status text
  getStatusText(): string {
    const validation = this.validation();
    if (validation.valid) return 'Balanced';

    const diff = Math.abs(validation.difference);
    if (this.totalTeamBudgets() > this.company().budget.forecast) {
      return `Over-allocated by ${this.formatCurrency(diff)}`;
    }
    return `Under-allocated by ${this.formatCurrency(diff)}`;
  }

  // Math for template
  Math = Math;
}
