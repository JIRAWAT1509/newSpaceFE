import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

interface AgingRow {
  aging: string;
  no: number;
  amount: number;
}

@Component({
  selector: 'app-outstanding-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './outstanding-block.component.html',
  styleUrl: './outstanding-block.component.css'
})
export class OutstandingBlockComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Outstanding data
  agingData: AgingRow[] = [];
  totalNo: number = 0;
  totalAmount: number = 0;

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

    this.dashboardService.getOutstandingData().subscribe({
      next: (response: any) => {
        console.log('Outstanding Response:', response);

        if (response && response.data) {
          const data = response.data;

          // Map the aging data to display format
          this.agingData = [
            {
              aging: 'In-due',
              no: data.CountAgingIndue || 0,
              amount: data.SumAmountIndue || 0
            },
            {
              aging: '1-25',
              no: data.CountAging1_15 || 0,
              amount: data.SumAmount1_15 || 0
            },
            {
              aging: '26-60',
              no: data.CountAging16_30 || 0,
              amount: data.SumAmount15_30 || 0
            },
            {
              aging: '61-90',
              no: data.CountAging31_45 || 0,
              amount: data.SumAmount31_45 || 0
            },
            {
              aging: '91-120',
              no: data.CountAging46_60 || 0,
              amount: data.SumAmount46_60 || 0
            },
            {
              aging: '>120',
              no: data.CountAging61UP || 0,
              amount: data.SumAmount61UP || 0
            }
          ];

          // Calculate totals
          this.totalNo = data.OutStanding || 0;
          this.totalAmount = data.OutStandingTotalAmount || 0;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading outstanding data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
