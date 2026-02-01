// company-budget-card.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Company } from '@core/models/budget.model';
import { BudgetBarComponent } from '../budget-bar/budget-bar.component';

@Component({
  selector: 'app-company-budget-card',
  standalone: true,
  imports: [CommonModule, BudgetBarComponent],
  templateUrl: './company-budget-card.component.html',
  styleUrl: './company-budget-card.component.css'
})
export class CompanyBudgetCardComponent {
  // Inputs
  company = input.required<Company>();

  // Outputs
  edit = output<string>();
  viewMonthly = output<string>();

  // Handle edit
  onEdit(): void {
    this.edit.emit(this.company().id);
  }

  // Handle view monthly breakdown
  onViewMonthly(): void {
    this.viewMonthly.emit(this.company().id);
  }

  // Get total teams count
  getTeamsCount(): number {
    return this.company().teams.length;
  }

  // Get total members count
  getMembersCount(): number {
    return this.company().teams.reduce((total, team) => total + team.members.length, 0);
  }
}
