export type CompanyCode = 'HEADQUARTERS' | 'SHUYANG' | 'DONGCHUAN' | 'CAMBODIA';

export interface CompanyContextSelection {
  code: CompanyCode;
  factoryId: number | null;
  orgFactoryId?: number | null;
  mode: 'summary' | 'factory';
}

export interface CompanyContextIdentity {
  userId?: number | null;
  deptId?: number | null;
}

export interface BackendCompanyContextOptionLike {
  code?: string | null;
  orgUnitId?: number | null;
  orgCode?: string | null;
  orgName?: string | null;
  businessFactoryId?: number | null;
  orgFactoryId?: number | null;
  available?: boolean | null;
  availabilityReason?: string | null;
}

export interface FactoryOptionLike {
  value: string;
  label: string;
}

export interface OrgCompanyOptionLike {
  id?: number | null;
  factoryId?: number | null;
  orgCode?: string | null;
  orgName?: string | null;
  status?: string | null;
}

export interface CompanyContextOption extends CompanyContextSelection {
  available: boolean;
  availabilityReason?: string | null;
  orgUnitId?: number | null;
}

export const COMPANY_CONTEXT_STORAGE_KEY = 'erp-ui-company-context';

export const DEFAULT_COMPANY_CONTEXT: CompanyContextSelection = {
  code: 'HEADQUARTERS',
  factoryId: null,
  orgFactoryId: null,
  mode: 'summary',
};

const COMPANY_MATCHERS: Record<Exclude<CompanyCode, 'HEADQUARTERS'>, string[]> = {
  SHUYANG: ['沭阳', '沭陽', 'shuyang'],
  DONGCHUAN: ['东川', '東川', 'dongchuan'],
  CAMBODIA: ['柬埔寨', 'cambodia', 'kampuchea'],
};

const COMPANY_CODE_MATCHERS: Record<Exclude<CompanyCode, 'HEADQUARTERS'>, string[]> = {
  SHUYANG: ['SHUYANG'],
  DONGCHUAN: ['DONGCHUAN'],
  CAMBODIA: ['CAMBODIA'],
};

export function loadCompanyContext(): CompanyContextSelection {
  if (typeof window === 'undefined') {
    return DEFAULT_COMPANY_CONTEXT;
  }

  const raw = window.localStorage.getItem(COMPANY_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_COMPANY_CONTEXT;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.code === 'string' && (parsed.mode === 'summary' || parsed.mode === 'factory')) {
        return {
          code: parsed.code as CompanyCode,
          factoryId: typeof parsed.factoryId === 'number' ? parsed.factoryId : null,
          orgFactoryId: typeof parsed.orgFactoryId === 'number' ? parsed.orgFactoryId : null,
          mode: parsed.mode,
        };
    }
  } catch {
    return DEFAULT_COMPANY_CONTEXT;
  }

  return DEFAULT_COMPANY_CONTEXT;
}

function readPersistedCompanyContextPayload() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(COMPANY_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function hasPersistedCompanyContext(identity?: CompanyContextIdentity) {
  if (typeof window === 'undefined') {
    return false;
  }

  const payload = readPersistedCompanyContextPayload();
  if (!payload) {
    return false;
  }

  if (!identity || (identity.userId == null && identity.deptId == null)) {
    return true;
  }

  const persistedUserId = typeof payload.userId === 'number' ? payload.userId : null;
  const persistedDeptId = typeof payload.deptId === 'number' ? payload.deptId : null;

  if (persistedUserId == null && persistedDeptId == null) {
    return false;
  }

  if (identity.userId != null && persistedUserId != null && identity.userId === persistedUserId) {
    return true;
  }

  if (identity.deptId != null && persistedDeptId != null && identity.deptId === persistedDeptId) {
    return true;
  }

  return false;
}

export function persistCompanyContext(selection: CompanyContextSelection, identity?: CompanyContextIdentity) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    COMPANY_CONTEXT_STORAGE_KEY,
    JSON.stringify({
      ...selection,
      userId: identity?.userId ?? null,
      deptId: identity?.deptId ?? null,
    })
  );
}

export function clearPersistedCompanyContext() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(COMPANY_CONTEXT_STORAGE_KEY);
}

function matchesFactoryLabel(label: string, matchers: string[]) {
  const normalized = label.trim().toLowerCase();
  return matchers.some((matcher) => normalized.includes(matcher.toLowerCase()));
}

function normalizeFactoryId(factoryId: number | string | null | undefined) {
  const value = typeof factoryId === 'number' ? factoryId : Number(factoryId);
  return Number.isNaN(value) ? null : value;
}

function findFactoryIdByDict(code: Exclude<CompanyCode, 'HEADQUARTERS'>, factoryOptions: FactoryOptionLike[]) {
  const matched = factoryOptions.find((option) => matchesFactoryLabel(option.label, COMPANY_MATCHERS[code]));
  return normalizeFactoryId(matched?.value);
}

function findFactoryIdByOrg(code: Exclude<CompanyCode, 'HEADQUARTERS'>, orgOptions: OrgCompanyOptionLike[]) {
  const activeOrgOptions = orgOptions.filter((option) => (option.status ?? '0') === '0');

  const byCode = activeOrgOptions.find((option) => {
    const orgCode = (option.orgCode || '').trim().toUpperCase();
    return COMPANY_CODE_MATCHERS[code].some((matcher) => orgCode === matcher);
  });
  if (byCode) {
    return normalizeFactoryId(byCode.factoryId);
  }

  const byName = activeOrgOptions.find((option) => matchesFactoryLabel(option.orgName || '', COMPANY_MATCHERS[code]));
  return normalizeFactoryId(byName?.factoryId);
}

export function buildCompanyContextOptions(
  factoryOptions: FactoryOptionLike[],
  orgOptions: OrgCompanyOptionLike[] = []
): CompanyContextOption[] {
  const options: CompanyContextOption[] = [
    {
      ...DEFAULT_COMPANY_CONTEXT,
      available: true,
    },
  ];

  (Object.keys(COMPANY_MATCHERS) as Array<Exclude<CompanyCode, 'HEADQUARTERS'>>).forEach((code) => {
    const factoryId = findFactoryIdByOrg(code, orgOptions) ?? findFactoryIdByDict(code, factoryOptions);
    options.push({
      code,
      factoryId,
      orgFactoryId: factoryId,
      mode: 'factory',
      available: factoryId != null,
    });
  });

  return options;
}

export function buildCompanyContextOptionsFromBackend(
  backendOptions: BackendCompanyContextOptionLike[] = [],
  orgOptions: OrgCompanyOptionLike[] = []
): CompanyContextOption[] {
  const normalized = backendOptions
    .map((option) => {
      const rawCode = (option.code || '').trim().toUpperCase();
      if (
        rawCode !== 'HEADQUARTERS' &&
        rawCode !== 'SHUYANG' &&
        rawCode !== 'DONGCHUAN' &&
        rawCode !== 'CAMBODIA'
      ) {
        return null;
      }

      const code = rawCode as CompanyCode;
      const mappedFactoryId =
        typeof option.businessFactoryId === 'number' && !Number.isNaN(option.businessFactoryId)
          ? option.businessFactoryId
          : null;
      const orgFactoryId =
        typeof option.orgFactoryId === 'number' && !Number.isNaN(option.orgFactoryId)
          ? option.orgFactoryId
          : code === 'HEADQUARTERS'
            ? null
            : findFactoryIdByOrg(code, orgOptions);
      const factoryId =
        code === 'HEADQUARTERS'
          ? null
          : mappedFactoryId != null
            ? mappedFactoryId
            : orgFactoryId;
      const available = Boolean(option.available && (code === 'HEADQUARTERS' || factoryId != null));
      const result: CompanyContextOption = {
        code,
        factoryId: code === 'HEADQUARTERS' ? null : factoryId,
        orgFactoryId: code === 'HEADQUARTERS' ? null : orgFactoryId,
        mode: code === 'HEADQUARTERS' ? 'summary' : 'factory',
        available,
        availabilityReason: option.availabilityReason || null,
        orgUnitId:
          typeof option.orgUnitId === 'number' && !Number.isNaN(option.orgUnitId)
            ? option.orgUnitId
            : null,
      };
      return result;
    })
    .filter((option): option is CompanyContextOption => Boolean(option));

  if (normalized.length === 0) {
    return [];
  }

  const deduped = new Map<CompanyCode, CompanyContextOption>();
  normalized.forEach((option) => {
    deduped.set(option.code, option);
  });

  if (!deduped.has('HEADQUARTERS')) {
    deduped.set('HEADQUARTERS', {
      ...DEFAULT_COMPANY_CONTEXT,
      available: false,
      availabilityReason: 'UNAUTHORIZED',
    });
  }

  return (['HEADQUARTERS', 'SHUYANG', 'DONGCHUAN', 'CAMBODIA'] as CompanyCode[])
    .map((code) => deduped.get(code))
    .filter((option): option is CompanyContextOption => Boolean(option));
}

export function getCompanyLabel(code: CompanyCode, t: (key: string) => string) {
  switch (code) {
    case 'HEADQUARTERS':
      return t('companyContext.headquarters');
    case 'SHUYANG':
      return t('companyContext.shuyang');
    case 'DONGCHUAN':
      return t('companyContext.dongchuan');
    case 'CAMBODIA':
      return t('companyContext.cambodia');
    default:
      return code;
  }
}

export function resolveDefaultCompanyContext(
  currentSelection: CompanyContextSelection,
  companyOptions: CompanyContextOption[],
  deptId?: number | null,
  hasPersistedSelection = true
) {
  if (!hasPersistedSelection && deptId != null) {
    const matchedDept = companyOptions.find(
      (item) => item.available && item.code !== 'HEADQUARTERS' && (item.factoryId === deptId || item.orgUnitId === deptId)
    );
    if (matchedDept) {
      return {
        code: matchedDept.code,
        factoryId: matchedDept.factoryId,
        orgFactoryId: matchedDept.orgFactoryId ?? null,
        mode: matchedDept.mode,
      } satisfies CompanyContextSelection;
    }
  }

  const matchedCurrent = companyOptions.find((item) => item.code === currentSelection.code);
  if (matchedCurrent && matchedCurrent.available) {
    return {
      code: matchedCurrent.code,
      factoryId: matchedCurrent.factoryId,
      orgFactoryId: matchedCurrent.orgFactoryId ?? null,
      mode: matchedCurrent.mode,
    } satisfies CompanyContextSelection;
  }

  if (deptId != null) {
    const matchedDept = companyOptions.find(
      (item) => item.available && item.code !== 'HEADQUARTERS' && (item.factoryId === deptId || item.orgUnitId === deptId)
    );
    if (matchedDept) {
      return {
        code: matchedDept.code,
        factoryId: matchedDept.factoryId,
        orgFactoryId: matchedDept.orgFactoryId ?? null,
        mode: matchedDept.mode,
      } satisfies CompanyContextSelection;
    }
  }

  return null;
}
