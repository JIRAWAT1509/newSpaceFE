// contract-management.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
    ContractTableComponent,
  ],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.css',
})
export class ContractManagementComponent implements OnInit {
  activeTab = signal<string>('quotation');
  sharedSearchText = signal<string>('');
  sharedFilters = signal<SearchFilter[]>([]);

  // ✅ ส่ง prefill ผ่าน signal binding ใน template — ไม่ต้องใช้ ViewChild
  quotationPrefill = signal<Record<string, any> | null>(null);

  private contractsList = signal<Contract[]>([]);

  quotationData = computed<Contract[]>(() =>
    this.contractsList().filter(
      (c) => c.CONTRACT_TYPE === 'QUOTATION_AGREEMENT',
    ),
  );
  bookingData = computed<Contract[]>(() =>
    this.contractsList().filter((c) => c.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT'),
  );
  leaseData = computed<Contract[]>(() =>
    this.contractsList().filter(
      (c) =>
        c.CONTRACT_TYPE === 'LEASE_AGREEMENT' ||
        c.CONTRACT_TYPE === 'LEASE_RENEWAL' ||
        c.CONTRACT_TYPE === 'LEASE_AMENDMENT',
    ),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
  ) {
    // ✅ อ่านจาก history.state (Web API) — Angular router เขียนค่าไว้ที่นี่
    // getCurrentNavigation() ใช้ไม่ได้ใน constructor ของ routed component
    const state = typeof history !== 'undefined' ? history.state : null;
    console.log('[ContractManagement] history.state:', state);

    if (state?.autoOpenQuotation && state?.areaData) {
      this.quotationPrefill.set(state.areaData);
      console.log('[ContractManagement] quotationPrefill set:', state.areaData);
    }
  }

  ngOnInit(): void {
    this.contractsList.set(this.contractService.getContracts());

    this.route.queryParams.subscribe((params) => {
      const areaId = params['areaId'];
      if (areaId) {
        const areaFilter: SearchFilter = {
          id: `auto-area-${Date.now()}`,
          field: 'AREA_ID',
          value: areaId,
          isComplete: true,
        };
        this.sharedFilters.set([areaFilter]);
        this.activeTab.set('lease');
      }
    });
  }

  onSearchUpdate(searchText: string): void {
    this.sharedSearchText.set(searchText);
  }
  onFiltersUpdate(filters: SearchFilter[]): void {
    this.sharedFilters.set(filters);
  }
  onTabChange(value: string | number | undefined): void {
    this.activeTab.set(String(value ?? 'quotation'));
  }

  onContractSaved(formData: any): void {
    const newContract: Contract = this.mapFormDataToContract(formData);
    if (formData.mode === 'edit') {
      this.contractsList.update((list) =>
        list.map((c) =>
          c.CONTRACT_ID === formData.contractId ? newContract : c,
        ),
      );
      this.contractService.saveContracts(this.contractsList());
      return;
    }
    this.contractsList.update((list) => [newContract, ...list]);
    this.contractService.saveContracts(this.contractsList());
    if (formData.saveAsBooking) this.activeTab.set('booking');
    // ✅ clear prefill หลัง save
    this.quotationPrefill.set(null);
  }

  onContractCopied(contract: Contract): void {
    this.contractsList.update((list) => [contract, ...list]);
    this.contractService.saveContracts(this.contractsList());
    if (contract.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT')
      this.activeTab.set('booking');
    else if (
      ['LEASE_AGREEMENT', 'LEASE_RENEWAL', 'LEASE_AMENDMENT'].includes(
        contract.CONTRACT_TYPE,
      )
    )
      this.activeTab.set('lease');
    else if (contract.CONTRACT_TYPE === 'QUOTATION_AGREEMENT')
      this.activeTab.set('quotation');
  }

  onContractCancelRequest(payload: {
    contract: Contract;
    cancelType: CancelType;
  }): void {
    this.contractsList.update((list) =>
      list.map((c) =>
        c.CONTRACT_ID === payload.contract.CONTRACT_ID
          ? { ...c, STATUS: 'TERMINATED' as any }
          : c,
      ),
    );
    this.contractService.saveContracts(this.contractsList());
  }

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
    const contractType = formData.saveAsQuotationOnly
      ? 'QUOTATION_AGREEMENT'
      : formData.saveAsBooking
        ? 'DEPOSIT_AGREEMENT'
        : formData.mode === 'edit'
          ? this.mapContractTypeCode(general.contractType)
          : 'QUOTATION_AGREEMENT';
    const displayName =
      general.contactName ||
      general.businessName ||
      contractDetails.legalEntityName ||
      'N/A';
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
      ISSUE_DATE:
        toDateStr(general.quotationDate) ||
        new Date().toISOString().split('T')[0],
      EXPIRY_DATE: toDateStr(conditions.contractEndDate) || '',
      MONTHLY_RENT: conditions.rentRate || 0,
      DEPOSIT_AMOUNT: conditions.depositAmount || 0,
      BRANCH_CODE: general.branch || '',
      CONTRACT_TYPE_CODE: general.contractType || '',
      CONTRACT_NUMBER_MAIN: general.contractNumberMain,
      CONTRACT_NUMBER_SUB: general.contractNumberSub,
      QUOTATION_STATUS: general.quotationStatus,
      QUOTATION_LEVEL_DATE: toDateStr(general.quotationLevelDate),
      CONTRACT_DATE:
        toDateStr(general.quotationDate) ||
        new Date().toISOString().split('T')[0],
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
      CONTACT_PERSON: general.contactName || '',
      CONTACT_PHONE: general.contactPhone || '',
      BOOKING_NUMBER: contractDetails.bookingNumber || '',
      CONTRACT_MAKER: contractDetails.contractMaker || '',
      LEGAL_ENTITY_NAME: contractDetails.legalEntityName || '',
      REGISTERED_ADDRESS: contractDetails.registeredAddress || '',
      DOCUMENT_DELIVERY_ADDRESS: contractDetails.documentDeliveryAddress || '',
      PHONE_DETAIL: contractDetails.phone || '',
      EMAIL_DETAIL: contractDetails.email || '',
      CONTACT_PERSON_DETAIL: contractDetails.contactPerson || '',
      DURATION_YEARS: conditions.durationYears || 0,
      DURATION_MONTHS: conditions.durationMonths || 0,
      DURATION_DAYS: conditions.durationDays || 0,
      START_DATE: toDateStr(conditions.contractStartDate) || '',
      END_DATE: toDateStr(conditions.contractEndDate) || '',
      CREDIT_TERM_RENT: conditions.creditTermRent || 0,
      CREDIT_TERM_UTILITY: conditions.creditTermUtility || 0,
      AREA_DETAILS: general.areaBuilding
        ? [
            {
              BUILDING: general.areaBuilding || '',
              FLOOR: general.areaFloor || '',
              UNIT_NUMBER: general.areaUnitNumber || '',
              STATUS: general.areaType || '',
              ZONE: '',
              WIDTH: 0,
              LENGTH: 0,
              TOTAL_AREA: Number(general.areaTotal) || 0,
            },
          ]
        : [],
    } as any as Contract;
  }

  private mapContractTypeCode(code: string): any {
    const typeMap: Record<string, string> = {
      QUOTATION: 'QUOTATION_AGREEMENT',
      BOOKING: 'DEPOSIT_AGREEMENT',
      LEASE: 'LEASE_AGREEMENT',
      RENEWAL: 'LEASE_RENEWAL',
      AMENDMENT: 'LEASE_AMENDMENT',
    };
    return typeMap[code] || 'QUOTATION_AGREEMENT';
  }
}
