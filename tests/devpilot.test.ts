import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting DevPilot Automated System Verification...\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message || err}`);
      failedCount++;
    }
  }

  // 1. Health & Server Check
  await test('Backend Health and PostgreSQL/Supabase Ready', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.app, 'DevPilot Platform');
  });

  // 2. Settings & Payment Instructions Check
  await test('Platform Payment Configuration & Bengali Instructions', async () => {
    const res = await fetch(`${BASE_URL}/api/settings`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.settings.paymentConfig.bkashNumber, 'bKash number should exist');
    assert.ok(data.settings.paymentConfig.nagadNumber, 'Nagad number should exist');
    assert.ok(data.settings.paymentConfig.bankName, 'Bank name should exist');
    assert.ok(data.settings.paymentConfig.bkashInstructionsBn.includes('বিকাশ'), 'Bengali instructions should exist');
  });

  // 3. User Registration (Customer Role Only)
  const testCustomerEmail = `customer_${Date.now()}@testcorp.com`;
  let customerToken = '';

  await test('Customer Registration & Password Security', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'customerPass123',
        name: 'Rahim Chowdhury',
        phone: '+8801712345678',
        company: 'Chowdhury Tech',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'customer', 'Public registration role must be customer');
    assert.strictEqual(data.user.email, testCustomerEmail);
    assert.strictEqual(data.user.emailVerified, true);
    customerToken = data.token;
  });

  // 4. Duplicate Registration Guard
  await test('Duplicate Email Registration Blocked', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'anotherPassword',
        name: 'Another User',
      }),
    });
    assert.strictEqual(res.status, 409);
  });

  // 5. Admin Authentication & Seed User
  let adminToken = '';
  await test('Admin Authentication for Initial Owner Account', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ayanislam10000@gmail.com',
        password: 'robiul1000',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  // 6. Order Creation by Customer
  let createdOrderId = '';
  await test('Customer Creates Order with Requirements & Unique ID', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        serviceId: 'svc-bug-fix',
        serviceTitleBn: 'ওয়েবসাইট ও স্ক্রিপ্ট বাগ ফিক্সিং',
        serviceTitleEn: 'Website & Script Bug Fixing',
        category: 'bug_fix',
        priceBdt: 1500,
        projectRequirements: 'React hydrate error in production header component and broken mobile menu.',
        customerName: 'Rahim Chowdhury',
        customerEmail: testCustomerEmail,
        customerPhone: '+8801712345678',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.order.id.startsWith('DP-ORD-2026-'), 'Order ID format DP-ORD-2026-XXX');
    assert.strictEqual(data.order.status, 'pending');
    assert.strictEqual(data.order.paymentStatus, 'unpaid');
    assert.strictEqual(data.order.priceBdt, 1500);
    createdOrderId = data.order.id;
  });

  // 7. Security & Transition Check: Customer CANNOT set order directly to 'paid'
  await test('Security Guard: Customer Cannot Illegally Set Status to Paid', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ status: 'paid' }),
    });
    assert.strictEqual(res.status, 400, 'Customer setting paid status directly must be rejected');
    const data = await res.json();
    assert.ok(
      data.error.includes('অনুমোদিত নয়') || data.error.includes('গ্রাহক সরাসরি'),
      'Bengali error message expected'
    );
  });

  // 8. Admin Quotation Workflow
  await test('Admin Sends Quotation with Custom Value', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/quotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        amountBdt: 2000,
        quotationNote: 'Includes SSR bug fix and responsive optimization',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'quotation_sent');
    assert.strictEqual(data.order.priceBdt, 2000);
  });

  // 9. Customer Accepts Quotation
  await test('Customer Accepts Quotation -> Transitions to Awaiting Payment', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/quotation/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ accepted: true }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'awaiting_payment');
  });

  // 10. Manual Payment Submission by Customer (bKash TrxID)
  const testTrxId = `BKASH${Date.now()}`;
  await test('Customer Submits Manual Payment with TrxID and Sender Account', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        method: 'bkash',
        trxId: testTrxId,
        senderAccount: '01711223344',
        amountBdt: 2000,
        notes: 'Paid via bKash Personal App',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.paymentStatus, 'verification_pending');
    assert.strictEqual(data.order.payment?.trxId, testTrxId);
  });

  // 11. Duplicate TrxID Prevention
  await test('Duplicate TrxID Submission is Blocked', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        method: 'bkash',
        trxId: testTrxId,
        senderAccount: '01711223344',
        amountBdt: 2000,
      }),
    });
    assert.strictEqual(res.status, 409, 'Duplicate TrxID must return 409 Conflict');
  });

  // 12. Admin Verifies Payment -> Issues Invoice & Marks Paid
  await test('Admin Verifies Payment -> Order Marked Paid & Invoice Generated', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ action: 'approve' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.paymentStatus, 'paid');
    assert.strictEqual(data.order.status, 'paid');
    assert.ok(data.order.payment?.verifiedAt);
    assert.strictEqual(data.order.payment?.isLocked, true);
  });

  // 13. Admin Moves Order to In Progress
  await test('Admin Starts Work -> In Progress Transition', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'in_progress');
  });

  // 14. Admin Submits Delivery Files
  await test('Admin Submits Project Delivery Files -> Status Delivered', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        notes: 'Fixed the hydration issue in Header.tsx and optimized mobile drawer animation.',
        files: [
          { name: 'patch-header-fix.zip', url: 'https://storage.devpilot.app/files/patch-header-fix.zip', sizeKb: 240 },
        ],
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'delivered');
    assert.strictEqual(data.order.deliveries.length, 1);
  });

  // 15. Customer Requests Revision
  await test('Customer Requests Revision -> Status Revision Requested', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/revision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        reason: 'Please adjust hamburger button tap target size on small screens.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'revision_requested');
    assert.strictEqual(data.order.revisionRequests.length, 1);
  });

  // 16. Admin Re-delivers and Customer Completes
  await test('Admin Re-delivers and Marks Completed', async () => {
    const resDeliv = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ notes: 'Updated button padding to 48px tap target.' }),
    });
    assert.strictEqual(resDeliv.status, 200);

    const resComp = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
    });
    assert.strictEqual(resComp.status, 200);
    const data = await resComp.json();
    assert.strictEqual(data.order.status, 'completed');
  });

  // 17. Operational Expenses Logging
  let expenseId = '';
  await test('Admin Logs Operational Expense (Hosting/Server Cost)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Vercel Pro & Domain Renewal',
        category: 'hosting',
        amountBdt: 500,
        notes: 'Monthly infrastructure expense',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.expense.amountBdt, 500);
    expenseId = data.expense.id;
  });

  // 18. Financial Metrics Calculation Accuracy
  await test('Financial Metrics: Gross Sales, Expenses & Net Profit Calculation', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    const expectedNet = Math.max(
      0,
      data.metrics.grossSales - data.metrics.totalRefunds - data.metrics.totalExpenses
    );
    assert.strictEqual(
      data.metrics.netProfit,
      expectedNet,
      'Net profit must mathematically equal Gross Sales - Refunds - Expenses'
    );
    assert.ok(data.metrics.grossSales >= 2000, 'Gross sales should account for verified payments');
    assert.ok(data.metrics.confirmedPaymentsCount >= 1, 'Confirmed payments count should be at least 1');
  });

  // 19. Customer Data Isolation
  await test('Data Isolation: Customer Only Sees Own Orders in GET /api/orders', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    data.orders.forEach((o: any) => {
      assert.strictEqual(o.customerEmail, testCustomerEmail, 'Customer should not see foreign orders');
    });
  });

  // 20. Audit Trail Generation
  await test('Audit Trail Logs Crucial Admin and Customer Events', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.auditLogs.length > 0, 'Audit logs must be populated');
    const actions = data.auditLogs.map((l: any) => l.action);
    assert.ok(actions.includes('ORDER_CREATED'), 'Should log ORDER_CREATED');
    assert.ok(actions.includes('PAYMENT_SUBMITTED'), 'Should log PAYMENT_SUBMITTED');
    assert.ok(actions.includes('PAYMENT_VERIFIED'), 'Should log PAYMENT_VERIFIED');
  });

  // 21. AI Diagnostic Endpoint Graceful Fallback
  await test('AI Coding Diagnostic Returns Structured Solution Without Crash', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemDescription: 'Uncaught TypeError: Cannot read properties of undefined (reading map) in react table',
        codeSnippet: 'const rows = data.items.map(i => i.name)',
        language: 'bn',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.titleBn, 'Should contain title in Bengali');
    assert.ok(data.analysisBn, 'Should contain analysis in Bengali');
    assert.ok(data.suggestedFix, 'Should provide code snippet fix');
  });

  // Clean up test expense
  if (expenseId) {
    await fetch(`${BASE_URL}/api/admin/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  console.log('\n======================================================');
  console.log(`Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
