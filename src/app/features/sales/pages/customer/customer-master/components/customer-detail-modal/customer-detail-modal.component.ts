// customer-detail-modal.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Customer,
  CLASS_DEFINITIONS,
  STATUS_LABELS,
  CHURN_RISK_LABELS,
  CHANNEL_LABELS
} from '@core/models/customer.model';

@Component({
  selector: 'app-customer-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detail-modal.component.html',
  styleUrl: './customer-detail-modal.component.css'
})
export class CustomerDetailModalComponent {
  // Inputs
  customer = input.required<Customer>();

  // Outputs
  close = output<void>();
  edit = output<string>(); // New output for editing customer

  // Get display name
  getDisplayName(): string {
    const c = this.customer();
    return c.companyName || `${c.firstName} ${c.lastName}`;
  }

  // Get class info
  getClassInfo() {
    return CLASS_DEFINITIONS.find(c => c.class === this.customer().class);
  }

  // Get status info
  getStatusInfo() {
    return STATUS_LABELS[this.customer().status];
  }

  // Get channel info
  getChannelInfo() {
    return CHANNEL_LABELS[this.customer().channel];
  }

  // Get churn risk info
  getChurnRiskInfo() {
    return CHURN_RISK_LABELS[this.customer().churnRisk];
  }

  // Format currency
  formatCurrency(amount: number | undefined): string {
    if (!amount) return '-';
    return `฿${amount.toLocaleString()}`;
  }

  // Format date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get CSAT stars
  getCSATStars(): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(this.customer().csat) ? 1 : 0);
  }

  // Mock contract click
  onContractClick(contractIndex: number): void {
    alert(`🚧 Redirect to contract #${contractIndex + 1} page (Feature coming soon)`);
  }

  // Mock area click
  onAreaClick(areaName: string): void {
    alert(`🚧 Redirect to area "${areaName}" page (Feature coming soon)`);
  }

  // Close modal
  onClose(): void {
    this.close.emit();
  }

  // Edit customer
  onEdit(): void {
    this.edit.emit(this.customer().id);
  }

  // Prevent closing when clicking inside modal
  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}
