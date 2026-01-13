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
    { id: 'basic', name: 'ข้อมูลพื้นฐาน' },
    { id: 'renewal', name: 'ข้อตกลงต่ออายุ' },
    { id: 'area', name: 'พื้นที่' }
  ];

  // Table data
  renewalAgreements = signal<RenewalAgreement[]>([]);
  areaDetails = signal<AreaDetail[]>([]);

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
      // Duration
      durationYears: [0, Validators.required],
      durationMonths: [0],
      durationDays: [0],

      // Dates
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      rentStartDate: ['', Validators.required],

      // Ratios and terms
      rentRatio: [0],
      serviceRatio: [0],
      renewalNoticeDays: [0],
      creditTermRent: [0, Validators.required],
      creditTermUtility: [0, Validators.required],
      paymentDay: [1],
      closurePenalty: [0],

      // Dropdowns
      paymentMethod: ['', Validators.required],
      revenueCollection: [''],
      hasAddendum: [false],

      // Adjustments
      adjustmentYears: [0],
      adjustmentPercent: [0],
      excludedProducts: [''],

      // Area
      requestAreaMeasurement: [false]
    });
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
      case 'basic':
        return ['durationYears', 'startDate', 'endDate', 'rentStartDate', 'creditTermRent', 'creditTermUtility', 'paymentMethod'];
      case 'renewal':
        return [];
      case 'area':
        return [];
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

  // Renewal Table Actions
  addRenewalRow(): void {
    this.renewalAgreements.update(rows => [...rows, {
      startDate: null,
      endDate: null,
      rate: null
    }]);
  }

  removeRenewalRow(index: number): void {
    this.renewalAgreements.update(rows => rows.filter((_, i) => i !== index));
  }

  // Area Table Actions
  addAreaRow(): void {
    this.areaDetails.update(rows => [...rows, {
      building: '',
      floor: '',
      unitNumber: '',
      status: '',
      zone: '',
      width: null,
      length: null,
      totalArea: null
    }]);
  }

  removeAreaRow(index: number): void {
    this.areaDetails.update(rows => rows.filter((_, i) => i !== index));
  }

  calculateArea(index: number): void {
    this.areaDetails.update(rows => {
      const row = rows[index];
      if (row.width && row.length) {
        row.totalArea = row.width * row.length;
      }
      return [...rows];
    });
  }
}
