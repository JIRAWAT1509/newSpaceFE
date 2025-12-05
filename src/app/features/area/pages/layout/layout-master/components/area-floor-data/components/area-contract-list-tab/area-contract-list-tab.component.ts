// area-contract-list-tab.component.ts
import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Contract, ContractFile, CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS } from '@core/models/contract.model';
import { getContractsByAreaId } from '@core/data/contract.mock';
import { fromDateString } from '@core/utils/date-utils';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-area-contract-list-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './area-contract-list-tab.component.html',
  styleUrl: './area-contract-list-tab.component.css'
})
export class AreaContractListTabComponent {
  areaId = input.required<string>();

  // Signals
  expandedId = signal<string | null>(null);
  sortBy = signal<string>('date-desc');
  filterStatus = signal<string | null>(null);
  filterType = signal<string | null>(null);
  showPreview = signal<boolean>(false);
  showFileModal = signal<boolean>(false);
  selectedFile = signal<ContractFile | null>(null);

  // Sort options
  sortOptions: SortOption[] = [
    { label: 'Date (Newest First)', value: 'date-desc' },
    { label: 'Date (Oldest First)', value: 'date-asc' },
    { label: 'Expiry (Soonest First)', value: 'expiry-asc' },
    { label: 'Expiry (Latest First)', value: 'expiry-desc' },
    { label: 'Value (High to Low)', value: 'value-desc' },
    { label: 'Value (Low to High)', value: 'value-asc' }
  ];

  // Status filter options
  statusOptions: SortOption[] = [
    { label: 'All Statuses', value: '' },
    { label: CONTRACT_STATUS_LABELS.ACTIVE.TH, value: 'ACTIVE' },
    { label: CONTRACT_STATUS_LABELS.PENDING.TH, value: 'PENDING' },
    { label: CONTRACT_STATUS_LABELS.COMPLETED.TH, value: 'COMPLETED' },
    { label: CONTRACT_STATUS_LABELS.EXPIRED.TH, value: 'EXPIRED' },
    { label: CONTRACT_STATUS_LABELS.TERMINATED.TH, value: 'TERMINATED' }
  ];

  // Type filter options
  typeOptions: SortOption[] = [
    { label: 'All Types', value: '' },
    { label: CONTRACT_TYPE_LABELS.LEASE_AGREEMENT.TH, value: 'LEASE_AGREEMENT' },
    { label: CONTRACT_TYPE_LABELS.LEASE_RENEWAL.TH, value: 'LEASE_RENEWAL' },
    { label: CONTRACT_TYPE_LABELS.LEASE_AMENDMENT.TH, value: 'LEASE_AMENDMENT' },
    { label: CONTRACT_TYPE_LABELS.LEASE_TERMINATION.TH, value: 'LEASE_TERMINATION' },
    { label: CONTRACT_TYPE_LABELS.QUOTATION_AGREEMENT.TH, value: 'QUOTATION_AGREEMENT' }
  ];

  // Computed
  contracts = computed<Contract[]>(() => {
    return getContractsByAreaId(this.areaId());
  });

  filteredContracts = computed<Contract[]>(() => {
    let contracts = [...this.contracts()];

    // Apply status filter
    const status = this.filterStatus();
    if (status) {
      contracts = contracts.filter(c => c.STATUS === status);
    }

    // Apply type filter
    const type = this.filterType();
    if (type) {
      contracts = contracts.filter(c => c.CONTRACT_TYPE === type);
    }

    // Apply sorting
    const sort = this.sortBy();
    switch (sort) {
      case 'date-desc':
        contracts.sort((a, b) => this.getTimestamp(b.ISSUE_DATE) - this.getTimestamp(a.ISSUE_DATE));
        break;
      case 'date-asc':
        contracts.sort((a, b) => this.getTimestamp(a.ISSUE_DATE) - this.getTimestamp(b.ISSUE_DATE));
        break;
      case 'expiry-asc':
        contracts.sort((a, b) => this.getTimestamp(a.EXPIRY_DATE) - this.getTimestamp(b.EXPIRY_DATE));
        break;
      case 'expiry-desc':
        contracts.sort((a, b) => this.getTimestamp(b.EXPIRY_DATE) - this.getTimestamp(a.EXPIRY_DATE));
        break;
      case 'value-desc':
        contracts.sort((a, b) => (b.TOTAL_VALUE || 0) - (a.TOTAL_VALUE || 0));
        break;
      case 'value-asc':
        contracts.sort((a, b) => (a.TOTAL_VALUE || 0) - (b.TOTAL_VALUE || 0));
        break;
    }

    return contracts;
  });

  // ==================== ACTIONS ====================

  toggleExpand(id: string): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(id);
    }
  }

  onSortChange(): void {
    // Signal will automatically trigger recomputation
  }

  onFilterChange(): void {
    // Signal will automatically trigger recomputation
  }

  onPreviewToggle(): void {
    // Signal will automatically trigger recomputation
  }

  onDownloadFile(file: ContractFile): void {
    console.log('Downloading file:', file.FILE_NAME);
    // TODO: Implement actual download
    // window.open(file.FILE_URL, '_blank');
    alert(`Download: ${file.FILE_NAME}\n\nIn production, this would trigger a file download.`);
  }

  onPreviewFile(file: ContractFile): void {
    this.selectedFile.set(file);
    this.showFileModal.set(true);
  }

  closeFileModal(): void {
    this.showFileModal.set(false);
    this.selectedFile.set(null);
  }

  // ==================== HELPERS ====================

  getTypeLabel(type: string): string {
    const labels = CONTRACT_TYPE_LABELS;
    return labels[type as keyof typeof labels]?.TH || type;
  }

  getStatusColor(status: string): string {
    const labels = CONTRACT_STATUS_LABELS;
    return labels[status as keyof typeof labels]?.COLOR || '#6B7280';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }

  formatDate(dateString: string): string {
    const date = fromDateString(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private getTimestamp(dateString: string): number {
    return parseInt(dateString.replace(/\/Date\((\d+)\)\//, '$1'));
  }
}
