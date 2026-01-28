// payment-method.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker, InputText],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  title = input.required<string>();
  transfers = input<any[]>([]);
  checks = input<any[]>([]);

  addTransfer = output<void>();
  removeTransfer = output<number>();
  addCheck = output<void>();
  removeCheck = output<number>();
}
