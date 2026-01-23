// finance-dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStats, Debt, DEBT_STATUS_CONFIG } from '@core/models/finance.model';
import { MOCK_FINANCE_STATS, MOCK_DEBTS } from '@core/data/finance.mock';

interface StatCard {
  label: string;
  value: number;
  color: string;
  icon: string;
  bgGradient: string;
}

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.css'
})
export class FinanceDashboardComponent implements OnInit {
  stats = signal<FinanceStats>(MOCK_FINANCE_STATS);
  debts = signal<Debt[]>([]);
  statCards = signal<StatCard[]>([]);

  ngOnInit(): void {
    this.loadStats();
    this.loadDebts();
  }

  loadStats(): void {
    const statsData = this.stats();

    const cards: StatCard[] = [
      {
        label: 'จำนวนรายการทั้งหมด',
        value: statsData.totalItems,
        color: '#667eea',
        icon: 'pi-list',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        label: 'ออกใบแจ้งหนี้แล้ว',
        value: statsData.invoicesIssued,
        color: '#43e97b',
        icon: 'pi-check-circle',
        bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      },
      {
        label: 'ออกใบกำกับภาษีแล้ว',
        value: statsData.taxInvoicesIssued,
        color: '#4facfe',
        icon: 'pi-file-check',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        label: 'รายการหนี้คงค้างทั้งหมด',
        value: statsData.totalOutstanding,
        color: '#fa709a',
        icon: 'pi-exclamation-triangle',
        bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];

    this.statCards.set(cards);
  }

  loadDebts(): void {
    // Sort by overdue days (longest first)
    const sorted = [...MOCK_DEBTS].sort((a, b) => b.overdueDays - a.overdueDays);
    this.debts.set(sorted);
  }

  getStatusConfig(status: string) {
    return DEBT_STATUS_CONFIG[status as keyof typeof DEBT_STATUS_CONFIG];
  }

  getStatusClass(status: string): string {
    const config = this.getStatusConfig(status);
    return `status-${status}`;
  }

  onViewContract(debt: Debt): void {
    console.log('View contract:', debt);
    alert(`Mock: View ${debt.contractFile}`);
  }

  onSendReminder(debt: Debt): void {
    console.log('Send reminder:', debt);
    alert(`Mock: Send reminder to ${debt.customerName}`);
  }
}
