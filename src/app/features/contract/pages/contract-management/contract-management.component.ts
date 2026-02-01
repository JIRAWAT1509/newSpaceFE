// contract-management.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ContractTableComponent } from './components/contract-table/contract-table.component';
import { Contract } from '@core/models/contract.model';
import { MOCK_CONTRACTS } from '@core/data/contract.mock';
import { SearchFilter } from '@core/models/contract-search.model';

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

  // Local contract lists (writable) - start with mock data
  private contractsList = signal<Contract[]>([...MOCK_CONTRACTS]);

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
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
      // Update existing contract
      this.contractsList.update(list => 
        list.map(c => c.CONTRACT_ID === formData.contractId ? newContract : c)
      );
    } else {
      // Add new contract
      this.contractsList.update(list => [newContract, ...list]);
    }
  }

  // Map form data to Contract model
  private mapFormDataToContract(formData: any): Contract {
    const general = formData?.generalDetails || {};
    const conditions = formData?.conditions || {};

    const toDateStr = (val: unknown): string => {
      if (!val) return '';
      if (val instanceof Date) return val.toISOString().split('T')[0];
      if (typeof val === 'string') return val.split('T')[0];
      return '';
    };

    return {
      CONTRACT_ID: formData.contractId || `CNT-${Date.now()}`,
      OU_CODE: 'OU001',
      AREA_ID: general.areaUnitNumber || '',
      CONTRACT_NUMBER: general.contractNumberMain || `AUTO-${Date.now()}`,
      CONTRACT_TYPE: this.mapContractTypeCode(general.contractType),
      STATUS: 'ACTIVE',
      CONTRACT_TOPIC: `สัญญา ${general.contractType}`,
      CONTRACT_TOPIC_TH: `สัญญา ${general.contractType}`,
      CONTRACT_TOPIC_EN: `Contract ${general.contractType}`,
      TENANT_NAME: general.companyName || 'N/A',
      TENANT_NAME_TH: general.companyName || 'N/A',
      TENANT_NAME_EN: general.companyName || 'N/A',
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
      CONTRACT_DATE: toDateStr(general.quotationDate) || new Date().toISOString().split('T')[0],
      RECORD_DATE: general.recordDate,
      APPROVAL_DATE: general.approvalDate,
      
      SUB_CATEGORY: general.subCategory || '',
      CUSTOMER_ID: general.customerId || '',
      AUTHORIZED_PERSON_1: general.authorizedPerson1 || '',
      PHONE_1: general.phone1 || '',
      POSITION_1: general.position1 || '',
      
      // From conditions
      DURATION_YEARS: conditions.durationYears || 0,
      START_DATE: toDateStr(conditions.contractStartDate) || '',
      END_DATE: toDateStr(conditions.contractEndDate) || '',
      CREDIT_TERM_RENT: conditions.creditTermRent || 0,
      CREDIT_TERM_UTILITY: conditions.creditTermUtility || 0,
      
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
}
