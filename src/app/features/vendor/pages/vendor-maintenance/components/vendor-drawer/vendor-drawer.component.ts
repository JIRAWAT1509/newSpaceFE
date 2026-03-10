// vendor-drawer.component.ts
import { Component, input, output, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorContract, ContractType, ContractStatus } from '../../../../../../core/models/vendor-contract.model';

@Component({
  selector: 'app-vendor-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-drawer.component.html',
  styleUrl: './vendor-drawer.component.css'
})
export class VendorDrawerComponent implements OnInit {
  mode = input.required<'create' | 'edit'>();
  contract = input<VendorContract | null>(null);

  save = output<Partial<VendorContract>>();
  cancel = output<void>();

  // Form fields
  formData = signal<Partial<VendorContract>>({
    name: '',
    type: 'Software',
    building: '',
    detail: '',
    priority: 'Medium',
    category: '',
    owner: '',
    dept: '',
    ownerEmail: '',
    vendor: '',
    vendorContact: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    value: 0,
    recurring: 'Annual',
    payment: 'Net 30',
    autoRenew: 'No',
    penalty: 'None',
    start: '',
    end: '',
    noticePeriod: 30,
    status: 'Active',
    pmFreq: 'N/A',
    technician: ''
  });

  contractTypes: ContractType[] = ['Software', 'Hardware', 'Disposable', 'MA', 'Preventive', 'SLA', 'Consulting'];
  contractStatuses: ContractStatus[] = ['Active', 'Expiring', 'Expired', 'Draft'];
  priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
  recurringOptions = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
  paymentOptions = ['Net 30', 'Net 45', 'Net 60', 'Advance'];
  pmFreqOptions = ['N/A', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];

  buildings = ['Skyline Tower (HQ)', 'Grand Plaza', 'Retail Hub A', 'All Buildings'];

  constructor() {
    effect(() => {
      const c = this.contract();
      if (c) {
        this.formData.set({ ...c });
      } else {
        this.formData.set({
          name: '',
          type: 'Software',
          building: '',
          detail: '',
          priority: 'Medium',
          category: '',
          owner: '',
          dept: '',
          ownerEmail: '',
          vendor: '',
          vendorContact: '',
          vendorPhone: '',
          vendorEmail: '',
          vendorAddress: '',
          value: 0,
          recurring: 'Annual',
          payment: 'Net 30',
          autoRenew: 'No',
          penalty: 'None',
          start: '',
          end: '',
          noticePeriod: 30,
          status: 'Active',
          pmFreq: 'N/A',
          technician: ''
        });
      }
    });
  }

  ngOnInit(): void {}

  updateField(field: keyof VendorContract, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  onSave(): void {
    const data = this.formData();
    if (!data.name || !data.vendor || !data.start || !data.end) {
      alert('Please fill in required fields: Contract Name, Vendor, Start Date, End Date');
      return;
    }
    this.save.emit(data);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
