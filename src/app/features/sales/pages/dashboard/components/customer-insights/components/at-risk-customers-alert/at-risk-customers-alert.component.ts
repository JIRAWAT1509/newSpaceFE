// at-risk-customers-alert.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtRiskCustomer } from '@core/models/dashboard.types';

@Component({
  selector: 'app-at-risk-customers-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './at-risk-customers-alert.component.html',
  styleUrl: './at-risk-customers-alert.component.css'
})
export class AtRiskCustomersAlertComponent {

  @Input() customers: AtRiskCustomer[] = [];
  @Input() isLoading: boolean = false;

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  getRiskClass(risk: string): string {
    return risk === 'high' ? 'risk-high' : 'risk-medium';
  }

  getRiskIcon(risk: string): string {
    return risk === 'high' ? 'pi pi-exclamation-circle' : 'pi pi-exclamation-triangle';
  }
}
