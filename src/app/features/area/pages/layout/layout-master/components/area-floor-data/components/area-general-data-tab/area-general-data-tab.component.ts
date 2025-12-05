// area-general-data-tab.component.ts
import { Component, input, signal, computed, effect, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Area, AreaStatus, AreaType } from '@core/models/area.model';
import { getRentRateTimeline } from '@core/data/rental-history.mock';
import { fromDateString } from '@core/utils/date-utils';

Chart.register(...registerables);

interface AreaPicture {
  id: string;
  url: string;
  description: string;
  uploadedAt: Date;
}

@Component({
  selector: 'app-area-general-data-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-general-data-tab.component.html',
  styleUrl: './area-general-data-tab.component.css'
})
export class AreaGeneralDataTabComponent implements AfterViewInit {
  areaData = input<Area | null>(null);

  rentChart = viewChild<ElementRef>('rentChart');

  // Signals
  showPictureModal = signal<boolean>(false);
  selectedPicture = signal<AreaPicture | null>(null);
  chartInstance = signal<Chart | null>(null);

  // Computed
  areaPictures = computed<AreaPicture[]>(() => {
    const area = this.areaData();
    if (!area) return [];

    // Using external placeholder images
    const roomNumber = encodeURIComponent(area.roomNumber);
    return [
      {
        id: `${area.id}-pic-1`,
        url: `https://via.placeholder.com/800x600/2196F3/FFFFFF?text=${roomNumber}+Main+View`,
        description: `${area.roomNumber} - Main View`,
        uploadedAt: new Date()
      },
      {
        id: `${area.id}-pic-2`,
        url: `https://via.placeholder.com/800x600/42A5F5/FFFFFF?text=${roomNumber}+Interior`,
        description: `${area.roomNumber} - Interior`,
        uploadedAt: new Date()
      },
      {
        id: `${area.id}-pic-3`,
        url: `https://via.placeholder.com/800x600/64B5F6/FFFFFF?text=${roomNumber}+Entrance`,
        description: `${area.roomNumber} - Entrance`,
        uploadedAt: new Date()
      }
    ];
  });

  rentRateTimeline = computed<{ date: Date; rent: number }[]>(() => {
    const area = this.areaData();
    if (!area) return [];

    return getRentRateTimeline(area.id);
  });

  constructor() {
    // Watch for area changes to update chart
    effect(() => {
      const timeline = this.rentRateTimeline();
      if (timeline.length > 0) {
        setTimeout(() => this.updateChart(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  // ==================== CHART ====================

  initChart(): void {
    const canvas = this.rentChart();
    if (!canvas) return;

    const timeline = this.rentRateTimeline();
    if (timeline.length === 0) return;

    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: timeline.map(t => this.formatDate(t.date)),
        datasets: [{
          label: 'Monthly Rent (THB)',
          data: timeline.map(t => t.rent),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#2196F3',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Rent: ฿${value !== null ? this.formatNumber(value) : 'N/A'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => `฿${this.formatNumber(Number(value))}`
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.chartInstance.set(chart);
  }

  updateChart(): void {
    this.destroyChart();
    this.initChart();
  }

  destroyChart(): void {
    const chart = this.chartInstance();
    if (chart) {
      chart.destroy();
      this.chartInstance.set(null);
    }
  }

  // ==================== PICTURES ====================

  onPictureClick(picture: AreaPicture): void {
    this.selectedPicture.set(picture);
    this.showPictureModal.set(true);
  }

  closePictureModal(): void {
    this.showPictureModal.set(false);
    this.selectedPicture.set(null);
  }

  // ==================== HELPERS ====================

  getTypeLabel(type: AreaType): string {
    const labels: Record<AreaType, string> = {
      'log': 'Log',
      'kiosk': 'Kiosk',
      'open-plan': 'Open Plan'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: AreaStatus): string {
    const labels: Record<AreaStatus, string> = {
      'vacant': 'ว่าง',
      'leased': 'เช่า',
      'quotation': 'ใบเสนอราคา',
      'unallocated': 'ยังไม่พร้อม'
    };
    return labels[status] || status;
  }

  getStatusColor(status: AreaStatus): string {
    const colors: Record<AreaStatus, string> = {
      'vacant': '#80E08E',
      'leased': '#FFD05F',
      'quotation': '#4CA3FF',
      'unallocated': '#FF6384'
    };
    return colors[status] || '#9CA3AF';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      // Handle /Date(timestamp)/ format
      date = fromDateString(date);
    }

    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
