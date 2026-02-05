// decline-info-modal.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DeclineInfo {
  contractNumber?: string;
  quotationNumber?: string;
  customerName?: string;
  reason: string;
}

@Component({
  selector: 'app-decline-info-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-icon">
              <i class="pi pi-times-circle"></i>
            </div>
            <h3 class="modal-title">ข้อมูลการ Decline</h3>
            <p class="modal-subtitle">กรุณากรอกเหตุผลการยกเลิกใบเสนอราคา/สัญญา</p>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Reference Info -->
            @if (contractNumber() || quotationNumber()) {
              <div class="info-section">
                @if (quotationNumber()) {
                  <div class="info-row">
                    <span class="info-label">เลขที่ใบเสนอราคา:</span>
                    <span class="info-value">{{ quotationNumber() }}</span>
                  </div>
                }
                @if (contractNumber()) {
                  <div class="info-row">
                    <span class="info-label">เลขที่สัญญา:</span>
                    <span class="info-value">{{ contractNumber() }}</span>
                  </div>
                }
                @if (customerName()) {
                  <div class="info-row">
                    <span class="info-label">ชื่อลูกค้า:</span>
                    <span class="info-value">{{ customerName() }}</span>
                  </div>
                }
              </div>
            }

            <!-- Reason Textbox -->
            <div class="form-group">
              <label class="form-label">
                <i class="pi pi-pencil"></i>
                เหตุผลการยกเลิก <span class="required">*</span>
              </label>
              <textarea
                class="form-textarea"
                [(ngModel)]="declineReason"
                placeholder="กรุณาระบุเหตุผลการยกเลิกใบเสนอราคา/สัญญา..."
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="char-count">
                {{ declineReason.length }}/500
              </div>
            </div>

            <!-- Additional Note -->
            <div class="note-box">
              <i class="pi pi-info-circle"></i>
              <span>ข้อมูลการ Decline จะถูกบันทึกเพื่อใช้ในการวิเคราะห์และปรับปรุงการบริการ</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" (click)="onCancel()">
              <i class="pi pi-times"></i>
              <span>ยกเลิก</span>
            </button>
            <button 
              class="btn-confirm" 
              (click)="onConfirm()"
              [disabled]="!declineReason.trim()"
              [class.disabled]="!declineReason.trim()"
            >
              <i class="pi pi-check"></i>
              <span>บันทึก</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      max-width: 500px;
      width: calc(100% - 2rem);
      margin: 1rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: scaleIn 0.2s ease;
      overflow: hidden;
    }

    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }

    .modal-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fef2f2;
    }

    .modal-icon i {
      font-size: 2rem;
      color: #dc2626;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .info-section {
      background: #f9fafb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0;
    }

    .info-row:not(:last-child) {
      border-bottom: 1px dashed #e5e7eb;
    }

    .info-label {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .info-value {
      color: #111827;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-label i {
      color: #6b7280;
    }

    .required {
      color: #dc2626;
    }

    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      resize: vertical;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea::placeholder {
      color: #9ca3af;
    }

    .char-count {
      text-align: right;
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    .note-box {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #eff6ff;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      color: #1e40af;
    }

    .note-box i {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .modal-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .btn-cancel, .btn-confirm {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-confirm {
      background: #dc2626;
      color: white;
    }

    .btn-confirm:hover:not(.disabled) {
      background: #b91c1c;
    }

    .btn-confirm.disabled {
      background: #fca5a5;
      cursor: not-allowed;
    }
  `]
})
export class DeclineInfoModalComponent {
  isOpen = input<boolean>(false);
  contractNumber = input<string>('');
  quotationNumber = input<string>('');
  customerName = input<string>('');

  confirm = output<DeclineInfo>();
  cancel = output<void>();

  declineReason: string = '';

  onConfirm(): void {
    if (this.declineReason.trim()) {
      this.confirm.emit({
        contractNumber: this.contractNumber(),
        quotationNumber: this.quotationNumber(),
        customerName: this.customerName(),
        reason: this.declineReason.trim()
      });
      this.declineReason = '';
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.declineReason = '';
  }
}
