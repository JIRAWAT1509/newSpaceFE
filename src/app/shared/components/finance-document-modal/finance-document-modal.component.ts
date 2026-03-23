/* finance-document-modal.component.ts */

import { Component, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DocumentType, FinanceDocumentFormData } from '@core/models/finance-document.model';
import { DocumentNumberService } from '@core/services/document-number.service';
import { Debt } from '@core/models/finance.model';
import { getBranchById } from '@core/data/branch.mock';

@Component({
  selector: 'app-finance-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-document-modal.component.html',
  styleUrl: './finance-document-modal.component.css',
})
export class FinanceDocumentModalComponent implements OnInit {
  documentType = input.required<DocumentType>();
  debtData = input.required<Debt>();

  close = output<void>();
  submit = output<FinanceDocumentFormData>();

  modalTitle = signal<string>('');
  submitButtonLabel = signal<string>('');

  form!: FormGroup;

  cnStatusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Cancel', value: 'cancel' },
  ];

  cnTransferStatusOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  cnPrintStatusOptions = [
    { label: 'Printed', value: 'printed' },
    { label: 'Never Print', value: 'never_print' },
  ];

  categoryOptions = [
    { label: 'OFFICE', value: 'OFFICE' },
    { label: 'RETAIL', value: 'RETAIL' },
    { label: 'FOOD', value: 'FOOD' },
    { label: 'SERVICE', value: 'SERVICE' },
  ];

  invoiceStatusOptions = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Cancel', value: 'cancel' },
  ];

  printStatusOptions = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'พิมพ์', value: 'printed' },
    { label: 'ยังไม่พิมพ์', value: 'not_printed' },
  ];

  transferStatusOptions = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'โอน', value: 'transferred' },
    { label: 'ยังไม่โอน', value: 'not_transferred' },
  ];

  debtStatusOptions = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'มีหนี้คงเหลือ', value: 'has_debt' },
    { label: 'ไม่มีหนี้คงเหลือ', value: 'no_debt' },
  ];

  receiptStatusOptions = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Posted', value: 'posted' },
    { label: 'Cancel', value: 'cancel' },
  ];

  cancelReasonOptions = [
    { label: 'CC1 - เอกสารเดิมไม่ถูกต้อง', value: 'CC1' },
    { label: 'CC2 - ลูกค้ายกเลิกสัญญา', value: 'CC2' },
    { label: 'CC3 - แจ้งหนี้เกิน', value: 'CC3' },
    { label: 'CN1 - ได้รับอนุมัติส่วนลด', value: 'CN1' },
    { label: 'CN2 - ลูกค้ายกเลิกสัญญา', value: 'CN2' },
    { label: 'CN3 - มูลค่าการแจ้งหนี้เดิมไม่ถูกต้อง', value: 'CN3' },
    { label: 'CR1 - คืนเงินประกันให้ลูกค้า', value: 'CR1' },
    { label: 'CR2 - ลูกค้ายกเลิกสัญญา', value: 'CR2' },
    { label: 'CR3 - มูลค่าใบกำกับภาษี/ใบเสร็จรับเงินไม่ถูกต้อง(R)', value: 'CR3' },
    { label: 'CT1 - ลูกค้ายกเลิกสัญญา', value: 'CT1' },
  ];

  private readonly reasonDescriptionMap: Record<string, string> = {
    CC1: 'เอกสารเดิมไม่ถูกต้อง',
    CC2: 'ลูกค้ายกเลิกสัญญา',
    CC3: 'แจ้งหนี้เกิน',
    CN1: 'ได้รับอนุมัติส่วนลด',
    CN2: 'ลูกค้ายกเลิกสัญญา',
    CN3: 'มูลค่าการแจ้งหนี้เดิมไม่ถูกต้อง',
    CR1: 'คืนเงินประกันให้ลูกค้า',
    CR2: 'ลูกค้ายกเลิกสัญญา',
    CR3: 'มูลค่าใบกำกับภาษี/ใบเสร็จรับเงินไม่ถูกต้อง(R)',
    CT1: 'ลูกค้ายกเลิกสัญญา',
  };

  constructor(
    private fb: FormBuilder,
    private documentNumberService: DocumentNumberService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setModalContent();
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const dateFrom = control.get('dateFrom')?.value;
    const dateTo = control.get('dateTo')?.value;
    if (!dateFrom || !dateTo) return null;
    return new Date(dateTo) < new Date(dateFrom) ? { dateRangeInvalid: true } : null;
  }

  formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getDisplayDate(field: string): string {
    const val = this.form.get(field)?.value;
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }

  onNativeDateChange(field: string, isoValue: string): void {
    this.form.get(field)?.setValue(isoValue);
    this.form.get(field)?.markAsTouched();
  }

  onCnReasonDropdownChange(value: string): void {
    const desc = this.reasonDescriptionMap[value] ?? '';
    this.form.get('cnReasonDescription')?.setValue(desc);
  }

  onLookupClick(field: string): void {
    console.log(`Lookup clicked for: ${field}`);
  }

  initForm(): void {
    const type = this.documentType();
    const debt = this.debtData();

    switch (type) {
      case 'credit_note': {
        const branch = debt.branchId ? getBranchById(debt.branchId) : null;
        const branchDisplay = branch ? `${branch.code} - ${branch.nameTh}` : '';
        const today = this.formatDateForInput(new Date());

        this.form = this.fb.group({
          branch:               [{ value: branchDisplay, disabled: true }],
          cnStatus:             ['open', Validators.required],
          transferStatus:       ['no'],
          printStatus:          ['never_print'],
          creditNoteNumber:     [{ value: this.documentNumberService.generateDocumentNumber('credit_note'), disabled: true }],
          cnDate:               ['', Validators.required],
          postingDate:          [''],
          referenceNo:          [''],
          contractNumber:       [{ value: debt.contractFile.replace('.pdf', ''), disabled: true }],
          newInvoiceNo:         [''],
          systemRecordDate:     [{ value: today, disabled: true }],
          currency:             ['THB'],
          exchangeRate:         [1.0000, [Validators.required, Validators.min(0)]],
          customerCode:         [{ value: debt.id, disabled: true }],
          customerNameTh:       [{ value: debt.customerName, disabled: true }],
          customerNameEn:       [{ value: '', disabled: true }],
          address:              [''],
          category:             ['OFFICE'],
          cnReasonCode:         ['', Validators.required],
          cnReasonDescription:  [{ value: '', disabled: true }],
          remarks:              [''],
        });
        break;
      }

      case 'invoice':
        this.form = this.fb.group(
          {
            customerName:    [{ value: debt.customerName, disabled: true }],
            invoiceNumber:   [{ value: this.documentNumberService.generateDocumentNumber('invoice'), disabled: true }],
            dateFrom:        ['', Validators.required],
            dateTo:          ['', Validators.required],
            contractNumber:  [{ value: debt.contractFile.replace('.pdf', ''), disabled: true }],
            invoiceStatus:   ['all'],
            printStatus:     ['all'],
            transferStatus:  ['all'],
            debtStatus:      ['all'],
          },
          { validators: this.dateRangeValidator }
        );
        break;

      case 'cancel_invoice': {
        const branch = debt.branchId ? getBranchById(debt.branchId) : null;
        const branchDisplay = branch ? `${branch.code} - ${branch.nameTh}` : '';
        this.form = this.fb.group(
          {
            branch:          [{ value: branchDisplay, disabled: true }],
            invoiceNumber:   [{ value: 'INV' + Date.now().toString().slice(-6), disabled: true }],
            customerName:    [{ value: debt.customerName, disabled: true }],
            dateFrom:        ['', Validators.required],
            dateTo:          ['', Validators.required],
            contractNumber:  [{ value: debt.contractFile.replace('.pdf', ''), disabled: true }],
            cancelReason:    ['', Validators.required],
          },
          { validators: this.dateRangeValidator }
        );
        break;
      }

      case 'receipt_credit':
        this.form = this.fb.group({
          receiptNumber:   [{ value: this.documentNumberService.generateDocumentNumber('receipt'), disabled: true }],
          customerName:    [{ value: debt.customerName, disabled: true }],
          creditNoteNumber:[{ value: 'CN' + Date.now().toString().slice(-6), disabled: true }],
          dateFrom:        [{ value: this.formatDateForInput(new Date()), disabled: true }],
          dateTo:          [{ value: this.formatDateForInput(new Date()), disabled: true }],
          status:          ['all'],
          printStatus:     ['all'],
        });
        break;

      case 'receipt_invoice':
        this.form = this.fb.group({
          receiptNumber:   [{ value: this.documentNumberService.generateDocumentNumber('receipt'), disabled: true }],
          customerName:    [{ value: debt.customerName, disabled: true }],
          invoiceNumber:   [{ value: 'INV' + Date.now().toString().slice(-6), disabled: true }],
          dateFrom:        [{ value: this.formatDateForInput(new Date()), disabled: true }],
          dateTo:          [{ value: this.formatDateForInput(new Date()), disabled: true }],
          status:          ['all'],
          printStatus:     ['all'],
        });
        break;

      case 'receipt_cancel':
        this.form = this.fb.group({
          receiptNumber:        [{ value: this.documentNumberService.generateDocumentNumber('receipt'), disabled: true }],
          customerName:         [{ value: debt.customerName, disabled: true }],
          cancelInvoiceNumber:  [{ value: 'CANC' + Date.now().toString().slice(-6), disabled: true }],
          dateFrom:             [{ value: this.formatDateForInput(new Date()), disabled: true }],
          dateTo:               [{ value: this.formatDateForInput(new Date()), disabled: true }],
          status:               ['all'],
          printStatus:          ['all'],
        });
        break;
    }
  }

  setModalContent(): void {
    const type = this.documentType();

    const titles: Record<DocumentType, string> = {
      credit_note:     'ออกใบลดหนี้',
      invoice:         'ออกใบแจ้งหนี้',
      cancel_invoice:  'ออกใบยกเลิกใบแจ้งหนี้',
      receipt_credit:  'ออกใบเสร็จใบลดหนี้',
      receipt_invoice: 'ออกใบเสร็จใบแจ้งหนี้',
      receipt_cancel:  'ออกใบเสร็จใบยกเลิก',
    };

    const buttonLabels: Record<DocumentType, string> = {
      credit_note:     'ออกใบลดหนี้',
      invoice:         'ออกใบแจ้งหนี้',
      cancel_invoice:  'ออกใบยกเลิกใบแจ้งหนี้',
      receipt_credit:  'ออกใบเสร็จใบลดหนี้',
      receipt_invoice: 'ออกใบเสร็จใบแจ้งหนี้',
      receipt_cancel:  'ออกใบเสร็จใบยกเลิก',
    };

    this.modalTitle.set(titles[type]);
    this.submitButtonLabel.set(buttonLabels[type]);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData: FinanceDocumentFormData = {
        documentType: this.documentType(),
        ...this.form.getRawValue(),
      };
      this.submit.emit(formData);
      this.close.emit();
    } else {
      this.markAllAsTouched();
      if (this.form.errors?.['dateRangeInvalid']) {
        alert('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
      }
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  hasField(fieldName: string): boolean {
    return this.form.controls[fieldName] !== undefined;
  }

  isFieldDisabled(fieldName: string): boolean {
    return this.form.get(fieldName)?.disabled ?? false;
  }

  hasDateRangeError(): boolean {
    return (
      !!this.form.errors?.['dateRangeInvalid'] &&
      (!!this.form.get('dateFrom')?.touched || !!this.form.get('dateTo')?.touched)
    );
  }

  isInvalid(fieldName: string): boolean {
    const ctrl = this.form.get(fieldName);
    return !!ctrl?.invalid && !!ctrl?.touched;
  }
}
