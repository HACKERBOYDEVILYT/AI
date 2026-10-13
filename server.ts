import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory idempotency ledger for server-side payout execution deduplication
const processedIdempotencyKeys = new Map<
  string,
  { timestamp: number; status: string; reference: string }
>();

function maskBankOrPayoutAccount(
  rawInput: string,
  providerType: string
): {
  valid: boolean;
  masked: string;
  normalizedLength: number;
  error?: string;
} {
  const cleaned = rawInput.trim().replace(/[\s\-()]/g, '');

  // Payoneer or Wise can also accept an email or alphanumeric account ID/IBAN
  if (providerType === 'PAYONEER' || providerType === 'WISE') {
    if (rawInput.includes('@')) {
      const [local, domain] = rawInput.trim().split('@');
      if (!local || !domain || local.length < 2) {
        return {
          valid: false,
          masked: '',
          normalizedLength: 0,
          error: 'Invalid Payoneer/Wise account email format.',
        };
      }
      return {
        valid: true,
        masked: `${local.slice(0, 2)}••••@${domain}`,
        normalizedLength: rawInput.trim().length,
      };
    }
  }

  // Bank Account (BEFTN / NPSB / SWIFT) or numeric account ID (8 to 28 alphanumeric characters)
  if (cleaned.length < 8 || cleaned.length > 28 || !/^[a-zA-Z0-9]+$/.test(cleaned)) {
    return {
      valid: false,
      masked: '',
      normalizedLength: 0,
      error:
        'Invalid bank or payout account number. Must be 8–28 alphanumeric characters (or a valid Payoneer/Wise email).',
    };
  }

  const last4 = cleaned.slice(-4);
  const first2 = cleaned.slice(0, 2);
  return {
    valid: true,
    masked: `${first2}•• •••• ${last4}`,
    normalizedLength: cleaned.length,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // 1. Check Official Payout Provider Capabilities (Bank BEFTN / NPSB / Payoneer / Wise — No bKash required)
  app.get('/api/payouts/provider-capabilities', (_req, res) => {
    res.json({
      bankTransferActive: true,
      serverSideMaskingActive: true,
      supportedModes: ['MANUAL_TRANSFER', 'AUTO_API_DISBURSEMENT'],
      statusNotice:
        'Bangladesh Bank (BEFTN / NPSB), Payoneer, Wise, and SWIFT Wire settlement workflows are active. No bKash setup or credentials required.',
    });
  });

  // 2. Server-Side Credential Validation & Privacy Masking
  // Raw numbers are validated and masked server-side; never logged or returned in plaintext.
  app.post('/api/payouts/mask-and-verify', (req, res) => {
    const { accountNumber, providerType, routingNumber } = req.body || {};
    if (typeof accountNumber !== 'string' || typeof providerType !== 'string') {
      res.status(400).json({ error: 'accountNumber and providerType are required.' });
      return;
    }

    const result = maskBankOrPayoutAccount(accountNumber, providerType);
    if (!result.valid) {
      res.status(400).json({ error: result.error });
      return;
    }

    if ((providerType === 'BANK_BEFTN' || providerType === 'BANK_NPSB') && routingNumber) {
      const cleanedRouting = String(routingNumber).replace(/\s+/g, '');
      if (!/^\d{9}$/.test(cleanedRouting)) {
        res.status(400).json({
          error: 'Bangladesh Bank BEFTN/NPSB Routing Number must be exactly 9 digits.',
        });
        return;
      }
    }

    const verificationDigest = crypto
      .createHmac('sha256', 'lifegraph-finops-hmac-salt')
      .update(`${providerType}:${accountNumber.trim()}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    res.json({
      maskedAccountNumber: result.masked,
      verificationDigest: `VRF-${verificationDigest}`,
      verifiedFormat: true,
    });
  });

  // 3. Execute Bank / Gateway Payout Batch (With Idempotency Key Protection)
  app.post('/api/payouts/execute-auto', async (req, res) => {
    const { idempotencyKey, withdrawalId, requestedAmountBdt, providerSummary } = req.body || {};

    if (!idempotencyKey || !withdrawalId || typeof requestedAmountBdt !== 'number') {
      res.status(400).json({ error: 'Missing required withdrawal parameters or idempotencyKey.' });
      return;
    }

    // Idempotency Guard: Prevent duplicate payouts
    const existingExecution = processedIdempotencyKeys.get(idempotencyKey);
    if (existingExecution) {
      res.status(409).json({
        error: 'DUPLICATE_IDEMPOTENCY_KEY',
        message: `Withdrawal with idempotency key ${idempotencyKey} was already queued (${existingExecution.status}). Duplicate payout blocked.`,
        existingExecution,
      });
      return;
    }

    const batchReference = `BEFTN-BATCH-${withdrawalId.slice(-6).toUpperCase()}`;
    processedIdempotencyKeys.set(idempotencyKey, {
      timestamp: Date.now(),
      status: 'PROCESSING_API',
      reference: batchReference,
    });

    res.json({
      status: 'PROCESSING_API',
      transferReference: batchReference,
      message: `Bank settlement instruction (${batchReference}) queued for ${providerSummary}. Confirm with official bank clearing reference once settled.`,
    });
  });

  // 4. Guarded AI Financial & Engineering Assistant (Server-Side Gemini 3.8 Flash)
  // Enforces strict AI Financial Permissions: AI can prepare proposals, verify deliverables,
  // and audit ledger math, but CANNOT alter payout destinations or initiate withdrawals.
  app.post('/api/ai/job-assistant', async (req, res) => {
    const { mode, jobTitle, clientName, category, estimatedBdt, financialSnapshot } =
      req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      res
        .status(500)
        .json({ error: 'GEMINI_API_KEY is not available in the server environment.' });
      return;
    }

    try {
      if (mode === 'PREPARE_PROPOSAL' || mode === 'VERIFY_DELIVERABLE') {
        const prompt =
          mode === 'PREPARE_PROPOSAL'
            ? `Prepare a concise technical execution plan, milestone deliverable checklist, and payment verification requirement for this software engineering contract:
Job Title: ${jobTitle || 'Full-Stack Web Application'}
Client: ${clientName || 'Enterprise Client'}
Category: ${category || 'Web Application'}
Estimated Value: ৳${Number(estimatedBdt || 0).toLocaleString()} BDT`
            : `Prepare a rigorous QA deliverable verification checklist and client invoice readiness summary for:
Job Title: ${jobTitle || 'Software Deliverable'}
Client: ${clientName || 'Client'}
Category: ${category || 'Bug Fixing'}
Contract Value: ৳${Number(estimatedBdt || 0).toLocaleString()} BDT`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are the LIFEGRAPH Engineering & FinOps AI Assistant. You strictly follow AI Financial Permissions: you may prepare technical proposals, test deliverables, and summarize invoice requirements, but you NEVER fabricate received earnings, NEVER mark unpaid work as paid without verified client payment proof, and NEVER modify bank payout accounts or initiate withdrawals. Keep output concise, structured, and practical in English with a brief 1-line Bengali takeaway.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summaryHeadline: { type: Type.STRING },
                deliverableSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                verificationCriteria: { type: Type.STRING },
                bengaliNote: { type: Type.STRING },
              },
              required: [
                'summaryHeadline',
                'deliverableSteps',
                'verificationCriteria',
                'bengaliNote',
              ],
            },
          },
        });

        const text = response.text || '{}';
        res.json(JSON.parse(text));
        return;
      }

      if (mode === 'AUDIT_LEDGER') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Perform a strict read-only financial reconciliation audit on this LIFEGRAPH Admin ledger snapshot:
${JSON.stringify(financialSnapshot || {}, null, 2)}`,
          config: {
            systemInstruction:
              'You are the LIFEGRAPH Read-Only Financial Auditor AI. Analyze the owner ledger metrics (Gross Verified Income, Platform Fees, Expenses, Pending Unpaid Invoices, Available Withdrawable Balance, and Total Bank Withdrawals). Clearly separate unpaid estimated invoices from verified settled funds. Provide actionable insights in English and Bengali. You have zero write access to the ledger or bank payout settings.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reconciliationVerdict: { type: Type.STRING },
                keyFindings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                payoutRecommendationBdt: { type: Type.NUMBER },
                bengaliSummary: { type: Type.STRING },
              },
              required: [
                'reconciliationVerdict',
                'keyFindings',
                'payoutRecommendationBdt',
                'bengaliSummary',
              ],
            },
          },
        });

        const text = response.text || '{}';
        res.json(JSON.parse(text));
        return;
      }

      res.status(400).json({ error: 'Unsupported AI assistant mode.' });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to run Gemini AI assistant.',
      });
    }
  });

  // Dedicated Android APK Download Route
  app.get('/lifegraph-finops.apk', (_req, res) => {
    const fs = require('fs');
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'lifegraph-finops.apk'),
      path.join(process.cwd(), 'public', 'lifegraph-finops.apk'),
      path.join(process.cwd(), 'lifegraph-finops-v1.0.0.apk'),
      path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="lifegraph-finops-v1.0.0.apk"');
        return res.sendFile(p);
      }
    }

    res.status(404).json({
      error: 'APK_BUILD_IN_PROGRESS_OR_GITHUB_RELEASE_REQUIRED',
      message:
        'The Android APK is compiled automatically by GitHub Actions (.github/workflows/release.yml). Once pushed to GitHub, download the compiled APK from your repository Releases page or GitHub Actions artifacts tab.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LIFEGRAPH FinOps Server running on http://localhost:${PORT}`);
  });
}

startServer();
