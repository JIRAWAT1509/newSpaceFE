// contract-management.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ContractTableComponent } from './components/contract-table/contract-table.component';
import { Contract } from '@core/models/contract.model';
import { SearchFilter } from '@core/models/contract-search.model';
import { ContractService, CancelType } from '@core/services/contract.service';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [
    CommonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ContractTableComponent
  ],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.css'
})
export class ContractManagementComponent implements OnInit {
  activeTab = signal<string>('quotation');

  // Shared search state across all tabs
  sharedSearchText = signal<string>('');
  sharedFilters = signal<SearchFilter[]>([]);

  // Local contract lists: โหลดจาก localStorage (ผ่าน service) เพื่อไม่หายเมื่อรีเฟรช
  private contractsList = signal<Contract[]>([]);

  // Filter contracts by type for each tab
  quotationData = computed<Contract[]>(() =>
    this.contractsList().filter(c => c.CONTRACT_TYPE === 'QUOTATION_AGREEMENT')
  );

  bookingData = computed<Contract[]>(() =>
    this.contractsList().filter(c => c.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT')
  );

  leaseData = computed<Contract[]>(() =>
    this.contractsList().filter(c =>
      c.CONTRACT_TYPE === 'LEASE_AGREEMENT' ||
      c.CONTRACT_TYPE === 'LEASE_RENEWAL' ||
      c.CONTRACT_TYPE === 'LEASE_AMENDMENT'
    )
  );

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    this.contractsList.set(this.contractService.getContracts());

    // Check for query params from area page
    this.route.queryParams.subscribe(params => {
      const areaId = params['areaId'];
      const roomNumber = params['roomNumber'];

      if (areaId) {
        // Auto-create filter for area
        const areaFilter: SearchFilter = {
          id: `auto-area-${Date.now()}`,
          field: 'AREA_ID',
          value: areaId,
          isComplete: true
        };

        this.sharedFilters.set([areaFilter]);

        // Switch to lease tab (most likely tab for area contracts)
        this.activeTab.set('lease');
      }
    });
  }

  // Handle search/filter updates from any tab
  onSearchUpdate(searchText: string): void {
    this.sharedSearchText.set(searchText);
  }

  onFiltersUpdate(filters: SearchFilter[]): void {
    this.sharedFilters.set(filters);
  }

  onTabChange(value: string | number | undefined): void {
    this.activeTab.set(String(value ?? 'quotation'));
  }

  // Add new contract to list (called from child table component)
  onContractSaved(formData: any): void {
    const newContract: Contract = this.mapFormDataToContract(formData);

    if (formData.mode === 'edit') {
      this.contractsList.update(list =>
        list.map(c => c.CONTRACT_ID === formData.contractId ? newContract : c)
      );
      this.contractService.saveContracts(this.contractsList());
      return;
    }

    this.contractsList.update(list => [newContract, ...list]);
    this.contractService.saveContracts(this.contractsList());

    // ถ้ากรอกรายละเอียดทั่วไป + รายละเอียดสัญญาครบ → ไปหน้า สัญญาจอง
    if (formData.saveAsBooking) {
      this.activeTab.set('booking');
    }
  }

  /** คัดลอก/โอนสัญญา: เพิ่มสัญญาใหม่แล้วสลับไปแท็บที่ตรงกับประเภทสัญญา */
  onContractCopied(contract: Contract): void {
    this.contractsList.update(list => [contract, ...list]);
    this.contractService.saveContracts(this.contractsList());
    if (contract.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT') {
      this.activeTab.set('booking');
    } else if (contract.CONTRACT_TYPE === 'LEASE_AGREEMENT' || contract.CONTRACT_TYPE === 'LEASE_RENEWAL' || contract.CONTRACT_TYPE === 'LEASE_AMENDMENT') {
      this.activeTab.set('lease');
    } else if (contract.CONTRACT_TYPE === 'QUOTATION_AGREEMENT') {
      this.activeTab.set('quotation');
    }
  }

  // Map form data to Contract model
  private mapFormDataToContract(formData: any): Contract {
    const general = formData?.generalDetails || {};
    const conditions = formData?.conditions || {};
    const contractDetails = formData?.contractDetails || {};

    const toDateStr = (val: unknown): string => {
      if (!val) return '';
      if (val instanceof Date) return val.toISOString().split('T')[0];
      if (typeof val === 'string') return val.split('T')[0];
      return '';
    };

    // บันทึกจากปุ่ม "บันทึก" (เฉพาะรายละเอียดทั่วไป) → ใบเสนอราคา
    // บันทึกจากปุ่ม "บันทึกสัญญา" และกรอกรายละเอียดสัญญาครบ → สัญญาจอง
    // บันทึกจากปุ่ม "บันทึกสัญญา" แต่กรอกแค่รายละเอียดทั่วไป → ใบเสนอราคา
    const contractType = formData.saveAsQuotationOnly
      ? 'QUOTATION_AGREEMENT'
      : formData.saveAsBooking
        ? 'DEPOSIT_AGREEMENT'
        : formData.mode === 'edit'
          ? this.mapContractTypeCode(general.contractType)
          : 'QUOTATION_AGREEMENT';

    const displayName = general.contactName || general.businessName || contractDetails.legalEntityName || general.companyName || 'N/A';

    return {
      CONTRACT_ID: formData.contractId || `CNT-${Date.now()}`,
      OU_CODE: 'OU001',
      AREA_ID: general.areaUnitNumber || '',
      CONTRACT_NUMBER: general.contractNumberMain || `AUTO-${Date.now()}`,
      CONTRACT_TYPE: contractType,
      STATUS: 'ACTIVE',
      CONTRACT_TOPIC: `สัญญา ${general.contractType}`,
      CONTRACT_TOPIC_TH: `สัญญา ${general.contractType}`,
      CONTRACT_TOPIC_EN: `Contract ${general.contractType}`,
      TENANT_NAME: displayName,
      TENANT_NAME_TH: displayName,
      TENANT_NAME_EN: displayName,
      LANDLORD_NAME: 'บริษัท Space Management จำกัด',
      ISSUE_DATE: toDateStr(general.quotationDate) || new Date().toISOString().split('T')[0],
      EXPIRY_DATE: toDateStr(conditions.contractEndDate) || '',
      MONTHLY_RENT: conditions.rentRate || 0,
      DEPOSIT_AMOUNT: conditions.depositAmount || 0,
      
      // From generalDetails
      BRANCH_CODE: general.branch || '',
      CONTRACT_TYPE_CODE: general.contractType || '',
      CONTRACT_NUMBER_MAIN: general.contractNumberMain,
      CONTRACT_NUMBER_SUB: general.contractNumberSub,
      QUOTATION_STATUS: general.quotationStatus,
      QUOTATION_LEVEL_DATE: toDateStr(general.quotationLevelDate),
      CONTRACT_DATE: toDateStr(general.quotationDate) || new Date().toISOString().split('T')[0],
      RECORD_DATE: toDateStr(general.recordDate),
      APPROVAL_DATE: toDateStr(general.approvalDate),
      
      SUB_CATEGORY: general.subCategory || '',
      CATEGORY: general.category || '',
      PROFIT_CENTER: general.profitCenter || '',
      BUSINESS_NAME: general.businessName || '',
      PRODUCT_TYPE_1: general.productType1 || '',
      PRODUCT_TYPE_2: general.productType2 || '',
      PRODUCT_TYPE_3: general.productType3 || '',
      PRODUCT_TYPE_4: general.productType4 || '',
      PRODUCT_TYPE_5: general.productType5 || '',
      PRODUCT_TYPE_6: general.productType6 || '',
      CUSTOMER_ID: general.customerId || '',
      AUTHORIZED_PERSON_1: general.authorizedPerson1 || '',
      PHONE_1: general.phone1 || '',
      POSITION_1: general.position1 || '',
      
      // Contact info (page 1)
      CONTACT_PERSON: general.contactName || '',
      CONTACT_PHONE: general.contactPhone || '',
      
      // From contractDetails (tab 2)
      BOOKING_NUMBER: contractDetails.bookingNumber || '',
      CONTRACT_MAKER: contractDetails.contractMaker || '',
      LEGAL_ENTITY_NAME: contractDetails.legalEntityName || '',
      REGISTERED_ADDRESS: contractDetails.registeredAddress || '',
      DOCUMENT_DELIVERY_ADDRESS: contractDetails.documentDeliveryAddress || '',
      PHONE_DETAIL: contractDetails.phone || '',
      EMAIL_DETAIL: contractDetails.email || '',
      CONTACT_PERSON_DETAIL: contractDetails.contactPerson || '',
      
      // From conditions
      DURATION_YEARS: conditions.durationYears || 0,
      DURATION_MONTHS: conditions.durationMonths || 0,
      DURATION_DAYS: conditions.durationDays || 0,
      START_DATE: toDateStr(conditions.contractStartDate) || '',
      END_DATE: toDateStr(conditions.contractEndDate) || '',
      CREDIT_TERM_RENT: conditions.creditTermRent || 0,
      CREDIT_TERM_UTILITY: conditions.creditTermUtility || 0,
      
      // Area details (mapped from flat form fields → AREA_DETAILS array)
      AREA_DETAILS: general.areaBuilding ? [{
        BUILDING: general.areaBuilding || '',
        FLOOR: general.areaFloor || '',
        UNIT_NUMBER: general.areaUnitNumber || '',
        STATUS: general.areaType || '',
        ZONE: '',
        WIDTH: 0,
        LENGTH: 0,
        TOTAL_AREA: Number(general.areaTotal) || 0
      }] : [],

      // All other required fields with reasonable defaults
    } as any as Contract; // Use 'as any as Contract' to bypass strict type check for now
  }

  private mapContractTypeCode(code: string): any {
    // Map form's contractType code to CONTRACT_TYPE enum
    const typeMap: Record<string, string> = {
      'QUOTATION': 'QUOTATION_AGREEMENT',
      'BOOKING': 'DEPOSIT_AGREEMENT',
      'LEASE': 'LEASE_AGREEMENT',
      'RENEWAL': 'LEASE_RENEWAL',
      'AMENDMENT': 'LEASE_AMENDMENT'
    };
    return typeMap[code] || 'QUOTATION_AGREEMENT';
  }

  /** ยกเลิกใบเสนอราคา/สัญญาจอง/สัญญาเช่า: เปลี่ยนสถานะเป็น TERMINATED */
  onContractCancelRequest(payload: { contract: Contract; cancelType: CancelType }): void {
    const { contract } = payload;
    const id = contract.CONTRACT_ID;

    // เปลี่ยนสถานะเป็น TERMINATED แทนการลบ (เก็บข้อมูลไว้ เพื่อความสมบูรณ์ของข้อมูล)
    this.contractsList.update(list =>
      list.map(c => c.CONTRACT_ID === id
        ? { ...c, STATUS: 'TERMINATED' as any }
        : c
      )
    );
    this.contractService.saveContracts(this.contractsList());
  }
}
