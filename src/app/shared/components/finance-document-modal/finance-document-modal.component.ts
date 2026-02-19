// src/app/shared/components/finance-document-modal/finance-document-modal.component.ts

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
import {
  DocumentType,
  FinanceDocumentFormData,
} from '@core/models/finance-document.model';
import { DocumentNumberService } from '@core/services/document-number.service';
import { Debt } from '@core/models/finance.model';

@Component({
  selector: 'app-finance-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-document-modal.component.html',
  styleUrl: './finance-document-modal.component.css',
})
export class FinanceDocumentModalComponent implements OnInit {
  // Inputs
  documentType = input.required<DocumentType>();
  debtData = input.required<Debt>();

  // Outputs
  close = output<void>();
  submit = output<FinanceDocumentFormData>();

  // Signals
  modalTitle = signal<string>('');
  submitButtonLabel = signal<string>('');

  // Form
  form!: FormGroup;

  // Dropdown options
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

  constructor(
    private fb: FormBuilder,
    private documentNumberService: DocumentNumberService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setModalContent();
  }

  // ✅ Custom Validator: วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const dateFrom = control.get('dateFrom')?.value;
    const dateTo = control.get('dateTo')?.value;

    if (!dateFrom || !dateTo) {
      return null;
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (endDate < startDate) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initForm(): void {
    const type = this.documentType();
    const debt = this.debtData();

    switch (type) {
      case 'credit_note':
        this.form = this.fb.group(
          {
            customerName: [{ value: debt.customerName, disabled: true }],
            creditNoteNumber: [
              {
                value:
                  this.documentNumberService.generateDocumentNumber(
                    'credit_note',
                  ),
                disabled: true,
              },
            ],
            dateFrom: ['', Validators.required],
            dateTo: ['', Validators.required],
            contractNumber: [
              { value: debt.contractFile.replace('.pdf', ''), disabled: true },
            ],
            invoiceStatus: ['all'],
            printStatus: ['all'],
            transferStatus: ['all'],
          },
          { validators: this.dateRangeValidator } // ✅ เพิ่ม validator
        );
        break;

      case 'invoice':
        this.form = this.fb.group(
          {
            customerName: [{ value: debt.customerName, disabled: true }],
            invoiceNumber: [
              {
                value:
                  this.documentNumberService.generateDocumentNumber('invoice'),
                disabled: true,
              },
            ],
            dateFrom: ['', Validators.required],
            dateTo: ['', Validators.required],
            contractNumber: [
              { value: debt.contractFile.replace('.pdf', ''), disabled: true },
            ],
            invoiceStatus: ['all'],
            printStatus: ['all'],
            transferStatus: ['all'],
            debtStatus: ['all'],
          },
          { validators: this.dateRangeValidator } // ✅ เพิ่ม validator
        );
        break;

      case 'cancel_invoice':
        this.form = this.fb.group(
          {
            customerName: [{ value: debt.customerName, disabled: true }],
            invoiceNumber: [
              { value: 'INV' + Date.now().toString().slice(-6), disabled: true },
            ],
            dateFrom: ['', Validators.required],
            dateTo: ['', Validators.required],
            contractNumber: [
              { value: debt.contractFile.replace('.pdf', ''), disabled: true },
            ],
          },
          { validators: this.dateRangeValidator } // ✅ เพิ่ม validator
        );
        break;

      case 'receipt_credit':
        this.form = this.fb.group({
          receiptNumber: [
            {
              value:
                this.documentNumberService.generateDocumentNumber('receipt'),
              disabled: true,
            },
          ],
          customerName: [{ value: debt.customerName, disabled: true }],
          creditNoteNumber: [
            { value: 'CN' + Date.now().toString().slice(-6), disabled: true },
          ],
          dateFrom: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          dateTo: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          status: ['all'],
          printStatus: ['all'],
        });
        break;

      case 'receipt_invoice':
        this.form = this.fb.group({
          receiptNumber: [
            {
              value:
                this.documentNumberService.generateDocumentNumber('receipt'),
              disabled: true,
            },
          ],
          customerName: [{ value: debt.customerName, disabled: true }],
          invoiceNumber: [
            { value: 'INV' + Date.now().toString().slice(-6), disabled: true },
          ],
          dateFrom: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          dateTo: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          status: ['all'],
          printStatus: ['all'],
        });
        break;

      case 'receipt_cancel':
        this.form = this.fb.group({
          receiptNumber: [
            {
              value:
                this.documentNumberService.generateDocumentNumber('receipt'),
              disabled: true,
            },
          ],
          customerName: [{ value: debt.customerName, disabled: true }],
          cancelInvoiceNumber: [
            { value: 'CANC' + Date.now().toString().slice(-6), disabled: true },
          ],
          dateFrom: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          dateTo: [
            { value: this.formatDateForInput(new Date()), disabled: true },
          ],
          status: ['all'],
          printStatus: ['all'],
        });
        break;
    }
  }

  setModalContent(): void {
    const type = this.documentType();

    const titles: Record<DocumentType, string> = {
      credit_note: 'ออกใบลดหนี้',
      invoice: 'ออกใบแจ้งหนี้',
      cancel_invoice: 'ออกใบยกเลิก',
      receipt_credit: 'ออกใบเสร็จใบลดหนี้',
      receipt_invoice: 'ออกใบเสร็จใบแจ้งหนี้',
      receipt_cancel: 'ออกใบเสร็จใบยกเลิก',
    };

    const buttonLabels: Record<DocumentType, string> = {
      credit_note: 'ออกใบลดหนี้',
      invoice: 'ออกใบแจ้งหนี้',
      cancel_invoice: 'ออกใบยกเลิก',
      receipt_credit: 'ออกใบเสร็จใบลดหนี้',
      receipt_invoice: 'ออกใบเสร็จใบแจ้งหนี้',
      receipt_cancel: 'ออกใบเสร็จใบยกเลิก',
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

      // ✅ แสดงข้อความ error ถ้า date range ไม่ถูกต้อง
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
    const control = this.form.get(fieldName);
    return control ? control.disabled : false;
  }

  hasDateRangeError(): boolean {
    return this.form.errors?.['dateRangeInvalid'] &&
           (this.form.get('dateFrom')?.touched || this.form.get('dateTo')?.touched);
  }
}
