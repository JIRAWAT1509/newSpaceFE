import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IncomeItem } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

interface IncomeRow {
  buildingCode: string;
  contractAmount: number;
  receivedAmount: number;
}

@Component({
  selector: 'app-income-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-block.component.html',
  styleUrl: './income-block.component.css'
})
export class IncomeBlockComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Income data
  incomeData: IncomeRow[] = [];
  totalContractAmount: number = 0;
  totalReceivedAmount: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  showPageDropdown: boolean = false;
  cachedPageRanges: { label: string; page: number }[] = [];

  constructor(
    private dashboardService: DashboardService,
    public utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getIncomeData().subscribe({
      next: (response: any) => {
        console.log('Income Response:', response);

        if (response && response.data) {
          const items: IncomeItem[] = response.data;

          // Map the income data to display format
          this.incomeData = items.map(item => ({
            buildingCode: item.BUILDING_CODE,
            contractAmount: item.TOTAL_CONTRACT_AMT || 0,
            receivedAmount: item.TOTAL_REC_AMT || 0
          }));

          // Calculate totals
          this.totalContractAmount = items.reduce((sum, item) => sum + (item.TOTAL_CONTRACT_AMT || 0), 0);
          this.totalReceivedAmount = items.reduce((sum, item) => sum + (item.TOTAL_REC_AMT || 0), 0);

          // Calculate total pages
          this.totalPages = Math.ceil(this.incomeData.length / this.itemsPerPage);

          // Calculate page ranges once
          this.calculatePageRanges();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading income data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }

  calculatePageRanges(): void {
    this.cachedPageRanges = [];
    for (let i = 1; i <= this.totalPages; i++) {
      const startItem = (i - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(i * this.itemsPerPage, this.incomeData.length);
      this.cachedPageRanges.push({
        label: `${startItem}-${endItem}`,
        page: i
      });
    }
  }

  // Pagination methods
  get paginatedData(): IncomeRow[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.incomeData.slice(startIndex, endIndex);
  }

  get currentPageRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.incomeData.length);
    return `${startItem}-${endItem}`;
  }

  get totalItems(): number {
    return this.incomeData.length;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.showPageDropdown = false;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    this.showPageDropdown = !this.showPageDropdown;
  }

  onDropdownItemClick(page: number, event: Event): void {
    event.stopPropagation();
    this.goToPage(page);
  }
}
