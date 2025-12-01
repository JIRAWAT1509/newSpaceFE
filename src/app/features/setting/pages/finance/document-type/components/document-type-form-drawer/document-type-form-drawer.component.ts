// document-type-form-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

interface DocumentType {
  OU_CODE: string;
  DOC_CODE: string;
  DOC_NAME: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  UPD_PGM?: string;
}

@Component({
  selector: 'app-document-type-form-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './document-type-form-drawer.component.html',
  styleUrl: './document-type-form-drawer.component.css'
})
export class DocumentTypeFormDrawerComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() documentType: DocumentType | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ data: DocumentType; mode: 'create' | 'edit' }>();

  formData: DocumentType = this.getEmptyForm();
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentType'] && this.documentType && this.mode === 'edit') {
      this.populateForm(this.documentType);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  getEmptyForm(): DocumentType {
    return {
      OU_CODE: '001',
      DOC_CODE: '',
      DOC_NAME: ''
    };
  }

  populateForm(documentType: DocumentType): void {
    this.formData = { ...documentType };
  }

  resetForm(): void {
    this.formData = this.getEmptyForm();
    this.errors = {};
  }

  // ==================== VALIDATION ====================

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // รหัสเอกสาร (required)
    if (!this.formData.DOC_CODE?.trim()) {
      this.errors['DOC_CODE'] = 'กรุณากรอกรหัสเอกสาร';
      isValid = false;
    } else if (this.formData.DOC_CODE.trim().length > 10) {
      this.errors['DOC_CODE'] = 'รหัสเอกสารต้องไม่เกิน 10 ตัวอักษร';
      isValid = false;
    }

    // ชื่อเอกสาร (required)
    if (!this.formData.DOC_NAME?.trim()) {
      this.errors['DOC_NAME'] = 'กรุณากรอกชื่อเอกสาร';
      isValid = false;
    } else if (this.formData.DOC_NAME.trim().length > 100) {
      this.errors['DOC_NAME'] = 'ชื่อเอกสารต้องไม่เกิน 100 ตัวอักษร';
      isValid = false;
    }

    return isValid;
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Trim whitespace
    this.formData.DOC_CODE = this.formData.DOC_CODE.trim();
    this.formData.DOC_NAME = this.formData.DOC_NAME.trim();

    // Add timestamps
    const now = '/Date(' + new Date().getTime() + ')/';

    if (this.mode === 'create') {
      this.formData.CREATE_BY = 'SPACE';
      this.formData.CREATE_DATE = now;
      this.formData.UPD_PGM = 'F010601';
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
