// vendor-kpi-cards.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorStats } from '../../../../../../core/models/vendor-contract.model';

@Component({
  selector: 'app-vendor-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-kpi-cards.component.html',
  styleUrl: './vendor-kpi-cards.component.css'
})
export class VendorKpiCardsComponent {
  stats = input.required<VendorStats>();

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '฿' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '฿' + (value / 1000).toFixed(0) + 'K';
    }
    return '฿' + value.toLocaleString();
  }
}
