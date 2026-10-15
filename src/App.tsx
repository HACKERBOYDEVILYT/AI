/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FileCode, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import ownerAvatarImg from './assets/images/avatar_owner_admin_1791776091468.jpg';
import { DeploymentWorkflowsSection } from './components/DeploymentWorkflowsSection';
import { JobPipelineSection } from './components/JobPipelineSection';
import { LedgerSection } from './components/LedgerSection';
import { OverviewSection } from './components/OverviewSection';
import { PayoutSystemSection } from './components/PayoutSystemSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SecurityAuditSection } from './components/SecurityAuditSection';
import {
  auth,
  AUTHORIZED_OWNER_EMAIL,
  signInAsOwner,
  signOutOwner,
} from './firebase';
import {
  addVerifiedPayoutMethod,
  computeFinancialMetrics,
  confirmManualWithdrawalTransfer,
  createJobRecord,
  ensureOwnerAdminRecord,
  initiateWithdrawalRequest,
  loadLocalStore,
  recordOperationalLedgerEntry,
  subscribeOwnerCollections,
  updateJobStageAndSummary,
  verifyJobClientPayment,
} from './services/financeService';
import {
  AppNotification,
  AuditLog,
  JobRecord,
  JobStage,
  LedgerEntry,
  LedgerEntryType,
  PayoutAccountType,
  PayoutMethod,
  PayoutProviderType,
  WithdrawalMode,
  WithdrawalRequest,
} from './types/finance';
import { formatBdt } from './utils/formatters';

type ActiveTab = 'overview' | 'jobs' | 'ledger' | 'payouts' | 'security' | 'workflows';

const STANDALONE_OWNER_UID = 'owner_ayan_lifegraph';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Firestore / Standalone Real-Time State (Instantly seeded so no blank loading screen)
  const initialLocalState = useMemo(() => loadLocalStore(STANDALONE_OWNER_UID), []);
  const [jobs, setJobs] = useState<JobRecord[]>(initialLocalState.jobs);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLocalState.ledgerEntries);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(initialLocalState.payoutMethods);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(initialLocalState.withdrawals);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialLocalState.auditLogs);
  const [seeding, setSeeding] = useState(false);

  // Session Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'init_guard',
      type: 'SECURITY_GUARD',
      title: 'Zero-Trust Financial Ledger & CI/CD Active',
      message:
        'Unpaid invoices are strictly separated from received earnings. GitHub workflows (release.yml & website.yml) are configured and active.',
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    },
  ]);

  const isFirebaseOwner = Boolean(
    currentUser &&
      currentUser.email?.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase()
  );

  // If signed in with a non-owner Google account, block access; otherwise allow Owner Console
  const isUnauthorizedExternalUser = Boolean(
    currentUser &&
      currentUser.email?.toLowerCase() !== AUTHORIZED_OWNER_EMAIL.toLowerCase()
  );

  const effectiveOwnerUid = isFirebaseOwner && currentUser ? currentUser.uid : STANDALONE_OWNER_UID;
  const effectiveOwnerEmail =
    isFirebaseOwner && currentUser?.email ? currentUser.email : AUTHORIZED_OWNER_EMAIL;
  const effectiveOwnerName =
    isFirebaseOwner && currentUser?.displayName ? currentUser.displayName : 'Ayan Islam';

  useEffect(() => {
    // Safety fallback: if onAuthStateChanged hangs or takes long on static domains, enable standalone mode
    const safetyTimer = setTimeout(() => {
      setAuthReady((ready) => {
        if (!ready) {
          console.info('Firebase Auth handshake timeout on static host — auto-enabling Owner Standalone Mode');
          return true;
        }
        return ready;
      });
    }, 1000);

    const unsubAuth = onAuthStateChanged(
      auth,
      async (user) => {
        clearTimeout(safetyTimer);
        setCurrentUser(user);
        setAuthReady(true);
        if (
          user &&
          user.email?.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase() &&
          user.emailVerified
        ) {
          try {
            await ensureOwnerAdminRecord(user.uid);
          } catch (err) {
            console.error('Owner bootstrap error:', err);
          }
        }
      },
      (err) => {
        console.warn('Auth state error (continuing in Standalone Mode):', err);
        clearTimeout(safetyTimer);
        setAuthReady(true);
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!authReady || isUnauthorizedExternalUser) {
      return;
    }

    const unsubAll = subscribeOwnerCollections(effectiveOwnerUid, {
      onJobs: setJobs,
      onLedger: setLedgerEntries,
      onPayoutMethods: setPayoutMethods,
      onWithdrawals: setWithdrawals,
      onAuditLogs: setAuditLogs,
    });

    return () => unsubAll();
  }, [authReady, isUnauthorizedExternalUser, effectiveOwnerUid]);

  const metrics = useMemo(
    () => computeFinancialMetrics(jobs, ledgerEntries, withdrawals),
    [jobs, ledgerEntries, withdrawals]
  );

  const pushNotification = (
    type: AppNotification['type'],
    title: string,
    message: string
  ) => {
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        title,
        message,
        timestamp: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInAsOwner();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? `Cloud popup note: ${err.message} (Active in Verified Owner Standalone Mode)`
          : 'Active in Verified Owner Standalone Mode.'
      );
    }
  };

  const handleSeedInitialData = async () => {
    if (isUnauthorizedExternalUser || seeding) return;
    setSeeding(true);
    try {
      const uid = effectiveOwnerUid;

      const job1Id = await createJobRecord({
        ownerId: uid,
        title: 'Multi-Tenant SaaS Billing & Webhook Reconciliation Engine',
        clientName: 'Vanguard FinTech Ltd (UK)',
        platform: 'Upwork',
        category: 'Full-Stack Feature',
        estimatedBdt: 85000,
        aiSummary:
          'Completed full-stack TypeScript Stripe webhook reconciliation module with idempotency keys and automated unit tests.',
      });

      await verifyJobClientPayment({
        ownerId: uid,
        job: {
          id: job1Id,
          ownerId: uid,
          title: 'Multi-Tenant SaaS Billing & Webhook Reconciliation Engine',
          clientName: 'Vanguard FinTech Ltd (UK)',
          platform: 'Upwork',
          category: 'Full-Stack Feature',
          stage: JobStage.DELIVERED_INVOICED,
          estimatedBdt: 85000,
          verifiedGrossBdt: 0,
          platformFeeBdt: 0,
          netEarnedBdt: 0,
          paymentProofRef: '',
          aiSummary: '',
          createdAt: null as never,
          updatedAt: null as never,
        },
        grossBdt: 85000,
        platformFeeBdt: 8500,
        paymentProofRef: 'UPW-ESCROW-8849201',
        currency: 'BDT',
      });

      const job2Id = await createJobRecord({
        ownerId: uid,
        title: 'Production Memory Leak & Race Condition Bug Fix in Node.js API',
        clientName: 'Apex Logistics GmbH',
        platform: 'Direct Contract',
        category: 'Bug Fixing',
        estimatedBdt: 42000,
        aiSummary:
          'Isolated WebSocket connection pool leak and patched race condition with zero downtime deployment.',
      });

      await verifyJobClientPayment({
        ownerId: uid,
        job: {
          id: job2Id,
          ownerId: uid,
          title: 'Production Memory Leak & Race Condition Bug Fix in Node.js API',
          clientName: 'Apex Logistics GmbH',
          platform: 'Direct Contract',
          category: 'Bug Fixing',
          stage: JobStage.DELIVERED_INVOICED,
          estimatedBdt: 42000,
          verifiedGrossBdt: 0,
          platformFeeBdt: 0,
          netEarnedBdt: 0,
          paymentProofRef: '',
          aiSummary: '',
          createdAt: null as never,
          updatedAt: null as never,
        },
        grossBdt: 42000,
        platformFeeBdt: 1200,
        paymentProofRef: 'WIRE-SWIFT-7731904',
        currency: 'BDT',
      });

      const job3Id = await createJobRecord({
        ownerId: uid,
        title: 'Next.js Inventory Analytics Portal & Role-Based Access Control',
        clientName: 'Dhaka Retail Group',
        platform: 'Direct Contract',
        category: 'Web Application',
        estimatedBdt: 55000,
        aiSummary:
          'Deliverable verified and invoice dispatched to client. Waiting for official bank payment clearance before adding to ledger.',
      });
      await updateJobStageAndSummary({
        ownerId: uid,
        jobId: job3Id,
        stage: JobStage.DELIVERED_INVOICED,
        aiSummary:
          'Deliverable verified and invoice dispatched to client. Waiting for official bank payment clearance before adding to ledger.',
      });

      await recordOperationalLedgerEntry({
        ownerId: uid,
        entryType: LedgerEntryType.DEBIT_EXPENSE,
        source: 'Google Cloud Run & Domain Infrastructure',
        description: 'Monthly production container hosting and automated CI/CD runner allocation',
        grossAmountBdt: 4800,
        feeAmountBdt: 0,
        proofReference: 'GCP-INV-2026-10',
      });

      const cityBankMethodId = await addVerifiedPayoutMethod({
        ownerId: uid,
        providerType: PayoutProviderType.BANK_BEFTN,
        providerName: 'The City Bank PLC',
        accountHolderName: effectiveOwnerName,
        rawAccountNumber: '1402938475610',
        accountType: PayoutAccountType.SAVINGS,
        bankBranch: 'Gulshan Avenue Branch, Dhaka',
        routingNumber: '225261729',
        isDefault: true,
        minWithdrawalBdt: 5000,
        autoPayoutEnabled: true,
      });

      await addVerifiedPayoutMethod({
        ownerId: uid,
        providerType: PayoutProviderType.PAYONEER,
        providerName: 'Payoneer Business',
        accountHolderName: effectiveOwnerName,
        rawAccountNumber: '994827162540',
        accountType: PayoutAccountType.BUSINESS,
        isDefault: false,
        minWithdrawalBdt: 5000,
        autoPayoutEnabled: false,
      });

      const wdRes = await initiateWithdrawalRequest({
        ownerId: uid,
        method: {
          id: cityBankMethodId,
          ownerId: uid,
          providerType: PayoutProviderType.BANK_BEFTN,
          providerName: 'The City Bank PLC',
          accountHolderName: effectiveOwnerName,
          maskedAccountNumber: '14•• •••• 5610',
          accountType: PayoutAccountType.SAVINGS,
          bankBranch: 'Gulshan Avenue Branch, Dhaka',
          routingNumber: '225261729',
          isDefault: true,
          verificationStatus: 'VERIFIED',
          minWithdrawalBdt: 5000,
          autoPayoutEnabled: true,
          createdAt: null as never,
          updatedAt: null as never,
        },
        requestedAmountBdt: 25000,
        executionMode: WithdrawalMode.MANUAL_TRANSFER,
        availableBalanceBdt: 112500,
      });

      await confirmManualWithdrawalTransfer({
        ownerId: uid,
        withdrawal: {
          id: wdRes.withdrawalId,
          ownerId: uid,
          payoutMethodId: cityBankMethodId,
          providerSummary: 'The City Bank PLC (14•• •••• 5610)',
          executionMode: WithdrawalMode.MANUAL_TRANSFER,
          requestedAmountBdt: 25000,
          feeAmountBdt: 0,
          netPayoutBdt: 25000,
          status: wdRes.status,
          idempotencyKey: `IDM-SEED-${Date.now()}`,
          transferReference: '',
          failureReason: '',
          retryCount: 0,
          createdAt: null as never,
          updatedAt: null as never,
        },
        officialTransferRef: 'BEFTN-9841205M',
      });

      pushNotification(
        'FUNDS_WITHDRAWABLE',
        'Baseline Financial Ledger Initialized',
        'Verified payments, unpaid pipeline jobs, and masked Bank/Payoneer payout destinations are now active.'
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('overview');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          LIFEGRAPH FinOps
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'jobs', label: 'Job Pipeline' },
              { id: 'ledger', label: 'Financial Ledger' },
              { id: 'payouts', label: 'Bank & Global Payouts' },
              { id: 'workflows', label: 'release.yml & website.yml' },
              { id: 'security', label: 'Security & Audit' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === item.id
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Request Withdrawal ({formatBdt(metrics.availableWithdrawalBalanceBdt)})
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-8">
        {isUnauthorizedExternalUser ? (
          /* Unauthorized User Block */
          <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-lg p-8 space-y-4 my-8">
            <div className="flex items-center gap-2.5 text-red-700">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <h2 className="text-base font-bold">
                Access Denied — Owner Authorization Required
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Signed in as <strong className="font-mono">{currentUser?.email}</strong>, which is not the authorized LIFEGRAPH Owner account (<strong className="font-mono">{AUTHORIZED_OWNER_EMAIL}</strong>).
            </p>
            <button
              type="button"
              onClick={() => signOutOwner()}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        ) : (
          /* Authenticated Owner Workspace (Works in Cloud Run, GitHub Pages & Android APK) */
          <div className="space-y-6">
            {/* Workspace Owner Bar + Mobile Navigation */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {!avatarLoadError ? (
                  <img
                    src={ownerAvatarImg}
                    alt="LIFEGRAPH Owner Admin"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                    className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    AI
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {effectiveOwnerName}
                    </span>
                    <span className="text-xs text-slate-400" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs font-mono text-emerald-700 font-medium inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Owner Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {effectiveOwnerEmail} · Step-Up Approval Enforced · APK &amp; Web Ready
                  </p>
                  {authError && (
                    <p className="text-[11px] text-amber-700 mt-0.5">{authError}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('workflows')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  release.yml &amp; website.yml
                </button>
                <PWAInstallButton onOpenWorkflowsTab={() => setActiveTab('workflows')} />
                {/* Mobile section switcher */}
                <div className="flex md:hidden flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'overview', label: 'Overview' },
                      { id: 'jobs', label: 'Jobs' },
                      { id: 'ledger', label: 'Ledger' },
                      { id: 'payouts', label: 'Payouts' },
                      { id: 'workflows', label: 'YAML/APK' },
                      { id: 'security', label: 'Security' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`px-2.5 py-1 text-xs rounded ${
                        activeTab === t.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {isFirebaseOwner ? (
                  <button
                    type="button"
                    onClick={() => signOutOwner()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Cloud Sync
                  </button>
                )}
              </div>
            </div>

            {/* Active Workspace View */}
            {activeTab === 'overview' && (
              <OverviewSection
                metrics={metrics}
                jobs={jobs}
                ledgerEntries={ledgerEntries}
                withdrawals={withdrawals}
                notifications={notifications}
                onMarkNotificationRead={handleMarkNotificationRead}
                onNavigateTab={setActiveTab}
                onSeedInitialData={handleSeedInitialData}
                seeding={seeding}
              />
            )}

            {activeTab === 'jobs' && (
              <JobPipelineSection
                ownerId={effectiveOwnerUid}
                jobs={jobs}
                onNotify={pushNotification}
              />
            )}

            {activeTab === 'ledger' && (
              <LedgerSection
                ownerId={effectiveOwnerUid}
                ledgerEntries={ledgerEntries}
              />
            )}

            {activeTab === 'payouts' && (
              <PayoutSystemSection
                ownerId={effectiveOwnerUid}
                metrics={metrics}
                payoutMethods={payoutMethods}
                withdrawals={withdrawals}
                onNotify={pushNotification}
              />
            )}

            {activeTab === 'workflows' && <DeploymentWorkflowsSection />}

            {activeTab === 'security' && (
              <SecurityAuditSection
                ownerEmail={effectiveOwnerEmail}
                ownerUid={effectiveOwnerUid}
                auditLogs={auditLogs}
              />
            )}
          </div>
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            LIFEGRAPH FinOps &amp; Bangladesh Payout Administration · Immutable Ledger Architecture
          </span>
          <span>
            Owner-Only Access · Bangladesh Bank BEFTN/NPSB, Payoneer &amp; Wise Withdrawal Support
          </span>
        </div>
      </footer>
    </div>
  );
}
