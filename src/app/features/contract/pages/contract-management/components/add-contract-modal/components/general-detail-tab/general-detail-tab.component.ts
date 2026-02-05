// general-detail-tab.component.ts
import { Component, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { DeclineInfoModalComponent, DeclineInfo } from '@shared/components/decline-info-modal/decline-info-modal.component';

interface Section {
  id: string;
  name: string;
  letter: string;
}

interface SelectorOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-general-detail-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    DatePicker,
    InputText,
    Textarea,
    RadioButton,
    DeclineInfoModalComponent
  ],
  templateUrl: './general-detail-tab.component.html',
  styleUrl: './general-detail-tab.component.css'
})
export class GeneralDetailTabComponent implements OnInit {
  // Input from parent
  form = input.required<FormGroup>();

  // Outputs
  selectorOpen = output<{ field: string; options: SelectorOption[] }>();
  messageRequest = output<{ title: string; message: string }>();
  declineSubmit = output<DeclineInfo>();

  // Sections for progress indicator - Updated for Q structure
  sections: Section[] = [
    { id: 'header', name: 'ข้อมูลอ้างอิงเอกสาร', letter: 'A' },
    { id: 'products', name: 'ข้อมูลสินค้า/บริการ (ต้นทาง)', letter: 'B' },
    { id: 'area', name: 'ข้อมูลพื้นที่ (จากใบเสนอราคา)', letter: 'C' }
  ];

  // Selector modal state
  showSelectorModal = signal<boolean>(false);
  currentSelectorField = signal<string>('');
  selectorSearchText = signal<string>('');
  currentSelectorOptions = signal<SelectorOption[]>([]);

  // Decline modal state
  showDeclineModal = signal<boolean>(false);
  declineContractNumber = signal<string>('');
  declineQuotationNumber = signal<string>('');
  declineCustomerName = signal<string>('');

  // Dropdown options
  representativeOptions = [
    { label: 'นายธนาศิลป์ สงเสริม', value: 'rep1' },
    { label: 'คุณสมชาย ใจดี', value: 'rep2' }
  ];

  positionOptions = [
    { label: 'กรรมการ', value: 'director' },
    { label: 'หุ้นส่วน', value: 'partner' },
    { label: 'ผู้รับมอบอำนาจ', value: 'authorized' },
    { label: 'ผู้รับมอบอำนาจกระทำการแทนบริษัท', value: 'company_authorized' },
    { label: 'กรรมการผู้รับมอบอำนาจกระทำการแทนบริษัท', value: 'director_authorized' },
    { label: 'กรรมการผู้มีอำนาจกระทำการแทนบริษัท', value: 'director_power' },
    { label: 'กรรมการผู้มีอำนาจกระทำการแทนธนาคาร', value: 'bank_director' },
    { label: 'ผู้อำนวยการ', value: 'manager' },
    { label: 'ผู้รับผิดชอบในการดำเนินงานในประเทศไทย', value: 'thailand_responsible' }
  ];

  ngOnInit(): void {
    // Initialize form with default values if needed
  }

  // ==================== SECTION PROGRESS ====================

  isSectionCompleted(sectionId: string): boolean {
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    return requiredFields.every(field => {
      const control = this.form().get(field);
      return control && control.valid && control.value;
    });
  }

  getSectionProgress(sectionId: string): number {
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    if (requiredFields.length === 0) return 100;

    const completedFields = requiredFields.filter(field => {
      const control = this.form().get(field);
      return control && control.valid && control.value;
    }).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  getRequiredFieldsBySection(sectionId: string): string[] {
    switch (sectionId) {
      case 'header':
        return ['branch', 'contractType', 'contractNumberMain', 'quotationDate'];
      case 'products':
        return ['subCategory'];
      case 'area':
        return ['areaBuilding', 'areaFloor', 'areaUnitNumber'];
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

  // ==================== SELECTOR MODAL ====================

  openSelector(field: string): void {
    this.currentSelectorField.set(field);
    this.selectorSearchText.set('');

    // Get options based on field
    const options = this.getSelectorOptions(field);
    this.currentSelectorOptions.set(options);
    this.showSelectorModal.set(true);
  }

  getSelectorOptions(field: string): SelectorOption[] {
    // Mock data - replace with actual data from service
    switch (field) {
      case 'branch':
        return [
          { label: 'สาขาหลัก', value: 'BR001' },
          { label: 'สาขาสุขุมวิท', value: 'BR002' },
          { label: 'สาขาสีลม', value: 'BR003' }
        ];
      case 'contractType':
        return [
          { label: 'RETAIL', value: 'RETAIL' },
          { label: 'FOOD & BEVERAGE', value: 'FOOD_BEVERAGE' },
          { label: 'ELECTRONICS', value: 'ELECTRONICS' }
        ];
      case 'contractLocation':
        return [
          { label: 'อาคาร A ชั้น 2', value: 'LOC001' },
          { label: 'อาคาร B ชั้น 3', value: 'LOC002' }
        ];
      case 'customerId':
        return [
          { label: 'C0001 - บริษัท ABC จำกัด', value: 'C0001' },
          { label: 'C0002 - ร้านกาแฟดีดี', value: 'C0002' }
        ];
      case 'subCategory':
      case 'productCategory':
        return [
          { label: 'อาหารและเครื่องดื่ม', value: 'CAT001' },
          { label: 'เครื่องใช้ไฟฟ้า', value: 'CAT002' }
        ];
      case 'areaBuilding':
        return [
          { label: 'อาคาร A', value: 'BLD001' },
          { label: 'อาคาร B', value: 'BLD002' },
          { label: 'อาคาร C', value: 'BLD003' }
        ];
      case 'areaFloor':
        return [
          { label: 'ชั้น 1', value: 'FLR001' },
          { label: 'ชั้น 2', value: 'FLR002' },
          { label: 'ชั้น 3', value: 'FLR003' }
        ];
      case 'areaType':
        return [
          { label: 'Retail', value: 'retail' },
          { label: 'Kiosk', value: 'kiosk' },
          { label: 'Food Court', value: 'foodcourt' }
        ];
      default:
        return [];
    }
  }

  getSelectorTitle(): string {
    const field = this.currentSelectorField();
    const titles: Record<string, string> = {
      branch: 'เลือกสาขา',
      contractType: 'เลือกประเภทสัญญา',
      contractLocation: 'เลือกสถานที่ทำสัญญา',
      customerId: 'เลือกลูกค้า',
      documentAddress: 'เลือกที่อยู่จัดส่งเอกสาร',
      billingAddress: 'เลือกที่อยู่ออกใบแจ้งหนี้',
      subCategory: 'เลือก Sub Category',
      productCategory: 'เลือกหมวดสินค้า/บริการ',
      areaBuilding: 'เลือกอาคาร',
      areaFloor: 'เลือกชั้น',
      areaType: 'เลือกประเภทพื้นที่'
    };
    return titles[field] || 'เลือก';
  }

  getFilteredSelectorOptions(): SelectorOption[] {
    const searchText = this.selectorSearchText().toLowerCase();
    if (!searchText) return this.currentSelectorOptions();

    return this.currentSelectorOptions().filter(option =>
      option.label.toLowerCase().includes(searchText)
    );
  }

  selectSelectorItem(item: SelectorOption): void {
    const field = this.currentSelectorField();
    const control = this.form().get(field);
    if (control) {
      control.setValue(item.label);
      control.markAsTouched();
    }
    this.closeSelectorModal();
  }

  closeSelectorModal(): void {
    this.showSelectorModal.set(false);
    this.currentSelectorField.set('');
    this.selectorSearchText.set('');
  }

  // ==================== ACTIONS ====================

  openDeclineInfo(): void {
    // Get form values to populate the modal
    const formValue = this.form().value;
    this.declineContractNumber.set(formValue.contractNumberMain || '');
    this.declineQuotationNumber.set(formValue.quotationNumberMain || '');
    this.declineCustomerName.set(formValue.customerName || '');
    this.showDeclineModal.set(true);
  }

  onDeclineConfirm(info: DeclineInfo): void {
    this.showDeclineModal.set(false);
    this.declineSubmit.emit(info);
    this.messageRequest.emit({ 
      title: 'บันทึกสำเร็จ', 
      message: `บันทึกเหตุผลการ Decline เรียบร้อยแล้ว\n\nเหตุผล: ${info.reason}` 
    });
  }

  onDeclineCancel(): void {
    this.showDeclineModal.set(false);
  }

  openCustomerDetails(): void {
    this.messageRequest.emit({ title: 'รายละเอียดลูกค้า', message: 'ฟีเจอร์นี้จะเปิดโมดอลรายละเอียดลูกค้า (กำลังพัฒนา)' });
  }

  // ==================== VALIDATION ====================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form().get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
