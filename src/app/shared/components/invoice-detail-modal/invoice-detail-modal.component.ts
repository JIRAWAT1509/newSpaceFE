// invoice-detail-modal.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail-modal.component.html',
  styleUrl: './invoice-detail-modal.component.css'
})
export class InvoiceDetailModalComponent {
  invoice = input.required<any>();
  isFromReadyList = input<boolean>(false); // ✅ FIX #3: Know if from ready list
  close = output<void>();
  issueInvoice = output<any>(); // ✅ FIX #3: Emit to parent to issue invoice

  onClose(): void {
    this.close.emit();
  }

  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusConfig(status: string) {
    const configs: Record<string, any> = {
      ready: { label: 'พร้อมออกใบแจ้งหนี้', icon: 'pi-clock', description: 'รอการออกใบแจ้งหนี้' },
      open: { label: 'ออกใบแจ้งหนี้แล้ว', icon: 'pi-check-circle', description: 'ออกใบแจ้งหนี้เรียบร้อยแล้ว' },
      cancel: { label: 'ยกเลิก', icon: 'pi-times-circle', description: 'ใบแจ้งหนี้ถูกยกเลิก' }
    };
    return configs[status] || configs['ready'];
  }

  onDownloadPDF(): void {
    alert('Mock: กำลังดาวน์โหลด PDF');
  }

  onSendEmail(): void {
    alert('Mock: กำลังส่งอีเมล');
  }

  // ✅ FIX #3: Issue invoice from detail modal
  onIssueInvoice(): void {
    this.issueInvoice.emit(this.invoice());
    this.close.emit();
  }
}
