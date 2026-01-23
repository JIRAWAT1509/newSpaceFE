// revenue-tab.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';

interface Section {
  id: string;
  name: string;
}

interface RevenueCode {
  code: string;
  name: string;
  characteristic: string;
  referStatus: string;
  group: string;
  type: string;
  collectBefore: string;
}

interface OtherRevenue {
  code: string;
  name: string;
  type: string;
  amount: number;
  paymentType: string;
}

@Component({
  selector: 'app-revenue-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePicker,
    InputText
  ],
  templateUrl: './revenue-tab.component.html',
  styleUrl: './revenue-tab.component.css'
})
export class RevenueTabComponent implements OnInit {
  // Create own form
  form!: FormGroup;

  // Section progress
  sections: Section[] = [
    { id: 'revenue-code', name: 'รหัสรายได้' },
    { id: 'other-revenue', name: 'รายได้อื่นๆ' },
    { id: 'rent-service', name: 'ค่าเช่า/ค่าบริการ' },
    { id: 'building-tax', name: 'ภาษีโรงเรือน' }
  ];

  // Table data
  revenueCodeList = signal<RevenueCode[]>([]);
  otherRevenueList = signal<OtherRevenue[]>([]);

  // Drawer states
  showRevenueCodeDrawer = signal<boolean>(false);
  showOtherRevenueDrawer = signal<boolean>(false);

  // Drawer forms
  revenueCodeForm!: FormGroup;
  otherRevenueForm!: FormGroup;

  // Dropdown options
  revenueTypeOptions = [
    { label: 'ค่าเช่า', value: 'rent' },
    { label: 'ค่าบริการ', value: 'service' },
    { label: 'ค่าบริการส่วนกลาง', value: 'common_service' }
  ];

  taxCalculationOptions = [
    { label: 'คำนวนตามพื้นที่', value: 'by_area' },
    { label: 'คำนวนตามยอดขาย', value: 'by_revenue' },
    { label: 'อัตราคงที่', value: 'fixed_rate' }
  ];

  taxPeriodOptions = [
    { label: 'รายเดือน', value: 'monthly' },
    { label: 'รายไตรมาส', value: 'quarterly' },
    { label: 'รายปี', value: 'yearly' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initDrawerForms();
    this.initMainForm();
  }

  initMainForm(): void {
    this.form = this.fb.group({
      // Rent/Service section
      rentServiceType: [''],
      unitNumber: [''],
      advanceMonths: [0],
      amount: [0],
      paymentDueDate: [''],

      // Building Tax section
      taxCalculationMethod: [''],
      taxCollectionPeriod: ['']
    });
  }

  initDrawerForms(): void {
    // Revenue Code Form
    this.revenueCodeForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      characteristic: [''],
      referStatus: [''],
      group: [''],
      type: [''],
      collectBefore: ['']
    });

    // Other Revenue Form
    this.otherRevenueForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: [''],
      amount: [0, [Validators.required, Validators.min(0)]],
      paymentType: ['']
    });
  }

  // Section Progress
  isSectionCompleted(sectionId: string): boolean {
    // Implement based on your validation logic
    return false;
  }

  getSectionProgress(sectionId: string): number {
    // Implement based on your validation logic
    return 0;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Revenue Code Drawer
  openRevenueCodeDrawer(): void {
    this.revenueCodeForm.reset();
    this.showRevenueCodeDrawer.set(true);
  }

  saveRevenueCode(): void {
    if (this.revenueCodeForm.valid) {
      const newItem: RevenueCode = this.revenueCodeForm.value;
      this.revenueCodeList.update(list => [...list, newItem]);
      this.closeDrawer();
    } else {
      Object.keys(this.revenueCodeForm.controls).forEach(key => {
        this.revenueCodeForm.get(key)?.markAsTouched();
      });
    }
  }

  removeRevenueCode(index: number): void {
    this.revenueCodeList.update(list => list.filter((_, i) => i !== index));
  }

  // Other Revenue Drawer
  openOtherRevenueDrawer(): void {
    this.otherRevenueForm.reset();
    this.showOtherRevenueDrawer.set(true);
  }

  saveOtherRevenue(): void {
    if (this.otherRevenueForm.valid) {
      const newItem: OtherRevenue = this.otherRevenueForm.value;
      this.otherRevenueList.update(list => [...list, newItem]);
      this.closeDrawer();
    } else {
      Object.keys(this.otherRevenueForm.controls).forEach(key => {
        this.otherRevenueForm.get(key)?.markAsTouched();
      });
    }
  }

  removeOtherRevenue(index: number): void {
    this.otherRevenueList.update(list => list.filter((_, i) => i !== index));
  }

  // Close all drawers
  closeDrawer(): void {
    this.showRevenueCodeDrawer.set(false);
    this.showOtherRevenueDrawer.set(false);
  }
}
