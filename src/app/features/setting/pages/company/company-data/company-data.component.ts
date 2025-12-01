import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

// ==================== INTERFACES ====================

interface OrgCode {
  OU_CODE: string;
  OU_NAME: string;
  NOTE?: string;
  INACTIVE?: string;
}

interface Company {
  OU_CODE: string;
  COMP_CODE: string;
  OU_NAME: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
}

interface LegalEntity {
  OU_CODE: string;
  COMPANY_CODE: string;
  SHORT_NAME: string;
  COMPANY_TNAME: string;
  COMPANY_ENAME?: string;
  ADDR_T1: string;
  ADDR_T2?: string;
  ADDR_E1?: string;
  ADDR_E2?: string;
  TEL?: string;
  TAX_ID: string;
  CAL_WHT: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
}

interface Branch {
  OU_CODE: string;
  STORE_SEQ?: number;
  STORE_CODE: string;
  SHORT_NAME: string;
  STORE_ID: string;
  COMPANY_CODE: string;
  STORE_NAME_T: string;
  STORE_NAME_E?: string;
  ADDRESS_T1: string;
  ADDRESS_T2?: string;
  ADDRESS_E1?: string;
  ADDRESS_E2?: string;
  TEL?: string;
  TAX_ID?: string;
  MANAGER?: string;
  PLAZA_MANAGER?: string;
  FILE_PASSWORD: string;
  USE_PRICE_LIST: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
}

type DataCategory = 'company' | 'legal' | 'branch';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule
  ],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.css',
  providers: [MessageService, ConfirmationService]
})
export class CompanyDataComponent implements OnInit {

  // ==================== DATA ====================
  companies: Company[] = [];
  legalEntities: LegalEntity[] = [];
  branches: Branch[] = [];
  orgCodes: OrgCode[] = [];

  // ==================== SELECTED CATEGORY ====================
  selectedCategory: DataCategory = 'company';

  // ==================== SEARCH ====================
  searchQuery = '';

  // ==================== LOADING STATES ====================
  isLoadingCompanies = false;
  isLoadingLegal = false;
  isLoadingBranches = false;
  isLoadingOrgCodes = false;

  // ==================== MODALS ====================
  showCompanyModal = false;
  showLegalModal = false;
  showBranchModal = false;
  isEditMode = false;
  isSaving = false;

  // ==================== FORMS ====================
  companyForm: Company = this.getEmptyCompany();
  legalForm: LegalEntity = this.getEmptyLegal();
  branchForm: Branch = this.getEmptyBranch();

  // ==================== FORM ERRORS ====================
  companyErrors: { [key: string]: string } = {};
  legalErrors: { [key: string]: string } = {};
  branchErrors: { [key: string]: string } = {};

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadOrgCodes();
    this.loadCompanies();
    this.loadLegalEntities();
    this.loadBranches();
  }

  // ==================== EMPTY FORMS ====================

  getEmptyCompany(): Company {
    return {
      OU_CODE: '',
      COMP_CODE: '',
      OU_NAME: ''
    };
  }

  getEmptyLegal(): LegalEntity {
    return {
      OU_CODE: '001',
      COMPANY_CODE: '',
      SHORT_NAME: '',
      COMPANY_TNAME: '',
      COMPANY_ENAME: '',
      ADDR_T1: '',
      ADDR_T2: '',
      ADDR_E1: '',
      ADDR_E2: '',
      TEL: '',
      TAX_ID: '',
      CAL_WHT: 'N'
    };
  }

  getEmptyBranch(): Branch {
    return {
      OU_CODE: '001',
      STORE_CODE: '',
      SHORT_NAME: '',
      STORE_ID: '',
      COMPANY_CODE: '',
      STORE_NAME_T: '',
      STORE_NAME_E: '',
      ADDRESS_T1: '',
      ADDRESS_T2: '',
      ADDRESS_E1: '',
      ADDRESS_E2: '',
      TEL: '',
      TAX_ID: '',
      MANAGER: '',
      PLAZA_MANAGER: '',
      FILE_PASSWORD: '',
      USE_PRICE_LIST: 'N'
    };
  }

  // ==================== LOAD DATA ====================

  loadOrgCodes() {
    this.isLoadingOrgCodes = true;

    // Mock data
    setTimeout(() => {
      this.orgCodes = [
        { OU_CODE: '001', OU_NAME: 'SPACE' },
        { OU_CODE: '002', OU_NAME: 'TEST' }
      ];
      this.isLoadingOrgCodes = false;
    }, 300);

    /* Real API:
    this.http.post('/API_URL/GetOrgCodes', {}).subscribe({
      next: (response: any) => {
        this.orgCodes = response.data;
        this.isLoadingOrgCodes = false;
      },
      error: () => {
        this.showError('Failed to load organization codes');
        this.isLoadingOrgCodes = false;
      }
    });
    */
  }

  loadCompanies() {
    this.isLoadingCompanies = true;

    // Mock data
    setTimeout(() => {
      this.companies = [
        {
          OU_CODE: '001',
          COMP_CODE: 'SC',
          OU_NAME: 'SC',
          CREATE_BY: 'SPACE',
          UPD_BY: 'SPACE'
        }
      ];
      this.isLoadingCompanies = false;
    }, 300);

    /* Real API:
    this.http.post('/API_URL/GetCompanies', {}).subscribe({
      next: (response: any) => {
        this.companies = response.data;
        this.isLoadingCompanies = false;
      },
      error: () => {
        this.showError('Failed to load companies');
        this.isLoadingCompanies = false;
      }
    });
    */
  }

  loadLegalEntities() {
    this.isLoadingLegal = true;

    // Mock data
    setTimeout(() => {
      this.legalEntities = [
        {
          OU_CODE: '001',
          COMPANY_CODE: '2700',
          SHORT_NAME: '-',
          COMPANY_TNAME: '-',
          COMPANY_ENAME: '-',
          ADDR_T1: '-',
          TEL: '8888888',
          TAX_ID: '1111111111111',
          CAL_WHT: 'N'
        },
        {
          OU_CODE: '001',
          COMPANY_CODE: 'UL',
          SHORT_NAME: 'UPCONTRY',
          COMPANY_TNAME: 'บริษัท อัพคันทรี่ แลนด์ จํากัด',
          COMPANY_ENAME: 'UPCOUNTRY LAND CO., LTD.',
          ADDR_T1: '1010 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900',
          ADDR_E1: '1010 Vibhavadi Rangsit Rd., Chatuchak, Bangkok 10900',
          TEL: '0222222222',
          TAX_ID: '12345678900983',
          CAL_WHT: 'Y'
        }
      ];
      this.isLoadingLegal = false;
    }, 300);

    /* Real API:
    this.http.post('/API_URL/GetLegalEntities', {}).subscribe({
      next: (response: any) => {
        this.legalEntities = response.data;
        this.isLoadingLegal = false;
      },
      error: () => {
        this.showError('Failed to load legal entities');
        this.isLoadingLegal = false;
      }
    });
    */
  }

  loadBranches() {
    this.isLoadingBranches = true;

    // Mock data
    setTimeout(() => {
      this.branches = [
        {
          OU_CODE: '001',
          STORE_SEQ: 5,
          STORE_CODE: '701',
          SHORT_NAME: '2701',
          STORE_NAME_T: '-',
          STORE_NAME_E: '-',
          ADDRESS_T1: '-',
          ADDRESS_E1: '1988 Bangkapi Huai-Khwang Bangkok 10310',
          STORE_ID: '701',
          TAX_ID: '1111111111111',
          MANAGER: '001 Sinde Manage',
          COMPANY_CODE: '2700',
          PLAZA_MANAGER: '0001',
          FILE_PASSWORD: '12345',
          USE_PRICE_LIST: 'Y'
        },
        {
          OU_CODE: '001',
          STORE_SEQ: 20,
          STORE_CODE: 'BP2',
          SHORT_NAME: 'WBP2',
          STORE_NAME_T: 'Warehouse Bangphee 2',
          STORE_NAME_E: 'Warehouse Bangphee 2',
          ADDRESS_T1: '1 หมู 2 บางพลี',
          STORE_ID: 'BP2',
          TAX_ID: '12345678900983',
          COMPANY_CODE: 'SCAS',
          FILE_PASSWORD: 'ๅ/-ภถ',
          USE_PRICE_LIST: 'N'
        }
      ];
      this.isLoadingBranches = false;
    }, 300);

    /* Real API:
    this.http.post('/API_URL/GetBranches', {}).subscribe({
      next: (response: any) => {
        this.branches = response.data;
        this.isLoadingBranches = false;
      },
      error: () => {
        this.showError('Failed to load branches');
        this.isLoadingBranches = false;
      }
    });
    */
  }

  // ==================== CATEGORY SELECTION ====================

  selectCategory(category: DataCategory) {
    this.selectedCategory = category;
    this.searchQuery = '';
  }

  // ==================== FILTERED DATA ====================

  get filteredCompanies(): Company[] {
    if (!this.searchQuery) return this.companies;
    const query = this.searchQuery.toLowerCase();
    return this.companies.filter(c =>
      c.OU_CODE.toLowerCase().includes(query) ||
      c.COMP_CODE.toLowerCase().includes(query) ||
      c.OU_NAME.toLowerCase().includes(query)
    );
  }

  get filteredLegalEntities(): LegalEntity[] {
    if (!this.searchQuery) return this.legalEntities;
    const query = this.searchQuery.toLowerCase();
    return this.legalEntities.filter(l =>
      l.COMPANY_CODE.toLowerCase().includes(query) ||
      l.SHORT_NAME.toLowerCase().includes(query) ||
      l.COMPANY_TNAME.toLowerCase().includes(query) ||
      (l.COMPANY_ENAME && l.COMPANY_ENAME.toLowerCase().includes(query))
    );
  }

  get filteredBranches(): Branch[] {
    if (!this.searchQuery) return this.branches;
    const query = this.searchQuery.toLowerCase();
    return this.branches.filter(b =>
      b.STORE_CODE.toLowerCase().includes(query) ||
      b.SHORT_NAME.toLowerCase().includes(query) ||
      b.STORE_NAME_T.toLowerCase().includes(query) ||
      (b.STORE_NAME_E && b.STORE_NAME_E.toLowerCase().includes(query))
    );
  }

  // ==================== COMPANY OPERATIONS ====================

  openAddCompanyModal() {
    this.isEditMode = false;
    this.companyForm = this.getEmptyCompany();
    this.companyErrors = {};
    this.showCompanyModal = true;
  }

  openEditCompanyModal(company: Company) {
    this.isEditMode = true;
    this.companyForm = { ...company };
    this.companyErrors = {};
    this.showCompanyModal = true;
  }

  saveCompanyModal() {
    if (!this.validateCompanyForm()) return;

    this.isSaving = true;

    setTimeout(() => {
      if (this.isEditMode) {
        const index = this.companies.findIndex(c => c.OU_CODE === this.companyForm.OU_CODE);
        if (index !== -1) {
          this.companies[index] = { ...this.companyForm };
        }
        this.showSuccess('Company updated successfully');
      } else {
        this.companies.push({ ...this.companyForm });
        this.showSuccess('Company created successfully');
      }

      this.closeCompanyModal();
      this.isSaving = false;
    }, 500);

    /* Real API:
    const url = this.isEditMode ? '/API_URL/UpdateCompany' : '/API_URL/CreateCompany';
    this.http.post(url, this.companyForm).subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'Updated' : 'Created');
        this.closeCompanyModal();
        this.loadCompanies();
        this.isSaving = false;
      },
      error: () => {
        this.showError('Save failed');
        this.isSaving = false;
      }
    });
    */
  }

  deleteCompany(company: Company) {
    this.confirmationService.confirm({
      message: `Delete company "${company.OU_NAME}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.companies = this.companies.filter(c => c.OU_CODE !== company.OU_CODE);
        this.showSuccess('Company deleted successfully');
      }
    });
  }

  closeCompanyModal() {
    this.showCompanyModal = false;
    this.companyForm = this.getEmptyCompany();
    this.companyErrors = {};
  }

  validateCompanyForm(): boolean {
    this.companyErrors = {};
    let isValid = true;

    if (!this.companyForm.OU_CODE || this.companyForm.OU_CODE.trim() === '') {
      this.companyErrors['OU_CODE'] = 'Organization code is required';
      isValid = false;
    }

    if (!this.companyForm.COMP_CODE || this.companyForm.COMP_CODE.trim() === '') {
      this.companyErrors['COMP_CODE'] = 'Company code is required';
      isValid = false;
    }

    if (!this.companyForm.OU_NAME || this.companyForm.OU_NAME.trim() === '') {
      this.companyErrors['OU_NAME'] = 'Company name is required';
      isValid = false;
    }

    if (!isValid) {
      this.showError('Please fill in all required fields');
    }

    return isValid;
  }

  // ==================== LEGAL ENTITY OPERATIONS ====================

  openAddLegalModal() {
    this.isEditMode = false;
    this.legalForm = this.getEmptyLegal();
    this.legalErrors = {};
    this.showLegalModal = true;
  }

  openEditLegalModal(legal: LegalEntity) {
    this.isEditMode = true;
    this.legalForm = { ...legal };
    this.legalErrors = {};
    this.showLegalModal = true;
  }

  saveLegalModal() {
    if (!this.validateLegalForm()) return;

    this.isSaving = true;

    setTimeout(() => {
      if (this.isEditMode) {
        const index = this.legalEntities.findIndex(l => l.COMPANY_CODE === this.legalForm.COMPANY_CODE);
        if (index !== -1) {
          this.legalEntities[index] = { ...this.legalForm };
        }
        this.showSuccess('Legal entity updated successfully');
      } else {
        this.legalEntities.push({ ...this.legalForm });
        this.showSuccess('Legal entity created successfully');
      }

      this.closeLegalModal();
      this.isSaving = false;
    }, 500);
  }

  deleteLegal(legal: LegalEntity) {
    this.confirmationService.confirm({
      message: `Delete legal entity "${legal.COMPANY_TNAME}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.legalEntities = this.legalEntities.filter(l => l.COMPANY_CODE !== legal.COMPANY_CODE);
        this.showSuccess('Legal entity deleted successfully');
      }
    });
  }

  closeLegalModal() {
    this.showLegalModal = false;
    this.legalForm = this.getEmptyLegal();
    this.legalErrors = {};
  }

  validateLegalForm(): boolean {
    this.legalErrors = {};
    let isValid = true;

    if (!this.legalForm.COMPANY_CODE || this.legalForm.COMPANY_CODE.trim() === '') {
      this.legalErrors['COMPANY_CODE'] = 'Legal entity code is required';
      isValid = false;
    }

    if (!this.legalForm.SHORT_NAME || this.legalForm.SHORT_NAME.trim() === '') {
      this.legalErrors['SHORT_NAME'] = 'Short name is required';
      isValid = false;
    }

    if (!this.legalForm.COMPANY_TNAME || this.legalForm.COMPANY_TNAME.trim() === '') {
      this.legalErrors['COMPANY_TNAME'] = 'Thai name is required';
      isValid = false;
    }

    if (!this.legalForm.ADDR_T1 || this.legalForm.ADDR_T1.trim() === '') {
      this.legalErrors['ADDR_T1'] = 'Thai address is required';
      isValid = false;
    }

    if (!this.legalForm.TAX_ID || this.legalForm.TAX_ID.trim() === '') {
      this.legalErrors['TAX_ID'] = 'Tax ID is required';
      isValid = false;
    }

    if (!isValid) {
      this.showError('Please fill in all required fields');
    }

    return isValid;
  }

  // ==================== BRANCH OPERATIONS ====================

  openAddBranchModal() {
    this.isEditMode = false;
    this.branchForm = this.getEmptyBranch();
    this.branchErrors = {};
    this.showBranchModal = true;
  }

  openEditBranchModal(branch: Branch) {
    this.isEditMode = true;
    this.branchForm = { ...branch };
    this.branchErrors = {};
    this.showBranchModal = true;
  }

  saveBranchModal() {
    if (!this.validateBranchForm()) return;

    this.isSaving = true;

    setTimeout(() => {
      if (this.isEditMode) {
        const index = this.branches.findIndex(b => b.STORE_CODE === this.branchForm.STORE_CODE);
        if (index !== -1) {
          this.branches[index] = { ...this.branchForm };
        }
        this.showSuccess('Branch updated successfully');
      } else {
        this.branches.push({ ...this.branchForm });
        this.showSuccess('Branch created successfully');
      }

      this.closeBranchModal();
      this.isSaving = false;
    }, 500);
  }

  deleteBranch(branch: Branch) {
    this.confirmationService.confirm({
      message: `Delete branch "${branch.STORE_NAME_T}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.branches = this.branches.filter(b => b.STORE_CODE !== branch.STORE_CODE);
        this.showSuccess('Branch deleted successfully');
      }
    });
  }

  closeBranchModal() {
    this.showBranchModal = false;
    this.branchForm = this.getEmptyBranch();
    this.branchErrors = {};
  }

  validateBranchForm(): boolean {
    this.branchErrors = {};
    let isValid = true;

    if (!this.branchForm.SHORT_NAME || this.branchForm.SHORT_NAME.trim() === '') {
      this.branchErrors['SHORT_NAME'] = 'Short name is required';
      isValid = false;
    }

    if (!this.branchForm.STORE_CODE || this.branchForm.STORE_CODE.trim() === '') {
      this.branchErrors['STORE_CODE'] = 'Store code is required';
      isValid = false;
    }

    if (!this.branchForm.STORE_ID || this.branchForm.STORE_ID.trim() === '') {
      this.branchErrors['STORE_ID'] = 'Store ID is required';
      isValid = false;
    }

    if (!this.branchForm.COMPANY_CODE || this.branchForm.COMPANY_CODE.trim() === '') {
      this.branchErrors['COMPANY_CODE'] = 'Legal entity is required';
      isValid = false;
    }

    if (!this.branchForm.STORE_NAME_T || this.branchForm.STORE_NAME_T.trim() === '') {
      this.branchErrors['STORE_NAME_T'] = 'Thai name is required';
      isValid = false;
    }

    if (!this.branchForm.ADDRESS_T1 || this.branchForm.ADDRESS_T1.trim() === '') {
      this.branchErrors['ADDRESS_T1'] = 'Thai address is required';
      isValid = false;
    }

    if (!this.branchForm.FILE_PASSWORD || this.branchForm.FILE_PASSWORD.trim() === '') {
      this.branchErrors['FILE_PASSWORD'] = 'Password is required';
      isValid = false;
    }

    if (!isValid) {
      this.showError('Please fill in all required fields');
    }

    return isValid;
  }

  // ==================== HELPERS ====================

  get orgCodeOptions() {
    return this.orgCodes.map(org => ({
      label: `${org.OU_CODE} - ${org.OU_NAME}`,
      value: org.OU_CODE
    }));
  }

  get legalEntityOptions() {
    return this.legalEntities.map(legal => ({
      label: `${legal.COMPANY_CODE} - ${legal.COMPANY_TNAME}`,
      value: legal.COMPANY_CODE
    }));
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}
