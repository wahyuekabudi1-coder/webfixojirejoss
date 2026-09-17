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
    // Test E: Booking Creation & Unique Payment Code Generation
    // ----------------------------------------------------
    console.log('\n--- TEST E: Booking Creation & Unique Code (1-99) ---');
    const testOrderId = `SJ-TEST-${Date.now().toString().slice(-6)}`;
    const testBaseAmount = 500000;

    const resE0 = await makeRequest('/api/bookings', { method: 'POST' }, {
      id: testOrderId,
      bookingCode: testOrderId,
      type: 'Tours',
      customerName: 'Audit Test Traveler',
      customerEmail: 'audit@example.com',
      customerPhone: '+628123456789',
      baseAmount: testBaseAmount,
      totalPriceIDR: testBaseAmount,
      participantsCount: 2,
      tripTitle: 'Bromo Sunrise Tour'
    });

    assert(resE0.status === 201 || resE0.status === 200, 'Booking created successfully in database');
    const createdBooking = resE0.body.booking || resE0.body;
    assert(createdBooking.baseAmount === testBaseAmount, 'baseAmount matches requested tour price');
    assert(
      typeof createdBooking.uniqueCode === 'number' && 
      createdBooking.uniqueCode >= 1 && 
      createdBooking.uniqueCode <= 99, 
      `uniqueCode is generated within valid 1-99 range (got: ${createdBooking.uniqueCode})`
    );
    assert(
      createdBooking.paymentAmount === createdBooking.baseAmount + createdBooking.uniqueCode,
      `paymentAmount correctly equals baseAmount + uniqueCode (${createdBooking.paymentAmount} === ${createdBooking.baseAmount} + ${createdBooking.uniqueCode})`
    );

    // ----------------------------------------------------
    // Test F: Status Polling Endpoint on Existing Order
    // ----------------------------------------------------
    console.log('\n--- TEST F: Status Polling for Pending Order ---');
    const resF = await makeRequest(`/api/orders/${testOrderId}/payment-status`);
    assert(resF.status === 200, 'Polling endpoint returned 200 OK');
    assert(resF.body.found === true, 'Order was found in system ledger');
    assert(resF.body.paymentStatus === 'Pending', 'Initial order payment status is Pending');
    assert(resF.body.orderStatus === 'Pending', 'Initial order booking status is Pending');
    assert(resF.body.uniqueCode === createdBooking.uniqueCode, 'Polling returns authoritative uniqueCode');
    assert(resF.body.paymentAmount === createdBooking.paymentAmount, 'Polling returns authoritative paymentAmount');

    // ----------------------------------------------------
    // Test G: Webhook Settlement & Status Separation (Payment Status ≠ Booking Status)
    // ----------------------------------------------------
    console.log('\n--- TEST G: Webhook Payment Success & Status Separation ---');
    const resG = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testOrderId,
      amount: createdBooking.paymentAmount,
      paymentId: `PAY-${Date.now()}`,
      transaction_status: 'settlement'
    });
    assert(resG.status === 200, 'Webhook processed successfully with 200 OK');
    assert(resG.body.paymentStatus === 'Paid', 'Order paymentStatus updated to Paid');
    assert(
      resG.body.orderStatus === 'Pending Confirmation' || resG.body.bookingStatus === 'Pending Confirmation',
      'Order booking status is "Pending Confirmation" (DOES NOT auto-confirm to Confirmed)'
    );

    // Verify polling reflection
    const resG2 = await makeRequest(`/api/orders/${testOrderId}/payment-status`);
    assert(resG2.body.paymentStatus === 'Paid', 'Polling reflects authoritative Paid status');
    assert(resG2.body.orderStatus === 'Pending Confirmation', 'Polling reflects Pending Confirmation status');
    assert(resG2.body.paidAt !== null, 'paidAt timestamp recorded');

    // ----------------------------------------------------
    // Test H: Webhook Idempotency Guard
    // ----------------------------------------------------
    console.log('\n--- TEST H: Webhook Idempotency Verification ---');
    const resH = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testOrderId,
      amount: createdBooking.paymentAmount,
      transaction_status: 'settlement'
    });
    assert(resH.status === 200, 'Second webhook call for same Paid order returns 200 OK');
    assert(resH.body.message && resH.body.message.includes('Idempotent'), 'Idempotency guard triggered and confirmed');

    // ----------------------------------------------------
    // Test I: Admin Manual Confirmation & Auth Protection
    // ----------------------------------------------------
    console.log('\n--- TEST I: Admin Status Endpoint & Auth Protection ---');
    // First attempt status update without token -> Must return 401
    const resI1 = await makeRequest(`/api/bookings/${testOrderId}/status`, {
      method: 'PATCH'
    }, { status: 'Confirmed' });
    assert(resI1.status === 401, 'Unauthenticated status update rejected with HTTP 401');

    // Second attempt status update with invalid token -> Must return 401
    const resI2 = await makeRequest(`/api/bookings/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-xyz'
      }
    }, { status: 'Confirmed' });
    assert(resI2.status === 401, 'Invalid token status update rejected with HTTP 401');

    // Log in as admin via /api/auth/login
    const resLogin = await makeRequest('/api/auth/login', { method: 'POST' }, {
      email: 'sawahjayagroup@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'sawahjaya2026'
    });
    assert(resLogin.status === 200 && resLogin.body.token, 'Admin login succeeded and returned valid session token');

    const adminToken = resLogin.body.token;

    // Authorized status update to Confirmed
    const resI3 = await makeRequest(`/api/bookings/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { status: 'Confirmed' });
    assert(resI3.status === 200, 'Authorized admin confirmation succeeded with HTTP 200');
    assert((resI3.body.status === 'Confirmed' || resI3.body.booking?.status === 'Confirmed'), 'Booking status transitioned to Confirmed by Admin');

    // ----------------------------------------------------
    // Test J: Webhook Failure / Expired Transition
    // ----------------------------------------------------
    console.log('\n--- TEST J: Webhook Failure / Expired Transition ---');
    const testFailOrderId = `SJ-FAIL-${Date.now().toString().slice(-6)}`;
    await makeRequest('/api/bookings', { method: 'POST' }, {
      id: testFailOrderId,
      bookingCode: testFailOrderId,
      type: 'Tours',
      customerName: 'Fail Test Traveler',
      customerEmail: 'fail@example.com',
      totalPriceIDR: 750000,
      baseAmount: 750000
    });

    const resJ = await makeRequest('/api/artopay/webhook', { method: 'POST' }, {
      orderId: testFailOrderId,
      transaction_status: 'expire'
    });
    assert(resJ.status === 200, 'Expired webhook handled with 200 OK');
    assert(resJ.body.paymentStatus === 'Expired', 'Payment status set to Expired');
    assert(resJ.body.orderStatus === 'Cancelled', 'Order status marked as Cancelled');

    // ----------------------------------------------------
    // Test K: Webhook HMAC Signature Verification Header
    // ----------------------------------------------------
    console.log('\n--- TEST K: Webhook Signature Header Handling ---');
    const secret = process.env.WEBHOOK_SECRET || process.env.ARTOPAY_SECRET_KEY || 'test-secret';
    const sigPayload = JSON.stringify({ orderId: testOrderId, status: 'PAID' });
    const signature = crypto.createHmac('sha256', secret).update(sigPayload).digest('hex');

    const resK = await makeRequest('/api/artopay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-artopay-signature': signature
      }
    }, sigPayload);
    assert(resK.status === 200, 'Signed webhook payload accepted cleanly');

    // ----------------------------------------------------
    // Test L: Alternative Endpoint Route Aliases
    // ----------------------------------------------------
    console.log('\n--- TEST L: Endpoint Aliases & Routing Fallbacks ---');
    const resL1 = await makeRequest(`/api/artopay/status/${testOrderId}`);
    assert(resL1.status === 200 && resL1.body.found === true, 'Route alias /api/artopay/status/:orderId works correctly');

    // ----------------------------------------------------
    // Test M: Database Integrity & Batch recalculation
    // ----------------------------------------------------
    console.log('\n--- TEST M: Database State Consistency ---');
    const resM = await makeRequest('/api/db');
    assert(resM.status === 200, '/api/db responded with 200 OK');
    assert(Array.isArray(resM.body.trips), 'Trips list returned as array in DB state');
    assert(Array.isArray(resM.body.batches), 'Batches list returned as array in DB state');
    assert(Array.isArray(resM.body.bookings), 'Bookings list returned as array in DB state');

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
