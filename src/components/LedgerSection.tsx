import React, { useMemo, useState } from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { recordOperationalLedgerEntry } from '../services/financeService';
import { LedgerEntry, LedgerEntryType } from '../types/finance';
import { downloadCsvReport, formatBdt, formatTimestamp } from '../utils/formatters';

interface LedgerSectionProps {
  ownerId: string;
  ledgerEntries: LedgerEntry[];
}

export function LedgerSection({ ownerId, ledgerEntries }: LedgerSectionProps) {
  const [filterType, setFilterType] = useState<'ALL' | LedgerEntryType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Entry State
  const [entryType, setEntryType] = useState<
    LedgerEntryType.DEBIT_EXPENSE | LedgerEntryType.DEBIT_REFUND | LedgerEntryType.CREDIT_PAYMENT
  >(LedgerEntryType.DEBIT_EXPENSE);
  const [source, setSource] = useState('Cloud Infrastructure / API Billing');
  const [description, setDescription] = useState('');
  const [grossBdt, setGrossBdt] = useState('2500');
  const [feeBdt, setFeeBdt] = useState('0');
  const [proofRef, setProofRef] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      if (filterType !== 'ALL' && entry.entryType !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.txnReference.toLowerCase().includes(q) ||
          entry.source.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.proofReference.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ledgerEntries, filterType, searchQuery]);

  const handleCreateLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !proofRef.trim()) return;
    setSaving(true);
    try {
      await recordOperationalLedgerEntry({
        ownerId,
        entryType,
        source,
        description,
        grossAmountBdt: Number(grossBdt) || 0,
        feeAmountBdt: Number(feeBdt) || 0,
        proofReference: proofRef,
      });
      setDescription('');
      setProofRef('');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadLedgerCsv = () => {
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Type',
      'Source',
      'Description',
      'Gross (BDT)',
      'Fee (BDT)',
      'Net (BDT)',
      'Proof Reference',
      'Status',
    ];
    const rows = filteredEntries.map((e) => [
      e.txnReference,
      formatTimestamp(e.createdAt),
      e.entryType,
      e.source,
      e.description,
      e.grossAmountBdt,
      e.feeAmountBdt,
      e.netAmountBdt,
      e.proofReference,
      e.reconciliationStatus,
    ]);
    downloadCsvReport('lifegraph_immutable_ledger.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Append-Only Financial Record · Cryptographic Proof &amp; Reconciliation
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Immutable Financial Ledger
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadLedgerCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Export Filtered CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Expense / Refund / Direct Entry
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md self-start">
          {(
            [
              { id: 'ALL', label: 'All Entries' },
              { id: LedgerEntryType.CREDIT_PAYMENT, label: 'Verified Income' },
              { id: LedgerEntryType.DEBIT_EXPENSE, label: 'Expenses' },
              { id: LedgerEntryType.DEBIT_REFUND, label: 'Refunds' },
              { id: LedgerEntryType.DEBIT_WITHDRAWAL, label: 'Withdrawals' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Txn ID, source, or proof ref..."
            className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Add Operational Entry Form */}
      {showAddModal && (
        <form
          onSubmit={handleCreateLedgerEntry}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Record Verified Ledger Entry (Immutable Once Committed)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Entry Classification
              </label>
              <select
                value={entryType}
                onChange={(e) =>
                  setEntryType(
                    e.target.value as
                      | LedgerEntryType.DEBIT_EXPENSE
                      | LedgerEntryType.DEBIT_REFUND
                      | LedgerEntryType.CREDIT_PAYMENT
                  )
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
              >
                <option value={LedgerEntryType.DEBIT_EXPENSE}>
                  Operational Expense (Debit)
                </option>
                <option value={LedgerEntryType.DEBIT_REFUND}>
                  Client Refund / Chargeback (Debit)
                </option>
                <option value={LedgerEntryType.CREDIT_PAYMENT}>
                  Direct Verified Client Payment (Credit)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vendor / Source / Client
              </label>
              <input
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Google Cloud Run / Domain Renewal"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Official Receipt / Proof Reference ID
              </label>
              <input
                type="text"
                required
                value={proofRef}
                onChange={(e) => setProofRef(e.target.value)}
                placeholder="e.g. INV-GCP-2026-109"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly server infrastructure and deployment expense"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Amount (BDT ৳)
              </label>
              <input
                type="number"
                min={1}
                required
                value={grossBdt}
                onChange={(e) => setGrossBdt(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Recording...' : 'Commit Immutable Entry'}
            </button>
          </div>
        </form>
      )}

      {/* High-Density Financial Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Transaction ID &amp; Date</th>
                <th className="py-3 px-4">Classification &amp; Source</th>
                <th className="py-3 px-4">Description &amp; Proof Reference</th>
                <th className="py-3 px-4 text-right">Gross (BDT)</th>
                <th className="py-3 px-4 text-right">Fee (BDT)</th>
                <th className="py-3 px-4 text-right">Net Impact (BDT)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No immutable ledger entries match your current filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isCredit = entry.entryType === LedgerEntryType.CREDIT_PAYMENT;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          {entry.txnReference}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 tabular-nums mt-0.5">
                          {formatTimestamp(entry.createdAt)}
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div
                          className={`font-medium ${
                            isCredit ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {entry.entryType}
                        </div>
                        <div className="text-slate-500 mt-0.5">{entry.source}</div>
                      </td>

                      <td className="py-3 px-4 align-top max-w-md">
                        <div className="text-slate-900">{entry.description}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                          Proof: {entry.proofReference} · Currency: {entry.currency}
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top text-right font-mono tabular-nums text-slate-700">
                        {formatBdt(entry.grossAmountBdt)}
                      </td>

                      <td className="py-3 px-4 align-top text-right font-mono tabular-nums text-slate-500">
                        {formatBdt(entry.feeAmountBdt)}
                      </td>

                      <td
                        className={`py-3 px-4 align-top text-right font-mono font-semibold tabular-nums ${
                          isCredit ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {isCredit ? '+' : '−'}
                        {formatBdt(entry.netAmountBdt)}
                      </td>

                      <td className="py-3 px-4 align-top text-right font-mono text-[11px] text-slate-700">
                        {entry.reconciliationStatus}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
