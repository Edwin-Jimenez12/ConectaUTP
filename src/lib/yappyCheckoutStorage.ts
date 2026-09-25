const PENDING_PAYMENT_STORAGE_KEY = 'conecta-yappy-pending-payment';

export function clearPendingYappyPayment() {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
  } catch {
    // Some privacy modes block sessionStorage.
  }
}

export function readPendingYappyPayment(checkoutKey: string, maxAge: number) {
  try {
    const value = sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);
    if (!value) return null;
    const payment = JSON.parse(value) as Record<string, unknown>;
    if (payment.checkoutKey !== checkoutKey || typeof payment.createdAt !== 'number' || Date.now() - payment.createdAt > maxAge) {
      clearPendingYappyPayment();
      return null;
    }
    if (typeof payment.transactionId !== 'string' || typeof payment.documentName !== 'string' || typeof payment.token !== 'string') return null;
    return { transactionId: payment.transactionId, documentName: payment.documentName, token: payment.token };
  } catch {
    return null;
  }
}

export function savePendingYappyPayment(payment: { checkoutKey: string; createdAt: number; transactionId: string; documentName: string; token: string }) {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(payment));
  } catch {
    // Some privacy modes block sessionStorage.
  }
}
