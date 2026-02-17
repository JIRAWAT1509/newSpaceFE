// customer-classification-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CustomerClassification } from '@core/models/dashboard.types';

Chart.register(...registerables);

@Component({
  selector: 'app-customer-classification-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-classification-chart.component.html',
  styleUrl: './customer-classification-chart.component.css'
})
export class CustomerClassificationChartComponent implements OnChanges, AfterViewInit {

  @Input() classification: CustomerClassification | null = null;
  @Input() isLoading: boolean = false;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  // Define class names with proper type
  classNames: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  ngAfterViewInit(): void {
    if (this.classification) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classification'] && !changes['classification'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas || !this.classification) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = [
      this.classification.classA.count,
      this.classification.classB.count,
      this.classification.classC.count,
      this.classification.classD.count
    ];

    const colors = [
      this.classification.classA.color,
      this.classification.classB.color,
      this.classification.classC.color,
      this.classification.classD.color
    ];

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Class A', 'Class B', 'Class C', 'Class D'],
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => {
                const classList = ['classA', 'classB', 'classC', 'classD'];
                const classKey = classList[context.dataIndex] as keyof CustomerClassification;
                const classData = this.classification![classKey];
                return [
                  `Customers: ${classData.count}`,
                  `ARR: ฿${classData.totalARR.toLocaleString()}`,
                  `Avg CSAT: ${classData.avgCSAT}`
                ];
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart || !this.classification) {
      this.createChart();
      return;
    }

    const data = [
      this.classification.classA.count,
      this.classification.classB.count,
      this.classification.classC.count,
      this.classification.classD.count
    ];

    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }

  getClassData(className: 'A' | 'B' | 'C' | 'D') {
    if (!this.classification) return null;
    const classKey = `class${className}` as keyof CustomerClassification;
    return this.classification[classKey];
  }
}
