// decoration-tab.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { DateTime } from 'luxon';

interface Section {
  id: string;
  name: string;
}

interface AreaSummary {
  building: string;
  floor: string;
  unitNumber: string;
  status: string;
  zone: string;
  width: number;
  length: number;
  totalArea: number;
}

@Component({
  selector: 'app-decoration-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePicker,
    InputText
  ],
  templateUrl: './decoration-tab.component.html',
  styleUrl: './decoration-tab.component.css'
})
export class DecorationTabComponent implements OnInit {
  form!: FormGroup;

  sections: Section[] = [
    { id: 'decoration', name: 'การตกแต่งสถานที่' },
    { id: 'store-details', name: 'รายละเอียดร้านค้า' },
    { id: 'area-summary', name: 'พื้นที่รวมทั้งหมด' }
  ];

  // Area list - Mock data, replace with actual from previous tabs
  areaList = signal<AreaSummary[]>([
    { building: 'A', floor: '1', unitNumber: '101', status: 'Active', zone: 'North', width: 10, length: 15, totalArea: 150 }
  ]);

  serviceContractTypeOptions = [
    { label: 'จุดกระจายสัญญาณ', value: 'signal_distribution' },
    { label: 'เสาโทรศัพท์', value: 'cell_tower' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      // Decoration section
      noDecoration: [false],
      decorationStartDate: [''],
      decorationEndDate: [''],
      decorationDays: [{ value: 0, disabled: true }],
      pricePerSqmPerDay: [0],
      totalPrice: [{ value: 0, disabled: true }],

      // Store details section
      openTime: [''],
      closeTime: [''],
      salesAmountVat: ['include'],
      phoneNumberCount: [0],
      atmCount: [0],
      vendingCount: [0],
      signalInstallationPoints: [0],
      serviceContractType: [''],

      // Area summary
      requestAreaMeasurement: [false]
    });
  }

  // ==================== SECTION PROGRESS ====================
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
      case 'decoration':
        // If not decorated, no required fields
        if (this.form.get('noDecoration')?.value) return [];
        return ['decorationStartDate', 'decorationEndDate', 'pricePerSqmPerDay'];
      case 'store-details':
        return ['openTime', 'closeTime', 'salesAmountVat'];
      case 'area-summary':
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

  // ==================== DECORATION CALCULATIONS ====================
  onNoDecorationChange(): void {
    const noDecoration = this.form.get('noDecoration')?.value;

    if (noDecoration) {
      // Disable and reset all decoration fields
      this.form.patchValue({
        decorationStartDate: '',
        decorationEndDate: '',
        decorationDays: 0,
        pricePerSqmPerDay: 0,
        totalPrice: 0
      });
    }
  }

  calculateDecorationDays(): void {
    const startDate = this.form.get('decorationStartDate')?.value;
    const endDate = this.form.get('decorationEndDate')?.value;

    if (startDate && endDate) {
      const start = DateTime.fromJSDate(new Date(startDate));
      const end = DateTime.fromJSDate(new Date(endDate));
      const days = Math.ceil(end.diff(start, 'days').days);

      this.form.patchValue({ decorationDays: days > 0 ? days : 0 });
      this.calculateTotalPrice();
    }
  }

  calculateTotalPrice(): void {
    const days = this.form.get('decorationDays')?.value || 0;
    const pricePerSqmPerDay = this.form.get('pricePerSqmPerDay')?.value || 0;

    // Get total area from area list
    const totalArea = this.areaList().reduce((sum, area) => sum + area.totalArea, 0);

    const totalPrice = days * pricePerSqmPerDay * totalArea;
    this.form.patchValue({ totalPrice });
  }
}
