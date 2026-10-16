export type ExpoResult = { status?: string; id?: string; details?: { error?: string } };
export type Delivery = {
  id: number; item_id: string; token: string; session_hash: string;
  status: string; attempts: number; receipt_attempts: number; ticket_id: string | null;
};
const permanent = new Set(['DeviceNotRegistered', 'MessageTooBig', 'MismatchSenderId', 'InvalidCredentials']);

export function resultUpdate(row: Delivery, result: ExpoResult | undefined, receipt = false) {
  if (result?.status === 'ok' && (receipt || result.id)) {
    return receipt ? { status: 'delivered', error_code: null } : {
      status: 'receipt', ticket_id: result.id!, error_code: null,
      next_attempt_at: new Date(Date.now() + 15 * 60000).toISOString(),
    };
  }
  const code = result?.details?.error || 'ExpoTemporaryError';
  const resend = receipt && result?.status === 'error';
  const attempts = receipt && !resend ? row.receipt_attempts : row.attempts;
  // Missing receipts are checked again without resending the notification.
  return {
    status: permanent.has(code) || attempts >= 8 ? 'failed' : receipt && !resend ? 'receipt' : 'pending',
    error_code: code,
    next_attempt_at: new Date(Date.now() + Math.min(3600, 30 * 2 ** attempts) * 1000).toISOString(),
  };
}

export function buildScanQuery(lower: string, upper: string, cursor?: { time: string; name: string }) {
  return {
    from: [{ collectionId: 'itens' }],
    select: { fields: ['titulo', 'userId', 'createdAt'].map((fieldPath) => ({ fieldPath })) },
    where: { compositeFilter: { op: 'AND', filters: [
      { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: lower } } },
      { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: upper } } },
    ] } },
    orderBy: ['createdAt', '__name__'].map((fieldPath) => ({ field: { fieldPath }, direction: 'ASCENDING' })),
    ...(cursor ? { startAt: { before: false, values: [{ timestampValue: cursor.time }, { referenceValue: cursor.name }] } } : {}),
    limit: 100,
  };
}
