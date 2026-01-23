// csat-chart.component.ts
import { Component, input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

export interface CSATTrendData {
  month: string;
  value: number;
}

@Component({
  selector: 'app-csat-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './csat-chart.component.html',
  styleUrl: './csat-chart.component.css'
})
export class CsatChartComponent {
  // Inputs
  data = input.required<CSATTrendData[]>();
  currentValue = input.required<number>();

  // Chart configuration
  chartData = computed(() => ({
    labels: this.data().map(d => d.month),
    datasets: [
      {
        label: 'CSAT Score',
        data: this.data().map(d => d.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#2563eb',
        pointHoverBorderColor: '#ffffff'
      }
    ]
  }));

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `CSAT: ${context.parsed.y?.toFixed(1)}/5.0`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value) => value.toString()
        },
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  getStars(score: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(score) ? 1 : 0);
  }
}
