// system-contract.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { CostCenterFormDrawerComponent } from './components/cost-center-form-drawer/cost-center-form-drawer.component';
import { BusinessFormDrawerComponent } from './components/business-form-drawer/business-form-drawer.component';
import { SignerFormDrawerComponent } from './components/signer-form-drawer/signer-form-drawer.component';
import { ContractTypeWizardComponent } from './components/contract-type-wizard/contract-type-wizard.component';

@Component({
  selector: 'app-system-contract',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Dialog, Select, CostCenterFormDrawerComponent, BusinessFormDrawerComponent, SignerFormDrawerComponent ,
    ContractTypeWizardComponent  ],
  templateUrl: './system-contract.component.html',
  styleUrl: './system-contract.component.css'
})
export class SystemContractComponent implements OnInit {
  // ==================== STATE MANAGEMENT ====================
  activeMainCategory: 'business' | 'contract' | 'signers' | 'cost' = 'business';
  activeSubCategory: 'profit' | 'main-business' | 'sub-business' = 'profit';
  searchQuery: string = '';
  isEditMode: boolean = false;

  costCenterDrawerOpen: boolean = false;
drawerMode: 'create' | 'edit' = 'create';
selectedCostCenter: any = null;
businessDrawerOpen: boolean = false;
selectedItem: any = null;
  // ==================== DATA COUNTS ====================
  profitCenterCount: number = 0;
  mainBusinessCount: number = 0;
  subBusinessCount: number = 0;
  contractTypeCount: number = 0;
  signerCount: number = 0;
  costCenterCount: number = 0;

  // ==================== DATA ARRAYS ====================
  profitCenters: any[] = [];
  mainBusinessTypes: any[] = [];
  subBusinessTypes: any[] = [];
  contractTypes: any[] = [];
  signers: any[] = [];
  costCenters: any[] = [];

  // ==================== MODAL VISIBILITY FLAGS ====================
  // profitCenterModalVisible: boolean = false;
  // mainBusinessModalVisible: boolean = false;
  // subBusinessModalVisible: boolean = false;
  contractTypeModalVisible: boolean = false;
  // signerModalVisible: boolean = false;
  // costCenterModalVisible: boolean = false;
contractTypeWizardOpen: boolean = false;
contractTypeWizardMode: 'create' | 'edit' = 'create';
selectedContractType: any = null;

signerDrawerOpen: boolean = false;
selectedSigner: any = null;
  // ==================== FORM MODELS ====================
  // profitCenterForm: any = {
  //   COST_CENTER_CODE: '',
  //   COST_CENTER_NAME: '',
  //   OU_CODE: '001'
  // };

  // mainBusinessForm: any = {
  //   BUS_TYPE_CODE: '',
  //   BUS_TYPE_NAME: '',
  //   OU_CODE: '001'
  // };

  // subBusinessForm: any = {
  //   BUS_SUBTYPE_CODE: '',
  //   BUS_SUBTYPE_NAME: '',
  //   BUS_TYPE_CODE: '',
  //   COST_CENTER_CODE: '',
  //   OU_CODE: '001'
  // };

  contractTypeForm: any = {
    TYPE_CODE: '',
    TYPE_NAME: '',
    MAIN_TYPE: '',
    TYPE_STATUS: 'R',
    DECORATION_INS_INC_VAT: '0',
    OU_CODE: '001'
  };

  // signerForm: any = {
  //   REPRESENT: '',
  //   POSITION_NAME: '',
  //   REP_TYPE: '',
  //   STATUS: 'Y',
  //   OU_CODE: '001'
  // };

  // costCenterForm: any = {
  //   COST_CENTER_CODE: '',
  //   IO: '',
  //   DESCRIPTION: '',
  //   ACC_NO: '',
  //   INTER_ACC_NO: '',
  //   OU_CODE: '001'
  // };


  // ==================== DROPDOWN OPTIONS ====================
  repTypes = [
    { label: 'ผู้ให้บริการ', value: 'P' },
    { label: 'ลูกค้า', value: 'C' },
    { label: 'พยาน', value: 'W' }
  ];

  statusOptions = [
    { label: 'แสดง', value: 'Y' },
    { label: 'ไม่แสดง', value: 'N' }
  ];

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadMockData();
  }

  // ==================== MOCK DATA LOADER ====================
  loadMockData(): void {
    // Mock Profit Centers
    this.profitCenters = [
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '113000100',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 1',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575525000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '113000200',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 2',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575525000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575525000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575525000)/'
      }
    ];

    // Mock Main Business Types
    this.mainBusinessTypes = [
      {
        OU_CODE: '001',
        BUS_TYPE_CODE: 'LAND',
        BUS_TYPE_NAME: 'LAND',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752572262000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752572262000)/'
      },
      {
        OU_CODE: '001',
        BUS_TYPE_CODE: 'OFFICE',
        BUS_TYPE_NAME: 'OFFICE',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752572262000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752572262000)/'
      },
      {
        OU_CODE: '001',
        BUS_TYPE_CODE: 'PLAZA',
        BUS_TYPE_NAME: 'PLAZA',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752572262000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752572262000)/'
      },
      {
        OU_CODE: '001',
        BUS_TYPE_CODE: 'WH',
        BUS_TYPE_NAME: 'WAREHOUSE',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752572262000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752572262000)/'
      }
    ];

    // Mock Sub Business Types
    this.subBusinessTypes = [
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'ADV',
        BUS_SUBTYPE_NAME: 'ADVERTISE',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'COMMON',
        BUS_SUBTYPE_NAME: 'COMMON',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'HSOFF',
        BUS_SUBTYPE_NAME: 'HOUSEUSED-OFFICE',
        BUS_TYPE_CODE: 'OFFICE',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'HSPLAZ',
        BUS_SUBTYPE_NAME: 'HOUSEUSED-PLAZA',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'LAND',
        BUS_SUBTYPE_NAME: 'LAND',
        BUS_TYPE_CODE: 'LAND',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'MEDIA',
        BUS_SUBTYPE_NAME: 'MEDIA',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'OFFICE',
        BUS_SUBTYPE_NAME: 'OFFICE',
        BUS_TYPE_CODE: 'OFFICE',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'PLAZA',
        BUS_SUBTYPE_NAME: 'PLAZA',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'STORE',
        BUS_SUBTYPE_NAME: 'STORE',
        BUS_TYPE_CODE: 'PLAZA',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      },
      {
        OU_CODE: '001',
        BUS_SUBTYPE_CODE: 'WH',
        BUS_SUBTYPE_NAME: 'WAREHOUSE',
        BUS_TYPE_CODE: 'WH',
        COST_CENTER_CODE: '113000300',
        COST_CENTER_NAME: 'อาคารชินวัตร ทาวเวอร์ 3',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752575104000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752575104000)/'
      }
    ];

    // Mock Contract Types
    this.contractTypes = [
      {
        OU_CODE: '001',
        TYPE_CODE: 'HU-OFFICE',
        TYPE_NAME: 'HOUSEUSED-OFF',
        TYPE_STATUS: 'R',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '0',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752567964000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752567964000)/'
      },
      {
        OU_CODE: '001',
        TYPE_CODE: 'HU-PLAZA',
        TYPE_NAME: 'HOUSEUSED-PLAZA',
        TYPE_STATUS: 'R',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '0',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1752567964000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1752567964000)/'
      },
      {
        OU_CODE: '001',
        TYPE_CODE: 'LAND',
        TYPE_NAME: 'LAND',
        TYPE_STATUS: 'R',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '0',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1751436288000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1751436288000)/'
      },
      {
        OU_CODE: '001',
        TYPE_CODE: 'OFFICE',
        TYPE_NAME: 'OFFICE',
        TYPE_STATUS: 'R',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '1',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1751436288000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1751436288000)/'
      },
      {
        OU_CODE: '001',
        TYPE_CODE: 'PLAZA',
        TYPE_NAME: 'PLAZA',
        TYPE_STATUS: 'C',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '1',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1751436288000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1751436288000)/'
      },
      {
        OU_CODE: '001',
        TYPE_CODE: 'WHRB',
        TYPE_NAME: 'Ready Build',
        TYPE_STATUS: 'R',
        MAIN_TYPE: null,
        MAIN_TYPE_DESC: null,
        DECORATION_INS_INC_VAT: '0',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1751436288000)/',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1751436288000)/'
      }
    ];

    // Mock Signers
    this.signers = [
      {
        OU_CODE: '001',
        SEQ: 1,
        REPRESENT: 'นายธนาศิลป์ สงเสริม',
        POSITION_NAME: 'ผู้รับมอบอำนาจ',
        REP_TYPE: 'P',
        REP_TYPE_NAME: 'ผู้ให้บริการ',
        STATUS: 'Y',
        STATUS_NAME: 'แสดง',
        CREATE_BY: 'RACHAN',
        CREATE_DATE: '/Date(1471935995000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1749438773000)/'
      }
    ];

    // Mock Cost Centers
    this.costCenters = [
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '2701740140',
        IO: '27OFF0371401',
        DESCRIPTION: 'Singha Property Development 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(-15434308946000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003315000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '4500A53110',
        IO: '4SHOFR3A1100',
        DESCRIPTION: '4500',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1681888837000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003315000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '4W01730140',
        IO: '4WOFF0371401',
        DESCRIPTION: 'S PRIME 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1726828074000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003315000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '660T730140',
        IO: '66OFF0371401',
        DESCRIPTION: 'Sun Tower 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1722337519000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003315000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '660T730140',
        IO: '66OFF0371403',
        DESCRIPTION: 'Sun Tower 2025 มีเฟนเก',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1722337533000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003315000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '660T730140',
        IO: '66OFF0371401',
        DESCRIPTION: 'S Oasis 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1722337553000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003155000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '7602710541',
        IO: '76LTH0311002',
        DESCRIPTION: 'Light house 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1722337569000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003155000)/'
      },
      {
        OU_CODE: '001',
        COST_CENTER_CODE: '7603730140',
        IO: '76OFF0371401',
        DESCRIPTION: 'S Metro 2025',
        ACC_NO: '62706999',
        INTER_ACC_NO: '62706999',
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(1722337495000)/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(1737003155000)/'
      }
    ];

    // Update counts
    this.updateCounts();
  }

  updateCounts(): void {
    this.profitCenterCount = this.profitCenters.length;
    this.mainBusinessCount = this.mainBusinessTypes.length;
    this.subBusinessCount = this.subBusinessTypes.length;
    this.contractTypeCount = this.contractTypes.length;
    this.signerCount = this.signers.length;
    this.costCenterCount = this.costCenters.length;
  }

  // ==================== NAVIGATION ====================
  selectMainCategory(category: 'business' | 'contract' | 'signers' | 'cost'): void {
    this.activeMainCategory = category;
    this.searchQuery = '';

    // Reset sub-category if switching away from business
    if (category !== 'business') {
      this.activeSubCategory = 'profit';
    }
  }

  selectSubCategory(subCategory: 'profit' | 'main-business' | 'sub-business'): void {
    this.activeSubCategory = subCategory;
    this.searchQuery = '';
  }

  getActiveSubCategoryTitle(): string {
    switch (this.activeSubCategory) {
      case 'profit':
        return 'Profit Center';
      case 'main-business':
        return 'ประเภทธุรกิจหลัก';
      case 'sub-business':
        return 'ประเภทธุรกิจย่อย';
      default:
        return '';
    }
  }

  // ==================== DATA FILTERING ====================
  getFilteredData(): any[] {
    let data: any[] = [];

    switch (this.activeSubCategory) {
      case 'profit':
        data = this.profitCenters;
        break;
      case 'main-business':
        data = this.mainBusinessTypes;
        break;
      case 'sub-business':
        data = this.subBusinessTypes;
        break;
    }

    if (!this.searchQuery.trim()) {
      return data;
    }

    const query = this.searchQuery.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }

  getFilteredContractTypes(): any[] {
    if (!this.searchQuery.trim()) {
      return this.contractTypes;
    }

    const query = this.searchQuery.toLowerCase();
    return this.contractTypes.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }

  getFilteredSigners(): any[] {
    if (!this.searchQuery.trim()) {
      return this.signers;
    }

    const query = this.searchQuery.toLowerCase();
    return this.signers.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }

  getFilteredCostCenters(): any[] {
    if (!this.searchQuery.trim()) {
      return this.costCenters;
    }

    const query = this.searchQuery.toLowerCase();
    return this.costCenters.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }

  // ==================== MODAL OPERATIONS - PROFIT CENTER ====================
  // openAddModal(): void {
  //   this.isEditMode = false;

  //   switch (this.activeSubCategory) {
  //     case 'profit':
  //       this.profitCenterForm = {
  //         COST_CENTER_CODE: '',
  //         COST_CENTER_NAME: '',
  //         OU_CODE: '001'
  //       };
  //       this.profitCenterModalVisible = true;
  //       break;
  //     case 'main-business':
  //       this.mainBusinessForm = {
  //         BUS_TYPE_CODE: '',
  //         BUS_TYPE_NAME: '',
  //         OU_CODE: '001'
  //       };
  //       this.mainBusinessModalVisible = true;
  //       break;
  //     case 'sub-business':
  //       this.subBusinessForm = {
  //         BUS_SUBTYPE_CODE: '',
  //         BUS_SUBTYPE_NAME: '',
  //         BUS_TYPE_CODE: '',
  //         COST_CENTER_CODE: '',
  //         OU_CODE: '001'
  //       };
  //       this.subBusinessModalVisible = true;
  //       break;
  //   }
  // }

  // openEditModal(item: any): void {
  //   this.isEditMode = true;

  //   switch (this.activeSubCategory) {
  //     case 'profit':
  //       this.profitCenterForm = { ...item };
  //       this.profitCenterModalVisible = true;
  //       break;
  //     case 'main-business':
  //       this.mainBusinessForm = { ...item };
  //       this.mainBusinessModalVisible = true;
  //       break;
  //     case 'sub-business':
  //       this.subBusinessForm = { ...item };
  //       this.subBusinessModalVisible = true;
  //       break;
  //   }
  // }

  // saveProfitCenter(): void {
  //   if (this.isEditMode) {
  //     const index = this.profitCenters.findIndex(
  //       (p) => p.COST_CENTER_CODE === this.profitCenterForm.COST_CENTER_CODE
  //     );
  //     if (index !== -1) {
  //       this.profitCenters[index] = {
  //         ...this.profitCenterForm,
  //         UPD_BY: 'SPACE',
  //         UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //       };
  //     }
  //   } else {
  //     this.profitCenters.push({
  //       ...this.profitCenterForm,
  //       CREATE_BY: 'SPACE',
  //       CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
  //       UPD_BY: 'SPACE',
  //       UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //     });
  //   }

  //   this.updateCounts();
  //   this.profitCenterModalVisible = false;
  // }

  // saveMainBusiness(): void {
  //   if (this.isEditMode) {
  //     const index = this.mainBusinessTypes.findIndex(
  //       (p) => p.BUS_TYPE_CODE === this.mainBusinessForm.BUS_TYPE_CODE
  //     );
  //     if (index !== -1) {
  //       this.mainBusinessTypes[index] = {
  //         ...this.mainBusinessForm,
  //         UPD_BY: 'SPACE',
  //         UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //       };
  //     }
  //   } else {
  //     this.mainBusinessTypes.push({
  //       ...this.mainBusinessForm,
  //       CREATE_BY: 'SPACE',
  //       CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
  //       UPD_BY: 'SPACE',
  //       UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //     });
  //   }

  //   this.updateCounts();
  //   this.mainBusinessModalVisible = false;
  // }

  // saveSubBusiness(): void {
  //   // Find the Profit Center name
  //   const profitCenter = this.profitCenters.find(
  //     (p) => p.COST_CENTER_CODE === this.subBusinessForm.COST_CENTER_CODE
  //   );
  //   if (profitCenter) {
  //     this.subBusinessForm.COST_CENTER_NAME = profitCenter.COST_CENTER_NAME;
  //   }

  //   if (this.isEditMode) {
  //     const index = this.subBusinessTypes.findIndex(
  //       (p) => p.BUS_SUBTYPE_CODE === this.subBusinessForm.BUS_SUBTYPE_CODE
  //     );
  //     if (index !== -1) {
  //       this.subBusinessTypes[index] = {
  //         ...this.subBusinessForm,
  //         UPD_BY: 'SPACE',
  //         UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //       };
  //     }
  //   } else {
  //     this.subBusinessTypes.push({
  //       ...this.subBusinessForm,
  //       CREATE_BY: 'SPACE',
  //       CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
  //       UPD_BY: 'SPACE',
  //       UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //     });
  //   }

  //   this.updateCounts();
  //   this.subBusinessModalVisible = false;
  // }

  deleteItem(item: any): void {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      return;
    }

    switch (this.activeSubCategory) {
      case 'profit':
        this.profitCenters = this.profitCenters.filter(
          (p) => p.COST_CENTER_CODE !== item.COST_CENTER_CODE
        );
        break;
      case 'main-business':
        this.mainBusinessTypes = this.mainBusinessTypes.filter(
          (p) => p.BUS_TYPE_CODE !== item.BUS_TYPE_CODE
        );
        break;
      case 'sub-business':
        this.subBusinessTypes = this.subBusinessTypes.filter(
          (p) => p.BUS_SUBTYPE_CODE !== item.BUS_SUBTYPE_CODE
        );
        break;
    }

    this.updateCounts();
  }

  openAddDrawer(): void {
  this.drawerMode = 'create';
  this.selectedItem = null;
  this.businessDrawerOpen = true;
}

openEditDrawer(item: any): void {
  this.drawerMode = 'edit';
  this.selectedItem = item;
  this.businessDrawerOpen = true;
}

closeBusinessDrawer(): void {
  this.businessDrawerOpen = false;
  this.selectedItem = null;
}

onSaveBusinessItem(event: any): void {
  const { data, mode, formType } = event;

  if (mode === 'create') {
    if (formType === 'profit') {
      this.profitCenters.push(data);
    } else if (formType === 'main-business') {
      this.mainBusinessTypes.push(data);
    } else {
      this.subBusinessTypes.push(data);
    }
  } else {
    if (formType === 'profit') {
      const index = this.profitCenters.findIndex(p => p.COST_CENTER_CODE === data.COST_CENTER_CODE);
      if (index !== -1) this.profitCenters[index] = data;
    } else if (formType === 'main-business') {
      const index = this.mainBusinessTypes.findIndex(p => p.BUS_TYPE_CODE === data.BUS_TYPE_CODE);
      if (index !== -1) this.mainBusinessTypes[index] = data;
    } else {
      const index = this.subBusinessTypes.findIndex(p => p.BUS_SUBTYPE_CODE === data.BUS_SUBTYPE_CODE);
      if (index !== -1) this.subBusinessTypes[index] = data;
    }
  }
  this.updateCounts();
}

  // ==================== CONTRACT TYPE OPERATIONS ====================
openAddContractModal(): void {
  this.contractTypeWizardMode = 'create';
  this.selectedContractType = null;
  this.contractTypeWizardOpen = true;
}

openEditContractModal(contractType: any): void {
  this.contractTypeWizardMode = 'edit';
  this.selectedContractType = contractType;
  this.contractTypeWizardOpen = true;
}

onContractTypeWizardClose(): void {
  this.contractTypeWizardOpen = false;
  this.selectedContractType = null;
}

  saveContractType(): void {
    if (this.isEditMode) {
      const index = this.contractTypes.findIndex(
        (p) => p.TYPE_CODE === this.contractTypeForm.TYPE_CODE
      );
      if (index !== -1) {
        this.contractTypes[index] = {
          ...this.contractTypeForm,
          UPD_BY: 'SPACE',
          UPD_DATE: '/Date(' + new Date().getTime() + ')/'
        };
      }
    } else {
      this.contractTypes.push({
        ...this.contractTypeForm,
        CREATE_BY: 'SPACE',
        CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
        UPD_BY: 'SPACE',
        UPD_DATE: '/Date(' + new Date().getTime() + ')/'
      });
    }

    this.updateCounts();
    this.contractTypeModalVisible = false;
  }

onContractTypeWizardSave(event: any): void {
  const { data, mode } = event;

  if (mode === 'create') {
    // Add new contract type
    this.contractTypes = [data, ...this.contractTypes];
    this.contractTypeCount = this.contractTypes.length;
    console.log('Contract Type Created:', data);
  } else {
    // Update existing contract type
    const index = this.contractTypes.findIndex(
      ct => ct.TYPE_CODE === data.TYPE_CODE
    );
    if (index !== -1) {
      this.contractTypes[index] = data;
    }
    console.log('Contract Type Updated:', data);
  }

  // TODO: Replace with actual API call
  // this.contractService.saveContractType(data).subscribe({
  //   next: (response) => {
  //     this.showSuccess(mode === 'create' ? 'สร้างสำเร็จ' : 'บันทึกสำเร็จ');
  //     this.loadContractTypes();
  //   },
  //   error: (error) => {
  //     this.showError('เกิดข้อผิดพลาด');
  //   }
  // });
}


  deleteContractType(item: any): void {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      return;
    }

    this.contractTypes = this.contractTypes.filter(
      (p) => p.TYPE_CODE !== item.TYPE_CODE
    );
    this.updateCounts();
  }

  // ==================== SIGNER OPERATIONS ====================
  // openAddSignerModal(): void {
  //   this.isEditMode = false;
  //   this.signerForm = {
  //     REPRESENT: '',
  //     POSITION_NAME: '',
  //     REP_TYPE: '',
  //     STATUS: 'Y',
  //     OU_CODE: '001'
  //   };
  //   this.signerModalVisible = true;
  // }

  // openEditSignerModal(item: any): void {
  //   this.isEditMode = true;
  //   this.signerForm = { ...item };
  //   this.signerModalVisible = true;
  // }

  // saveSigner(): void {
  //   if (this.isEditMode) {
  //     const index = this.signers.findIndex((p) => p.SEQ === this.signerForm.SEQ);
  //     if (index !== -1) {
  //       // Update REP_TYPE_NAME based on REP_TYPE
  //       const repType = this.repTypes.find(
  //         (r) => r.value === this.signerForm.REP_TYPE
  //       );
  //       this.signerForm.REP_TYPE_NAME = repType ? repType.label : '';

  //       // Update STATUS_NAME based on STATUS
  //       const status = this.statusOptions.find(
  //         (s) => s.value === this.signerForm.STATUS
  //       );
  //       this.signerForm.STATUS_NAME = status ? status.label : '';

  //       this.signers[index] = {
  //         ...this.signerForm,
  //         UPD_BY: 'SPACE',
  //         UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //       };
  //     }
  //   } else {
  //     // Find next SEQ
  //     const maxSeq = Math.max(...this.signers.map((s) => s.SEQ), 0);

  //     // Update REP_TYPE_NAME and STATUS_NAME
  //     const repType = this.repTypes.find(
  //       (r) => r.value === this.signerForm.REP_TYPE
  //     );
  //     const status = this.statusOptions.find(
  //       (s) => s.value === this.signerForm.STATUS
  //     );

  //     this.signers.push({
  //       ...this.signerForm,
  //       SEQ: maxSeq + 1,
  //       REP_TYPE_NAME: repType ? repType.label : '',
  //       STATUS_NAME: status ? status.label : '',
  //       CREATE_BY: 'SPACE',
  //       CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
  //       UPD_BY: 'SPACE',
  //       UPD_DATE: '/Date(' + new Date().getTime() + ')/'
  //     });
  //   }

  //   this.updateCounts();
  //   this.signerModalVisible = false;
  // }

  deleteSigner(item: any): void {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      return;
    }

    this.signers = this.signers.filter((p) => p.SEQ !== item.SEQ);
    this.updateCounts();
  }

  openAddSignerDrawer(): void {
  this.drawerMode = 'create';
  this.selectedSigner = null;
  this.signerDrawerOpen = true;
}

openEditSignerDrawer(signer: any): void {
  this.drawerMode = 'edit';
  this.selectedSigner = signer;
  this.signerDrawerOpen = true;
}

closeSignerDrawer(): void {
  this.signerDrawerOpen = false;
  this.selectedSigner = null;
}

onSaveSigner(event: any): void {
  const { data, mode } = event;

  if (mode === 'create') {
    const maxSeq = Math.max(...this.signers.map(s => s.SEQ), 0);
    data.SEQ = maxSeq + 1;
    this.signers.push(data);
  } else {
    const index = this.signers.findIndex(s => s.SEQ === data.SEQ);
    if (index !== -1) {
      this.signers[index] = data;
    }
  }
  this.updateCounts();
}

  // ==================== COST CENTER OPERATIONS ====================
  // openAddCostCenterModal(): void {
  //   this.isEditMode = false;
  //   this.costCenterForm = {
  //     COST_CENTER_CODE: '',
  //     IO: '',
  //     DESCRIPTION: '',
  //     ACC_NO: '',
  //     INTER_ACC_NO: '',
  //     OU_CODE: '001'
  //   };
  //   this.costCenterModalVisible = true;
  // }
openAddCostCenterDrawer(): void {
  this.drawerMode = 'create';
  this.selectedCostCenter = null;
  this.costCenterDrawerOpen = true;
}

  // openEditCostCenterModal(item: any): void {
  //   this.isEditMode = true;
  //   this.costCenterForm = { ...item };
  //   this.costCenterModalVisible = true;
  // }

  openEditCostCenterDrawer(item: any): void {
  this.drawerMode = 'edit';
  this.selectedCostCenter = item;
  this.costCenterDrawerOpen = true;
}

// saveCostCenter(): void {
//     if (this.isEditMode) {
//       const index = this.costCenters.findIndex(
//         (p) =>
//           p.COST_CENTER_CODE === this.costCenterForm.COST_CENTER_CODE &&
//           p.IO === this.costCenterForm.IO
//       );
//       if (index !== -1) {
//         this.costCenters[index] = {
//           ...this.costCenterForm,
//           UPD_BY: 'SPACE',
//           UPD_DATE: '/Date(' + new Date().getTime() + ')/'
//         };
//       }
//     } else {
//       this.costCenters.push({
//         ...this.costCenterForm,
//         CREATE_BY: 'SPACE',
//         CREATE_DATE: '/Date(' + new Date().getTime() + ')/',
//         UPD_BY: 'SPACE',
//         UPD_DATE: '/Date(' + new Date().getTime() + ')/'
//       });
//     }

//     this.updateCounts();
//     this.costCenterModalVisible = false;
//   }

onSaveCostCenter(event: any): void {
  const { data, mode } = event;

  if (mode === 'create') {
    this.costCenters.push(data);
  } else {
    const index = this.costCenters.findIndex(
      cc => cc.COST_CENTER_CODE === data.COST_CENTER_CODE
    );
    if (index !== -1) {
      this.costCenters[index] = data;
    }
  }
  this.updateCounts();
}

closeCostCenterDrawer(): void {
  this.costCenterDrawerOpen = false;
  this.selectedCostCenter = null;
}


  deleteCostCenter(item: any): void {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      return;
    }

    this.costCenters = this.costCenters.filter(
      (p) =>
        !(
          p.COST_CENTER_CODE === item.COST_CENTER_CODE && p.IO === item.IO
        )
    );
    this.updateCounts();
  }

  // ==================== UTILITIES ====================
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';

    // Parse .NET JSON date format: /Date(1752575525000)/
    const match = dateString.match(/\/Date\((\d+)\)\//);
    if (match) {
      const timestamp = parseInt(match[1]);
      const date = new Date(timestamp);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }

    return dateString;
  }

}
