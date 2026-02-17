// receipt-detail-modal.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipt-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-detail-modal.component.html',
  styleUrl: './receipt-detail-modal.component.css'
})
export class ReceiptDetailModalComponent {
  receipt = input.required<any>();
  close = output<void>();

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
      ready: { label: 'พร้อมออกใบเสร็จ', icon: 'pi-clock', description: 'รอการออกใบเสร็จ' },
      open: { label: 'ออกใบเสร็จแล้ว', icon: 'pi-check-circle', description: 'ออกใบเสร็จเรียบร้อยแล้ว' },
      cancel: { label: 'ยกเลิก', icon: 'pi-times-circle', description: 'ใบเสร็จถูกยกเลิก' }
    };
    return configs[status] || configs['ready'];
  }

  onDownloadPDF(): void {
    alert('Mock: กำลังดาวน์โหลด PDF');
  }

  onSendEmail(): void {
    alert('Mock: กำลังส่งอีเมล');
  }
}
