// general-detail-tab.component.ts
import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { DeclineInfoModalComponent, DeclineInfo } from '@shared/components/decline-info-modal/decline-info-modal.component';
import { AreaDataService, FloorWithAreas } from '@core/services/area/area-data.service';

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
  // Inject AreaDataService
  private areaDataService = inject(AreaDataService);

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
    { id: 'area', name: 'ข้อมูลพื้นที่ (จากใบเสนอราคา)', letter: 'C' },
    { id: 'contact', name: 'ข้อมูลผู้ติดต่อ', letter: 'D' }
  ];

  // Track selected building/floor for cascading filters
  private selectedBuildingId = signal<string>('');
  private selectedFloorId = signal<string>('');

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
      case 'contact':
        return ['contactName', 'contactPhone'];
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
      case 'areaBuilding': {
        // ดึงข้อมูลจาก AreaDataService
        const building = this.areaDataService.building();
        return [
          { label: `${building.nameTh} (${building.code})`, value: building.id }
        ];
      }
      case 'areaFloor': {
        // ดึงชั้นตาม building จาก AreaDataService
        const floors = this.areaDataService.getFloors();
        return floors.map(floor => ({
          label: floor.floorNameTh || floor.floorNameEn || `ชั้น ${floor.floorNumber}`,
          value: floor.id
        }));
      }
      case 'areaUnitNumber': {
        // ดึงห้องจาก AreaDataService ตามชั้นที่เลือก
        const floorId = this.selectedFloorId();
        if (!floorId) return [];
        const floor = this.areaDataService.getFloorById(floorId);
        if (!floor) return [];
        const areas = this.areaDataService.getAreasForCurrentContext(floor);
        const activeAreas = areas.filter(a => a.isActive && !a.isDeleted);
        return activeAreas.map(area => ({
          label: `${area.roomNumber} (${area.size} ตร.ม., ${this.mapAreaType(area.type)}, ${this.mapAreaStatus(area.status)})`,
          value: area.id
        }));
      }
      case 'areaType':
        return [
          { label: 'Retail (Open Plan)', value: 'open-plan' },
          { label: 'Kiosk', value: 'kiosk' },
          { label: 'Log', value: 'log' },
          { label: 'Food Court', value: 'foodcourt' }
        ];
      default:
        return [];
    }
  }

  /** แปลง area type เป็นชื่อไทย */
  private mapAreaType(type: string): string {
    const types: Record<string, string> = {
      'open-plan': 'Open Plan',
      'kiosk': 'Kiosk',
      'log': 'Log'
    };
    return types[type] || type;
  }

  /** แปลง area status เป็นชื่อไทย */
  private mapAreaStatus(status: string): string {
    const statuses: Record<string, string> = {
      'leased': 'เช่าอยู่',
      'vacant': 'ว่าง',
      'quotation': 'ใบเสนอราคา',
      'unallocated': 'ยังไม่จัดสรร'
    };
    return statuses[status] || status;
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
      areaUnitNumber: 'เลือกห้อง / ยูนิต (จาก Area Management)',
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

    if (field === 'areaUnitNumber') {
      // เมื่อเลือกห้อง → auto-fill ข้อมูลจาก AreaDataService
      const floorId = this.selectedFloorId();
      const floor = floorId ? this.areaDataService.getFloorById(floorId) : null;
      const areas = floor ? this.areaDataService.getAreasForCurrentContext(floor) : [];
      const selectedArea = areas.find(a => a.id === item.value);

      if (selectedArea && control) {
        control.setValue(selectedArea.roomNumber);
        control.markAsTouched();

        // Auto-fill พื้นที่รวม
        const areaTotalControl = this.form().get('areaTotal');
        if (areaTotalControl) {
          areaTotalControl.setValue(selectedArea.size);
          areaTotalControl.markAsTouched();
        }

        // Auto-fill ประเภทพื้นที่
        const areaTypeControl = this.form().get('areaType');
        if (areaTypeControl) {
          areaTypeControl.setValue(this.mapAreaType(selectedArea.type));
          areaTypeControl.markAsTouched();
        }

        // Auto-fill ค่าเช่า/เดือน (จาก monthlyRent หรือ currentTenant.monthlyRent)
        const rentControl = this.form().get('areaMonthlyRent');
        if (rentControl) {
          const rent = selectedArea.monthlyRent ?? selectedArea.currentTenant?.monthlyRent ?? 0;
          rentControl.setValue(rent > 0 ? rent.toLocaleString('th-TH') : '-');
          rentControl.markAsTouched();
        }
      }
    } else if (field === 'areaBuilding') {
      // เมื่อเลือก building → set label, track ID, and clear dependent fields
      this.selectedBuildingId.set(item.value);
      if (control) {
        control.setValue(item.label);
        control.markAsTouched();
      }
      // Reset floor and unit when building changes
      this.selectedFloorId.set('');
      const floorControl = this.form().get('areaFloor');
      const unitControl = this.form().get('areaUnitNumber');
      const totalControl = this.form().get('areaTotal');
      const typeControl = this.form().get('areaType');
      const rentControl = this.form().get('areaMonthlyRent');
      if (floorControl) floorControl.setValue('');
      if (unitControl) unitControl.setValue('');
      if (totalControl) totalControl.setValue('');
      if (typeControl) typeControl.setValue('');
      if (rentControl) rentControl.setValue('');
    } else if (field === 'areaFloor') {
      // เมื่อเลือก floor → set label, track ID, and clear unit
      this.selectedFloorId.set(item.value);
      if (control) {
        control.setValue(item.label);
        control.markAsTouched();
      }
      const unitControl = this.form().get('areaUnitNumber');
      const totalControl = this.form().get('areaTotal');
      const typeControl = this.form().get('areaType');
      const rentControl = this.form().get('areaMonthlyRent');
      if (unitControl) unitControl.setValue('');
      if (totalControl) totalControl.setValue('');
      if (typeControl) typeControl.setValue('');
      if (rentControl) rentControl.setValue('');
    } else {
      if (control) {
        control.setValue(item.label);
        control.markAsTouched();
      }
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

  /** อนุญาตเฉพาะตัวเลขในช่องเบอร์โทร */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.form().get('contactPhone')?.setValue(input.value, { emitEvent: false });
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
