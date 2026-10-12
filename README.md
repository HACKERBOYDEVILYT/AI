# LIFEGRAPH FinOps & Bangladesh Payout Admin (`v1.0.0`)

Owner-only financial administration console, AI job revenue verification pipeline, immutable financial ledger, and Bangladesh Bank (BEFTN / NPSB), Payoneer, Wise, and SWIFT withdrawal system for **LIFEGRAPH**.

## Live URLs

- **Preview / Shared Application URL**: `https://ais-pre-qtgfaz7r3tj442djj7ihlh-531708784674.asia-southeast1.run.app`
- **Development Environment URL**: `https://ais-dev-qtgfaz7r3tj442djj7ihlh-531708784674.asia-southeast1.run.app`

---

## Core Architecture & Features

1. **Owner-Only Admin Dashboard (`Overview`)**:
   - Real-time Firestore-backed calculation of **Available Withdrawal Balance**, **Verified Net Income**, **Gross Settled Volume**, **Platform Fees**, **Operational Expenses**, **Net Profit**, and **Total Completed Withdrawals**.
   - Strict separation of **Pending / Unpaid Pipeline** invoices from verified received earnings.
   - Daily, Weekly, and Monthly financial charts (`recharts`) + one-click **CSV Financial Report** and **JSON Audit Package** downloads.

2. **AI Job Execution & Payment Proof Pipeline (`Job Pipeline`)**:
   - Tracks contracts from `DISCOVERED` $\to$ `PROPOSAL_READY` $\to$ `IN_PROGRESS` $\to$ `DELIVERED_INVOICED` $\to$ `PAID_VERIFIED`.
   - Server-side **Gemini 3.8 Flash** (`@google/genai`) assistant prepares proposals, verifies code deliverables, and runs read-only ledger audits without write access to financial balances or payout destinations.
   - Explicit Owner step-up approval (`APPROVE`) and payment proof reference required before committing client payments to the ledger.

3. **Immutable Financial Ledger (`Financial Ledger`)**:
   - Append-only ledger (`ledger_entries`) protected by hardened Firestore security rules (`allow delete: if false` and immutable financial amounts).

4. **Bangladesh Bank, Payoneer & Wise Withdrawal System (`Bank & Global Payouts`)**:
   - Supports **Bangladesh Bank BEFTN (৳0 Free)**, **Bangladesh Bank NPSB Instant**, **Payoneer Business**, **Wise Multi-Currency**, and **SWIFT Wire**.
   - Server-side HMAC validation and privacy masking (`/api/payouts/mask-and-verify`) so raw account numbers are never exposed in client documents or logs.
   - Idempotency key locking (`idempotencyKey`), bank clearing reference confirmation, failure tracking, and idempotent retry controls.

---

## Local Development & Production Deployment

```bash
# Install dependencies
npm install

# Run full-stack development server on port 3000
npm run dev

# Build production client bundle
npm run build

# Start production Express + static server on port 3000
npm start
```
