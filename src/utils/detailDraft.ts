export function createDraftKey(namespace: string, id: string | number) {
  return `erp-ui:draft:${namespace}:${id}`;
}

export function readDraft<T>(namespace: string, id: string | number, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(createDraftKey(namespace, id));
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

export function writeDraft(namespace: string, id: string | number, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(createDraftKey(namespace, id), JSON.stringify(value));
}

export function createRowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildDocNo(prefix: string) {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}${date}-${rand}`;
}
