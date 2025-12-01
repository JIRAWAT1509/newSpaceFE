// business-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-business-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, Button],
  templateUrl: './business-form-drawer.component.html',
  styleUrl: './business-form-drawer.component.css'
})
export class BusinessFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() formType: 'profit' | 'main-business' | 'sub-business' = 'profit';
  @Input() item: any = null;
  @Input() profitCenters: any[] = [];
  @Input() mainBusinessTypes: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item && this.mode === 'edit') {
      this.populateForm(this.item);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    } else if (changes['formType']) {
      this.resetForm();
    }
  }

  getHeaderTitle(): string {
    const action = this.mode === 'create' ? 'เพิ่ม' : 'แก้ไข';

    switch (this.formType) {
      case 'profit':
        return `${action} Profit Center`;
      case 'main-business':
        return `${action}ประเภทธุรกิจหลัก`;
      case 'sub-business':
        return `${action}ประเภทธุรกิจย่อย`;
      default:
        return action;
    }
  }

  populateForm(item: any): void {
    this.formData = { ...item };
  }

  resetForm(): void {
    this.formData = {
      OU_CODE: '001'
    };
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    switch (this.formType) {
      case 'profit':
        if (!this.formData.COST_CENTER_CODE?.trim()) {
          this.errors['COST_CENTER_CODE'] = 'กรุณากรอกรหัส Profit Center';
          isValid = false;
        }
        if (!this.formData.COST_CENTER_NAME?.trim()) {
          this.errors['COST_CENTER_NAME'] = 'กรุณากรอกชื่อ Profit Center';
          isValid = false;
        }
        break;

      case 'main-business':
        if (!this.formData.BUS_TYPE_CODE?.trim()) {
          this.errors['BUS_TYPE_CODE'] = 'กรุณากรอกรหัสประเภทธุรกิจ';
          isValid = false;
        }
        if (!this.formData.BUS_TYPE_NAME?.trim()) {
          this.errors['BUS_TYPE_NAME'] = 'กรุณากรอกชื่อประเภทธุรกิจ';
          isValid = false;
        }
        break;

      case 'sub-business':
        if (!this.formData.BUS_SUBTYPE_CODE?.trim()) {
          this.errors['BUS_SUBTYPE_CODE'] = 'กรุณากรอกรหัสประเภทธุรกิจย่อย';
          isValid = false;
        }
        if (!this.formData.BUS_SUBTYPE_NAME?.trim()) {
          this.errors['BUS_SUBTYPE_NAME'] = 'กรุณากรอกชื่อประเภทธุรกิจย่อย';
          isValid = false;
        }
        if (!this.formData.BUS_TYPE_CODE) {
          this.errors['BUS_TYPE_CODE'] = 'กรุณาเลือกประเภทธุรกิจหลัก';
          isValid = false;
        }
        if (!this.formData.COST_CENTER_CODE) {
          this.errors['COST_CENTER_CODE'] = 'กรุณาเลือก Profit Center';
          isValid = false;
        }
        break;
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

    // For sub-business, get the COST_CENTER_NAME from selected profit center
    if (this.formType === 'sub-business' && this.formData.COST_CENTER_CODE) {
      const selectedProfitCenter = this.profitCenters.find(
        pc => pc.COST_CENTER_CODE === this.formData.COST_CENTER_CODE
      );
      if (selectedProfitCenter) {
        this.formData.COST_CENTER_NAME = selectedProfitCenter.COST_CENTER_NAME;
      }
    }

    // Simulate API call delay
    setTimeout(() => {
      this.save.emit({
        data: this.formData,
        mode: this.mode,
        formType: this.formType
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
