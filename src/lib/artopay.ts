import ArtoPay from '@arto-pay/js-sdk';

export interface ArtoPayPaymentParams {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  onSuccess?: (res: any) => void;
  onPending?: (res: any) => void;
  onError?: (err: any) => void;
  onClose?: () => void;
}

export interface PaymentIntentResponse {
  success?: boolean;
  id?: string;
  paymentId?: string;
  secret?: string;
  clientSecret?: string;
  customerToken?: string;
  token?: string;
  checkoutUrl?: string;
  publicKey?: string;
  orderId?: string;
  error?: string;
  details?: string;
}

/**
 * Trigger official ArtoPay payment flow according to official JS SDK documentation:
 * 1. Requests payment intent from backend endpoint `/api/artopay/payment-intent`.
 * 2. Receives { paymentId, clientSecret, customerToken, orderId }.
 * 3. Configures ArtoPay SDK sandbox mode.
 * 4. Calls ArtoPay.openPayment({ token: customerToken, clientSecret, paymentId, orderId, sandbox }).
 */
export async function processArtoPayPayment({
  orderId,
  amount,
  currency = 'IDR',
  description,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  metadata,
  onSuccess,
  onPending,
  onError,
  onClose,
}: ArtoPayPaymentParams) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required for payment processing.');
    }

    const validAmount = Number(amount);
    if (!validAmount || isNaN(validAmount) || validAmount <= 0) {
      throw new Error('Amount must be a valid number greater than 0.');
    }

    console.log(`[ArtoPay] Creating backend Payment Intent for Order: ${orderId}, Amount: IDR ${validAmount}`);

    // Step 1: Call backend API to create official ArtoPay Payment Intent
    const response = await fetch('/api/artopay/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: String(orderId),
        amount: validAmount,
        currency,
        description: description || `Payment for order ${orderId}`,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.error || `Gagal membuat Payment Intent (${response.status})`;
      console.error('[ArtoPay Gateway Error]', errorMsg);
      if (onError) onError({ message: errorMsg, details: errorJson.details });
      throw new Error(errorMsg);
    }

    const data: PaymentIntentResponse = await response.json();
    console.log('[ArtoPay Gateway] Payment Intent created successfully:', data);

    // If hosted checkout URL is provided by backend response, redirect
    if (data.checkoutUrl) {
      console.log('[ArtoPay] Redirecting to hosted gateway URL:', data.checkoutUrl);
      window.location.href = data.checkoutUrl;
      return data;
    }

    // Step 2: Extract required parameters per official ArtoPay SDK documentation
    const paymentId = data.paymentId || data.id;
    const clientSecret = data.clientSecret || data.secret;
    const customerToken = data.customerToken || data.token;
    const returnedOrderId = data.orderId || String(orderId);
    const publicKey = data.publicKey || (import.meta as any).env?.VITE_ARTOPAY_PUBLIC_KEY || '';

    const isSandbox =
      (import.meta as any).env?.VITE_ARTOPAY_ENV !== 'live' &&
      (import.meta as any).env?.VITE_ARTOPAY_ENV !== 'production' &&
      (import.meta as any).env?.VITE_ARTOPAY_SANDBOX !== 'false';

    if (!paymentId || !clientSecret) {
      const msg = 'ArtoPay Gateway tidak mengembalikan paymentId atau clientSecret yang valid.';
      if (onError) onError({ message: msg });
      throw new Error(msg);
    }

    if (publicKey) {
      if (typeof window !== 'undefined') {
        (window as any).__ARTOPAY_PUBLIC_KEY__ = publicKey;
        const scriptEl = document.getElementById('arto-pay-sdk-script');
        if (scriptEl) {
          scriptEl.setAttribute('data-client-key', publicKey);
        }
      }
    }

    // Configure ArtoPay SDK
    ArtoPay.configure({
      sandbox: isSandbox,
    });

    // Step 3: Open Payment Interface using official SDK parameters
    (ArtoPay.openPayment as any)({
      token: customerToken,
      clientSecret,
      paymentId,
      orderId: returnedOrderId,
      sandbox: isSandbox,
      publicKey: publicKey || undefined,
      onSuccess: (result: any) => {
        console.log('[ArtoPay SDK Callback] onSuccess:', result);
        if (onSuccess) onSuccess(result);
      },
      onPending: (result: any) => {
        console.log('[ArtoPay SDK Callback] onPending:', result);
        if (onPending) onPending(result);
      },
      onError: (error: any) => {
        console.error('[ArtoPay SDK Callback] onError:', error);
        if (onError) onError(error);
      },
      onClose: () => {
        console.log('[ArtoPay SDK Callback] onClose');
        if (onClose) onClose();
      },
    });

    return data;
  } catch (error: any) {
    console.error('[ArtoPay Process Exception]:', error);
    if (onError) {
      onError({ message: error.message || 'Gagal memproses pembayaran ArtoPay.' });
    }
    throw error;
  }
}

