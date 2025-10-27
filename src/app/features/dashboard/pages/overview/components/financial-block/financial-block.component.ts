import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { UtilitiesService } from '@core/services/utilities.service';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-financial-block',
  standalone: true,
  imports: [CommonModule, DatePickerComponent, WarningModalComponent],
  templateUrl: './financial-block.component.html',
  styleUrl: './financial-block.component.css'
})
export class FinancialBlockComponent implements OnInit {
  @ViewChild('startDatePicker') startDatePicker!: DatePickerComponent;
  @ViewChild('endDatePicker') endDatePicker!: DatePickerComponent;

  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Date range
  startDate: string = '';
  endDate: string = '';
  previousStartDate: string = '';
  previousEndDate: string = '';

  // Date constraints for pickers (only used during auto-open)
  startMinDate: string = '';
  startMaxDate: string = '';
  endMinDate: string = '';
  endMaxDate: string = '';

  // Track if picker is being auto-opened
  isAutoOpening: boolean = false;

  // Modal
  showWarningModal: boolean = false;
  warningMessage: string = '';

  // Financial data
  invoiceTypeN: number = 0;
  totalAmountTypeN: number = 0;
  printInvoice: number = 0;
  neverPrintInvoice: number = 0;
  invoiceTypeCN: number = 0;
  totalAmountTypeCN: number = 0;

  receiveTypeN: number = 0;
  receiveAmountTypeN: number = 0;
  printReceive: number = 0;
  neverPrintReceive: number = 0;
  receiveTypeCN: number = 0;
  receiveAmountTypeCN: number = 0;

  constructor(
    private dashboardService: DashboardService,
    public utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.initializeDates();
    this.loadData();
  }

  initializeDates(): void {
    const now = DateTime.now();
    const firstDay = now.startOf('month');
    const lastDay = now.endOf('month');

    this.startDate = firstDay.toFormat('dd/MM/yyyy');
    this.endDate = lastDay.toFormat('dd/MM/yyyy');
    this.previousStartDate = this.startDate;
    this.previousEndDate = this.endDate;
  }

  clearDateConstraints(): void {
    this.startMinDate = '';
    this.startMaxDate = '';
    this.endMinDate = '';
    this.endMaxDate = '';
  }

  setDateConstraintsForAutoOpen(): void {
    if (this.endDate) {
      const end = DateTime.fromFormat(this.endDate, 'dd/MM/yyyy');
      const minStart = end.minus({ months: 3 });
      this.startMinDate = minStart.toFormat('dd/MM/yyyy');
      this.startMaxDate = this.endDate;
    }

    if (this.startDate) {
      const start = DateTime.fromFormat(this.startDate, 'dd/MM/yyyy');
      this.endMinDate = this.startDate;
      const maxEnd = start.plus({ months: 3 });
      this.endMaxDate = maxEnd.toFormat('dd/MM/yyyy');
    }
  }

  onStartDatePickerOpen(): void {
    if (!this.isAutoOpening) {
      // Manual open - clear constraints
      this.clearDateConstraints();
    }
    this.isAutoOpening = false;
  }

  onEndDatePickerOpen(): void {
    if (!this.isAutoOpening) {
      // Manual open - clear constraints
      this.clearDateConstraints();
    }
    this.isAutoOpening = false;
  }

onStartDateChange(newDate: string): void {
  this.startDate = newDate;

  if (!this.endDate) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.endDatePicker) {
        this.endDatePicker.open(); // Use open() method instead
      }
    }, 100);
    return;
  }

  const start = DateTime.fromFormat(newDate, 'dd/MM/yyyy');
  const end = DateTime.fromFormat(this.endDate, 'dd/MM/yyyy');

  if (start > end) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.endDatePicker) {
        this.endDatePicker.open();
      }
    }, 100);
    return;
  }

  const diffInMonths = end.diff(start, 'months').months;
  if (diffInMonths > 3) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.endDatePicker) {
        this.endDatePicker.open();
      }
    }, 100);
  } else {
    this.clearDateConstraints();
    this.previousStartDate = this.startDate;
    this.previousEndDate = this.endDate;
    this.loadData();
  }
}

onEndDateChange(newDate: string): void {
  this.endDate = newDate;

  if (!this.startDate) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.startDatePicker) {
        this.startDatePicker.open();
      }
    }, 100);
    return;
  }

  const start = DateTime.fromFormat(this.startDate, 'dd/MM/yyyy');
  const end = DateTime.fromFormat(newDate, 'dd/MM/yyyy');

  if (start > end) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.startDatePicker) {
        this.startDatePicker.open();
      }
    }, 100);
    return;
  }

  const diffInMonths = end.diff(start, 'months').months;
  if (diffInMonths > 3) {
    this.isAutoOpening = true;
    this.setDateConstraintsForAutoOpen();
    setTimeout(() => {
      if (this.startDatePicker) {
        this.startDatePicker.open();
      }
    }, 100);
  } else {
    this.clearDateConstraints();
    this.previousStartDate = this.startDate;
    this.previousEndDate = this.endDate;
    this.loadData();
  }
}

  closeWarningModal(): void {
    // Reset to previous valid dates
    this.startDate = this.previousStartDate;
    this.endDate = this.previousEndDate;
    this.clearDateConstraints();
    this.showWarningModal = false;
  }

  loadData(): void {
    if (!this.startDate || !this.endDate) {
      return; // Don't load if dates are not set
    }

    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getFinancialData(this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        console.log('Financial Response:', response);

        if (response && response.data) {
          const finance = response.data;

          this.invoiceTypeN = finance.InvoiceTypeN || 0;
          this.totalAmountTypeN = finance.TotalAmountTypeN || 0;
          this.printInvoice = finance.PrintInvoice || 0;
          this.neverPrintInvoice = finance.NeverPrintInvoice || 0;
          this.invoiceTypeCN = finance.InvoiceTypeCN || 0;
          this.totalAmountTypeCN = finance.TotalAmountTypeCN || 0;

          this.receiveTypeN = finance.ReceiveTypeN || 0;
          this.receiveAmountTypeN = finance.ReceiveAmountTypeN || 0;
          this.printReceive = finance.PrintReceive || 0;
          this.neverPrintReceive = finance.NeverPrintReceive || 0;
          this.receiveTypeCN = finance.ReceiveTypeCN || 0;
          this.receiveAmountTypeCN = finance.ReceiveAmountTypeCN || 0;

          // Update previous dates after successful load
          this.previousStartDate = this.startDate;
          this.previousEndDate = this.endDate;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading financial data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }
}
