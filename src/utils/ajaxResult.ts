type AjaxEnvelope = {
  code?: number;
  msg?: string;
  data?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isEnvelopeWithoutData(value: Record<string, unknown>) {
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key === 'code' || key === 'msg');
}

export function unwrapAjaxResultData<T>(payload: unknown): T | null {
  if (payload == null) {
    return null;
  }
  if (!isPlainObject(payload)) {
    return payload as T;
  }

  const envelope = payload as AjaxEnvelope & Record<string, unknown>;
  if ('data' in envelope) {
    return (envelope.data as T | null) ?? null;
  }
  if (isEnvelopeWithoutData(envelope)) {
    return null;
  }
  return payload as T;
}
