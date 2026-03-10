// expiry-tracker.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VendorContract,
  PMTask,
  getDaysUntil,
  computeStatus
} from '../../../../../../core/models/vendor-contract.model';

@Component({
  selector: 'app-expiry-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiry-tracker.component.html',
  styleUrl: './expiry-tracker.component.css'
})
export class ExpiryTrackerComponent {
  contracts = input.required<VendorContract[]>();
  pmTasks = input.required<PMTask[]>();

  viewContract = output<string>();

  expiringContracts = computed(() => {
    return this.contracts()
      .filter(c => {
        const days = getDaysUntil(c.end);
        return days >= -30 && days <= 120;
      })
      .sort((a, b) => getDaysUntil(a.end) - getDaysUntil(b.end))
      .slice(0, 6);
  });

  upcomingPM = computed(() => {
    return this.pmTasks()
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
      .slice(0, 5);
  });

  getDotClass(contract: VendorContract): string {
    const days = getDaysUntil(contract.end);
    if (days < 0) return 'dot-expired';
    if (days <= 30) return 'dot-critical';
    if (days <= 90) return 'dot-warning';
    return 'dot-ok';
  }

  getDaysLabel(contract: VendorContract): string {
    const days = getDaysUntil(contract.end);
    if (days < 0) return `Expired ${-days}d ago`;
    if (days === 0) return 'Expires today';
    return `${days}d left`;
  }

  getDaysLabelClass(contract: VendorContract): string {
    const days = getDaysUntil(contract.end);
    if (days < 0) return 'label-expired';
    if (days <= 30) return 'label-critical';
    if (days <= 90) return 'label-warning';
    return 'label-ok';
  }

  getPMDotClass(task: PMTask): string {
    switch (task.status) {
      case 'Overdue': return 'dot-expired';
      case 'Due Soon': return 'dot-warning';
      case 'Scheduled': return 'dot-ok';
      default: return 'dot-ok';
    }
  }

  getPMDaysLabel(task: PMTask): string {
    const days = getDaysUntil(task.nextDue);
    if (days < 0) return `${-days}d overdue`;
    if (days === 0) return 'Due today';
    return `Due in ${days}d`;
  }

  getPMStatusClass(status: string): string {
    switch (status) {
      case 'Overdue': return 'label-expired';
      case 'Due Soon': return 'label-warning';
      case 'Scheduled': return 'label-ok';
      default: return 'label-ok';
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  onViewContract(id: string): void {
    this.viewContract.emit(id);
  }
}
