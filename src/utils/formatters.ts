import { Timestamp } from 'firebase/firestore';
import { FinancialMetrics, JobRecord, LedgerEntry, WithdrawalRequest } from '../types/finance';

export function formatBdt(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `৳${rounded.toLocaleString('en-IN')}`;
}

export function formatTimestamp(ts: Timestamp | { seconds?: number; toDate?: () => Date } | undefined | null): string {
  if (!ts) {
    return 'Just now';
  }
  let d: Date;
  if (typeof ts.toDate === 'function') {
    d = ts.toDate();
  } else if (typeof ts.seconds === 'number') {
    d = new Date(ts.seconds * 1000);
  } else {
    return 'Just now';
  }
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(ts: Timestamp | { seconds?: number; toDate?: () => Date } | undefined | null): string {
  if (!ts) {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  let d: Date;
  if (typeof ts.toDate === 'function') {
    d = ts.toDate();
  } else if (typeof ts.seconds === 'number') {
    d = new Date(ts.seconds * 1000);
  } else {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

export function downloadCsvReport(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonAuditPackage(
  metrics: FinancialMetrics,
  jobs: JobRecord[],
  ledger: LedgerEntry[],
  withdrawals: WithdrawalRequest[]
): void {
  const payload = {
    generatedAt: new Date().toISOString(),
    system: 'LIFEGRAPH FinOps & Bangladesh Payout Admin',
    metricsSummaryBdt: metrics,
    immutableLedgerCount: ledger.length,
    jobsCount: jobs.length,
    withdrawalsCount: withdrawals.length,
    ledgerEntries: ledger.map((e) => ({
      id: e.id,
      txnReference: e.txnReference,
      entryType: e.entryType,
      source: e.source,
      description: e.description,
      currency: e.currency,
      grossAmountBdt: e.grossAmountBdt,
      feeAmountBdt: e.feeAmountBdt,
      netAmountBdt: e.netAmountBdt,
      reconciliationStatus: e.reconciliationStatus,
      proofReference: e.proofReference,
      createdAt: formatTimestamp(e.createdAt),
    })),
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      providerSummary: w.providerSummary,
      executionMode: w.executionMode,
      requestedAmountBdt: w.requestedAmountBdt,
      feeAmountBdt: w.feeAmountBdt,
      netPayoutBdt: w.netPayoutBdt,
      status: w.status,
      idempotencyKey: w.idempotencyKey,
      transferReference: w.transferReference,
      failureReason: w.failureReason,
      retryCount: w.retryCount,
      createdAt: formatTimestamp(w.createdAt),
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lifegraph_financial_audit_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
