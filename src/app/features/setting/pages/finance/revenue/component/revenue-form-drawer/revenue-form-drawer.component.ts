// revenue-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-revenue-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './revenue-form-drawer.component.html',
  styleUrl: './revenue-form-drawer.component.css'
})
export class RevenueFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() revenue: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  taxOptions = [
  { label: 'ภาษีหัก ณ ที่จ่าย 1%(R1)', value: 'R1' },
  { label: 'ภาษีหัก ณ ที่จ่าย 3%(R2)', value: 'R2' },
  { label: 'ภาษีหัก ณ ที่จ่าย 5%(R3)', value: 'R3' }
];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenue'] && this.revenue && this.mode === 'edit') {
      this.populateForm(this.revenue);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  populateForm(revenue: any): void {
    this.formData = { ...revenue };
  }

  resetForm(): void {
    this.formData = {
      REVENUE_CODE: '',
      REVENUE_NAME: '',
      VAT_PERCENT: '',
      WH_TAX_NORMAL: '',
      WH_TAX_NO_BOOK: '',
      WH_TAX_NO_RECEIPT: '',
      WH_TAX_NORMAL_NO_BOOK: '',
      WH_TAX_NO_BOOK_NO_RECEIPT: '',
      WH_TAX_NO_RECEIPT_NO_BOOK: '',
      WH_TAX_NORMAL_FOREIGN: '',
      WH_TAX_NO_BOOK_FOREIGN: '',
      PROFIT_CENTER: '',
      ACCOUNT_CODE: '',
      ACCOUNT_CODE_NO_BOOK: '',
      UPDATE_TYPE: 'ต้น', // ต้น or ไม่ต้น
      BILLING_TYPE: 'Fixed', // Fixed or Non Fixed
      CN_FLAG: 'Yes', // Yes or No
      COUNTRY_TYPE: ''
    };
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Required: รหัสรายได้
    if (!this.formData.REVENUE_CODE?.trim()) {
      this.errors['REVENUE_CODE'] = 'กรุณากรอกรหัสรายได้';
      isValid = false;
    }

    // Required: ชื่อรายได้
    if (!this.formData.REVENUE_NAME?.trim()) {
      this.errors['REVENUE_NAME'] = 'กรุณากรอกชื่อรายได้';
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Add timestamps
    const now = '/Date(' + new Date().getTime() + ')/';

    if (this.mode === 'create') {
      this.formData.CREATE_BY = 'SPACE';
      this.formData.CREATE_DATE = now;
    }

    this.formData.UPD_BY = 'SPACE';
    this.formData.UPD_DATE = now;

    // Simulate API call
    setTimeout(() => {
      this.save.emit({
        data: this.formData,
        mode: this.mode
      });
      this.isSubmitting = false;
      this.onClose();
    }, 500);
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }
}
