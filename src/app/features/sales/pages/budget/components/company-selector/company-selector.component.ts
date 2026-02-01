// company-selector.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Company } from '@core/models/budget.model';

export type ViewMode = 'yearly' | 'monthly';

@Component({
  selector: 'app-company-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './company-selector.component.html',
  styleUrl: './company-selector.component.css'
})
export class CompanySelectorComponent {
  // Inputs
  companies = input.required<Company[]>();
  selectedCompanyId = input.required<string | null>();
  viewMode = input.required<ViewMode>();

  // Outputs
  companyChange = output<string>();
  viewModeChange = output<ViewMode>();
  addCompany = output<void>();

  // Local state for dropdown
  selectedCompany = signal<string | null>(null);

  ngOnInit(): void {
    this.selectedCompany.set(this.selectedCompanyId());
  }

  ngOnChanges(): void {
    this.selectedCompany.set(this.selectedCompanyId());
  }

  // Handle company selection
  onCompanyChange(event: any): void {
    const companyId = event.value;
    this.selectedCompany.set(companyId);
    this.companyChange.emit(companyId);
  }

  // Handle view mode toggle
  onViewModeChange(mode: ViewMode): void {
    this.viewModeChange.emit(mode);
  }

  // Get current company
  getCurrentCompany(): Company | null {
    const companyId = this.selectedCompanyId();
    if (!companyId) return null;
    return this.companies().find(c => c.id === companyId) || null;
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString()}`;
  }
}
