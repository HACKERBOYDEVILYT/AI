# Release Notes — `v1.0.0` (LIFEGRAPH FinOps & Bangladesh Payout Admin)

**Release Tag:** `v1.0.0`  
**Release Title:** LIFEGRAPH Income Admin Panel, Immutable Financial Ledger & Bangladesh Bank Payout System

## Highlights

- **Real-Time Owner Financial Command**: Tracks Gross Verified Income, Verified Net Income, Unpaid Pipeline (strictly isolated from withdrawable balance), Operational Expenses, Net Profit, Available Withdrawal Balance, and Completed Withdrawals in BDT (`৳`).
- **End-to-End Job & Payment Verification Pipeline**: Full contract lifecycle tracking with server-side Gemini 3.8 Flash (`@google/genai`) proposal & deliverable QA assistance and Owner-approved payment proof reconciliation.
- **Bangladesh Bank (BEFTN / NPSB), Payoneer & Wise Payouts**: Server-side account validation and privacy masking (`14•• •••• 5610`), minimum withdrawal thresholds, transparent fee calculation, idempotency protection, and clearing reference confirmation.
- **Zero-Trust Security & Hardened Firestore Rules**: 8-Pillar Firestore Security Rules verified with ESLint (`@firebase/eslint-plugin-security-rules`) and deployed to production (`ai-studio-13942140-941b-484d-abbe-15828f04fa91`), plus step-up `APPROVE` confirmation and append-only audit logs.
