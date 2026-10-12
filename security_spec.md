# LIFEGRAPH FinOps & Bangladesh Payout Admin — Security Specification

## 1. Data Invariants

1. **Owner-Only Isolation & Verified Identity**: Every document in `jobs`, `ledger_entries`, `payout_methods`, `withdrawals`, and `audit_logs` MUST have `ownerId == request.auth.uid`, and the authenticated user MUST have `request.auth.token.email_verified == true` and be an authorized Owner Admin (`isAdmin()`).
2. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) MUST validate the path document ID via `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). `list` operations MUST NOT call `isValidId()` on the collection wildcard variable.
3. **Immutable Financial Ledger**: Documents in `/ledger_entries/{entryId}` cannot be deleted (`allow delete: if false;`). Once created, financial amounts (`grossAmountBdt`, `feeAmountBdt`, `netAmountBdt`, `entryType`, `txnReference`, `ownerId`, `createdAt`) are strictly immutable; only `reconciliationStatus` and `updatedAt` may be updated.
4. **Append-Only Security Audit Logs**: Documents in `/audit_logs/{logId}` are strictly append-only (`allow update, delete: if false;`).
5. **Terminal State Locking**:
   - A `WithdrawalRequest` in `/withdrawals/{withdrawalId}` that reaches a terminal status (`COMPLETED` or `CANCELLED`) cannot be modified unless overridden by `isAdmin()` under strict schema validation.
   - A `JobRecord` in `/jobs/{jobId}` with `stage != 'PAID_VERIFIED'` must have `verifiedGrossBdt == 0` and `netEarnedBdt == 0` on creation unless created directly in `PAID_VERIFIED` stage with non-empty `paymentProofRef`.
6. **Temporal Integrity**: Every `create` operation enforces `incoming().createdAt == request.time`, and every `update` operation enforces `incoming().updatedAt == request.time` and `incoming().createdAt == existing().createdAt`.
7. **Query Enforcer**: Every `allow list` rule explicitly enforces `resource.data.ownerId == request.auth.uid` and `isAdmin()`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Shadow Field Injection on Ledger Entry**:
   `{ ownerId: "uid1", txnReference: "TX1", entryType: "CREDIT_PAYMENT", ..., isBypassAudit: true }` -> Rejected by `hasOnly()`.
2. **Payload 2 — Unverified Email Admin Spoof**:
   Auth token with `email: "ayanislam10000@gmail.com"` and `email_verified: false` -> Rejected by `isVerifiedUser()`.
3. **Payload 3 — Cross-Tenant Identity Spoofing on Job Creation**:
   Authenticated user `"attacker_uid"` sets `ownerId: "victim_uid"` -> Rejected by `data.ownerId == request.auth.uid`.
4. **Payload 4 — Ledger Amount Tampering via Update**:
   Updating `netAmountBdt` from `15000` to `950000` on `/ledger_entries/entry1` -> Rejected by `affectedKeys().hasOnly(['reconciliationStatus', 'updatedAt'])`.
5. **Payload 5 — Value Poisoning on Update**:
   Updating `reconciliationStatus` on `/ledger_entries/entry1` to a 1MB string or invalid enum `"HACKED"` -> Rejected by `isValidLedgerEntry(incoming())` wrapping the update block.
6. **Payload 6 — Path ID Poisoning**:
   Creating `/payout_methods/invalid$id!with*spaces` -> Rejected by `isValidId(methodId)`.
7. **Payload 7 — Forged Client Timestamp (Backdating Ledger)**:
   Creating a ledger entry with `createdAt: Timestamp(2020, 1, 1)` instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
8. **Payload 8 — Mutating Immortal `createdAt` or `ownerId` on Update**:
   Updating `/jobs/job1` with a modified `createdAt` or `ownerId` -> Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`.
9. **Payload 9 — Blanket List Scraping on Payout Methods**:
   Executing an unfiltered `list` query on `/payout_methods` without `where('ownerId', '==', uid)` -> Rejected by `resource.data.ownerId == request.auth.uid`.
10. **Payload 10 — Deleting Audit Log or Ledger Entry**:
    Calling `deleteDoc` on `/audit_logs/log1` or `/ledger_entries/entry1` -> Rejected by `allow delete: if false`.
11. **Payload 11 — Negative Withdrawal Amount Exploit**:
    Creating a withdrawal with `requestedAmountBdt: -50000` to inflate balance -> Rejected by `data.requestedAmountBdt >= 500`.
12. **Payload 12 — Orphan Withdrawal Without Existing Payout Method**:
    Creating `/withdrawals/w1` referencing a non-existent `payoutMethodId` -> Rejected by `exists(/databases/$(database)/documents/payout_methods/$(incoming().payoutMethodId))`.

## 3. Test Runner Verification

See `firestore.rules.test.ts` for the complete test suite verifying that all 12 adversarial payloads return `PERMISSION_DENIED`.
