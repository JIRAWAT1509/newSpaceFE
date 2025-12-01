import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';

interface Bank {
  OU_CODE: string;
  BANK_CODE: string;
  BANK_NAME_EN: string;
  BANK_NAME_TH: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  IsSelected?: boolean;
}

interface Branch {
  OU_CODE: string;
  BANK_CODE: string;
  BRANCH_CODE: string;
  BRANCH_NAME_EN: string;
  BRANCH_NAME_TH: string;
  BANK_NAME_TH?: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  IsSelected?: boolean;
}

interface AccountInfo {
  OU_CODE: string;
  PAID_FOR_CODE: string;
  BANK_CODE: string;
  BRANCH_CODE: string;
  ACC_BANK: string;
  ACC_TYPE: string;
  ACC_GL: string;
  BILL_PAYMENT_REF1?: string;  // ✅ ADD: Customer column
  BILL_PAYMENT_REF2?: string;  // ✅ ADD: Invoice column
  BILL_PAYMENT_REF3?: string;  // ✅ ADD: Payment Amount column
  NB_BANK_NAME?: string;
  NB_BRANCH_NAME?: string;
  NB_LONG_TEXT?: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  IsSelected?: boolean;
}

interface GLAccount {
  OU_CODE: string;
  ACC_NO: string;
  LONG_TEXT: string;
  SHORT_TEXT: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  IsSelected?: boolean;
}

@Component({
  selector: 'app-company-bank',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TextareaModule,
    TabsModule,
    SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './company-bank.component.html',
  styleUrl: './company-bank.component.css',
})
export class CompanyBankComponent implements OnInit {
  // Data
  banks: Bank[] = [];
  branches: Branch[] = [];
  accounts: AccountInfo[] = [];  // ✅ Changed from single to array
  selectedBank: Bank | null = null;
  selectedBranch: Branch | null = null;
  selectedAccount: AccountInfo | null = null;  // ✅ Added for account selection

  // Loading states
  isLoadingBanks = false;
  isLoadingBranches = false;
  isLoadingAccounts = false;  // ✅ Added
  isSaving = false;

  // Modals
  showBankModal = false;
  showBranchModal = false;
  showAccountModal = false;  // ✅ Added for account edit
  showDetailsModal = false;
  isEditMode = false;
  isAccountEditMode = false;  // ✅ Added for account edit mode

  // Forms
  bankForm: Bank = this.getEmptyBank();
  branchForm: Branch = this.getEmptyBranch();
  accountForm: AccountInfo = this.getEmptyAccount();

  // Form errors
  bankErrors: { [key: string]: string } = {};
  branchErrors: { [key: string]: string } = {};
  accountErrors: { [key: string]: string } = {};  // ✅ Added

  // Search
  bankSearchQuery = '';
  branchSearchQuery = '';
  accountSearchQuery = '';  // ✅ Added

    glAccounts: GLAccount[] = [];  // ✅ ADD
  isLoadingGLAccounts = false;   // ✅ ADD

  // Account types for dropdown
  accountTypeOptions = [
    { label: 'กระแสรายวัน', value: 'กระแสรายวัน' },
    { label: 'ออมทรัพย์', value: 'ออมทรัพย์' }
  ];

// ✅ UPDATE: Bill payment columns A-Z
billPaymentColumns = Array.from({ length: 26 }, (_, i) => ({
  label: String.fromCharCode(65 + i), // A-Z
  value: String.fromCharCode(65 + i)
}));

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

loadAccountsForBranch(bankCode: string, branchCode: string) {
  console.log('Loading accounts for:', bankCode, branchCode); // ✅ ADD for debugging
  this.isLoadingAccounts = true;

  // Mock data - multiple accounts
  setTimeout(() => {
    this.accounts = [
      {
        OU_CODE: '001',
        PAID_FOR_CODE: '1',
        BANK_CODE: bankCode,
        BRANCH_CODE: branchCode,
        ACC_BANK: '1234567890',
        ACC_TYPE: 'กระแสรายวัน',
        ACC_GL: '11122250',
        NB_BANK_NAME: this.selectedBank?.BANK_NAME_EN || '',
        NB_BRANCH_NAME: this.selectedBranch?.BRANCH_NAME_EN || '',
        NB_LONG_TEXT: '7602-KBANK-CA'
      },
      {
        OU_CODE: '001',
        PAID_FOR_CODE: '2',
        BANK_CODE: bankCode,
        BRANCH_CODE: branchCode,
        ACC_BANK: '9876543210',
        ACC_TYPE: 'ออมทรัพย์',
        ACC_GL: '11122260',
        NB_BANK_NAME: this.selectedBank?.BANK_NAME_EN || '',
        NB_BRANCH_NAME: this.selectedBranch?.BRANCH_NAME_EN || '',
        NB_LONG_TEXT: '7602-KBANK-SA'
      }
    ];
    console.log('Accounts loaded:', this.accounts); // ✅ ADD for debugging
    this.isLoadingAccounts = false;
  }, 300);
}

ngOnInit() {
  this.loadBanks();
  this.loadGLAccounts();  // ✅ ADD
}

  // ==================== DATA LOADING ====================

  loadBanks() {
    this.isLoadingBanks = true;

    // Mock data
    setTimeout(() => {
      this.banks = this.generateMockBanks();
      this.isLoadingBanks = false;
    }, 500);

    /* Real API call:
    this.http.post('/API_URL/GetBanks', {}).subscribe({
      next: (response: any) => {
        this.banks = response.data;
        this.isLoadingBanks = false;
      },
      error: (error) => {
        this.showError('Failed to load banks');
        this.isLoadingBanks = false;
      }
    });
    */
  }

  loadBranches(bankCode: string) {
    this.isLoadingBranches = true;

    // Mock data
    setTimeout(() => {
      this.branches = this.generateMockBranches(bankCode);
      this.isLoadingBranches = false;
    }, 300);

    /* Real API call:
    this.http.post('/API_URL/GetBranches', { bankCode }).subscribe({
      next: (response: any) => {
        this.branches = response.data;
        this.isLoadingBranches = false;
      },
      error: (error) => {
        this.showError('Failed to load branches');
        this.isLoadingBranches = false;
      }
    });
    */
  }

loadAccountInfo(bankCode: string, branchCode: string) {
  this.isLoadingAccounts = true;

  // Mock data - multiple accounts
  setTimeout(() => {
    this.accounts = this.generateMockAccounts(bankCode, branchCode);
    this.isLoadingAccounts = false;
  }, 300);

  /* Real API call:
  this.http.post('/API_URL/GetAccounts', { bankCode, branchCode }).subscribe({
    next: (response: any) => {
      this.accounts = response.data;
      this.isLoadingAccounts = false;
    },
    error: (error) => {
      this.showError('Failed to load accounts');
      this.isLoadingAccounts = false;
    }
  });
  */
}

  // ==================== BANK OPERATIONS ====================

  selectBank(bank: Bank) {
    this.selectedBank = bank;
    this.selectedBranch = null;
    this.loadBranches(bank.BANK_CODE);
  }

  openAddBankModal() {
    this.isEditMode = false;
    this.bankForm = this.getEmptyBank();
    this.bankErrors = {};
    this.showBankModal = true;
  }

  openEditBankModal(bank: Bank) {
    this.isEditMode = true;
    this.bankForm = { ...bank };
    this.bankErrors = {};
    this.showBankModal = true;
  }

  saveBankModal() {
    if (!this.validateBankForm()) {
      return;
    }

    this.isSaving = true;

    // Mock save
    setTimeout(() => {
      if (this.isEditMode) {
        const index = this.banks.findIndex(b => b.BANK_CODE === this.bankForm.BANK_CODE);
        if (index !== -1) {
          this.banks[index] = { ...this.bankForm };
        }
        this.showSuccess('Bank updated successfully');
      } else {
        this.banks.push({ ...this.bankForm });
        this.showSuccess('Bank created successfully');
      }

      this.closeBankModal();
      this.isSaving = false;
    }, 500);

    /* Real API call:
    const endpoint = this.isEditMode ? '/API_URL/UpdateBank' : '/API_URL/CreateBank';
    this.http.post(endpoint, this.bankForm).subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'Bank updated' : 'Bank created');
        this.closeBankModal();
        this.loadBanks();
        this.isSaving = false;
      },
      error: () => {
        this.showError('Failed to save bank');
        this.isSaving = false;
      }
    });
    */
  }

  deleteBank(bank: Bank) {
    this.confirmationService.confirm({
      message: `Delete bank "${bank.BANK_NAME_EN}" and all its branches?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDeleteBank(bank);
      }
    });
  }

  performDeleteBank(bank: Bank) {
    /* Real API call:
    this.http.post('/API_URL/DeleteBank', { code: bank.BANK_CODE }).subscribe({
      next: () => {
        this.showSuccess('Bank deleted successfully');
        this.loadBanks();
        if (this.selectedBank?.BANK_CODE === bank.BANK_CODE) {
          this.selectedBank = null;
          this.branches = [];
        }
      },
      error: () => this.showError('Failed to delete bank')
    });
    */

    // Mock
    this.banks = this.banks.filter(b => b.BANK_CODE !== bank.BANK_CODE);
    if (this.selectedBank?.BANK_CODE === bank.BANK_CODE) {
      this.selectedBank = null;
      this.branches = [];
    }
    this.showSuccess('Bank deleted successfully');
  }

  closeBankModal() {
    this.showBankModal = false;
    this.bankForm = this.getEmptyBank();
    this.bankErrors = {};
  }

  validateBankForm(): boolean {
    this.bankErrors = {};
    let isValid = true;

    if (!this.bankForm.BANK_CODE || this.bankForm.BANK_CODE.trim() === '') {
      this.bankErrors['BANK_CODE'] = 'Bank code is required';
      isValid = false;
    }

    if (!this.bankForm.BANK_NAME_EN || this.bankForm.BANK_NAME_EN.trim() === '') {
      this.bankErrors['BANK_NAME_EN'] = 'Bank name (English) is required';
      isValid = false;
    }

    if (!this.bankForm.BANK_NAME_TH || this.bankForm.BANK_NAME_TH.trim() === '') {
      this.bankErrors['BANK_NAME_TH'] = 'Bank name (Thai) is required';
      isValid = false;
    }

    if (!isValid) {
      this.showError('Please fill in all required fields');
    }

    return isValid;
  }

  // ==================== BRANCH OPERATIONS ====================

openAddBranchModal() {
  if (!this.selectedBank) {
    this.showError('Please select a bank first');
    return;
  }

  this.isEditMode = false;
  this.branchForm = this.getEmptyBranch();
  this.branchForm.BANK_CODE = this.selectedBank.BANK_CODE;
  this.branchErrors = {};
  this.showBranchModal = true;
}

openEditBranchModal(branch: Branch) {
  this.isEditMode = true;
  this.branchForm = { ...branch };
  this.branchErrors = {};
  this.showBranchModal = true;  // ✅ Only open branch modal, not account
}
saveBranchModal() {
  if (!this.validateBranchForm()) {
    return;
  }

  this.isSaving = true;

  // Mock save
  setTimeout(() => {
    if (this.isEditMode) {
      const index = this.branches.findIndex(b => b.BRANCH_CODE === this.branchForm.BRANCH_CODE);
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
      message: `Delete branch "${branch.BRANCH_NAME_EN}" and its account info?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDeleteBranch(branch);
      }
    });
  }

  performDeleteBranch(branch: Branch) {
    /* Real API call:
    this.http.post('/API_URL/DeleteBranch', {
      bankCode: branch.BANK_CODE,
      branchCode: branch.BRANCH_CODE
    }).subscribe({
      next: () => {
        this.showSuccess('Branch deleted successfully');
        if (this.selectedBank) {
          this.loadBranches(this.selectedBank.BANK_CODE);
        }
      },
      error: () => this.showError('Failed to delete branch')
    });
    */

    // Mock
    this.branches = this.branches.filter(b => b.BRANCH_CODE !== branch.BRANCH_CODE);
    this.showSuccess('Branch deleted successfully');
  }

  closeBranchModal() {
    this.showBranchModal = false;
    this.branchForm = this.getEmptyBranch();
    this.accountForm = this.getEmptyAccount();
    this.branchErrors = {};
  }

  validateBranchForm(): boolean {
    this.branchErrors = {};
    let isValid = true;

    if (!this.branchForm.BRANCH_CODE || this.branchForm.BRANCH_CODE.trim() === '') {
      this.branchErrors['BRANCH_CODE'] = 'Branch code is required';
      isValid = false;
    }

    if (!this.branchForm.BRANCH_NAME_EN || this.branchForm.BRANCH_NAME_EN.trim() === '') {
      this.branchErrors['BRANCH_NAME_EN'] = 'Branch name (English) is required';
      isValid = false;
    }

    if (!this.branchForm.BRANCH_NAME_TH || this.branchForm.BRANCH_NAME_TH.trim() === '') {
      this.branchErrors['BRANCH_NAME_TH'] = 'Branch name (Thai) is required';
      isValid = false;
    }

    if (!isValid) {
      this.showError('Please fill in all required fields');
    }

    return isValid;
  }

  // ==================== DETAILS MODAL ====================

viewBranchDetails(branch: Branch) {
  console.log('=== VIEW BRANCH DETAILS DEBUG ===');
  console.log('Branch object:', branch);
  console.log('showDetailsModal BEFORE:', this.showDetailsModal);

  this.selectedBranch = branch;
  console.log('selectedBranch set to:', this.selectedBranch);

  this.loadAccountsForBranch(branch.BANK_CODE, branch.BRANCH_CODE);

  this.showDetailsModal = true;
  console.log('showDetailsModal AFTER:', this.showDetailsModal);
  console.log('=== END DEBUG ===');
}

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBranch = null;
    this.selectedAccount = null;
  }

editBranchFromDetails() {
  if (this.selectedBranch) {
    this.closeDetailsModal();
    setTimeout(() => {  // ✅ Add delay to ensure modal closes first
      this.openEditBranchModal(this.selectedBranch!);
    }, 100);
  }
}

  deleteBranchFromDetails() {
    if (this.selectedBranch) {
      const branch = this.selectedBranch;
      this.closeDetailsModal();
      this.deleteBranch(branch);
    }
  }

// ==================== ACCOUNT OPERATIONS ====================

openAddAccountModal() {
  if (!this.selectedBranch) {
    this.showError('Please select a branch first');
    return;
  }

  this.isAccountEditMode = false;
  this.accountForm = this.getEmptyAccount();
  this.accountForm.BANK_CODE = this.selectedBranch.BANK_CODE;
  this.accountForm.BRANCH_CODE = this.selectedBranch.BRANCH_CODE;
  this.accountErrors = {};
  this.showAccountModal = true;
}

// This method is already there, just make sure it exists
openEditAccountModal(account: AccountInfo) {
  this.isAccountEditMode = true;
  this.accountForm = { ...account };
  this.selectedAccount = account;
  this.accountErrors = {};
  this.showAccountModal = true;
}

saveAccountModal() {
  if (!this.validateAccountForm()) {
    return;
  }

  this.isSaving = true;

  // Mock save
  setTimeout(() => {
    if (this.isAccountEditMode) {
      const index = this.accounts.findIndex(a => a.PAID_FOR_CODE === this.accountForm.PAID_FOR_CODE);
      if (index !== -1) {
        this.accounts[index] = { ...this.accountForm };
      }
      this.showSuccess('Account updated successfully');
    } else {
      this.accounts.push({ ...this.accountForm });
      this.showSuccess('Account created successfully');
    }

    this.closeAccountModal();
    this.isSaving = false;
  }, 500);

  /* Real API call:
  const endpoint = this.isAccountEditMode ? '/API_URL/UpdateAccount' : '/API_URL/CreateAccount';
  this.http.post(endpoint, this.accountForm).subscribe({
    next: () => {
      this.showSuccess(this.isAccountEditMode ? 'Account updated' : 'Account created');
      this.closeAccountModal();
      if (this.selectedBranch) {
        this.loadAccountInfo(this.selectedBranch.BANK_CODE, this.selectedBranch.BRANCH_CODE);
      }
      this.isSaving = false;
    },
    error: () => {
      this.showError('Failed to save account');
      this.isSaving = false;
    }
  });
  */
}

deleteAccount(account: AccountInfo) {
  this.confirmationService.confirm({
    message: `Delete account "${account.ACC_BANK}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.performDeleteAccount(account);
    }
  });
}

deleteAccountFromModal() {
  if (this.selectedAccount) {
    this.confirmationService.confirm({
      message: `Delete account "${this.selectedAccount.ACC_BANK}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDeleteAccount(this.selectedAccount!);
        this.closeAccountModal();
      }
    });
  }
}

performDeleteAccount(account: AccountInfo) {
  /* Real API call:
  this.http.post('/API_URL/DeleteAccount', {
    paidForCode: account.PAID_FOR_CODE
  }).subscribe({
    next: () => {
      this.showSuccess('Account deleted successfully');
      if (this.selectedBranch) {
        this.loadAccountInfo(this.selectedBranch.BANK_CODE, this.selectedBranch.BRANCH_CODE);
      }
    },
    error: () => this.showError('Failed to delete account')
  });
  */

  // Mock
  this.accounts = this.accounts.filter(a => a.PAID_FOR_CODE !== account.PAID_FOR_CODE);
  this.showSuccess('Account deleted successfully');
}

closeAccountModal() {
  this.showAccountModal = false;
  this.accountForm = this.getEmptyAccount();
  this.accountErrors = {};
}

validateAccountForm(): boolean {
  this.accountErrors = {};
  let isValid = true;

  if (!this.accountForm.PAID_FOR_CODE || this.accountForm.PAID_FOR_CODE.trim() === '') {
    this.accountErrors['PAID_FOR_CODE'] = 'Payment code is required';
    isValid = false;
  }

  if (!this.accountForm.ACC_BANK || this.accountForm.ACC_BANK.trim() === '') {
    this.accountErrors['ACC_BANK'] = 'Account number is required';
    isValid = false;
  }

  if (!this.accountForm.ACC_GL || this.accountForm.ACC_GL.trim() === '') {
    this.accountErrors['ACC_GL'] = 'GL account is required';
    isValid = false;
  }

  if (!isValid) {
    this.showError('Please fill in all required fields');
  }

  return isValid;
}

  // ==================== HELPERS ====================

  getEmptyBank(): Bank {
    return {
      OU_CODE: '001',
      BANK_CODE: '',
      BANK_NAME_EN: '',
      BANK_NAME_TH: ''
    };
  }

  getEmptyBranch(): Branch {
    return {
      OU_CODE: '001',
      BANK_CODE: '',
      BRANCH_CODE: '',
      BRANCH_NAME_EN: '',
      BRANCH_NAME_TH: ''
    };
  }

getEmptyAccount(): AccountInfo {
  return {
    OU_CODE: '001',
    PAID_FOR_CODE: '',
    BANK_CODE: '',
    BRANCH_CODE: '',
    ACC_BANK: '',
    ACC_TYPE: 'กระแสรายวัน',
    ACC_GL: '',
    BILL_PAYMENT_REF1: '',  // ✅ ADD
    BILL_PAYMENT_REF2: '',  // ✅ ADD
    BILL_PAYMENT_REF3: ''   // ✅ ADD
  };
}

  get filteredAccounts(): AccountInfo[] {
  if (!this.accountSearchQuery) return this.accounts;

  const query = this.accountSearchQuery.toLowerCase();
  return this.accounts.filter(a =>
    a.PAID_FOR_CODE.toLowerCase().includes(query) ||
    a.ACC_BANK.toLowerCase().includes(query) ||
    (a.ACC_GL && a.ACC_GL.toLowerCase().includes(query))
  );
}

  get filteredBanks(): Bank[] {
    if (!this.bankSearchQuery) return this.banks;

    const query = this.bankSearchQuery.toLowerCase();
    return this.banks.filter(b =>
      b.BANK_CODE.toLowerCase().includes(query) ||
      b.BANK_NAME_EN.toLowerCase().includes(query) ||
      b.BANK_NAME_TH.toLowerCase().includes(query)
    );
  }

  get filteredBranches(): Branch[] {
    if (!this.branchSearchQuery) return this.branches;

    const query = this.branchSearchQuery.toLowerCase();
    return this.branches.filter(b =>
      b.BRANCH_CODE.toLowerCase().includes(query) ||
      b.BRANCH_NAME_EN.toLowerCase().includes(query) ||
      b.BRANCH_NAME_TH.toLowerCase().includes(query)
    );
  }

  // ✅ ADD: Load GL Accounts
loadGLAccounts() {
  this.isLoadingGLAccounts = true;

  // Mock data
  setTimeout(() => {
    this.glAccounts = [
      { OU_CODE: '001', ACC_NO: '0000000000', LONG_TEXT: '-', SHORT_TEXT: '-' },
      { OU_CODE: '001', ACC_NO: '11121630', LONG_TEXT: '6600-SCB-CA', SHORT_TEXT: '6600-SCB-CA' },
      { OU_CODE: '001', ACC_NO: '11122250', LONG_TEXT: '7602-KBANK-CA', SHORT_TEXT: '7602-KBANK-CA' },
      { OU_CODE: '001', ACC_NO: '11125060', LONG_TEXT: '6600-KTB-CA', SHORT_TEXT: '6600-KTB-CA' },
      { OU_CODE: '001', ACC_NO: '11125250', LONG_TEXT: '6600-KTB-SA', SHORT_TEXT: '6600-KTB-SA' },
      { OU_CODE: '001', ACC_NO: '11135070', LONG_TEXT: '6600-KTB-SA', SHORT_TEXT: '6600-KTB-SA' }
    ];
    this.isLoadingGLAccounts = false;
  }, 300);

  /* Real API call:
  this.http.post('/API_URL/GetGLAccounts', {}).subscribe({
    next: (response: any) => {
      this.glAccounts = response.data;
      this.isLoadingGLAccounts = false;
    },
    error: (error) => {
      this.showError('Failed to load GL accounts');
      this.isLoadingGLAccounts = false;
    }
  });
  */
}

get glAccountOptions() {
  return this.glAccounts.map(gl => ({
    label: `${gl.ACC_NO} - ${gl.LONG_TEXT}`,
    value: gl.ACC_NO
  }));
}

  // ==================== MOCK DATA ====================

  generateMockBanks(): Bank[] {
    return [
      { OU_CODE: '001', BANK_CODE: '001', BANK_NAME_EN: 'Siam Commercial Bank', BANK_NAME_TH: 'ธนาคารไทยพาณิชย์' },
      { OU_CODE: '001', BANK_CODE: '002', BANK_NAME_EN: 'Bangkok Bank', BANK_NAME_TH: 'ธนาคารกรุงเทพฯ' },
      { OU_CODE: '001', BANK_CODE: '003', BANK_NAME_EN: 'Krungthai Bank', BANK_NAME_TH: 'ธนาคารกรุงไทย' },
      { OU_CODE: '001', BANK_CODE: '004', BANK_NAME_EN: 'Kasikorn Thai', BANK_NAME_TH: 'ธนาคารกสิกรไทย' },
      { OU_CODE: '001', BANK_CODE: '005', BANK_NAME_EN: 'Krungsri Ayudhaya Bank', BANK_NAME_TH: 'ธนาคารกรุงศรีอยุธยา' },
      { OU_CODE: '001', BANK_CODE: '006', BANK_NAME_EN: 'TMB Bank', BANK_NAME_TH: 'ธนาคารทหารไทยธนชาต' }
    ];
  }

  generateMockBranches(bankCode: string): Branch[] {
    return [
      { OU_CODE: '001', BANK_CODE: bankCode, BRANCH_CODE: `${bankCode}01`, BRANCH_NAME_EN: `${bankCode}01`, BRANCH_NAME_TH: `${bankCode}01` },
      { OU_CODE: '001', BANK_CODE: bankCode, BRANCH_CODE: `${bankCode}02`, BRANCH_NAME_EN: `${bankCode}02`, BRANCH_NAME_TH: `${bankCode}02` },
      { OU_CODE: '001', BANK_CODE: bankCode, BRANCH_CODE: `${bankCode}03`, BRANCH_NAME_EN: `${bankCode}03`, BRANCH_NAME_TH: `${bankCode}03` },
      { OU_CODE: '001', BANK_CODE: bankCode, BRANCH_CODE: `${bankCode}04`, BRANCH_NAME_EN: `${bankCode}04`, BRANCH_NAME_TH: `${bankCode}04` }
    ];
  }

  generateMockAccounts(bankCode: string, branchCode: string): AccountInfo[] {
  return [
    {
      OU_CODE: '001',
      PAID_FOR_CODE: `${branchCode}`,
      BANK_CODE: bankCode,
      BRANCH_CODE: branchCode,
      ACC_BANK: '1234567890',
      ACC_TYPE: 'กระแสรายวัน',
      ACC_GL: '11122250',
      NB_LONG_TEXT: '7602-KBANK-CA'
    },
    {
      OU_CODE: '001',
      PAID_FOR_CODE: `${branchCode}-2`,
      BANK_CODE: bankCode,
      BRANCH_CODE: branchCode,
      ACC_BANK: '0987654321',
      ACC_TYPE: 'ออมทรัพย์',
      ACC_GL: '11125060',
      NB_LONG_TEXT: '6600-KTB-SA'
    }
  ];
}

  // ==================== MESSAGES ====================

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }
}
