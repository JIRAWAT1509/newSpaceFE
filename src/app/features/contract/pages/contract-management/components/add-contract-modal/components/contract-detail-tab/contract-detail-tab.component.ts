// contract-detail-tab.component.ts
import { Component, signal, input, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContractInfoTabComponent } from './components/contract-info-tab/contract-info-tab.component';
import { RevenueTabComponent } from './components/revenue-tab/revenue-tab.component';
import { InsuranceTabComponent } from './components/insurance-tab/insurance-tab.component';
import { DecorationTabComponent } from './components/decoration-tab/decoration-tab.component';

interface SubTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-contract-detail-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContractInfoTabComponent,
    RevenueTabComponent,
    InsuranceTabComponent,
    DecorationTabComponent
  ],
  templateUrl: './contract-detail-tab.component.html',
  styleUrl: './contract-detail-tab.component.css'
})
export class ContractDetailTabComponent {
  /** ข้อมูลที่เคยกรอกไว้ สำหรับ pre-populate เมื่อเข้า tab นี้ */
  initialData = input<Record<string, unknown>>({});

  @ViewChild(ContractInfoTabComponent) contractInfoTab?: ContractInfoTabComponent;

  activeSubTabIndex = signal<number>(0);

  subTabs: SubTab[] = [
    { id: 'contract-info', label: 'ข้อมูลสัญญา' },
    { id: 'revenue', label: 'รายได้' },
    { id: 'deposit', label: 'เงินประกัน' },
    { id: 'decoration', label: 'การตกแต่งสถานที่/รายละเอียดร้านค้า' }
  ];

  constructor() {
    // When initialData changes and the contract info tab exists, patch the form
    effect(() => {
      const data = this.initialData();
      if (data && Object.keys(data).length > 0 && this.contractInfoTab?.form) {
        this.contractInfoTab.form.patchValue(data);
      }
    });
  }

  ngAfterViewInit(): void {
    // Patch form with initial data once the view child is available
    const data = this.initialData();
    if (data && Object.keys(data).length > 0 && this.contractInfoTab?.form) {
      setTimeout(() => {
        this.contractInfoTab!.form.patchValue(data);
      });
    }
  }

  switchSubTab(index: number): void {
    this.activeSubTabIndex.set(index);
  }
}
