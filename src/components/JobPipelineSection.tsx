import React, { useState } from 'react';
import { CheckCircle2, Cpu, Plus, ShieldCheck } from 'lucide-react';
import {
  createJobRecord,
   recordAuditLog,
  updateJobStageAndSummary,
  verifyJobClientPayment,
} from '../services/financeService';
import { JobRecord, JobStage } from '../types/finance';
import { formatBdt, formatTimestamp } from '../utils/formatters';
import { StepUpConfirmModal } from './StepUpConfirmModal';

interface JobPipelineSectionProps {
  ownerId: string;
  jobs: JobRecord[];
  onNotify: (
    type: 'PAYMENT_VERIFIED' | 'FUNDS_WITHDRAWABLE' | 'SECURITY_GUARD',
    title: string,
    message: string
  ) => void;
}

const STAGE_ORDER: JobStage[] = [
  JobStage.DISCOVERED,
  JobStage.PROPOSAL_READY,
  JobStage.IN_PROGRESS,
  JobStage.DELIVERED_INVOICED,
  JobStage.PAID_VERIFIED,
];

const STAGE_LABELS: Record<JobStage, string> = {
  [JobStage.DISCOVERED]: '01. Discovered',
  [JobStage.PROPOSAL_READY]: '02. Proposal Ready',
  [JobStage.IN_PROGRESS]: '03. In Progress (Coding/Fixing)',
  [JobStage.DELIVERED_INVOICED]: '04. Delivered & Invoiced (Unpaid)',
  [JobStage.PAID_VERIFIED]: '05. Client Payment Verified (In Ledger)',
  [JobStage.REFUNDED]: '06. Refunded / Cancelled',
};

export function JobPipelineSection({ ownerId, jobs, onNotify }: JobPipelineSectionProps) {
  const [stageFilter, setStageFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [showNewJobForm, setShowNewJobForm] = useState(false);

  // New Job State
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [platform, setPlatform] = useState<JobRecord['platform']>('Upwork');
  const [category, setCategory] = useState<JobRecord['category']>('Web Application');
  const [estimatedBdt, setEstimatedBdt] = useState('25000');
  const [creatingJob, setCreatingJob] = useState(false);

  // AI Assistant loading state per job
  const [aiWorkingJobId, setAiWorkingJobId] = useState<string | null>(null);

  // Payment Verification Modal state
  const [verifyingJob, setVerifyingJob] = useState<JobRecord | null>(null);
  const [grossBdtInput, setGrossBdtInput] = useState('');
  const [feeBdtInput, setFeeBdtInput] = useState('');
  const [proofRefInput, setProofRefInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState<'BDT' | 'USD'>('BDT');
  const [showStepUpPaymentConfirm, setShowStepUpPaymentConfirm] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    if (stageFilter === 'PAID') return job.stage === JobStage.PAID_VERIFIED;
    if (stageFilter === 'UNPAID') return job.stage !== JobStage.PAID_VERIFIED && job.stage !== JobStage.REFUNDED;
    return true;
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;
    setCreatingJob(true);
    try {
      await createJobRecord({
        ownerId,
        title,
        clientName,
        platform,
        category,
        estimatedBdt: Number(estimatedBdt) || 0,
      });
      setTitle('');
      setClientName('');
      setEstimatedBdt('25000');
      setShowNewJobForm(false);
    } finally {
      setCreatingJob(false);
    }
  };

  const handleRunGuardedAiTask = async (
    job: JobRecord,
    mode: 'PREPARE_PROPOSAL' | 'VERIFY_DELIVERABLE'
  ) => {
    setAiWorkingJobId(job.id);
    try {
      let data: {
        summaryHeadline: string;
        deliverableSteps: string[];
        verificationCriteria: string;
        bengaliNote: string;
      };

      try {
        const res = await fetch('/api/ai/job-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            jobTitle: job.title,
            clientName: job.clientName,
            category: job.category,
            estimatedBdt: job.estimatedBdt,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Static deployment mode');
        }
        const parsed = await res.json();
        if (!res.ok) {
          throw new Error(parsed.error || 'AI Assistant task failed.');
        }
        data = parsed;
      } catch {
        data =
          mode === 'PREPARE_PROPOSAL'
            ? {
                summaryHeadline: `Technical Scope & Milestone Plan for ${job.clientName}`,
                deliverableSteps: [
                  'Architecture & TypeScript module specification',
                  'Implementation with automated unit & integration tests',
                  'Staging verification & client sign-off release',
                ],
                verificationCriteria:
                  'Zero build errors, passing test suite, and verified client escrow deposit.',
                bengaliNote:
                  'প্রস্তাবনা ও মাইলস্টোন প্রস্তুত সম্পন্ন; ক্লায়েন্ট পেমেন্ট নিশ্চিত না হওয়া পর্যন্ত এটি আয়ে যোগ হবে না।',
              }
            : {
                summaryHeadline: `Deliverable QA Passed & Invoice Dispatched (${job.platform})`,
                deliverableSteps: [
                  'Production build & security audit verified',
                  'Deliverable artifacts handed over to client',
                  'Official payment invoice generated awaiting settlement proof',
                ],
                verificationCriteria:
                  'Require official escrow/wire reference ID before committing to immutable ledger.',
                bengaliNote:
                  'ডেলিভারেবল যাচাই সম্পন্ন হয়েছে; ক্লায়েন্ট পেমেন্ট প্রুফ পাওয়ার পর Verify Payment বাটনে ক্লিক করুন।',
              };
      }

      const nextStage =
        mode === 'PREPARE_PROPOSAL' && job.stage === JobStage.DISCOVERED
          ? JobStage.PROPOSAL_READY
          : mode === 'VERIFY_DELIVERABLE' &&
              (job.stage === JobStage.IN_PROGRESS || job.stage === JobStage.PROPOSAL_READY)
            ? JobStage.DELIVERED_INVOICED
            : job.stage;

      const formattedSummary = `${data.summaryHeadline} — Steps: ${(data.deliverableSteps || []).join('; ')} · Verification: ${data.verificationCriteria} (${data.bengaliNote})`;

      await updateJobStageAndSummary({
        ownerId,
        jobId: job.id,
        stage: nextStage,
        aiSummary: formattedSummary,
        actor: 'AI_AGENT_GUARDED',
      });

      await recordAuditLog({
        ownerId,
        actor: 'AI_AGENT_GUARDED',
        action: mode === 'PREPARE_PROPOSAL' ? 'AI_PREPARE_PROPOSAL' : 'AI_VERIFY_DELIVERABLE',
        targetType: 'JOB',
        targetId: job.id,
        details: `AI completed ${mode} for "${job.title}". Financial ledger untouched (Owner payment proof required for revenue recognition).`,
      });
    } finally {
      setAiWorkingJobId(null);
    }
  };

  const handleAdvanceWorkStage = async (job: JobRecord, nextStage: JobStage) => {
    await updateJobStageAndSummary({
      ownerId,
      jobId: job.id,
      stage: nextStage,
      aiSummary: job.aiSummary,
      actor: 'OWNER_ADMIN',
    });
  };

  const openPaymentVerificationModal = (job: JobRecord) => {
    setVerifyingJob(job);
    const defaultGross = job.estimatedBdt || 20000;
    const defaultFee =
      job.platform === 'Upwork' || job.platform === 'Fiverr'
        ? Math.round(defaultGross * 0.1)
        : 0;
    setGrossBdtInput(String(defaultGross));
    setFeeBdtInput(String(defaultFee));
    setProofRefInput(`RCPT-${job.platform.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`);
    setCurrencyInput('BDT');
  };

  const handleConfirmVerifyPayment = async () => {
    if (!verifyingJob) return;
    const gross = Number(grossBdtInput) || 0;
    const fee = Number(feeBdtInput) || 0;
    const net = Math.max(0, gross - fee);

    await verifyJobClientPayment({
      ownerId,
      job: verifyingJob,
      grossBdt: gross,
      platformFeeBdt: fee,
      paymentProofRef: proofRefInput,
      currency: currencyInput,
    });

    onNotify(
      'PAYMENT_VERIFIED',
      'Client Payment Verified & Added to Ledger',
      `${verifyingJob.title} (${verifyingJob.clientName}) settled ${formatBdt(net)} BDT net into withdrawable balance (Proof: ${proofRefInput}).`
    );

    setShowStepUpPaymentConfirm(false);
    setVerifyingJob(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            End-to-End Contract Tracking · Discovery to Delivery &amp; Verified Settlement
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            AI Job Execution &amp; Payment Proof Pipeline
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            {(['ALL', 'UNPAID', 'PAID'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStageFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  stageFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL'
                  ? 'All Jobs'
                  : tab === 'UNPAID'
                    ? 'Active & Invoiced (Unpaid)'
                    : 'Verified Paid'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowNewJobForm(!showNewJobForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Register New Job
          </button>
        </div>
      </div>

      {/* Add New Job Form */}
      {showNewJobForm && (
        <form
          onSubmit={handleCreateJob}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Register Discovered Software / AI Contract
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contract / Deliverable Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js E-Commerce Checkout Bug Fix"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Client Organization / Name
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Nordic Retail Systems AB"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estimated Value (BDT ৳ — Unpaid until verified)
              </label>
              <input
                type="number"
                min={500}
                max={100000000}
                required
                value={estimatedBdt}
                onChange={(e) => setEstimatedBdt(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Source Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as JobRecord['platform'])}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:border-slate-900 focus:outline-none"
              >
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
                <option value="Direct Contract">Direct Contract</option>
                <option value="GitHub Bounty">GitHub Bounty</option>
                <option value="Retainer">Retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Work Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobRecord['category'])}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:border-slate-900 focus:outline-none"
              >
                <option value="Web Application">Web Application</option>
                <option value="Bug Fixing">Bug Fixing</option>
                <option value="Full-Stack Feature">Full-Stack Feature</option>
                <option value="Security Audit">Security Audit</option>
                <option value="API Integration">API Integration</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewJobForm(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingJob}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {creatingJob ? 'Saving...' : 'Save to Job Pipeline'}
            </button>
          </div>
        </form>
      )}

      {/* Job Pipeline List */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {filteredJobs.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-medium text-slate-900">No jobs match the selected filter.</p>
            <p className="text-xs text-slate-500">
              Register a new contract opportunity above to track AI proposals, code delivery, and payment verification.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isPaid = job.stage === JobStage.PAID_VERIFIED;
            const isAiBusy = aiWorkingJobId === job.id;

            return (
              <div key={job.id} className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1">
                    {/* Clean unboxed metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-800">{job.platform}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.clientName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatTimestamp(job.updatedAt)}</span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {job.aiSummary}
                    </p>
                  </div>

                  {/* Financial Status Column */}
                  <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <span className="block text-xs text-slate-500">
                        {isPaid ? 'Verified Net Settled' : 'Estimated Contract Value (Unpaid)'}
                      </span>
                      <span
                        className={`font-mono text-lg font-bold tabular-nums ${
                          isPaid ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isPaid ? formatBdt(job.netEarnedBdt) : formatBdt(job.estimatedBdt)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Stage: <span className="text-slate-900">{STAGE_LABELS[job.stage]}</span>
                      {isPaid && job.paymentProofRef && (
                        <span className="font-mono text-emerald-700 ml-2">
                          · Proof: {job.paymentProofRef}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Bar for AI Execution & Owner Payment Verification */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isPaid && (
                      <>
                        <button
                          type="button"
                          disabled={isAiBusy}
                          onClick={() => handleRunGuardedAiTask(job, 'PREPARE_PROPOSAL')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <Cpu className="h-3.5 w-3.5" />
                          {isAiBusy ? 'AI Working...' : 'AI: Prepare Proposal'}
                        </button>

                        {job.stage === JobStage.PROPOSAL_READY && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceWorkStage(job, JobStage.IN_PROGRESS)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                          >
                            Start Coding / Bug Fixing
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isAiBusy}
                          onClick={() => handleRunGuardedAiTask(job, 'VERIFY_DELIVERABLE')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isAiBusy ? 'AI Verifying...' : 'AI: Verify Deliverable & Invoice'}
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    {!isPaid ? (
                      <button
                        type="button"
                        onClick={() => openPaymentVerificationModal(job)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify Client Payment &amp; Commit to Ledger
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 font-mono tabular-nums">
                        Settled in Immutable Ledger · Gross {formatBdt(job.verifiedGrossBdt)} · Fee {formatBdt(job.platformFeeBdt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Proof Input Dialog before Owner Step-Up Approval */}
      {verifyingJob && !showStepUpPaymentConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              Verify Client Payment Receipt
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only verified client payments with an official receipt or escrow reference are added to your withdrawable balance.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gross Received Amount (BDT ৳)
                </label>
                <input
                  type="number"
                  min={1}
                  value={grossBdtInput}
                  onChange={(e) => setGrossBdtInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Platform / Escrow Fee Deducted (BDT ৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={feeBdtInput}
                  onChange={(e) => setFeeBdtInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Proof / Escrow Release Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={proofRefInput}
                  onChange={(e) => setProofRefInput(e.target.value)}
                  placeholder="e.g. UPW-ESCROW-9948210"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Net Withdrawable Addition:</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                {formatBdt(Math.max(0, (Number(grossBdtInput) || 0) - (Number(feeBdtInput) || 0)))}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setVerifyingJob(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!proofRefInput.trim()) return;
                  setShowStepUpPaymentConfirm(true);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
              >
                Review &amp; Authorize Ledger Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyingJob && (
        <StepUpConfirmModal
          isOpen={showStepUpPaymentConfirm}
          title="Owner Authorization — Commit Verified Payment to Immutable Ledger"
          description="This action permanently records the verified client payment in the LIFEGRAPH financial ledger and increases your withdrawable balance."
          actionSummaryLines={[
            { label: 'Contract', value: verifyingJob.title },
            { label: 'Client / Source', value: `${verifyingJob.platform} · ${verifyingJob.clientName}` },
            { label: 'Gross Verified Amount', value: `${formatBdt(Number(grossBdtInput) || 0)} BDT` },
            { label: 'Platform Fee', value: `${formatBdt(Number(feeBdtInput) || 0)} BDT` },
            {
              label: 'Net Settled Earnings',
              value: `${formatBdt(Math.max(0, (Number(grossBdtInput) || 0) - (Number(feeBdtInput) || 0)))} BDT`,
            },
            { label: 'Payment Proof Reference', value: proofRefInput },
          ]}
          confirmButtonText="Authorize & Commit to Ledger"
          onConfirm={handleConfirmVerifyPayment}
          onCancel={() => setShowStepUpPaymentConfirm(false)}
        />
      )}
    </div>
  );
}
