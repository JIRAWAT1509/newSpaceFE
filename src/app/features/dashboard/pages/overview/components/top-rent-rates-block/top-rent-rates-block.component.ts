import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, Top10HighestRentItem } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

@Component({
  selector: 'app-top-rent-rates-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-rent-rates-block.component.html',
  styleUrl: './top-rent-rates-block.component.css'
})
export class TopRentRatesBlockComponent implements OnInit {
  isLoading = false;
  data: Top10HighestRentItem[] = [];
  hasError = false;
  errorMessage = '';

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

    this.dashboardService.getTop10HighestRentData().subscribe({
      next: (response) => {
        if (response.data) {
          this.data = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading top rent rates data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
