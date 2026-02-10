// src/app/shared/components/debt-detail-modal/debt-detail-modal.component.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Debt, DEBT_STATUS_CONFIG } from '@core/models/finance.model';

// ✅ เพิ่ม interface ชัดเจน
interface DebtStatusConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-debt-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-detail-modal.component.html',
  styleUrl: './debt-detail-modal.component.css'
})
export class DebtDetailModalComponent {
  debt = input.required<Debt>();
  close = output<void>();

  // ✅ แก้ return type ให้ชัดเจน
  getStatusConfig(status: string): DebtStatusConfig {
    const config = DEBT_STATUS_CONFIG[status as keyof typeof DEBT_STATUS_CONFIG];
    return config || {
      label: 'ไม่ทราบสถานะ',
      icon: 'pi-question-circle',
      color: 'text-gray-600',
      description: 'ไม่พบข้อมูลสถานะ'
    };
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  onClose(): void {
    this.close.emit();
  }

  onViewContract(): void {
    const debtData = this.debt();
    alert(`Mock: View ${debtData.contractFile}`);
  }

  onDownloadPDF(): void {
    alert('Mock: Download PDF');
  }

  onSendReminder(): void {
    const debtData = this.debt();
    alert(`Mock: Send reminder to ${debtData.customerName}`);
  }

  getPaymentHistory() {
    return [
      {
        date: '2024-11-15',
        amount: 50000,
        method: 'โอนเงิน',
        status: 'สำเร็จ',
        reference: 'PAY-001'
      },
      {
        date: '2024-10-15',
        amount: 50000,
        method: 'เช็ค',
        status: 'สำเร็จ',
        reference: 'PAY-002'
      }
    ];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return '฿' + amount.toLocaleString('th-TH');
  }

  calculateTotalPaid(): number {
    return this.getPaymentHistory().reduce((sum, payment) => {
      return payment.status === 'สำเร็จ' ? sum + payment.amount : sum;
    }, 0);
  }

  calculateRemainingDebt(): number {
    const debt = this.debt();
    return debt.amount - this.calculateTotalPaid();
  }
}
