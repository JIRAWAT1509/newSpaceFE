// bulk-action-modal.component.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract } from '@core/models/contract.model';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

export type BulkActionType = 'terminate' | 'discount' | 'renew' | 'extend' | 'edit';

export interface BulkActionResult {
  action: BulkActionType;
  contractIds: string[];
  data: any;
}

interface TerminateData {
  terminationDate: Date | null;
  reason: string;
  refundDeposit: boolean;
  notes: string;
}

interface DiscountData {
  discountType: 'percentage' | 'amount';
  discountValue: number;
  startDate: Date | null;
  endDate: Date | null;
  applyTo: 'rent' | 'service' | 'both';
  notes: string;
}

interface RenewData {
  renewalStartDate: Date | null;
  durationYears: number;
  durationMonths: number;
  newRentRate: number | null;
  newServiceRate: number | null;
  notes: string;
}

interface ExtendData {
  extensionMonths: number;
  extensionDays: number;
  notes: string;
}

@Component({
  selector: 'app-bulk-action-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePicker,
    Select,
    InputText,
    Textarea
  ],
  templateUrl: './bulk-action-modal.component.html',
  styleUrl: './bulk-action-modal.component.css'
})
export class BulkActionModalComponent {
  // Inputs
  isOpen = input<boolean>(false);
  action = input<BulkActionType>('terminate');
  selectedContracts = input<Contract[]>([]);

  // Outputs
  close = output<void>();
  confirm = output<BulkActionResult>();

  // Form data
  terminateData = signal<TerminateData>({
    terminationDate: null,
    reason: '',
    refundDeposit: true,
    notes: ''
  });

  discountData = signal<DiscountData>({
    discountType: 'percentage',
    discountValue: 0,
    startDate: null,
    endDate: null,
    applyTo: 'both',
    notes: ''
  });

  renewData = signal<RenewData>({
    renewalStartDate: null,
    durationYears: 1,
    durationMonths: 0,
    newRentRate: null,
    newServiceRate: null,
    notes: ''
  });

  extendData = signal<ExtendData>({
    extensionMonths: 1,
    extensionDays: 0,
    notes: ''
  });

  // Options
  discountTypeOptions = [
    { label: 'เปอร์เซ็นต์ (%)', value: 'percentage' },
    { label: 'จำนวนเงิน (บาท)', value: 'amount' }
  ];

  applyToOptions = [
    { label: 'ค่าเช่าและค่าบริการ', value: 'both' },
    { label: 'ค่าเช่าเท่านั้น', value: 'rent' },
    { label: 'ค่าบริการเท่านั้น', value: 'service' }
  ];

  terminationReasons = [
    { label: 'เลือกเหตุผล', value: '' },
    { label: 'ผู้เช่าขอยกเลิก', value: 'tenant_request' },
    { label: 'ผิดสัญญา', value: 'breach' },
    { label: 'ครบกำหนดสัญญา', value: 'expiry' },
    { label: 'ปรับปรุงพื้นที่', value: 'renovation' },
    { label: 'อื่นๆ', value: 'other' }
  ];

  refundOptions = [
    { label: 'คืนเงินมัดจำ', value: true },
    { label: 'ไม่คืนเงินมัดจำ', value: false }
  ];

  // Computed
  modalTitle = computed(() => {
    switch (this.action()) {
      case 'terminate': return 'ยกเลิกสัญญา';
      case 'discount': return 'ให้ส่วนลด';
      case 'renew': return 'ต่อสัญญา';
      case 'extend': return 'ขยายระยะเวลา';
      case 'edit': return 'แก้ไขสัญญา';
      default: return 'ดำเนินการ';
    }
  });

  actionIcon = computed(() => {
    switch (this.action()) {
      case 'terminate': return 'pi-ban';
      case 'discount': return 'pi-percentage';
      case 'renew': return 'pi-refresh';
      case 'extend': return 'pi-calendar-plus';
      case 'edit': return 'pi-pencil';
      default: return 'pi-cog';
    }
  });

  isFormValid = computed(() => {
    switch (this.action()) {
      case 'terminate':
        return this.terminateData().terminationDate !== null && 
               this.terminateData().reason !== '';
      case 'discount':
        return this.discountData().discountValue > 0 &&
               this.discountData().startDate !== null &&
               this.discountData().endDate !== null;
      case 'renew':
        return this.renewData().renewalStartDate !== null &&
               (this.renewData().durationYears > 0 || this.renewData().durationMonths > 0);
      case 'extend':
        return this.extendData().extensionMonths > 0 || this.extendData().extensionDays > 0;
      case 'edit':
        return true;
      default:
        return false;
    }
  });

  // Methods
  onCancel(): void {
    this.resetForms();
    this.close.emit();
  }

  onConfirm(): void {
    if (!this.isFormValid()) return;

    const result: BulkActionResult = {
      action: this.action(),
      contractIds: this.selectedContracts().map(c => c.CONTRACT_ID),
      data: this.getActionData()
    };

    this.confirm.emit(result);
    this.resetForms();
  }

  private getActionData(): any {
    switch (this.action()) {
      case 'terminate': return { ...this.terminateData() };
      case 'discount': return { ...this.discountData() };
      case 'renew': return { ...this.renewData() };
      case 'extend': return { ...this.extendData() };
      default: return {};
    }
  }

  private resetForms(): void {
    this.terminateData.set({
      terminationDate: null,
      reason: '',
      refundDeposit: true,
      notes: ''
    });
    this.discountData.set({
      discountType: 'percentage',
      discountValue: 0,
      startDate: null,
      endDate: null,
      applyTo: 'both',
      notes: ''
    });
    this.renewData.set({
      renewalStartDate: null,
      durationYears: 1,
      durationMonths: 0,
      newRentRate: null,
      newServiceRate: null,
      notes: ''
    });
    this.extendData.set({
      extensionMonths: 1,
      extensionDays: 0,
      notes: ''
    });
  }

  // Update form data methods
  updateTerminateField(field: keyof TerminateData, value: any): void {
    this.terminateData.update(data => ({ ...data, [field]: value }));
  }

  updateDiscountField(field: keyof DiscountData, value: any): void {
    this.discountData.update(data => ({ ...data, [field]: value }));
  }

  updateRenewField(field: keyof RenewData, value: any): void {
    this.renewData.update(data => ({ ...data, [field]: value }));
  }

  updateExtendField(field: keyof ExtendData, value: any): void {
    this.extendData.update(data => ({ ...data, [field]: value }));
  }

  // Prevent backdrop close
  onBackdropClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
