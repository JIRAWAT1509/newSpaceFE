import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

@Component({
  selector: 'app-reserve-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reserve-block.component.html',
  styleUrl: './reserve-block.component.css'
})
export class ReserveBlockComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Reserve data
  count1to10: number = 0;
  count11to20: number = 0;
  count20up: number = 0;

  // Contract waiting approve (from same API)
  waitingApprove: number = 0;

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

    this.dashboardService.getReserveData().subscribe({
      next: (response: any) => {
        console.log('Reserve Response:', response);

        if (response && response.data) {
          // Extract Reserve data
          if (response.data.DisplayReserve) {
            const reserve = response.data.DisplayReserve;
            this.count1to10 = reserve.Count1to10 || 0;
            this.count11to20 = reserve.Count11to20 || 0;
            this.count20up = reserve.Count20up || 0;
          }

          // Extract Contract Waiting Approve
          if (response.data.DisplayContract) {
            const contract = response.data.DisplayContract;
            this.waitingApprove = contract.WaitingApprove === -1 ? 0 : (contract.WaitingApprove || 0);
          }
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reserve data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
