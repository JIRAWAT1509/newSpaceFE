import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, Top10RentalItem } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';

@Component({
  selector: 'app-top-rental-size-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-rental-size-block.component.html',
  styleUrl: './top-rental-size-block.component.css'
})
export class TopRentalSizeBlockComponent implements OnInit {
  isLoading = false;
  data: Top10RentalItem[] = [];
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

    this.dashboardService.getTop10RentalData().subscribe({
      next: (response) => {
        if (response.data) {
          this.data = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading top rental data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
