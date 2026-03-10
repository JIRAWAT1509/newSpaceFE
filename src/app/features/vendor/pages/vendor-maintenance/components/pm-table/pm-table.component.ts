// pm-table.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PMTask, getDaysUntil } from '../../../../../../core/models/vendor-contract.model';

@Component({
  selector: 'app-pm-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pm-table.component.html',
  styleUrl: './pm-table.component.css'
})
export class PmTableComponent {
  pmTasks = input.required<PMTask[]>();

  markDone = output<string>();
  deletePm = output<string>();
  addPm = output<void>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'Overdue': return 'status-overdue';
      case 'Due Soon': return 'status-due-soon';
      case 'Scheduled': return 'status-scheduled';
      case 'Completed': return 'status-completed';
      default: return '';
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getDaysUntilDue(task: PMTask): string {
    const days = getDaysUntil(task.nextDue);
    if (days < 0) return `${-days}d overdue`;
    if (days === 0) return 'Due today';
    return `in ${days}d`;
  }

  onMarkDone(id: string): void {
    this.markDone.emit(id);
  }

  onDelete(id: string): void {
    this.deletePm.emit(id);
  }

  onAddPm(): void {
    this.addPm.emit();
  }
}
