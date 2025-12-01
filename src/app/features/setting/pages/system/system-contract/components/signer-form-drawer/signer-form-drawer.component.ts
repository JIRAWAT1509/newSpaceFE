// signer-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-signer-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, Button],
  templateUrl: './signer-form-drawer.component.html',
  styleUrl: './signer-form-drawer.component.css'
})
export class SignerFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() signer: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {};
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  // Dropdown options
  repTypeOptions: DropdownOption[] = [
    { label: 'ผู้ให้บริการ (Service Provider)', value: 'P' },
    { label: 'ลูกค้า (Client)', value: 'C' },
    { label: 'พยาน (Witness)', value: 'W' }
  ];

  statusOptions: DropdownOption[] = [
    { label: 'แสดง', value: 'Y' },
    { label: 'ไม่แสดง', value: 'N' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['signer'] && this.signer && this.mode === 'edit') {
      this.populateForm(this.signer);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  populateForm(signer: any): void {
    this.formData = { ...signer };
  }

  resetForm(): void {
    this.formData = {
      OU_CODE: '001',
      REPRESENT: '',
      POSITION_NAME: '',
      REP_TYPE: '',
      STATUS: 'Y' // Default to 'แสดง'
    };
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.formData.REPRESENT?.trim()) {
      this.errors['REPRESENT'] = 'กรุณากรอกรายชื่อผู้ลงนาม';
      isValid = false;
    }

    if (!this.formData.POSITION_NAME?.trim()) {
      this.errors['POSITION_NAME'] = 'กรุณากรอกตำแหน่งผู้ลงนาม';
      isValid = false;
    }

    if (!this.formData.REP_TYPE) {
      this.errors['REP_TYPE'] = 'กรุณาเลือกประเภทการลงนาม';
      isValid = false;
    }

    if (!this.formData.STATUS) {
      this.errors['STATUS'] = 'กรุณาเลือกสถานะ';
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Add timestamps and metadata
    const now = '/Date(' + new Date().getTime() + ')/';

    if (this.mode === 'create') {
      this.formData.CREATE_BY = 'SPACE';
      this.formData.CREATE_DATE = now;
    }

    this.formData.UPD_BY = 'SPACE';
    this.formData.UPD_DATE = now;

    // Add REP_TYPE_NAME based on selected REP_TYPE
    const selectedRepType = this.repTypeOptions.find(
      opt => opt.value === this.formData.REP_TYPE
    );
    if (selectedRepType) {
      this.formData.REP_TYPE_NAME = selectedRepType.label.split(' (')[0]; // Get only Thai name
    }

    // Add STATUS_NAME based on selected STATUS
    const selectedStatus = this.statusOptions.find(
      opt => opt.value === this.formData.STATUS
    );
    if (selectedStatus) {
      this.formData.STATUS_NAME = selectedStatus.label;
    }

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
