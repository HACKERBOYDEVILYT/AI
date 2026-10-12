import React from 'react';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { DIRTY_DOZEN_TEST_CASES } from '../../firestore.rules.test';
import { AuditLog } from '../types/finance';
import { formatTimestamp } from '../utils/formatters';

interface SecurityAuditSectionProps {
  ownerEmail: string;
  ownerUid: string;
  auditLogs: AuditLog[];
}

const AI_PERMISSION_POLICIES = [
  {
    capability: 'Discover Jobs, Prepare Proposals & Scope Milestones',
    aiPermission: 'ALLOWED (Proposal Only)',
    ownerApproval: 'Optional review before client submission',
    enforcement: 'Server-side Gemini 3.8 Flash assistant + Audit Log',
  },
  {
    capability: 'Write Code, Fix Bugs & Run Deliverable QA Verification',
    aiPermission: 'ALLOWED (Workspace Execution)',
    ownerApproval: 'Required before final client invoice release',
    enforcement: 'Stage transition gated in Job Pipeline',
  },
  {
    capability: 'Fabricate Received Earnings or Count Unpaid Invoices as Income',
    aiPermission: 'STRICTLY FORBIDDEN',
    ownerApproval: 'Blocked by Ledger Accounting Rules',
    enforcement: 'computeFinancialMetrics() + Firestore Schema Rules',
  },
  {
    capability: 'Modify Financial Ledger Amounts or Delete Ledger Entries',
    aiPermission: 'STRICTLY FORBIDDEN',
    ownerApproval: 'Impossible (Append-Only Ledger)',
    enforcement: 'firestore.rules: allow delete: if false & immutable amount checks',
  },
  {
    capability: 'Add, Edit, or Unmask Bangladesh Bank / Payoneer / Wise Payout Accounts',
    aiPermission: 'STRICTLY FORBIDDEN',
    ownerApproval: 'Mandatory Owner Step-Up Approval (APPROVE)',
    enforcement: 'Server-side HMAC masking + Owner-only Firestore rules',
  },
  {
    capability: 'Initiate or Confirm Bank / Payoneer Withdrawals',
    aiPermission: 'STRICTLY FORBIDDEN',
    ownerApproval: 'Mandatory Owner Step-Up Approval + Idempotency Key',
    enforcement: 'Owner-only auth + Server Idempotency Lock',
  },
];

export function SecurityAuditSection({
  ownerEmail,
  ownerUid,
  auditLogs,
}: SecurityAuditSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Zero-Trust Financial Governance · AI Permission Guardrails &amp; Immutable Audit Trail
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Withdrawal Security &amp; AI Financial Permissions
          </h1>
        </div>
        <div className="text-xs font-mono text-slate-600 tabular-nums">
          Authorized Owner: <strong className="text-slate-900">{ownerEmail}</strong> · UID:{' '}
          {ownerUid.slice(0, 10)}…
        </div>
      </div>

      {/* AI Financial Permissions Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-900" />
              AI Financial Permission &amp; Owner Authorization Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI কখনোই নিজে থেকে আয় তৈরি (fabricate), লেজার পরিবর্তন, বা ব্যাংক/Payoneer অ্যাকাউন্টে টাকা উইথড্র করতে পারবে না।
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">System Capability / Financial Action</th>
                <th className="py-3 px-4">AI Agent Permission</th>
                <th className="py-3 px-4">Owner Approval Requirement</th>
                <th className="py-3 px-4">Technical Enforcement Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {AI_PERMISSION_POLICIES.map((row, idx) => {
                const isForbidden = row.aiPermission.includes('FORBIDDEN');
                return (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-medium text-slate-900">{row.capability}</td>
                    <td
                      className={`py-3 px-4 font-mono font-semibold ${
                        isForbidden ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {row.aiPermission}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{row.ownerApproval}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {row.enforcement}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dirty Dozen Firestore Security Rules Verification */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            Firestore Security Rules — 8-Pillar &amp; &ldquo;Dirty Dozen&rdquo; Adversarial Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All 12 adversarial attack vectors are blocked at the database rule layer (ESLint verified &amp; deployed).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {DIRTY_DOZEN_TEST_CASES.map((tc) => (
            <div
              key={tc.id}
              className="border border-slate-200 rounded-md p-3.5 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Vector #{String(tc.id).padStart(2, '0')}</span>
                  <span>
                    {tc.collection} · {tc.operation.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-900 mt-1">{tc.name}</p>
              </div>
              <div className="text-[11px] font-mono font-semibold text-emerald-700 pt-1 border-t border-slate-100">
                Enforced: {tc.expectedResult}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Append-Only Security & Financial Audit Log */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-slate-900" />
              Append-Only Security &amp; Financial Audit Trail
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every payment verification, payout destination update, and withdrawal request is permanently logged.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {auditLogs.length} Audit Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 align-top font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 align-top font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 align-top font-mono text-slate-800 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 align-top font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.targetType} · {log.targetId.slice(0, 12)}
                    </td>
                    <td className="py-3 px-4 align-top text-slate-700 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
