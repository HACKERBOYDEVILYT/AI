import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AuditLog,
  FinancialMetrics,
  JobRecord,
  JobStage,
  LedgerEntry,
  LedgerEntryType,
  PayoutAccountType,
  PayoutMethod,
  PayoutProviderType,
  ReconciliationStatus,
  WithdrawalMode,
  WithdrawalRequest,
  WithdrawalStatus,
} from '../types/finance';

function clampString(val: string, maxLen: number, fallback = ''): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function safeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function ensureOwnerAdminRecord(uid: string): Promise<void> {
  const path = `admins/${uid}`;
  try {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        uid: clampString(uid, 128),
        role: 'OWNER_ADMIN',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function recordAuditLog(params: {
  ownerId: string;
  actor: 'OWNER_ADMIN' | 'AI_AGENT_GUARDED' | 'SYSTEM_WEBHOOK';
  action: string;
  targetType: 'JOB' | 'LEDGER' | 'PAYOUT_METHOD' | 'WITHDRAWAL' | 'SECURITY_POLICY';
  targetId: string;
  details: string;
}): Promise<void> {
  const logId = safeId('log');
  const path = `audit_logs/${logId}`;
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      ownerId: clampString(params.ownerId, 128),
      actor: params.actor,
      action: clampString(params.action, 120, 'SYSTEM_ACTION'),
      targetType: params.targetType,
      targetId: clampString(params.targetId, 128, 'none'),
      details: clampString(params.details, 500, 'Action logged.'),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createJobRecord(params: {
  ownerId: string;
  title: string;
  clientName: string;
  platform: JobRecord['platform'];
  category: JobRecord['category'];
  estimatedBdt: number;
  aiSummary?: string;
}): Promise<string> {
  const jobId = safeId('job');
  const path = `jobs/${jobId}`;
  const cleanEst = Math.max(0, Math.min(100000000, Math.round(params.estimatedBdt)));

  try {
    await setDoc(doc(db, 'jobs', jobId), {
      ownerId: clampString(params.ownerId, 128),
      title: clampString(params.title, 200, 'Untitled Engineering Contract'),
      clientName: clampString(params.clientName, 120, 'Direct Client'),
      platform: params.platform,
      category: params.category,
      stage: JobStage.DISCOVERED,
      estimatedBdt: cleanEst,
      verifiedGrossBdt: 0,
      platformFeeBdt: 0,
      netEarnedBdt: 0,
      paymentProofRef: '',
      aiSummary: clampString(
        params.aiSummary || 'Discovered contract opportunity awaiting technical proposal & milestone scoping.',
        2000
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'CREATE_JOB_PIPELINE_RECORD',
      targetType: 'JOB',
      targetId: jobId,
      details: `Registered job "${clampString(params.title, 80)}" (${params.platform}) with estimated value ৳${cleanEst.toLocaleString()} BDT (Unpaid/Estimated).`,
    });

    return jobId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateJobStageAndSummary(params: {
  ownerId: string;
  jobId: string;
  stage: JobStage;
  aiSummary: string;
  actor?: 'OWNER_ADMIN' | 'AI_AGENT_GUARDED';
}): Promise<void> {
  const path = `jobs/${params.jobId}`;
  try {
    await updateDoc(doc(db, 'jobs', params.jobId), {
      stage: params.stage,
      aiSummary: clampString(params.aiSummary, 2000),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: params.actor || 'OWNER_ADMIN',
      action: `JOB_STAGE_${params.stage}`,
      targetType: 'JOB',
      targetId: params.jobId,
      details: `Updated job ${params.jobId} to stage ${params.stage}. Note: Unpaid work is excluded from withdrawable balance.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function verifyJobClientPayment(params: {
  ownerId: string;
  job: JobRecord;
  grossBdt: number;
  platformFeeBdt: number;
  paymentProofRef: string;
  currency: 'BDT' | 'USD';
}): Promise<void> {
  const cleanGross = Math.max(1, Math.min(100000000, Math.round(params.grossBdt)));
  const cleanFee = Math.max(0, Math.min(cleanGross, Math.round(params.platformFeeBdt)));
  const cleanNet = Math.max(0, cleanGross - cleanFee);
  const cleanProof = clampString(params.paymentProofRef, 160, `PRF-${Date.now()}`);

  const jobPath = `jobs/${params.job.id}`;
  const ledgerId = safeId('led');
  const ledgerPath = `ledger_entries/${ledgerId}`;

  try {
    await updateDoc(doc(db, 'jobs', params.job.id), {
      stage: JobStage.PAID_VERIFIED,
      verifiedGrossBdt: cleanGross,
      platformFeeBdt: cleanFee,
      netEarnedBdt: cleanNet,
      paymentProofRef: cleanProof,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'ledger_entries', ledgerId), {
      ownerId: clampString(params.ownerId, 128),
      txnReference: clampString(`INC-${params.job.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-5)}`, 120),
      entryType: LedgerEntryType.CREDIT_PAYMENT,
      source: clampString(`${params.job.platform} · ${params.job.clientName}`, 120),
      description: clampString(`Verified client payment for: ${params.job.title}`, 300),
      currency: params.currency,
      grossAmountBdt: cleanGross,
      feeAmountBdt: cleanFee,
      netAmountBdt: cleanNet,
      reconciliationStatus: ReconciliationStatus.RECONCILED,
      proofReference: cleanProof,
      relatedJobId: clampString(params.job.id, 128),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'VERIFY_CLIENT_PAYMENT_TO_LEDGER',
      targetType: 'LEDGER',
      targetId: ledgerId,
      details: `Verified payment proof [${cleanProof}] for "${clampString(params.job.title, 60)}". Gross: ৳${cleanGross.toLocaleString()}, Fee: ৳${cleanFee.toLocaleString()}, Net Settled: ৳${cleanNet.toLocaleString()} BDT.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${jobPath} -> ${ledgerPath}`);
  }
}

export async function recordOperationalLedgerEntry(params: {
  ownerId: string;
  entryType: LedgerEntryType.DEBIT_EXPENSE | LedgerEntryType.DEBIT_REFUND | LedgerEntryType.CREDIT_PAYMENT;
  source: string;
  description: string;
  grossAmountBdt: number;
  feeAmountBdt: number;
  proofReference: string;
  currency?: 'BDT' | 'USD';
}): Promise<string> {
  const ledgerId = safeId('led');
  const path = `ledger_entries/${ledgerId}`;
  const cleanGross = Math.max(1, Math.min(100000000, Math.round(params.grossAmountBdt)));
  const cleanFee = Math.max(0, Math.min(cleanGross, Math.round(params.feeAmountBdt)));
  const cleanNet =
    params.entryType === LedgerEntryType.CREDIT_PAYMENT
      ? Math.max(0, cleanGross - cleanFee)
      : cleanGross;

  try {
    const txnRef = clampString(
      `${params.entryType === LedgerEntryType.DEBIT_EXPENSE ? 'EXP' : params.entryType === LedgerEntryType.DEBIT_REFUND ? 'RFD' : 'INC'}-${Date.now().toString().slice(-7)}`,
      120
    );

    await setDoc(doc(db, 'ledger_entries', ledgerId), {
      ownerId: clampString(params.ownerId, 128),
      txnReference: txnRef,
      entryType: params.entryType,
      source: clampString(params.source, 120, 'Direct Operation'),
      description: clampString(params.description, 300, 'Financial ledger entry'),
      currency: params.currency || 'BDT',
      grossAmountBdt: cleanGross,
      feeAmountBdt: cleanFee,
      netAmountBdt: cleanNet,
      reconciliationStatus: ReconciliationStatus.RECONCILED,
      proofReference: clampString(params.proofReference, 160, txnRef),
      relatedJobId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: `RECORD_${params.entryType}`,
      targetType: 'LEDGER',
      targetId: ledgerId,
      details: `Recorded ${params.entryType} (${txnRef}): ৳${cleanNet.toLocaleString()} BDT · Proof: ${clampString(params.proofReference, 60)}.`,
    });

    return ledgerId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addVerifiedPayoutMethod(params: {
  ownerId: string;
  providerType: PayoutProviderType;
  providerName: string;
  accountHolderName: string;
  rawAccountNumber: string;
  accountType: PayoutAccountType;
  bankBranch?: string;
  routingNumber?: string;
  isDefault: boolean;
  minWithdrawalBdt: number;
  autoPayoutEnabled: boolean;
}): Promise<string> {
  // 1. Validate & Mask on the Server so plaintext account numbers are never stored in client collections
  const maskRes = await fetch('/api/payouts/mask-and-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountNumber: params.rawAccountNumber,
      providerType: params.providerType,
      routingNumber: params.routingNumber || '',
    }),
  });

  const maskData = await maskRes.json();
  if (!maskRes.ok) {
    throw new Error(maskData.error || 'Failed to validate payout account format.');
  }

  const methodId = safeId('pm');
  const path = `payout_methods/${methodId}`;
  const cleanMin = Math.max(500, Math.min(5000000, Math.round(params.minWithdrawalBdt)));

  try {
    await setDoc(doc(db, 'payout_methods', methodId), {
      ownerId: clampString(params.ownerId, 128),
      providerType: params.providerType,
      providerName: clampString(params.providerName, 100, 'The City Bank PLC'),
      accountHolderName: clampString(params.accountHolderName, 120, 'Owner Admin'),
      maskedAccountNumber: clampString(maskData.maskedAccountNumber, 60),
      accountType: params.accountType,
      bankBranch: clampString(params.bankBranch || '', 120),
      routingNumber: clampString(params.routingNumber || '', 40),
      isDefault: Boolean(params.isDefault),
      verificationStatus: 'VERIFIED',
      minWithdrawalBdt: cleanMin,
      autoPayoutEnabled: Boolean(params.autoPayoutEnabled),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'ADD_PAYOUT_DESTINATION',
      targetType: 'PAYOUT_METHOD',
      targetId: methodId,
      details: `Configured ${params.providerName} (${maskData.maskedAccountNumber}) [${maskData.verificationDigest}] · Min withdrawal: ৳${cleanMin.toLocaleString()} BDT.`,
    });

    return methodId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePayoutMethodPreferences(params: {
  ownerId: string;
  methodId: string;
  isDefault: boolean;
  minWithdrawalBdt: number;
  autoPayoutEnabled: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'SUSPENDED';
}): Promise<void> {
  const path = `payout_methods/${params.methodId}`;
  const cleanMin = Math.max(500, Math.min(5000000, Math.round(params.minWithdrawalBdt)));

  try {
    await updateDoc(doc(db, 'payout_methods', params.methodId), {
      isDefault: params.isDefault,
      minWithdrawalBdt: cleanMin,
      autoPayoutEnabled: params.autoPayoutEnabled,
      verificationStatus: params.verificationStatus,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'UPDATE_PAYOUT_PREFERENCES',
      targetType: 'PAYOUT_METHOD',
      targetId: params.methodId,
      details: `Updated payout method ${params.methodId}: Default=${params.isDefault}, AutoPayout=${params.autoPayoutEnabled}, Min=৳${cleanMin.toLocaleString()} BDT.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removePayoutMethod(ownerId: string, method: PayoutMethod): Promise<void> {
  const path = `payout_methods/${method.id}`;
  try {
    await deleteDoc(doc(db, 'payout_methods', method.id));
    await recordAuditLog({
      ownerId,
      actor: 'OWNER_ADMIN',
      action: 'REMOVE_PAYOUT_METHOD',
      targetType: 'PAYOUT_METHOD',
      targetId: method.id,
      details: `Removed payout method ${method.providerName} (${method.maskedAccountNumber}).`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function calculatePayoutFeeBdt(providerType: PayoutProviderType, amountBdt: number): number {
  if (providerType === PayoutProviderType.BANK_BEFTN) {
    // Bangladesh Bank BEFTN is ৳0 free
    return 0;
  }
  if (providerType === PayoutProviderType.BANK_NPSB) {
    // Standard instant NPSB flat fee ৳15 BDT
    return 15;
  }
  if (providerType === PayoutProviderType.PAYONEER) {
    // 2.0% Payoneer withdrawal fee
    return Math.round(amountBdt * 0.02);
  }
  if (providerType === PayoutProviderType.WISE) {
    // 1.0% Wise settlement fee
    return Math.round(amountBdt * 0.01);
  }
  // SWIFT Wire flat fee ৳500 BDT
  return 500;
}

export async function initiateWithdrawalRequest(params: {
  ownerId: string;
  method: PayoutMethod;
  requestedAmountBdt: number;
  executionMode: WithdrawalMode;
  availableBalanceBdt: number;
}): Promise<{ withdrawalId: string; status: WithdrawalStatus; notice: string }> {
  const cleanAmount = Math.round(params.requestedAmountBdt);
  if (cleanAmount < params.method.minWithdrawalBdt) {
    throw new Error(
      `Minimum withdrawal amount for ${params.method.providerName} is ৳${params.method.minWithdrawalBdt.toLocaleString()} BDT.`
    );
  }
  if (cleanAmount > params.availableBalanceBdt) {
    throw new Error(
      `Requested amount (৳${cleanAmount.toLocaleString()} BDT) exceeds genuinely withdrawable balance (৳${params.availableBalanceBdt.toLocaleString()} BDT).`
    );
  }

  const feeBdt = calculatePayoutFeeBdt(params.method.providerType, cleanAmount);
  const netBdt = Math.max(0, cleanAmount - feeBdt);
  const withdrawalId = safeId('wd');
  const idempotencyKey = `IDM-${params.ownerId.slice(0, 6)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
  const providerSummary = clampString(
    `${params.method.providerName} (${params.method.maskedAccountNumber})`,
    140
  );

  let initialStatus = WithdrawalStatus.AWAITING_MANUAL_TRANSFER;
  let transferReference = '';
  let failureReason = '';
  let notice =
    'Manual withdrawal request created. Transfer funds via your official Bank BEFTN/NPSB or Payoneer/Wise portal and enter the clearing reference ID to finalize reconciliation.';

  if (params.executionMode === WithdrawalMode.AUTO_API_DISBURSEMENT) {
    // Attempt server-side official API disbursement
    const apiRes = await fetch('/api/payouts/execute-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey,
        withdrawalId,
        requestedAmountBdt: cleanAmount,
        providerSummary,
      }),
    });
    const apiData = await apiRes.json();

    if (!apiRes.ok) {
      throw new Error(apiData.message || apiData.error || 'Automatic payout API rejected the request.');
    }

    initialStatus = WithdrawalStatus.PROCESSING_API;
    transferReference = apiData.transferReference || '';
    notice = apiData.message || 'Disbursement sent to official gateway.';
  }

  const path = `withdrawals/${withdrawalId}`;
  try {
    await setDoc(doc(db, 'withdrawals', withdrawalId), {
      ownerId: clampString(params.ownerId, 128),
      payoutMethodId: params.method.id,
      providerSummary,
      executionMode: params.executionMode,
      requestedAmountBdt: cleanAmount,
      feeAmountBdt: feeBdt,
      netPayoutBdt: netBdt,
      status: initialStatus,
      idempotencyKey: clampString(idempotencyKey, 120),
      transferReference: clampString(transferReference, 160),
      failureReason: clampString(failureReason, 300),
      retryCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'INITIATE_WITHDRAWAL_REQUEST',
      targetType: 'WITHDRAWAL',
      targetId: withdrawalId,
      details: `Initiated ${params.executionMode} withdrawal of ৳${cleanAmount.toLocaleString()} BDT (Net: ৳${netBdt.toLocaleString()} BDT) to ${providerSummary} · Idempotency: ${idempotencyKey}.`,
    });

    return { withdrawalId, status: initialStatus, notice };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function confirmManualWithdrawalTransfer(params: {
  ownerId: string;
  withdrawal: WithdrawalRequest;
  officialTransferRef: string;
}): Promise<void> {
  const cleanRef = clampString(params.officialTransferRef, 160);
  if (cleanRef.length < 4) {
    throw new Error('Please provide a valid official Bank BEFTN/NPSB or Payoneer/Wise Transfer Reference ID (min 4 characters).');
  }

  const wdPath = `withdrawals/${params.withdrawal.id}`;
  const ledgerId = safeId('led');
  const ledgerPath = `ledger_entries/${ledgerId}`;

  try {
    await updateDoc(doc(db, 'withdrawals', params.withdrawal.id), {
      status: WithdrawalStatus.COMPLETED,
      transferReference: cleanRef,
      failureReason: '',
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'ledger_entries', ledgerId), {
      ownerId: clampString(params.ownerId, 128),
      txnReference: cleanRef,
      entryType: LedgerEntryType.DEBIT_WITHDRAWAL,
      source: clampString(params.withdrawal.providerSummary, 120),
      description: clampString(
        `Verified payout withdrawal (${params.withdrawal.executionMode}) · Idempotency ${params.withdrawal.idempotencyKey}`,
        300
      ),
      currency: 'BDT',
      grossAmountBdt: params.withdrawal.requestedAmountBdt,
      feeAmountBdt: params.withdrawal.feeAmountBdt,
      netAmountBdt: params.withdrawal.netPayoutBdt,
      reconciliationStatus: ReconciliationStatus.RECONCILED,
      proofReference: cleanRef,
      relatedJobId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'CONFIRM_PAYOUT_COMPLETED',
      targetType: 'WITHDRAWAL',
      targetId: params.withdrawal.id,
      details: `Confirmed payout completion for ${params.withdrawal.providerSummary}. Amount: ৳${params.withdrawal.requestedAmountBdt.toLocaleString()} BDT · Official TrxID/Ref: ${cleanRef}.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${wdPath} -> ${ledgerPath}`);
  }
}

export async function markWithdrawalFailed(params: {
  ownerId: string;
  withdrawal: WithdrawalRequest;
  reason: string;
}): Promise<void> {
  const path = `withdrawals/${params.withdrawal.id}`;
  const cleanReason = clampString(params.reason, 300, 'Transfer rejected or timed out by gateway.');
  try {
    await updateDoc(doc(db, 'withdrawals', params.withdrawal.id), {
      status: WithdrawalStatus.FAILED,
      failureReason: cleanReason,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'MARK_WITHDRAWAL_FAILED',
      targetType: 'WITHDRAWAL',
      targetId: params.withdrawal.id,
      details: `Withdrawal ${params.withdrawal.id} marked FAILED. Reason: ${cleanReason}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function retryFailedWithdrawal(params: {
  ownerId: string;
  withdrawal: WithdrawalRequest;
}): Promise<void> {
  if (params.withdrawal.status !== WithdrawalStatus.FAILED) {
    throw new Error('Only failed withdrawals can be retried.');
  }
  const path = `withdrawals/${params.withdrawal.id}`;
  const nextRetry = Math.min(20, (params.withdrawal.retryCount || 0) + 1);

  try {
    await updateDoc(doc(db, 'withdrawals', params.withdrawal.id), {
      status: WithdrawalStatus.AWAITING_MANUAL_TRANSFER,
      failureReason: '',
      retryCount: nextRetry,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      ownerId: params.ownerId,
      actor: 'OWNER_ADMIN',
      action: 'RETRY_FAILED_WITHDRAWAL',
      targetType: 'WITHDRAWAL',
      targetId: params.withdrawal.id,
      details: `Retried withdrawal ${params.withdrawal.id} (Attempt #${nextRetry}) with idempotency lock ${params.withdrawal.idempotencyKey} to prevent duplicate payout.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function computeFinancialMetrics(
  jobs: JobRecord[],
  ledgerEntries: LedgerEntry[],
  withdrawals: WithdrawalRequest[]
): FinancialMetrics {
  let grossIncomeBdt = 0;
  let verifiedIncomeBdt = 0;
  let platformFeesBdt = 0;
  let totalExpensesBdt = 0;
  let refundsBdt = 0;

  for (const entry of ledgerEntries) {
    if (entry.reconciliationStatus !== ReconciliationStatus.RECONCILED) {
      continue;
    }
    if (entry.entryType === LedgerEntryType.CREDIT_PAYMENT) {
      grossIncomeBdt += entry.grossAmountBdt;
      platformFeesBdt += entry.feeAmountBdt;
      verifiedIncomeBdt += entry.netAmountBdt;
    } else if (entry.entryType === LedgerEntryType.DEBIT_PLATFORM_FEE) {
      platformFeesBdt += entry.netAmountBdt;
      verifiedIncomeBdt -= entry.netAmountBdt;
    } else if (entry.entryType === LedgerEntryType.DEBIT_EXPENSE) {
      totalExpensesBdt += entry.netAmountBdt;
    } else if (entry.entryType === LedgerEntryType.DEBIT_REFUND) {
      refundsBdt += entry.netAmountBdt;
      verifiedIncomeBdt -= entry.netAmountBdt;
    }
  }

  // Pending / Estimated payments: strictly from unpaid active/invoiced jobs (NEVER counted as received income)
  let pendingPaymentsBdt = 0;
  for (const job of jobs) {
    if (
      job.stage === JobStage.DELIVERED_INVOICED ||
      job.stage === JobStage.IN_PROGRESS ||
      job.stage === JobStage.PROPOSAL_READY
    ) {
      pendingPaymentsBdt += job.estimatedBdt;
    }
  }

  let totalWithdrawalsBdt = 0;
  let lockedInProcessingWithdrawalsBdt = 0;

  for (const wd of withdrawals) {
    if (wd.status === WithdrawalStatus.COMPLETED) {
      totalWithdrawalsBdt += wd.requestedAmountBdt;
    } else if (
      wd.status === WithdrawalStatus.AWAITING_MANUAL_TRANSFER ||
      wd.status === WithdrawalStatus.PROCESSING_API ||
      wd.status === WithdrawalStatus.PENDING_APPROVAL
    ) {
      lockedInProcessingWithdrawalsBdt += wd.requestedAmountBdt;
    }
  }

  const netProfitBdt = verifiedIncomeBdt - totalExpensesBdt;
  const availableWithdrawalBalanceBdt = Math.max(
    0,
    netProfitBdt - totalWithdrawalsBdt - lockedInProcessingWithdrawalsBdt
  );

  return {
    grossIncomeBdt,
    verifiedIncomeBdt,
    platformFeesBdt,
    pendingPaymentsBdt,
    totalExpensesBdt,
    refundsBdt,
    netProfitBdt,
    totalWithdrawalsBdt,
    lockedInProcessingWithdrawalsBdt,
    availableWithdrawalBalanceBdt,
  };
}

export function subscribeOwnerCollections(
  ownerId: string,
  callbacks: {
    onJobs: (jobs: JobRecord[]) => void;
    onLedger: (entries: LedgerEntry[]) => void;
    onPayoutMethods: (methods: PayoutMethod[]) => void;
    onWithdrawals: (withdrawals: WithdrawalRequest[]) => void;
    onAuditLogs: (logs: AuditLog[]) => void;
  }
): () => void {
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const ledgerQuery = query(
    collection(db, 'ledger_entries'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const methodsQuery = query(
    collection(db, 'payout_methods'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const withdrawalsQuery = query(
    collection(db, 'withdrawals'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const logsQuery = query(
    collection(db, 'audit_logs'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );

  const unsubJobs = onSnapshot(
    jobsQuery,
    (snap) => {
      callbacks.onJobs(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobRecord, 'id'>) }))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'jobs')
  );

  const unsubLedger = onSnapshot(
    ledgerQuery,
    (snap) => {
      callbacks.onLedger(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LedgerEntry, 'id'>) }))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'ledger_entries')
  );

  const unsubMethods = onSnapshot(
    methodsQuery,
    (snap) => {
      callbacks.onPayoutMethods(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PayoutMethod, 'id'>) }))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'payout_methods')
  );

  const unsubWithdrawals = onSnapshot(
    withdrawalsQuery,
    (snap) => {
      callbacks.onWithdrawals(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WithdrawalRequest, 'id'>) }))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawals')
  );

  const unsubLogs = onSnapshot(
    logsQuery,
    (snap) => {
      callbacks.onAuditLogs(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'audit_logs')
  );

  return () => {
    unsubJobs();
    unsubLedger();
    unsubMethods();
    unsubWithdrawals();
    unsubLogs();
  };
}
