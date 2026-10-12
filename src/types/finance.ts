import { Timestamp } from 'firebase/firestore';

export enum JobStage {
  DISCOVERED = 'DISCOVERED',
  PROPOSAL_READY = 'PROPOSAL_READY',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED_INVOICED = 'DELIVERED_INVOICED',
  PAID_VERIFIED = 'PAID_VERIFIED',
  REFUNDED = 'REFUNDED',
}

export enum LedgerEntryType {
  CREDIT_PAYMENT = 'CREDIT_PAYMENT',
  DEBIT_PLATFORM_FEE = 'DEBIT_PLATFORM_FEE',
  DEBIT_EXPENSE = 'DEBIT_EXPENSE',
  DEBIT_REFUND = 'DEBIT_REFUND',
  DEBIT_WITHDRAWAL = 'DEBIT_WITHDRAWAL',
}

export enum ReconciliationStatus {
  RECONCILED = 'RECONCILED',
  PENDING_CLEARANCE = 'PENDING_CLEARANCE',
  DISPUTED = 'DISPUTED',
}

export enum PayoutProviderType {
  BANK_BEFTN = 'BANK_BEFTN',
  BANK_NPSB = 'BANK_NPSB',
  PAYONEER = 'PAYONEER',
  WISE = 'WISE',
  SWIFT_WIRE = 'SWIFT_WIRE',
}

export enum PayoutAccountType {
  PERSONAL = 'PERSONAL',
  MERCHANT = 'MERCHANT',
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  BUSINESS = 'BUSINESS',
}

export enum WithdrawalMode {
  MANUAL_TRANSFER = 'MANUAL_TRANSFER',
  AUTO_API_DISBURSEMENT = 'AUTO_API_DISBURSEMENT',
}

export enum WithdrawalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  AWAITING_MANUAL_TRANSFER = 'AWAITING_MANUAL_TRANSFER',
  PROCESSING_API = 'PROCESSING_API',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface JobRecord {
  id: string;
  ownerId: string;
  title: string;
  clientName: string;
  platform: 'Upwork' | 'Fiverr' | 'Direct Contract' | 'GitHub Bounty' | 'Retainer';
  category: 'Web Application' | 'Bug Fixing' | 'Full-Stack Feature' | 'Security Audit' | 'API Integration';
  stage: JobStage;
  estimatedBdt: number;
  verifiedGrossBdt: number;
  platformFeeBdt: number;
  netEarnedBdt: number;
  paymentProofRef: string;
  aiSummary: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LedgerEntry {
  id: string;
  ownerId: string;
  txnReference: string;
  entryType: LedgerEntryType;
  source: string;
  description: string;
  currency: 'BDT' | 'USD';
  grossAmountBdt: number;
  feeAmountBdt: number;
  netAmountBdt: number;
  reconciliationStatus: ReconciliationStatus;
  proofReference: string;
  relatedJobId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PayoutMethod {
  id: string;
  ownerId: string;
  providerType: PayoutProviderType;
  providerName: string;
  accountHolderName: string;
  maskedAccountNumber: string;
  accountType: PayoutAccountType;
  bankBranch: string;
  routingNumber: string;
  isDefault: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  minWithdrawalBdt: number;
  autoPayoutEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WithdrawalRequest {
  id: string;
  ownerId: string;
  payoutMethodId: string;
  providerSummary: string;
  executionMode: WithdrawalMode;
  requestedAmountBdt: number;
  feeAmountBdt: number;
  netPayoutBdt: number;
  status: WithdrawalStatus;
  idempotencyKey: string;
  transferReference: string;
  failureReason: string;
  retryCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditLog {
  id: string;
  ownerId: string;
  actor: 'OWNER_ADMIN' | 'AI_AGENT_GUARDED' | 'SYSTEM_WEBHOOK';
  action: string;
  targetType: 'JOB' | 'LEDGER' | 'PAYOUT_METHOD' | 'WITHDRAWAL' | 'SECURITY_POLICY';
  targetId: string;
  details: string;
  createdAt: Timestamp;
}

export interface FinancialMetrics {
  grossIncomeBdt: number;
  verifiedIncomeBdt: number;
  platformFeesBdt: number;
  pendingPaymentsBdt: number;
  totalExpensesBdt: number;
  refundsBdt: number;
  netProfitBdt: number;
  totalWithdrawalsBdt: number;
  lockedInProcessingWithdrawalsBdt: number;
  availableWithdrawalBalanceBdt: number;
}

export interface ProviderCapabilities {
  bankTransferActive: boolean;
  serverSideMaskingActive: boolean;
  supportedModes: string[];
  statusNotice: string;
}

export interface AppNotification {
  id: string;
  type: 'PAYMENT_VERIFIED' | 'FUNDS_WITHDRAWABLE' | 'PAYOUT_SUCCEEDED' | 'PAYOUT_FAILED' | 'SECURITY_GUARD';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
