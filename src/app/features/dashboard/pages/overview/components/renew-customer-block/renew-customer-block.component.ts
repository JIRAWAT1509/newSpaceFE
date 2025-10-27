import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CustomerItem } from '@core/services/dashboard.service';

@Component({
  selector: 'app-renew-customer-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renew-customer-block.component.html',
  styleUrl: './renew-customer-block.component.css'
})
export class RenewCustomerBlockComponent implements OnInit {
  isLoading = false;
  data: CustomerItem[] = [];
  hasError = false;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getCustomerData().subscribe({
      next: (response: any) => {
        //console.log('Renew Customer Response:', response);  Debug log

        // The response structure has renewCustomer at root level
        if (response) {
          if (response.renewCustomer && Array.isArray(response.renewCustomer)) {
            this.data = response.renewCustomer;
          } else if (response.data?.renewCustomer && Array.isArray(response.data.renewCustomer)) {
            this.data = response.data.renewCustomer;
          } else {
            this.data = [];
          }
        } else {
          this.data = [];
        }

        //console.log('Renew Customer Data:', this.data);  Debug log
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading renew customer data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }

  truncateText(text: string, maxLength: number = 20): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
