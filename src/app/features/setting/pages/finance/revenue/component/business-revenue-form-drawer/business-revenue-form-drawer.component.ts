// business-revenue-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-business-revenue-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './business-revenue-form-drawer.component.html',
  styleUrl: './business-revenue-form-drawer.component.css'
})
export class BusinessRevenueFormDrawerComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() businessRevenue: any = null;
  @Input() revenues: any[] = []; // For dropdown options
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  statusOptions = [
    { label: 'ใช้งาน', value: 'A' },
    { label: 'ไม่ใช้งาน', value: 'I' }
  ];

  revenueOptions: any[] = [];

  ngOnInit(): void {
    this.updateRevenueOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenues']) {
      this.updateRevenueOptions();
    }
    if (changes['businessRevenue'] && this.businessRevenue && this.mode === 'edit') {
      this.populateForm(this.businessRevenue);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  updateRevenueOptions(): void {
    this.revenueOptions = this.revenues.map(rev => ({
      label: `${rev.REVENUE_CODE} - ${rev.REVENUE_NAME}`,
      value: rev.REVENUE_CODE,
      name: rev.REVENUE_NAME
    }));
  }

  populateForm(businessRevenue: any): void {
    this.formData = { ...businessRevenue };
  }

  resetForm(): void {
    this.formData = {
      BUSINESS_TYPE: '',
      BUSINESS_NAME: '',
      REVENUE_CODE: '',
      REVENUE_NAME: '',
      STATUS: 'A'
    };
    this.errors = {};
  }

  onRevenueCodeChange(): void {
    const selectedRevenue = this.revenues.find(r => r.REVENUE_CODE === this.formData.REVENUE_CODE);
    if (selectedRevenue) {
      this.formData.REVENUE_NAME = selectedRevenue.REVENUE_NAME;
    } else {
      this.formData.REVENUE_NAME = '';
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Required: ประเภทธุรกิจ
    if (!this.formData.BUSINESS_TYPE?.trim()) {
      this.errors['BUSINESS_TYPE'] = 'กรุณากรอกประเภทธุรกิจ';
      isValid = false;
    }

    // Required: ชื่อธุรกิจ
    if (!this.formData.BUSINESS_NAME?.trim()) {
      this.errors['BUSINESS_NAME'] = 'กรุณากรอกชื่อธุรกิจ';
      isValid = false;
    }

    // Required: รหัสรายได้
    if (!this.formData.REVENUE_CODE?.trim()) {
      this.errors['REVENUE_CODE'] = 'กรุณาเลือกรหัสรายได้';
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
