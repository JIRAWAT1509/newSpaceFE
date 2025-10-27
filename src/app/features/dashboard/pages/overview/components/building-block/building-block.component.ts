import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService, BuildingAreaItem } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

// Register Chart.js components
Chart.register(...registerables);

interface TooltipData {
  key: string;
  free: string;
  reserve: string;
  rent: string;
}

@Component({
  selector: 'app-building-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './building-block.component.html',
  styleUrl: './building-block.component.css'
})
export class BuildingBlockComponent implements OnInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Building data
  buildingData: BuildingAreaItem[] = [];
  sumFree: number = 0;
  sumAreaFree: number = 0;
  sumReserve: number = 0;
  sumAreaReserve: number = 0;
  sumContract: number = 0;
  sumAreaContract: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  showPageDropdown: boolean = false;
  cachedPageRanges: { label: string; page: number }[] = [];

  // Chart
  chart: Chart | null = null;
  tooltipsData: TooltipData[] = [];

  // Legend toggle states
  datasetVisibility = {
    reserve: true,  // Index 0
    rent: true,     // Index 1
    free: true      // Index 2
  };

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

    this.dashboardService.getBuildingData().subscribe({
      next: (response: any) => {
        console.log('Building Response:', response);

        if (response && response.data && response.data.DisplayGrossArea) {
          const area = response.data.DisplayGrossArea;

          this.buildingData = area.DisplayAreaBuidling || [];
          this.sumFree = area.SumFREE || 0;
          this.sumAreaFree = area.SumAreaFREE || 0;
          this.sumReserve = area.SumRESERVE || 0;
          this.sumAreaReserve = area.SumAreaRESERVE || 0;
          this.sumContract = area.SumCONTRACT || 0;
          this.sumAreaContract = area.SumAreaCONTRACT || 0;

          // Calculate total pages
          this.totalPages = Math.ceil(this.buildingData.length / this.itemsPerPage);

          // Calculate page ranges once
          this.calculatePageRanges();

          // Prepare tooltip data
          this.prepareTooltipData();

          // Create chart after data is loaded and view is initialized
          setTimeout(() => {
            this.createChart();
          }, 100);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading building data:', error);
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
      const endItem = Math.min(i * this.itemsPerPage, this.buildingData.length);
      this.cachedPageRanges.push({
        label: `${startItem}-${endItem}`,
        page: i
      });
    }
  }

  prepareTooltipData(): void {
    this.tooltipsData = this.buildingData.map(item => ({
      key: item.BUILDING_CODE,
      free: `${this.utilities.displaySumValue(item.FREE)} [${this.utilities.displayNumber(item.AREA_FREE)}]`,
      reserve: `${this.utilities.displaySumValue(item.RESERVE)} [${this.utilities.displayNumber(item.AREA_RESERVE)}]`,
      rent: `${this.utilities.displaySumValue(item.CONTRACT)} [${this.utilities.displayNumber(item.AREA_CONTRACT)}]`
    }));
  }

  toggleDataset(dataset: 'reserve' | 'rent' | 'free'): void {
    if (!this.chart) return;

    // Toggle visibility state
    this.datasetVisibility[dataset] = !this.datasetVisibility[dataset];

    // Update chart dataset visibility
    const datasetIndex = dataset === 'reserve' ? 0 : dataset === 'rent' ? 1 : 2;
    const meta = this.chart.getDatasetMeta(datasetIndex);
    meta.hidden = !this.datasetVisibility[dataset];

    this.chart.update();
  }

  createChart(): void {
    if (!this.chartCanvas) {
      console.log('Chart canvas not ready');
      return;
    }

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Could not get canvas context');
      return;
    }

    // Prepare chart data
    const labels = this.buildingData.map(item => item.BUILDING_CODE);
    const freeData = this.buildingData.map(item => item.AREA_FREE);
    const reserveData = this.buildingData.map(item => item.AREA_RESERVE);
    const rentData = this.buildingData.map(item => item.AREA_CONTRACT);

    console.log('Creating chart with data:', { labels, freeData, reserveData, rentData });

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Unit / พื้นที่จอง (ตร.ม.)',
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: '#FF6384',
            borderWidth: 1,
            data: reserveData,
            hidden: !this.datasetVisibility.reserve
          },
          {
            label: 'Unit / พื้นที่เช่า (ตร.ม.)',
            backgroundColor: 'rgba(255, 208, 95, 0.8)',
            borderColor: '#FFD05F',
            borderWidth: 1,
            data: rentData,
            hidden: !this.datasetVisibility.rent
          },
          {
            label: 'Unit / พื้นที่ว่าง (ตร.ม.)',
            backgroundColor: 'rgba(128, 224, 142, 0.8)',
            borderColor: '#80E08E',
            borderWidth: 1,
            data: freeData,
            hidden: !this.datasetVisibility.free
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || '';
                const buildingCode = context.label;
                const datasetIndex = context.datasetIndex;

                const tooltipItem = this.tooltipsData.find(t => t.key === buildingCode);

                if (tooltipItem) {
                  switch (datasetIndex) {
                    case 0: return `${datasetLabel}: ${tooltipItem.reserve}`;
                    case 1: return `${datasetLabel}: ${tooltipItem.rent}`;
                    case 2: return `${datasetLabel}: ${tooltipItem.free}`;
                  }
                }

                return datasetLabel;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    try {
      this.chart = new Chart(ctx, config);
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  // Pagination methods
  get paginatedData(): BuildingAreaItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.buildingData.slice(startIndex, endIndex);
  }

  get currentPageRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.buildingData.length);
    return `${startItem}-${endItem}`;
  }

  get totalItems(): number {
    return this.buildingData.length;
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

  calculateOccupancy(item: BuildingAreaItem): number {
    const totalArea = item.AREA_FREE + item.AREA_RESERVE + item.AREA_CONTRACT;
    if (totalArea > 0) {
      return Math.round((item.AREA_CONTRACT / totalArea) * 1000) / 10;
    }
    return 0;
  }

  calculateTotalOccupancy(): number {
    const totalArea = this.sumAreaFree + this.sumAreaReserve + this.sumAreaContract;
    if (totalArea > 0) {
      return Math.round((this.sumAreaContract / totalArea) * 1000) / 10;
    }
    return 0;
  }

  getTotalUnits(item: BuildingAreaItem): number {
    return item.FREE + item.RESERVE + item.CONTRACT;
  }

  getTotalArea(item: BuildingAreaItem): number {
    return item.AREA_FREE + item.AREA_RESERVE + item.AREA_CONTRACT;
  }

  getSumTotalUnits(): number {
    return this.sumFree + this.sumReserve + this.sumContract;
  }

  getSumTotalArea(): number {
    return this.sumAreaFree + this.sumAreaReserve + this.sumAreaContract;
  }
}
