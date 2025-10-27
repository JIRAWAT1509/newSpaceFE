import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// Import all block components
import { AreaBlockComponent } from './components/area-block/area-block.component';
import { BuildingBlockComponent } from './components/building-block/building-block.component';
import { TopRentalSizeBlockComponent } from './components/top-rental-size-block/top-rental-size-block.component';
import { TopRentRatesBlockComponent } from './components/top-rent-rates-block/top-rent-rates-block.component';
import { ReserveBlockComponent } from './components/reserve-block/reserve-block.component';
import { RenewCustomerBlockComponent } from './components/renew-customer-block/renew-customer-block.component';
import { ContractBlockComponent } from './components/contract-block/contract-block.component';
import { NewCustomerBlockComponent } from './components/new-customer-block/new-customer-block.component';
import { OutstandingBlockComponent } from './components/outstanding-block/outstanding-block.component';
import { IncomeBlockComponent } from './components/income-block/income-block.component';
import { FinancialBlockComponent } from './components/financial-block/financial-block.component';


import { ButtonModule } from 'primeng/button';

interface Branch {
  id: string;
  code: string;
  name: string;
  displayName: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AreaBlockComponent,
    BuildingBlockComponent,
    TopRentalSizeBlockComponent,
    TopRentRatesBlockComponent,
    ReserveBlockComponent,
    RenewCustomerBlockComponent,
    ContractBlockComponent,
    NewCustomerBlockComponent,
    OutstandingBlockComponent,
    IncomeBlockComponent,
    FinancialBlockComponent,

    ButtonModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',

})
export class OverviewComponent implements OnInit {
  // Branch selection
  branches: Branch[] = [
    { id: '1', code: 'ทั้งหมด', name: 'ทั้งหมด', displayName: 'ทั้งหมด' },
    { id: '2', code: 'ST03', name: 'อาคารชินวัตร ทาวเวอร์ 3', displayName: 'ST03 : อาคารชินวัตร ทาวเวอร์ 3' },
    { id: '3', code: 'WBP1', name: 'Warehouse Bangphee 1', displayName: 'WBP1 : Warehouse Bangphee 1' },
    { id: '4', code: 'WBP2', name: 'Warehouse Bangphee 2', displayName: 'WBP2 : Warehouse Bangphee 2' }
  ];

  selectedBranch: string = '2'; // Default to ST03

  constructor() { }

  ngOnInit(): void {
    console.log('Dashboard initialized with branch:', this.selectedBranch);
  }

  onBranchChange(branchId: string): void {
    this.selectedBranch = branchId;
    console.log('Branch changed to:', branchId);

    // TODO: Reload all components with new branch filter
    // This will be implemented when you connect to real API
  }

  getSelectedBranchName(): string {
    const branch = this.branches.find(b => b.id === this.selectedBranch);
    return branch ? branch.displayName : '';
  }
}
