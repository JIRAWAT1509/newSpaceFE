import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';

interface BranchRow {
  branch: string;
  name: string;
  taxProfile: string;
}

interface DropdownOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-branch-master',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DrawerModule,
    FormsModule,
    SelectModule
  ],
  templateUrl: './branch-master.component.html',
  styleUrls: ['./branch-master.component.css']
})
export class BranchMasterComponent {
  // Inputs from parent
  @Input() isLoadingBranch = false;
  @Input() branchMaster: BranchRow[] = [];

  // search
  searchKeyword = '';

  // Drawer state
  sideVisible = false;
  isEdit = false;

  // Generate branch options from branchMaster
  get branchOptions(): DropdownOption[] {
    return this.branchMaster.map(b => ({
      code: b.branch,
      name: `${b.branch} - ${b.name}`
    }));
  }

  // Mock dropdown data
  vatOptions: DropdownOption[] = [
    { code: 'DS', name: 'Deferred Output Tax rate 7%' },
    { code: 'O7', name: 'Output Tax rate 7%' },
    { code: 'OX', name: 'Output Tax rate 0% (Non tax relevant)' }
  ];

  houseTaxOptions: DropdownOption[] = [
    { code: 'PTAX', name: 'ภาษีโรงเรือน 1' },
    { code: 'H001', name: 'ภาษีโรงเรือน 2' },
    { code: 'H002', name: 'ภาษีโรงเรือน 3' },
    { code: 'H003', name: 'ภาษีโรงเรือน 4' },
    { code: 'H004', name: 'ภาษีโรงเรือน 5' }
  ];

  stampOptions: DropdownOption[] = [
    { code: 'OTHN', name: 'อากรแสตมป์อื่นๆ' },
    { code: 'ST01', name: 'อากรแสตมป์ 1' },
    { code: 'ST02', name: 'อากรแสตมป์ 2' },
    { code: 'ST03', name: 'อากรแสตมป์ 3' },
    { code: 'ST04', name: 'อากรแสตมป์ 4' }
  ];

  currencyOptions: DropdownOption[] = [
    { code: 'THB', name: 'บาท' },
    { code: 'USD', name: 'ดอลลาร์สหรัฐ' },
    { code: 'EUR', name: 'ยูโร' },
    { code: 'JPY', name: 'เยน' },
    { code: 'CNY', name: 'หยวน' }
  ];

  creditTermOptions: DropdownOption[] = [
    { code: 'C000', name: 'Due immediately' },
    { code: 'C005', name: 'ชำระเงินภายใน 5 วัน' },
    { code: 'C010', name: 'ชำระเงินภายใน 10 วัน' },
    { code: 'C030', name: 'ชำระเงินภายใน 30 วัน' },
    { code: 'CEND', name: 'ปลายเดือน' }
  ];

  insuranceOptions: DropdownOption[] = [
    { code: 'ISSU', name: 'Insurance Standard' },
    { code: 'INS01', name: 'Insurance Type 1' },
    { code: 'INS02', name: 'Insurance Type 2' },
    { code: 'INS03', name: 'Insurance Type 3' },
    { code: 'INS04', name: 'Insurance Type 4' }
  ];

  costCenterOptions: DropdownOption[] = [
    { code: 'CC001', name: 'Cost Center - Office' },
    { code: 'CC002', name: 'Cost Center - Warehouse' },
    { code: 'CC003', name: 'Cost Center - Retail' },
    { code: 'CC004', name: 'Cost Center - Admin' }
  ];

  // Form model
  branchForm = this.createEmptyForm();

  get filteredBranchList(): BranchRow[] {
    const kw = this.searchKeyword.trim().toLowerCase();
    if (!kw) return this.branchMaster;
    return this.branchMaster.filter(
      b =>
        b.branch.toLowerCase().includes(kw) ||
        b.name.toLowerCase().includes(kw) ||
        b.taxProfile.toLowerCase().includes(kw)
    );
  }

  // Open for add
  openAddPanel() {
    this.isEdit = false;
    this.branchForm = this.createEmptyForm();
    this.sideVisible = true;
  }

  // Open for edit
  openEditPanel(row: BranchRow) {
    this.isEdit = true;
    this.branchForm = {
      branchCode: row.branch,
      vatCode: 'DS',
      houseTaxCode: 'PTAX',
      houseTaxRate: 20,
      stampCode: 'OTHN',
      currencyCode: 'THB',
      shortTermMonth: 999,
      creditTerm: 'C005',
      insuranceCode: 'ISSU',
      insuranceRate: 15,
      contractMonthFrom: 1,
      costCenter: 'CC001'
    };
    this.sideVisible = true;
  }

  saveBranch() {
    console.log('Saving branch form:', this.branchForm);
    // TODO: emit to parent or call service
    this.sideVisible = false;
  }

  cancelPanel() {
    this.sideVisible = false;
  }

  private createEmptyForm() {
    return {
      branchCode: '',
      vatCode: '',
      houseTaxCode: '',
      houseTaxRate: 0,
      stampCode: '',
      currencyCode: 'THB',
      shortTermMonth: 1,
      creditTerm: '',
      insuranceCode: '',
      insuranceRate: 0,
      contractMonthFrom: 1,
      costCenter: ''
    };
  }
}
