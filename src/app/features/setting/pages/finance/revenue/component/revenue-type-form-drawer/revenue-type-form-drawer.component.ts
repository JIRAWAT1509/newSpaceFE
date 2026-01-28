// revenue-type-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-revenue-type-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './revenue-type-form-drawer.component.html',
  styleUrl: './revenue-type-form-drawer.component.css'
})
export class RevenueTypeFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() revenueType: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  statusOptions = [
    { label: 'ใช้งาน', value: 'A' },
    { label: 'ไม่ใช้งาน', value: 'I' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenueType'] && this.revenueType && this.mode === 'edit') {
      this.populateForm(this.revenueType);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  populateForm(revenueType: any): void {
    this.formData = { ...revenueType };
  }

  resetForm(): void {
    this.formData = {
      TYPE_CODE: '',
      TYPE_NAME: '',
      GROUP_NAME: '',
      STATUS: 'A'
    };
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Required: รหัสประเภท
    if (!this.formData.TYPE_CODE?.trim()) {
      this.errors['TYPE_CODE'] = 'กรุณากรอกรหัสประเภท';
      isValid = false;
    }

    // Required: ชื่อประเภทรายได้
    if (!this.formData.TYPE_NAME?.trim()) {
      this.errors['TYPE_NAME'] = 'กรุณากรอกชื่อประเภทรายได้';
      isValid = false;
    }

    // Required: กลุ่มรายได้
    if (!this.formData.GROUP_NAME?.trim()) {
      this.errors['GROUP_NAME'] = 'กรุณากรอกกลุ่มรายได้';
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
