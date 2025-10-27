import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-area-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-block.component.html',
  styleUrl: './area-block.component.css',
})
export class AreaBlockComponent implements OnInit {
  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Area data
  grossArea: number = 0;
  nla: number = 0;
  allocate: number = 0;
  leased: number = 0;
  occupancy: number = 0;

  // Chart
  chart: Chart | null = null;

  // Legend toggle states
  datasetVisibility = {
    unallocated: true,
    leased: true,
    vacant: true,
  };

  constructor(
    private dashboardService: DashboardService,
    public utilities: UtilitiesService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getAreaData().subscribe({
      next: (response: any) => {
        console.log('Area Response:', response);

        if (response && response.data && response.data.DisplayGrossArea) {
          const area = response.data.DisplayGrossArea;

          this.grossArea = area.GrossArea || 0;
          this.nla = area.NLA || 0;
          this.allocate = area.ALLOCATE || 0;
          this.leased = area.LA || 0;

          // Calculate occupancy percentage
          if (this.nla > 0) {
            this.occupancy = Math.round((this.leased / this.nla) * 1000) / 10;
          }

          // Create chart after data is loaded
          setTimeout(() => {
            this.createChart();
          }, 100);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading area data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      },
    });
  }

  toggleDataset(segment: 'unallocated' | 'leased' | 'vacant'): void {
    if (!this.chart) return;

    // Toggle visibility state
    this.datasetVisibility[segment] = !this.datasetVisibility[segment];

    // Get the dataset
    const dataset = this.chart.data.datasets[0];

    // Create array of visible data based on toggle states
    const unAllocated = Math.round((this.nla - this.allocate) * 100) / 100;
    const vacant = Math.round((this.allocate - this.leased) * 100) / 100;

    const newData = [
      this.datasetVisibility.unallocated ? unAllocated : 0,
      this.datasetVisibility.leased ? this.leased : 0,
      this.datasetVisibility.vacant ? vacant : 0,
    ];

    const newBackgroundColors = [
      this.datasetVisibility.unallocated ? '#FF6384' : 'transparent',
      this.datasetVisibility.leased ? '#FFD05F' : 'transparent',
      this.datasetVisibility.vacant ? '#80E08E' : 'transparent',
    ];

    // Update dataset
    dataset.data = newData;
    dataset.backgroundColor = newBackgroundColors;
    dataset.hoverBackgroundColor = newBackgroundColors;

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

    // Calculate chart data
    const unAllocated = Math.round((this.nla - this.allocate) * 100) / 100;
    const vacant = Math.round((this.allocate - this.leased) * 100) / 100;

    console.log('Creating chart with data:', {
      unAllocated,
      leased: this.leased,
      vacant,
    });

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['UNALLOCATED', 'LEASED', 'VACANT'],
        datasets: [
          {
            data: [unAllocated, this.leased, vacant],
            backgroundColor: [
              '#FF6384', // Unallocated (Red)
              '#FFD05F', // Leased (Yellow)
              '#80E08E', // Vacant (Green)
            ],
            hoverBackgroundColor: ['#FF6384', '#FFD05F', '#80E08E'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
  enabled: true,
  callbacks: {
    label: (context): string => {
      const label = context.label || '';
      const value = context.parsed || 0;
      if (value === 0) {
        return ''; // Return empty string for hidden segments
      }
      return `${label}: ${this.utilities.displayNumber(value)} Sqm`;
    }
  }
}
        },
        cutout: '70%',
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;

            ctx.restore();

            // Draw occupancy percentage
            const fontSize1 = (height / 180).toFixed(2);
            ctx.font = `bold ${fontSize1}em sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#374151';

            const text1 = `${this.occupancy}%`;
            const textX1 = Math.round(
              (width - ctx.measureText(text1).width) / 2
            );
            const textY1 = height / 2 - 10;

            ctx.fillText(text1, textX1, textY1);

            // Draw "Occupancy" label
            const fontSize2 = (height / 300).toFixed(2);
            ctx.font = `${fontSize2}em sans-serif`;
            ctx.fillStyle = '#6B7280';

            const text2 = 'Occupancy';
            const textX2 = Math.round(
              (width - ctx.measureText(text2).width) / 2
            );
            const textY2 = height / 2 + 15;

            ctx.fillText(text2, textX2, textY2);

            ctx.save();
          },
        },
      ],
    };

    try {
      this.chart = new Chart(ctx, config);
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }
}
