// insurance-tab.component.ts
import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { PaymentMethodComponent } from './components/payment-method/payment-method.component';

interface Section {
  id: string;
  name: string;
}

interface GuaranteeDocument {
  documentNumber: string;
  amount: number;
  bank: string;
  branch: string;
  company: string;
}

interface ReceiptTransfer {
  receiptNumber: string;
  date: Date | null;
  amount: number;
  company: string;
}

interface PaymentTransfer {
  date: Date | null;
  amount: number;
  bank: string;
  branch: string;
  company: string;
}

interface PaymentCheck {
  checkNumber: string;
  date: Date | null;
  amount: number;
  bank: string;
  branch: string;
  company: string;
}

interface Installment {
  dueDate: Date | null;
  amount: number;
  rentDeposit: number;
  serviceDeposit: number;
  commonDeposit: number;
  totalWithVat: number;
  cashPayment: number;
  transfers: PaymentTransfer[];
  checks: PaymentCheck[];
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
  selector: 'app-insurance-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    DatePicker,
    InputText,
    PaymentMethodComponent
  ],
  templateUrl: './insurance-tab.component.html',
  styleUrl: './insurance-tab.component.css'
})
export class InsuranceTabComponent implements OnInit {
  form!: FormGroup;
  guaranteeForm!: FormGroup;

  // VAT Configuration
  vatRate = 7;

  // Show/Hide
  showBackToTop = signal<boolean>(false);
  showGuaranteeDrawer = signal<boolean>(false);

  // Sections
  sections: Section[] = [
    { id: 'deposit-config', name: 'วางเงินประกัน' },
    { id: 'guarantee', name: 'หลักประกัน' },
    { id: 'payments', name: 'การชำระเงินประกัน' },
    { id: 'area-summary', name: 'พื้นที่รวมทั้งหมด' }
  ];

  // Deposit calculations
  depositCalculations: any = {};

  // Lists
  guaranteeList = signal<GuaranteeDocument[]>([]);
  receiptTransfers = signal<ReceiptTransfer[]>([]);
  receiptPaymentTransfers = signal<PaymentTransfer[]>([]);
  receiptPaymentChecks = signal<PaymentCheck[]>([]);
  installments = signal<Installment[]>([]);
  meterTransfers = signal<PaymentTransfer[]>([]);
  meterChecks = signal<PaymentCheck[]>([]);
  decorationTransfers = signal<PaymentTransfer[]>([]);
  decorationChecks = signal<PaymentCheck[]>([]);
  areaList = signal<AreaSummary[]>([
    // Mock data - replace with actual from previous tabs
    { building: 'A', floor: '1', unitNumber: '101', status: 'Active', zone: 'North', width: 10, length: 15, totalArea: 150 }
  ]);

  // Dropdown options
  depositPeriodOptions = [
    { label: 'ไม่วางเงินประกัน', value: 'none' },
    ...Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1} เดือน`, value: i + 1 }))
  ];

  bankOptions = [
    { label: 'ธนาคารกสิกรไทย', value: 'KBANK' },
    { label: 'ธนาคารกรุงเทพ', value: 'BBL' },
    { label: 'ธนาคารไทยพาณิชย์', value: 'SCB' },
    { label: 'ธนาคารกรุงศรีอยุธยา', value: 'BAY' }
  ];

  branchOptions = signal<any[]>([]);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initGuaranteeForm();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.showBackToTop.set(scrollPosition > 300);
  }

  initForm(): void {
    this.form = this.fb.group({
      // Deposit period
      depositPeriod: ['none'],

      // Deposit rates
      rentDepositRate: [0],
      serviceDepositRate: [0],
      commonDepositRate: [0],
      totalDepositRate: [0],

      // Meter/Phone section
      meterDueDate: [''],
      meterAmount: [0],
      meterCashPayment: [0],

      // Decoration section
      decorationDueDate: [''],
      decorationAmount: [0],
      decorationCashPayment: [0]
    });
  }

  initGuaranteeForm(): void {
    this.guaranteeForm = this.fb.group({
      documentNumber: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      bank: ['', Validators.required],
      branch: ['', Validators.required],
      company: ['', Validators.required]
    });
  }

  // ==================== SCROLL ====================
  scrollToTop(): void {
    document.getElementById('progress-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==================== SECTION PROGRESS ====================
  isSectionCompleted(sectionId: string): boolean {
    // Implement validation logic
    return false;
  }

  getSectionProgress(sectionId: string): number {
    // Implement progress calculation
    return 0;
  }

  // ==================== DEPOSIT CALCULATIONS ====================
  onDepositPeriodChange(): void {
    const period = this.form.get('depositPeriod')?.value;
    if (period === 'none') {
      this.form.patchValue({
        rentDepositRate: 0,
        serviceDepositRate: 0,
        commonDepositRate: 0,
        totalDepositRate: 0
      });
    }
    this.calculateDeposits();
  }

  calculateDeposits(): void {
    const period = this.form.get('depositPeriod')?.value;
    if (period === 'none') return;

    const months = typeof period === 'number' ? period : 0;

    ['rentDeposit', 'serviceDeposit', 'commonDeposit', 'totalDeposit',
     'phoneDeposit', 'meterDeposit', 'decorationDeposit'].forEach(type => {
      const rateField = type + 'Rate';
      const rate = this.form.get(rateField)?.value || 0;
      const beforeVat = rate * months;
      const vat = beforeVat * (this.vatRate / 100);
      const total = beforeVat + vat;

      this.depositCalculations[type] = { beforeVat, vat, total };
    });
  }

  getDepositAmount(type: string, field: 'beforeVat' | 'vat' | 'total'): number {
    return this.depositCalculations[type]?.[field] || 0;
  }

  getRightColumnTotal(field: 'beforeVat' | 'vat' | 'total'): number {
    return (this.getDepositAmount('phoneDeposit', field) +
            this.getDepositAmount('meterDeposit', field) +
            this.getDepositAmount('decorationDeposit', field));
  }

  // ==================== GUARANTEE ====================
  openGuaranteeDrawer(): void {
    this.guaranteeForm.reset();
    this.showGuaranteeDrawer.set(true);
  }

  closeDrawer(): void {
    this.showGuaranteeDrawer.set(false);
  }

  onBankChange(): void {
    const bank = this.guaranteeForm.get('bank')?.value;
    // Mock branches - replace with actual data
    this.branchOptions.set([
      { label: 'สาขาสีลม', value: 'SILOM' },
      { label: 'สาขาสุขุมวิท', value: 'SUKHUMVIT' }
    ]);
    this.guaranteeForm.patchValue({ branch: '' });
  }

  saveGuarantee(): void {
    if (this.guaranteeForm.valid) {
      this.guaranteeList.update(list => [...list, this.guaranteeForm.value]);
      this.closeDrawer();
    }
  }

  removeGuarantee(index: number): void {
    this.guaranteeList.update(list => list.filter((_, i) => i !== index));
  }

  // ==================== RECEIPT TRANSFERS ====================
  addReceiptTransfer(): void {
    this.receiptTransfers.update(list => [...list, { receiptNumber: '', date: null, amount: 0, company: '' }]);
  }

  removeReceiptTransfer(index: number): void {
    this.receiptTransfers.update(list => list.filter((_, i) => i !== index));
  }

  addReceiptPaymentTransfer(): void {
    this.receiptPaymentTransfers.update(list => [...list, { date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeReceiptPaymentTransfer(index: number): void {
    this.receiptPaymentTransfers.update(list => list.filter((_, i) => i !== index));
  }

  addReceiptPaymentCheck(): void {
    this.receiptPaymentChecks.update(list => [...list, { checkNumber: '', date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeReceiptPaymentCheck(index: number): void {
    this.receiptPaymentChecks.update(list => list.filter((_, i) => i !== index));
  }

  // ==================== INSTALLMENTS ====================
  addInstallment(): void {
    this.installments.update(list => [...list, {
      dueDate: null,
      amount: 0,
      rentDeposit: 0,
      serviceDeposit: 0,
      commonDeposit: 0,
      totalWithVat: 0,
      cashPayment: 0,
      transfers: [],
      checks: []
    }]);
  }

  removeInstallment(index: number): void {
    this.installments.update(list => list.filter((_, i) => i !== index));
  }

  calculateInstallmentVat(index: number): void {
    this.installments.update(list => {
      const item = list[index];
      const beforeVat = (item.amount || 0) + (item.rentDeposit || 0) +
                        (item.serviceDeposit || 0) + (item.commonDeposit || 0);
      item.totalWithVat = beforeVat * (1 + this.vatRate / 100);
      return [...list];
    });
  }

  addInstallmentTransfer(installmentIndex: number): void {
    this.installments.update(list => {
      list[installmentIndex].transfers.push({ date: null, amount: 0, bank: '', branch: '', company: '' });
      return [...list];
    });
  }

  removeInstallmentTransfer(installmentIndex: number, transferIndex: number): void {
    this.installments.update(list => {
      list[installmentIndex].transfers = list[installmentIndex].transfers.filter((_, i) => i !== transferIndex);
      return [...list];
    });
  }

  addInstallmentCheck(installmentIndex: number): void {
    this.installments.update(list => {
      list[installmentIndex].checks.push({ checkNumber: '', date: null, amount: 0, bank: '', branch: '', company: '' });
      return [...list];
    });
  }

  removeInstallmentCheck(installmentIndex: number, checkIndex: number): void {
    this.installments.update(list => {
      list[installmentIndex].checks = list[installmentIndex].checks.filter((_, i) => i !== checkIndex);
      return [...list];
    });
  }

  // ==================== METER ====================
  calculateMeterVat(): number {
    const amount = this.form.get('meterAmount')?.value || 0;
    return amount * (1 + this.vatRate / 100);
  }

  meterTotalWithVat(): number {
    return this.calculateMeterVat();
  }

  addMeterTransfer(): void {
    this.meterTransfers.update(list => [...list, { date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeMeterTransfer(index: number): void {
    this.meterTransfers.update(list => list.filter((_, i) => i !== index));
  }

  addMeterCheck(): void {
    this.meterChecks.update(list => [...list, { checkNumber: '', date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeMeterCheck(index: number): void {
    this.meterChecks.update(list => list.filter((_, i) => i !== index));
  }

  // ==================== DECORATION ====================
  calculateDecorationVat(): number {
    const amount = this.form.get('decorationAmount')?.value || 0;
    return amount * (1 + this.vatRate / 100);
  }

  decorationTotalWithVat(): number {
    return this.calculateDecorationVat();
  }

  addDecorationTransfer(): void {
    this.decorationTransfers.update(list => [...list, { date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeDecorationTransfer(index: number): void {
    this.decorationTransfers.update(list => list.filter((_, i) => i !== index));
  }

  addDecorationCheck(): void {
    this.decorationChecks.update(list => [...list, { checkNumber: '', date: null, amount: 0, bank: '', branch: '', company: '' }]);
  }

  removeDecorationCheck(index: number): void {
    this.decorationChecks.update(list => list.filter((_, i) => i !== index));
  }
}
