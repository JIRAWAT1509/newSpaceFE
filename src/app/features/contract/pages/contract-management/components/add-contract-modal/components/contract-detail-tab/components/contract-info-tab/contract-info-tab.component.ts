// contract-info-tab.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

interface Section {
  id: string;
  name: string;
}

interface RenewalAgreement {
  startDate: Date | null;
  endDate: Date | null;
  rate: number | null;
}

interface AreaDetail {
  building: string;
  floor: string;
  unitNumber: string;
  status: string;
  zone: string;
  width: number | null;
  length: number | null;
  totalArea: number | null;
}

@Component({
  selector: 'app-contract-info-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    DatePicker,
    InputText,
    Textarea
  ],
  templateUrl: './contract-info-tab.component.html',
  styleUrl: './contract-info-tab.component.css'
})
export class ContractInfoTabComponent implements OnInit {
  // Create own form
  form!: FormGroup;

  sections: Section[] = [
    { id: 'booking', name: 'ข้อมูลใบจอง' },
    { id: 'tenant', name: 'ข้อมูลผู้เช่า (ฉบับยืนยัน)' }
  ];

  // Removed - no longer needed for R structure

  // Dropdown options
  paymentMethodOptions = [
    { label: 'เหมาจ่ายครั้งเดียว', value: 'lump_sum' },
    { label: 'จ่ายทุกวัน', value: 'daily' },
    { label: 'จ่ายทุกเดือน', value: 'monthly' },
    { label: 'จ่ายทุกปี', value: 'yearly' }
  ];

  revenueCollectionOptions = [
    { label: 'ไม่รับเงิน', value: 'none' },
    { label: 'รับเงินมี Cashier', value: 'with_cashier' },
    { label: 'รับเงินไม่มี Cashier', value: 'without_cashier' }
  ];

  yesNoOptions = [
    { label: 'YES', value: true },
    { label: 'NO', value: false }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      // Section: ข้อมูลใบจอง
      bookingNumber: [''],
      bookingDate: [''],
      bookingStatus: [''],
      bookingStartDate: [''],
      bookingEndDate: [''],
      bookingDuration: [''],
      transferBookingContract: [''],

      // Section: ข้อมูลผู้เช่า (ฉบับยืนยัน)
      // Only name and phone are soft-required; other fields are optional at this stage
      contractMaker: [''],
      legalEntityName: [''],
      registeredAddress: [''],
      documentDeliveryAddress: [''],
      phone: ['', [Validators.pattern(/^[0-9]{9,10}$/)]],
      email: ['', [Validators.email]],
      contactPerson: ['']
    });
  }

  // Error message helpers
  getPhoneError(): string {
    const phone = this.form.get('phone');
    if (phone?.errors?.['required']) {
      return 'กรุณากรอกเบอร์โทรศัพท์';
    }
    if (phone?.errors?.['pattern']) {
      return 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)';
    }
    return '';
  }

  getEmailError(): string {
    const email = this.form.get('email');
    if (email?.errors?.['required']) {
      return 'กรุณากรอกอีเมล';
    }
    if (email?.errors?.['email']) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    return '';
  }

  // Section Progress
  isSectionCompleted(sectionId: string): boolean {
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    return requiredFields.every(field => {
      const control = this.form.get(field);
      return control && control.valid && control.value;
    });
  }

  getSectionProgress(sectionId: string): number {
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    if (requiredFields.length === 0) return 100;

    const completedFields = requiredFields.filter(field => {
      const control = this.form.get(field);
      return control && control.valid && control.value;
    }).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  getRequiredFieldsBySection(sectionId: string): string[] {
    switch (sectionId) {
      case 'booking':
        return [];
      case 'tenant':
        return ['contractMaker', 'phone'];
      default:
        return [];
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
