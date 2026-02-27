// cost-center-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-cost-center-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './cost-center-form-drawer.component.html',
  styleUrl: './cost-center-form-drawer.component.css'
})
export class CostCenterFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() costCenter: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode === 'create') {
      if (changes['mode']?.currentValue === 'create' || changes['isOpen']?.currentValue === true) {
        this.resetForm();
      }
      this.cdr.detectChanges();
      return;
    }
    // โหมดแก้ไข: เติมฟอร์มทุกครั้งที่ drawer เปิดและมี costCenter (แก้ปัญหาแก้ไขไม่ได้)
    if (this.isOpen && this.mode === 'edit' && this.costCenter) {
      this.populateForm(this.costCenter);
      this.cdr.detectChanges();
      setTimeout(() => {
        if (this.mode === 'edit' && this.costCenter) {
          this.populateForm(this.costCenter);
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }

  populateForm(costCenter: any): void {
    this.formData = {
      ...costCenter,
      COST_CENTER_CODE: costCenter.COST_CENTER_CODE ?? '',
      IO: costCenter.IO ?? '',
      DESCRIPTION: costCenter.DESCRIPTION ?? '',
      ACC_NO: costCenter.ACC_NO ?? '',
      INTER_ACC_NO: costCenter.INTER_ACC_NO ?? ''
    };
  }

  resetForm(): void {
    this.formData = {
      OU_CODE: '001',
      COST_CENTER_CODE: '',
      IO: '',
      DESCRIPTION: '',
      ACC_NO: '',
      INTER_ACC_NO: ''
    };
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Required fields
    if (!this.formData.COST_CENTER_CODE?.trim()) {
      this.errors['COST_CENTER_CODE'] = 'กรุณากรอก Cost Center';
      isValid = false;
    }

    if (!this.formData.IO?.trim()) {
      this.errors['IO'] = 'กรุณากรอก IO';
      isValid = false;
    }

    // Optional fields - no validation needed
    // DESCRIPTION, ACC_NO, INTER_ACC_NO are optional

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

    // Simulate API call delay
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
