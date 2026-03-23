import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChequeRow, InvoiceRow } from '../create-invoice-modal/create-invoice-modal.component';

export type InvoiceDetailAction = 'issue' | 'issue_print' | 'issue_email' | 'view';

export interface IssueInvoiceEvent {
  invoice: any;
  print: boolean;
  email: boolean;
}

@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-detail-modal.component.html',
  styleUrls: ['./invoice-detail-modal.component.css'],
})
export class InvoiceDetailModalComponent {
  invoice = input.required<any>();
  isFromReadyList = input<boolean>(false);
  pendingAction = input<InvoiceDetailAction>('view');

  close = output<void>();
  issueInvoice = output<IssueInvoiceEvent>();
  invoiceUpdated = output<any>();

  // ─── Edit Mode ──────────────────────────────────────────────
  private editing = false;
  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  isEditing(): boolean {
    return this.editing;
  }

  startEdit() {
    this.editing = true;
    this.editForm = this.fb.group({
      contractNumber: [this.invoice()?.contractNumber || ''],
      customerName: [this.invoice()?.customerName || ''],
      collectionItem: [this.invoice()?.collectionItem || ''],
      amount: [this.invoice()?.amount || 0],
      startDate: [this.invoice()?.startDate || ''],
      remark: [this.invoice()?.remark || ''],
    });
  }

  cancelEdit() {
    this.editing = false;
  }

  saveEdit() {
    if (this.editForm.invalid) return;
    const updated = { ...this.invoice(), ...this.editForm.value };
    this.invoiceUpdated.emit(updated);
    this.editing = false;
  }

  onConfirm(): void {
    const action = this.pendingAction();
    if (action === 'view') return;
    this.issueInvoice.emit({
      invoice: this.invoice(),
      print: action === 'issue_print',
      email: action === 'issue_email',
    });
    this.close.emit();
  }

  // ─── Close ─────────────────────────────────────────────────
  onClose(): void {
    this.close.emit();
  }

  // ─── Issue Invoice ─────────────────────────────────────────
  onIssueInvoice(print = false, email = false) {
    this.issueInvoice.emit({
      invoice: this.invoice(),
      print,
      email,
    });
  }

  // ─── Computed Financial Fields ─────────────────────────────
  get chequeRows(): ChequeRow[] {
    return this.invoice()?.chequeRows ?? [];
  }

  get invoiceRows(): InvoiceRow[] {
    return this.invoice()?.invoiceRows ?? [];
  }

  get totalPayAmount(): number {
    return this.invoiceRows.reduce((s, r) => s + (r.payAmount || 0), 0);
  }

  get totalInvoiceAmount(): number {
    return this.invoiceRows.reduce((s, r) => s + (r.totalAmount || 0), 0);
  }

  get beforeVat(): number {
    const amt = this.invoice()?.amount ?? 0;
    return amt / 1.07;
  }

  get vatAmount(): number {
    return this.beforeVat * 0.07;
  }

  get difference(): number {
    return this.totalInvoiceAmount - this.totalPayAmount;
  }

  // label สำหรับปุ่มเดียวใน footer
  get actionButtonLabel(): string {
    const map: Record<InvoiceDetailAction, string> = {
      issue:       'ออกใบแจ้งหนี้',
      issue_print: 'ออกใบแจ้งหนี้ + พิมพ์เอกสาร',
      issue_email: 'ออกใบแจ้งหนี้ + ส่งอีเมล',
      view:        '',
    };
    return map[this.pendingAction()];
  }

  get actionButtonIcon(): string {
    const map: Record<InvoiceDetailAction, string> = {
      issue:       'pi-file-check',
      issue_print: 'pi-print',
      issue_email: 'pi-send',
      view:        '',
    };
    return map[this.pendingAction()];
  }

  // ─── Helpers ───────────────────────────────────────────────
  formatCurrency(amount: number): string {
    return `฿${(amount ?? 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusConfig(status: string) {
    const configs: Record<string, any> = {
      ready: {
        label: 'พร้อมออกใบแจ้งหนี้',
        icon: 'pi-clock',
        description: 'รอการออกใบแจ้งหนี้',
      },
      open: {
        label: 'ออกใบแจ้งหนี้แล้ว',
        icon: 'pi-check-circle',
        description: 'ออกใบแจ้งหนี้เรียบร้อยแล้ว',
      },
      cancel: {
        label: 'ยกเลิก',
        icon: 'pi-times-circle',
        description: 'ใบแจ้งหนี้ถูกยกเลิก',
      },
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
