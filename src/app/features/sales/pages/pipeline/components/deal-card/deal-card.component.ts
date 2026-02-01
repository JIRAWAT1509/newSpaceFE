// deal-card.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, getDueStatus } from '@core/models/pipeline.model';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deal-card.component.html',
  styleUrl: './deal-card.component.css'
})
export class DealCardComponent {
  // Inputs
  deal = input.required<Deal>();

  // Outputs
  clicked = output<void>();
  menuClicked = output<void>();

  // Handle card click
  onCardClick(): void {
    this.clicked.emit();
  }

  // Handle menu click (prevent card click)
  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClicked.emit();
  }

  // Get customer initials for avatar
  getCustomerInitials(): string {
    const name = this.deal().customerName;
    if (!name) return '?';

    // For Thai names, take first character
    const firstChar = name.charAt(0);
    return firstChar.toUpperCase();
  }

  // Get owner initials for avatar
  getOwnerInitials(): string {
    const name = this.deal().ownerName;
    if (!name) return '?';

    // For English names, take first letter of first and last name
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Get due status
  getDueStatusClass(): 'overdue' | 'warning' | 'ok' {
    return getDueStatus(this.deal().daysUntilDue);
  }

  // Get due status text
  getDueStatusText(): string {
    const days = this.deal().daysUntilDue;
    const status = this.getDueStatusClass();

    if (status === 'overdue') {
      return `Overdue ${Math.abs(days)} days`;
    }
    if (status === 'warning') {
      return `Due in ${days} day${days === 1 ? '' : 's'}`;
    }
    return `${days} days left`;
  }

  // Get due status icon
  getDueStatusIcon(): string {
    const status = this.getDueStatusClass();
    if (status === 'overdue') return '🔴';
    if (status === 'warning') return '⚠️';
    return '✓';
  }

  // Format currency
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `฿${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `฿${(amount / 1000).toFixed(0)}K`;
    }
    return `฿${amount.toLocaleString()}`;
  }

  // Get priority badge class
  getPriorityClass(): string {
    return this.deal().priority;
  }

  // Get priority label
  getPriorityLabel(): string {
    const priority = this.deal().priority;
    const labels: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };
    return labels[priority] || priority;
  }

  // Get priority icon
  getPriorityIcon(): string {
    const priority = this.deal().priority;
    if (priority === 'high') return '🔴';
    if (priority === 'medium') return '🟡';
    return '⚪';
  }

  // Get last activity text
  getLastActivityText(): string {
    const type = this.deal().lastActivityType;
    if (!type) return 'No activity';

    const labels: Record<string, string> = {
      note: '📝 Note',
      email: '✉️ Email',
      call: '📞 Call',
      meeting: '🤝 Meeting'
    };
    return labels[type] || type;
  }

  // Format time ago
  getTimeAgo(): string {
    const lastActivity = new Date(this.deal().lastActivityAt);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastActivity.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
}
