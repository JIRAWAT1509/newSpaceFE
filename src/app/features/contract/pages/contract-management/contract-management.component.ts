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

  // Filter contracts by type for each tab
  quotationData = computed<Contract[]>(() =>
    MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'QUOTATION_AGREEMENT')
  );

  bookingData = computed<Contract[]>(() =>
    MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT')
  );

  leaseData = computed<Contract[]>(() =>
    MOCK_CONTRACTS.filter(c =>
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
}
