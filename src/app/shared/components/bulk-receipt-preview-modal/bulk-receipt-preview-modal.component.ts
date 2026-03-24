// src/app/shared/components/bulk-receipt-preview-modal/bulk-receipt-preview-modal.component.ts

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt } from '@core/models/finance.model';

@Component({
  selector: 'app-bulk-receipt-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-receipt-preview-modal.component.html',
  styleUrl: './bulk-receipt-preview-modal.component.css',
})
export class BulkReceiptPreviewModalComponent {
  isOpen   = input<boolean>(false);
  receipts = input<Receipt[]>([]);
  confirm  = output<void>();
  cancel   = output<void>();

  totalAmount = computed(() =>
    this.receipts().reduce((s, r) => s + r.amount, 0)
  );

  today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('preview-backdrop')) {
      this.cancel.emit();
    }
  }
}
