//finance-state.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Invoice, CreditNote, Receipt, Debt } from '@core/models/finance.model';
import {
  MOCK_INVOICES,
  MOCK_CREDIT_NOTES,
  MOCK_RECEIPTS,
  MOCK_RECEIPTS_WAITING,
  MOCK_DEBTS,
} from '@core/data/finance.mock';

export interface IssuedReceipt extends Receipt {
  refInvoiceNumber?: string;
  refCreditNoteNumber?: string;
}

let _cnCounter = 100;
let _rcCounter = 100;
let _invCounter = 100;

function nextCnNumber(): string {
  return `CN-${new Date().getFullYear()}-${String(++_cnCounter).padStart(3, '0')}`;
}
function nextRcNumber(): string {
  return `RCP-${new Date().getFullYear()}-${String(++_rcCounter).padStart(3, '0')}`;
}
function nextInvNumber(): string {
  return `INV-${new Date().getFullYear()}-${String(++_invCounter).padStart(3, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class FinanceStateService {
  private readonly _readyInvoices = signal<Invoice[]>(
    MOCK_INVOICES.filter((i) => i.status === 'ready'),
  );
  private readonly _issuedInvoices = signal<Invoice[]>(
    MOCK_INVOICES.filter((i) => i.status === 'open'),
  );
  private readonly _creditNotes = signal<CreditNote[]>(MOCK_CREDIT_NOTES);
  private readonly _receipts = signal<IssuedReceipt[]>(MOCK_RECEIPTS);
  private readonly _waitingReceipts = signal<Receipt[]>(MOCK_RECEIPTS_WAITING);
  private readonly _debts = signal<Debt[]>(MOCK_DEBTS);

  readonly readyInvoices = this._readyInvoices.asReadonly();
  readonly issuedInvoices = this._issuedInvoices.asReadonly();
  readonly creditNotes = this._creditNotes.asReadonly();
  readonly receipts = this._receipts.asReadonly();
  readonly waitingReceipts = this._waitingReceipts.asReadonly();
  readonly debts = this._debts.asReadonly();

  readonly totalDebtAmount = computed(() =>
    this._debts().reduce((sum, d) => sum + d.amount, 0),
  );

  issueInvoice(invoiceId: string): Invoice | null {
    const inv = this._readyInvoices().find((i) => i.id === invoiceId);
    if (!inv) return null;

    const issued: Invoice = { ...inv, status: 'open' };
    this._readyInvoices.update((list) =>
      list.filter((i) => i.id !== invoiceId),
    );
    this._issuedInvoices.update((list) => [...list, issued]);

    const waitingReceipt: Receipt = {
      id: `RW-${Date.now()}`,
      contractNumber: nextInvNumber(),
      customerName: inv.customerName,
      collectionItem: inv.collectionItem,
      amount: inv.amount,
      startDate: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    this._waitingReceipts.update((list) => [...list, waitingReceipt]);
    return issued;
  }
  deleteDebt(debtId: string): void {
    this._debts.update((list) => list.filter((d) => d.id !== debtId));
  }
  // FIX: Read signals before mutating — check membership first, then update once
  cancelInvoice(invoiceId: string): Invoice | null {
    const inReady = this._readyInvoices().find((i) => i.id === invoiceId);
    const inIssued = this._issuedInvoices().find((i) => i.id === invoiceId);
    const inv = inReady ?? inIssued;
    if (!inv) return null;

    const cancelled: Invoice = { ...inv, status: 'cancel' };

    if (inReady) {
      this._readyInvoices.update((list) =>
        list.filter((i) => i.id !== invoiceId),
      );
      this._issuedInvoices.update((list) => [...list, cancelled]);
    } else {
      this._issuedInvoices.update((list) =>
        list.map((i) => (i.id === invoiceId ? cancelled : i)),
      );
    }
    return cancelled;
  }

  issueCancelInvoice(invoice: Invoice): Invoice {
    const cancelled: Invoice = { ...invoice, status: 'cancel' };
    this._readyInvoices.update((list) =>
      list.filter((i) => i.id !== invoice.id),
    );
    const inIssued = this._issuedInvoices().find((i) => i.id === invoice.id);
    if (inIssued) {
      this._issuedInvoices.update((list) =>
        list.map((i) => (i.id === invoice.id ? cancelled : i)),
      );
    } else {
      this._issuedInvoices.update((list) => [...list, cancelled]);
    }
    return cancelled;
  }

  issueCreditNote(
    invoice: Invoice,
    amount: number,
    reason: string,
    formData: any,
  ): CreditNote {
    const cn: CreditNote = {
      id: `CN-${Date.now()}`,
      cnNumber: nextCnNumber(),
      refInvoiceNumber: invoice.contractNumber,
      customerName: invoice.customerName,
      amount: Math.abs(amount || invoice.amount),
      date: new Date().toISOString().split('T')[0],
      reason: reason || formData?.cnReasonDescription || 'ออกใบลดหนี้',
      status: 'open',
    };
    this._creditNotes.update((list) => [...list, cn]);
    this._debts.update((list) =>
      list.map((d) =>
        d.customerName === invoice.customerName
          ? { ...d, amount: Math.max(0, d.amount - cn.amount) }
          : d,
      ),
    );
    return cn;
  }

  // FIX: Match waiting receipt by customerName + amount instead of contractNumber,
  // since waiting receipts get a generated INV-XXXX number that won't match the invoice's contractNumber
  issueReceipt(
    source: Receipt | Invoice | CreditNote,
    type: 'invoice' | 'credit_note' | 'cancel',
    formData: any,
  ): IssuedReceipt {
    const receipt: IssuedReceipt = {
      id: `REC-${Date.now()}`,
      contractNumber: nextRcNumber(),
      customerName: source.customerName,
      collectionItem:
        'collectionItem' in source
          ? (source as Receipt | Invoice).collectionItem
          : (source as CreditNote).reason,
      amount: source.amount,
      startDate: formData?.rcCnDate || new Date().toISOString().split('T')[0],
      status: 'open',
      refInvoiceNumber:
        type === 'invoice' ? (source as Invoice).contractNumber : undefined,
      refCreditNoteNumber:
        type === 'credit_note' ? (source as CreditNote).cnNumber : undefined,
    };
    this._receipts.update((list) => [...list, receipt]);

    if (type === 'invoice') {
      this._waitingReceipts.update((list) =>
        list.filter(
          (r) =>
            !(
              r.customerName === source.customerName &&
              r.amount === source.amount
            ),
        ),
      );
    }
    return receipt;
  }

  addReadyInvoice(invoice: Invoice): void {
    this._readyInvoices.update((list) => [...list, invoice]);
  }

  updateInvoice(updated: Invoice): void {
    this._readyInvoices.update((list) =>
      list.map((i) => (i.id === updated.id ? updated : i)),
    );
    this._issuedInvoices.update((list) =>
      list.map((i) => (i.id === updated.id ? updated : i)),
    );
  }

  deleteInvoice(invoiceId: string): void {
    this._readyInvoices.update((list) =>
      list.filter((i) => i.id !== invoiceId),
    );
    this._issuedInvoices.update((list) =>
      list.filter((i) => i.id !== invoiceId),
    );
  }

  updateWaitingReceipt(updated: Receipt): void {
    this._waitingReceipts.update((list) =>
      list.map((r) => (r.id === updated.id ? updated : r)),
    );
  }

  deleteWaitingReceipt(receiptId: string): void {
    this._waitingReceipts.update((list) =>
      list.filter((r) => r.id !== receiptId),
    );
  }

  getNextReceiptNumber(): string {
    return nextRcNumber();
  }

  getNextCreditNoteNumber(): string {
    return nextCnNumber();
  }
}
