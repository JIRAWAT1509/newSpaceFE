import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

// Models
interface VATTax {
  id?: number;
  code: string;
  name: string;
  rate: number;
  sapAccountCode: string;
  accountNumber: string;
  relatedAccountNumber: string;
  isActive: boolean;
}

interface WithholdingTax {
  id?: number;
  code: string;
  name: string;
  rate: number;
  accountNumber: string;
  relatedAccountNumber: string;
  isActive: boolean;
}

type TaxType = 'vat' | 'withholding';

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent implements OnInit {
  // State management with signals
  isLoading = signal<boolean>(false);
  selectedTaxType = signal<TaxType>('vat');
  searchQuery = signal<string>('');

  // VAT Data
  vatTaxes = signal<VATTax[]>([]);

  // Withholding Tax Data
  withholdingTaxes = signal<WithholdingTax[]>([]);

  // Computed counts
  vatCount = computed(() => this.vatTaxes().length);
  withholdingCount = computed(() => this.withholdingTaxes().length);

  // Filtered data based on search
  filteredVATTaxes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.vatTaxes();

    return this.vatTaxes().filter(tax =>
      tax.code.toLowerCase().includes(query) ||
      tax.name.toLowerCase().includes(query) ||
      tax.sapAccountCode.toLowerCase().includes(query)
    );
  });

  filteredWithholdingTaxes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.withholdingTaxes();

    return this.withholdingTaxes().filter(tax =>
      tax.code.toLowerCase().includes(query) ||
      tax.name.toLowerCase().includes(query)
    );
  });

  // Modal states
  showVATModal = signal<boolean>(false);
  showWithholdingModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Form data
  vatForm = signal<VATTax>({
    code: '',
    name: '',
    rate: 0,
    sapAccountCode: '',
    accountNumber: '',
    relatedAccountNumber: '',
    isActive: true
  });

  withholdingForm = signal<WithholdingTax>({
    code: '',
    name: '',
    rate: 0,
    accountNumber: '',
    relatedAccountNumber: '',
    isActive: true
  });

  // Form validation errors
  vatErrors = signal<any>({});
  withholdingErrors = signal<any>({});

  ngOnInit(): void {
    this.loadTaxData();
  }

  // Load data (mock data for now)
  loadTaxData(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      // Mock VAT data
      this.vatTaxes.set([
        {
          id: 1,
          code: 'DS',
          name: 'Deferred Output Tax rate 7%',
          rate: 7.00,
          sapAccountCode: 'DS',
          accountNumber: '21810002',
          relatedAccountNumber: '21810002',
          isActive: true
        },
        {
          id: 2,
          code: 'O7',
          name: 'Output Tax rate 7%',
          rate: 7.00,
          sapAccountCode: 'O7',
          accountNumber: '21810001',
          relatedAccountNumber: '21810001',
          isActive: true
        },
        {
          id: 3,
          code: 'OX',
          name: 'Output Tax rate 0%(Non tax relevent)',
          rate: 0.00,
          sapAccountCode: 'OX',
          accountNumber: '',
          relatedAccountNumber: '',
          isActive: true
        }
      ]);

      // Mock Withholding Tax data
      this.withholdingTaxes.set([
        {
          id: 1,
          code: 'R1',
          name: 'ภาษีหัก ณ ที่จ่าย 1%',
          rate: 1.00,
          accountNumber: '',
          relatedAccountNumber: '',
          isActive: true
        },
        {
          id: 2,
          code: 'R2',
          name: 'ภาษีหัก ณ ที่จ่าย 3%',
          rate: 3.00,
          accountNumber: '',
          relatedAccountNumber: '',
          isActive: true
        },
        {
          id: 3,
          code: 'R3',
          name: 'ภาษีหัก ณ ที่จ่าย 5%',
          rate: 5.00,
          accountNumber: '',
          relatedAccountNumber: '',
          isActive: true
        }
      ]);

      this.isLoading.set(false);
    }, 500);
  }

  // Card selection
  selectTaxType(type: TaxType): void {
    this.selectedTaxType.set(type);
    this.searchQuery.set('');
  }

  // Search handling
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  // VAT Modal Actions
  openVATModal(tax?: VATTax): void {
    if (tax) {
      this.isEditMode.set(true);
      this.vatForm.set({ ...tax });
    } else {
      this.isEditMode.set(false);
      this.vatForm.set({
        code: '',
        name: '',
        rate: 0,
        sapAccountCode: '',
        accountNumber: '',
        relatedAccountNumber: '',
        isActive: true
      });
    }
    this.vatErrors.set({});
    this.showVATModal.set(true);
  }

  closeVATModal(): void {
    this.showVATModal.set(false);
    this.isEditMode.set(false);
    this.vatErrors.set({});
  }

  saveVAT(): void {
    // Validate
    const errors: any = {};
    const form = this.vatForm();

    if (!form.code.trim()) errors.code = 'รหัสภาษีจำเป็นต้องกรอก';
    if (!form.name.trim()) errors.name = 'ชื่อภาษีจำเป็นต้องกรอก';
    if (form.rate === null || form.rate === undefined) errors.rate = 'อัตราภาษีจำเป็นต้องกรอก';

    if (Object.keys(errors).length > 0) {
      this.vatErrors.set(errors);
      return;
    }

    // Save logic
    if (this.isEditMode()) {
      // Update existing
      const taxes = this.vatTaxes();
      const index = taxes.findIndex(t => t.id === form.id);
      if (index !== -1) {
        taxes[index] = { ...form };
        this.vatTaxes.set([...taxes]);
      }
    } else {
      // Add new
      const newTax = { ...form, id: Date.now() };
      this.vatTaxes.set([...this.vatTaxes(), newTax]);
    }

    this.closeVATModal();
  }

  // Withholding Tax Modal Actions
  openWithholdingModal(tax?: WithholdingTax): void {
    if (tax) {
      this.isEditMode.set(true);
      this.withholdingForm.set({ ...tax });
    } else {
      this.isEditMode.set(false);
      this.withholdingForm.set({
        code: '',
        name: '',
        rate: 0,
        accountNumber: '',
        relatedAccountNumber: '',
        isActive: true
      });
    }
    this.withholdingErrors.set({});
    this.showWithholdingModal.set(true);
  }

  closeWithholdingModal(): void {
    this.showWithholdingModal.set(false);
    this.isEditMode.set(false);
    this.withholdingErrors.set({});
  }

  saveWithholding(): void {
    // Validate
    const errors: any = {};
    const form = this.withholdingForm();

    if (!form.code.trim()) errors.code = 'รหัสภาษีจำเป็นต้องกรอก';
    if (!form.name.trim()) errors.name = 'ชื่อภาษีจำเป็นต้องกรอก';
    if (form.rate === null || form.rate === undefined) errors.rate = 'อัตราภาษีจำเป็นต้องกรอก';

    if (Object.keys(errors).length > 0) {
      this.withholdingErrors.set(errors);
      return;
    }

    // Save logic
    if (this.isEditMode()) {
      // Update existing
      const taxes = this.withholdingTaxes();
      const index = taxes.findIndex(t => t.id === form.id);
      if (index !== -1) {
        taxes[index] = { ...form };
        this.withholdingTaxes.set([...taxes]);
      }
    } else {
      // Add new
      const newTax = { ...form, id: Date.now() };
      this.withholdingTaxes.set([...this.withholdingTaxes(), newTax]);
    }

    this.closeWithholdingModal();
  }

  // Row click to edit
  onVATRowClick(tax: VATTax): void {
    this.openVATModal(tax);
  }

  onWithholdingRowClick(tax: WithholdingTax): void {
    this.openWithholdingModal(tax);
  }

  // Delete actions (optional)
  deleteVAT(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      this.vatTaxes.set(this.vatTaxes().filter(t => t.id !== id));
    }
  }

  deleteWithholding(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      this.withholdingTaxes.set(this.withholdingTaxes().filter(t => t.id !== id));
    }
  }

  // Update form fields
  updateVATForm(field: keyof VATTax, value: any): void {
    this.vatForm.update(form => ({ ...form, [field]: value }));
  }

  updateWithholdingForm(field: keyof WithholdingTax, value: any): void {
    this.withholdingForm.update(form => ({ ...form, [field]: value }));
  }
}
