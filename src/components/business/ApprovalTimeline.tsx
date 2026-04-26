interface ApprovalLogItem {
  id?: number | string;
  nodeCode?: string;
  actionType?: string;
  fromStatus?: string;
  toStatus?: string;
  actionBy?: string;
  actionTime?: string;
  actionRemark?: string;
}

function mapActionLabel(actionType?: string) {
  const normalized = String(actionType || '').toUpperCase();
  if (normalized === 'SUBMIT') {
    return '提交';
  }
  if (normalized === 'APPROVE') {
    return '审核通过';
  }
  if (normalized === 'REJECT') {
    return '驳回';
  }
  if (normalized === 'RELEASE') {
    return '放行';
  }
  return normalized || '动作';
}

function mapNodeLabel(nodeCode?: string) {
  const normalized = String(nodeCode || '').toUpperCase();
  if (normalized === 'SALES_APPROVE') {
    return '销售审批';
  }
  if (normalized === 'BOM_APPROVE') {
    return 'BOM 审批';
  }
  if (normalized === 'PLAN_APPROVE') {
    return '计划审批';
  }
  if (normalized === 'OUTSOURCE_APPROVE') {
    return '外协审批';
  }
  if (normalized === 'FINANCE_CONFIRM') {
    return '计件确认';
  }
  if (normalized === 'QUALITY_RELEASE') {
    return '质检放行';
  }
  if (normalized === 'INSPECTION_RELEASE') {
    return '检品处理';
  }
  return normalized || '审批节点';
}

export default function ApprovalTimeline({
  title = '审批记录',
  logs,
  loading = false,
}: {
  title?: string;
  logs: ApprovalLogItem[];
  loading?: boolean;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">记录提交、审核、驳回、放行与检品动作，便于业务追溯。</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-400">审批记录加载中...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-400">暂无审批记录</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={log.id || `${log.actionTime}-${index}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {mapNodeLabel(log.nodeCode)}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {mapActionLabel(log.actionType)}
                </span>
                <span className="text-xs text-slate-400">
                  {log.fromStatus || '-'} {'->'} {log.toStatus || '-'}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                <span className="font-medium">{log.actionBy || 'SYSTEM'}</span>
                <span className="ml-2 text-slate-400">{log.actionTime || '-'}</span>
              </div>
              {log.actionRemark && (
                <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{log.actionRemark}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
