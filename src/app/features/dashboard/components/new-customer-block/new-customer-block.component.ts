import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CustomerItem } from '@core/services/dashboard.service';

@Component({
  selector: 'app-new-customer-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-customer-block.component.html',
  styleUrl: './new-customer-block.component.css'
})
export class NewCustomerBlockComponent implements OnInit {
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
        //console.log('New Customer Response:', response);  Debug log

        // The response structure has newCustomer at root level
        if (response) {
          if (response.newCustomer && Array.isArray(response.newCustomer)) {
            this.data = response.newCustomer;
          } else if (response.data?.newCustomer && Array.isArray(response.data.newCustomer)) {
            this.data = response.data.newCustomer;
          } else {
            this.data = [];
          }
        } else {
          this.data = [];
        }

        //console.log('New Customer Data:', this.data);  Debug log
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading new customer data:', error);
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
