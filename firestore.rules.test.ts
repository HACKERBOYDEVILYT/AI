/**
 * Firestore Security Rules Test Suite — Dirty Dozen Verification
 * Verifies that all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TEST_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Ledger Entry (isBypassAudit: true)',
    collection: 'ledger_entries',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof (email_verified: false)',
    collection: 'payout_methods',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-Tenant Identity Spoofing on Job Creation (ownerId != auth.uid)',
    collection: 'jobs',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Ledger Amount Tampering via Update (modifying netAmountBdt)',
    collection: 'ledger_entries',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Value Poisoning on Update (invalid enum on reconciliationStatus)',
    collection: 'ledger_entries',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Path ID Poisoning (invalid characters in document ID)',
    collection: 'payout_methods',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client Timestamp (createdAt != request.time)',
    collection: 'ledger_entries',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Mutating Immortal createdAt or ownerId on Job Update',
    collection: 'jobs',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Blanket List Scraping on Payout Methods (unfiltered list query)',
    collection: 'payout_methods',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Deleting Immutable Audit Log or Ledger Entry',
    collection: 'audit_logs',
    operation: 'delete',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Negative Withdrawal Amount Exploit (requestedAmountBdt < 500)',
    collection: 'withdrawals',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Orphan Withdrawal Without Existing Payout Method',
    collection: 'withdrawals',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
];
