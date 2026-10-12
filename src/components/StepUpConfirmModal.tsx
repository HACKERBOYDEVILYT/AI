import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface StepUpConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionSummaryLines: { label: string; value: string }[];
  confirmButtonText: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function StepUpConfirmModal({
  isOpen,
  title,
  description,
  actionSummaryLines,
  confirmButtonText,
  onConfirm,
  onCancel,
}: StepUpConfirmModalProps) {
  const [ackChecked, setAckChecked] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ackChecked) {
      setErrorMsg('Please confirm owner authorization before executing this financial action.');
      return;
    }
    if (confirmationCode.trim().toUpperCase() !== 'APPROVE') {
      setErrorMsg('Type APPROVE in the verification box to authorize this action.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      setAckChecked(false);
      setConfirmationCode('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authorization action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-slate-900 shrink-0" />
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleExecute} className="mt-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

          <div className="rounded-md bg-slate-50 p-4 space-y-2 border border-slate-200">
            {actionSummaryLines.map((line, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{line.label}</span>
                <span className="font-mono font-medium text-slate-900 tabular-nums">{line.value}</span>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(e) => setAckChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span>
              I am the authorized LIFEGRAPH Owner Admin and explicitly approve this action to be recorded in the immutable financial audit trail.
            </span>
          </label>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Step-Up Verification — Type <span className="font-mono font-semibold text-slate-900">APPROVE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="APPROVE"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-600">{errorMsg}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {submitting ? 'Verifying & Recording...' : confirmButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
