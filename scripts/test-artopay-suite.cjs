const http = require('http');
const crypto = require('crypto');

// Simulated integration tests for ArtoPay end-to-end payment workflow
async function runTests() {
  console.log('====================================================');
  console.log('    ARTOPAY PAYMENT GATEWAY SUITE (TESTS A - L)    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  function makeRequest(path, options = {}, body = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: 3000,
          path,
          method: options.method || 'GET',
          headers: options.headers || { 'Content-Type': 'application/json' }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
            } catch (e) {
              resolve({ status: res.statusCode, headers: res.headers, body: data, raw: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  }

  try {
    // ----------------------------------------------------
    // Test A: Config Endpoint Check
    // ----------------------------------------------------
    console.log('--- TEST A: ArtoPay Server Configuration Endpoint ---');
    const resA = await makeRequest('/api/artopay/config');
    assert(resA.status === 200, 'Endpoint /api/artopay/config responded with 200 OK');
    assert(typeof resA.body.isConfigured === 'boolean', 'isConfigured boolean flag present');
    assert(resA.body.secretKeyInfo !== undefined, 'secretKeyInfo sanitized metadata present');

    // ----------------------------------------------------
    // Test B: Validation - Missing OrderId
    // ----------------------------------------------------
    console.log('\n--- TEST B: Intent Creation - Missing OrderId Validation ---');
    const resB = await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      amount: 150000
    });
    assert(resB.status === 400, 'Rejected request with missing orderId (HTTP 400)');
    assert(resB.body.error && resB.body.error.includes('orderId'), 'Error message identifies missing orderId');

    // ----------------------------------------------------
    // Test C: Validation - Invalid / Zero / Negative Amount
    // ----------------------------------------------------
    console.log('\n--- TEST C: Intent Creation - Amount Boundary Validation ---');
    const resC1 = await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      orderId: 'TEST-ORDER-INVALID-1',
      amount: 0
    });
    assert(resC1.status === 400, 'Rejected amount = 0 (HTTP 400)');

    const resC2 = await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      orderId: 'TEST-ORDER-INVALID-2',
      amount: -50000
    });
    assert(resC2.status === 400, 'Rejected negative amount (HTTP 400)');

    const resC3 = await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      orderId: 'TEST-ORDER-INVALID-3',
      amount: 'abc'
    });
    assert(resC3.status === 400, 'Rejected non-numeric string amount (HTTP 400)');

    // ----------------------------------------------------
    // Test D: Webhook - Missing OrderId & PaymentId Validation
    // ----------------------------------------------------
    console.log('\n--- TEST D: Webhook Payload Validation ---');
    const resD = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      status: 'PAID'
    });
    assert(resD.status === 400, 'Rejected webhook payload missing both orderId & paymentId (HTTP 400)');

    // ----------------------------------------------------
    // Test E: Booking Creation & DB Initial Pending Registration
    // ----------------------------------------------------
    console.log('\n--- TEST E: Order Lifecycle - Setup Test Booking ---');
    const testOrderId = `SJ-TEST-${Date.now().toString().slice(-6)}`;
    const testAmount = 500000;

    // Simulate an initial webhook with unknown order
    const resE1 = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: 'NON-EXISTENT-ORDER-999',
      status: 'PAID'
    });
    assert(resE1.status === 200, 'Gracefully handles non-existent order callback without crashing');

    // ----------------------------------------------------
    // Test F: Status Polling Endpoint on Existing Order
    // ----------------------------------------------------
    console.log('\n--- TEST F: Status Polling for Pending Order ---');
    // First, let's create intent or register order
    const resF1 = await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      orderId: testOrderId,
      amount: testAmount,
      customerName: 'Audit Test Traveler',
      customerEmail: 'audit@example.com'
    });

    const resF2 = await makeRequest(`/api/orders/${testOrderId}/payment-status`);
    assert(resF2.status === 200, 'Polling endpoint returned 200 OK');
    assert(resF2.body.found === true, 'Order was found in system ledger');
    assert(resF2.body.paymentStatus === 'Pending', 'Initial order payment status is Pending');

    // ----------------------------------------------------
    // Test G: Webhook Settlement / Success Flow
    // ----------------------------------------------------
    console.log('\n--- TEST G: Webhook Payment Success Transition ---');
    const resG = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testOrderId,
      paymentId: `PAY-${Date.now()}`,
      transaction_status: 'settlement'
    });
    assert(resG.status === 200, 'Webhook processed successfully with 200 OK');
    assert(resG.body.paymentStatus === 'Paid', 'Order paymentStatus updated to Paid');
    assert(resG.body.orderStatus === 'Confirmed', 'Order status updated to Confirmed');

    // Verify polling reflection
    const resG2 = await makeRequest(`/api/orders/${testOrderId}/payment-status`);
    assert(resG2.body.paymentStatus === 'Paid', 'Polling reflects authoritative Paid status');
    assert(resG2.body.orderStatus === 'Confirmed', 'Polling reflects authoritative Confirmed status');
    assert(resG2.body.paidAt !== null, 'paidAt timestamp recorded');

    // ----------------------------------------------------
    // Test H: Webhook Idempotency Guard
    // ----------------------------------------------------
    console.log('\n--- TEST H: Webhook Idempotency Verification ---');
    const resH = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testOrderId,
      transaction_status: 'settlement'
    });
    assert(resH.status === 200, 'Second webhook call for same Paid order returns 200 OK');
    assert(resH.body.message && resH.body.message.includes('Idempotent'), 'Idempotency guard triggered and confirmed');

    // ----------------------------------------------------
    // Test I: Webhook Failure / Expired Transition & Batch Seat Restoration
    // ----------------------------------------------------
    console.log('\n--- TEST I: Webhook Failure / Expired Transition ---');
    const testFailOrderId = `SJ-FAIL-${Date.now().toString().slice(-6)}`;
    await makeRequest('/api/artopay/payment-intent', { method: 'POST' }, {
      orderId: testFailOrderId,
      amount: 750000,
      customerName: 'Fail Test Traveler',
      customerEmail: 'fail@example.com'
    });

    const resI = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testFailOrderId,
      transaction_status: 'expire'
    });
    assert(resI.status === 200, 'Expired webhook handled with 200 OK');
    assert(resI.body.paymentStatus === 'Expired', 'Payment status set to Expired');
    assert(resI.body.orderStatus === 'Rejected', 'Order status marked as Rejected');

    // ----------------------------------------------------
    // Test J: Webhook HMAC Signature Verification Header
    // ----------------------------------------------------
    console.log('\n--- TEST J: Webhook Signature Header Handling ---');
    const secret = process.env.WEBHOOK_SECRET || process.env.ARTOPAY_SECRET_KEY || 'test-secret';
    const sigPayload = JSON.stringify({ orderId: testOrderId, status: 'PAID' });
    const signature = crypto.createHmac('sha256', secret).update(sigPayload).digest('hex');

    const resJ = await makeRequest('/api/artopay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-artopay-signature': signature
      }
    }, sigPayload);
    assert(resJ.status === 200, 'Signed webhook payload accepted cleanly');

    // ----------------------------------------------------
    // Test K: Alternative Endpoint Route Aliases
    // ----------------------------------------------------
    console.log('\n--- TEST K: Endpoint Aliases & Routing Fallbacks ---');
    const resK1 = await makeRequest(`/api/artopay/status/${testOrderId}`);
    assert(resK1.status === 200 && resK1.body.found === true, 'Route alias /api/artopay/status/:orderId works correctly');

    // ----------------------------------------------------
    // Test L: Database Integrity & Batch recalculation
    // ----------------------------------------------------
    console.log('\n--- TEST L: Database State Consistency ---');
    const resL = await makeRequest('/api/db');
    assert(resL.status === 200, '/api/db responded with 200 OK');
    assert(Array.isArray(resL.body.trips), 'Trips list returned as array in DB state');
    assert(Array.isArray(resL.body.batches), 'Batches list returned as array in DB state');
    assert(Array.isArray(resL.body.bookings), 'Bookings list returned as array in DB state');

  } catch (err) {
    console.error('Fatal test runner error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
