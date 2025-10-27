import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

interface ContractExpireItem {
  ContCode: string;
  CustomerName: string;
  UnitNo: string;
  ExpireDay: number;
}

@Component({
  selector: 'app-contract-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-block.component.html',
  styleUrl: './contract-block.component.css'
})
export class ContractBlockComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  noticeForExpire: number = 0;
  contractList: ContractExpireItem[] = [];

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

    this.dashboardService.getContractData().subscribe({
      next: (response: any) => {
        console.log('Contract Response:', response);

        if (response && response.data && response.data.DisplayContract) {
          const contract = response.data.DisplayContract;
          this.noticeForExpire = contract.NoticeForExpire || 0;
          this.contractList = contract.ListContExpire || [];
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contract data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
