interface DictOption {
  value: string;
  label: string;
}

type ApprovalSemantic = 'draft' | 'submitted' | 'approved' | 'rejected';
type ApprovalAction = 'submit' | 'approve' | 'reject';

const KEYWORDS: Record<ApprovalSemantic, string[]> = {
  draft: ['draft', '草稿', 'pending', '待处理', '待提交', '未提交', '0'],
  submitted: ['submitted', 'submit', '已提交', '待审', '待审核', '待确认'],
  approved: ['approved', 'approve', 'confirmed', 'scheduled', 'pass', '已审核', '已确认', '已排产', '通过', '1'],
  rejected: ['rejected', 'reject', 'fail', '驳回', '退回', '拒绝'],
};

const DEFAULT_CODES: Record<ApprovalSemantic, string> = {
  draft: 'DRAFT',
  submitted: 'SUBMITTED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

function normalizeText(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function includesKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function findOptionBySemantic(options: DictOption[] = [], semantic: ApprovalSemantic) {
  return options.find((option) => {
    const valueText = normalizeText(option.value);
    const labelText = normalizeText(option.label);
    return includesKeyword(valueText, KEYWORDS[semantic]) || includesKeyword(labelText, KEYWORDS[semantic]);
  });
}

export function resolveApprovalValue(
  options: DictOption[] = [],
  semantic: ApprovalSemantic,
  fallback?: string,
) {
  return findOptionBySemantic(options, semantic)?.value || fallback || DEFAULT_CODES[semantic];
}

export function resolveApprovalState(value: unknown, options: DictOption[] = []): ApprovalSemantic | null {
  const directText = normalizeText(value);
  const matchedOption = options.find((option) => normalizeText(option.value) === directText);
  const compareText = `${directText} ${normalizeText(matchedOption?.label)}`;

  if (includesKeyword(compareText, KEYWORDS.approved)) {
    return 'approved';
  }
  if (includesKeyword(compareText, KEYWORDS.submitted)) {
    return 'submitted';
  }
  if (includesKeyword(compareText, KEYWORDS.rejected)) {
    return 'rejected';
  }
  if (includesKeyword(compareText, KEYWORDS.draft)) {
    return 'draft';
  }
  return null;
}

export function isApprovalLocked(value: unknown, options: DictOption[] = []) {
  const state = resolveApprovalState(value, options);
  return state === 'submitted' || state === 'approved';
}

export function getApprovalActorName(user?: { nickname?: string; username?: string } | null) {
  return user?.nickname || user?.username || 'SYSTEM';
}

export function getApprovalTimestamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function buildApprovalPayload(params: {
  record: Record<string, any>;
  statusField: string;
  nextStatus: string;
  action: ApprovalAction;
  actorName: string;
  actionRemark?: string;
}) {
  const { record, statusField, nextStatus, action, actorName, actionRemark } = params;
  const actionTime = getApprovalTimestamp();
  const nextPayload: Record<string, any> = {
    ...record,
    [statusField]: nextStatus,
  };

  if (action === 'submit') {
    nextPayload.submitBy = actorName;
    nextPayload.submitTime = actionTime;
  }

  if (action === 'approve') {
    nextPayload.approveBy = actorName;
    nextPayload.approveTime = actionTime;
    nextPayload.reviewer = actorName;
    nextPayload.reviewDate = actionTime;
  }

  if (action === 'reject') {
    nextPayload.rejectBy = actorName;
    nextPayload.rejectTime = actionTime;
    nextPayload.rejectReason = actionRemark || 'REJECTED';
    nextPayload.reviewer = actorName;
    nextPayload.reviewDate = actionTime;
  }

  return nextPayload;
}

export function buildApprovalLog(params: {
  businessType: string;
  businessId?: number | string;
  businessNo?: string;
  nodeCode: string;
  actionType: 'SUBMIT' | 'APPROVE' | 'REJECT';
  fromStatus?: string;
  toStatus?: string;
  actionBy: string;
  actionRemark?: string;
}) {
  return {
    ...params,
    actionTime: getApprovalTimestamp(),
  };
}

export function isConfirmedStatus(value: unknown, options: DictOption[] = []) {
  const state = resolveApprovalState(value, options);
  return state === 'approved';
}
