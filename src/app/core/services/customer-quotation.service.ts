// customer-quotation.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface CustomerQuotationData {
  customerId: string;
  customerName: string;
  companyName?: string;
  owner: string;
  segment: string;
  class: string;
  arr: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerQuotationService {

  // Store customer data for quotation creation
  private customerData = signal<CustomerQuotationData | null>(null);

  constructor(private router: Router) {}

  /**
   * Create quotation from customer data and navigate to contract management
   */
  createQuotationFromCustomer(customerData: CustomerQuotationData): void {
    // Store customer data
    this.customerData.set(customerData);

    // Navigate to contract management with query param
    this.router.navigate(['/contract/management'], {
      queryParams: {
        action: 'createQuotation',
        customerId: customerData.customerId
      }
    });
  }

  /**
   * Get stored customer data and clear it
   */
  getAndClearCustomerData(): CustomerQuotationData | null {
    const data = this.customerData();
    this.customerData.set(null);
    return data;
  }

  /**
   * Check if there's pending customer data
   */
  hasPendingData(): boolean {
    return this.customerData() !== null;
  }
}
