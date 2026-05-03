import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowRight, CalendarRange, ClipboardCheck, Eye, Factory, RefreshCw } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as productionApi from '@/api/production';
import * as processRouteApi from '@/api/processRoute';
import * as workCenterApi from '@/api/workCenter';
import * as ganttApi from '@/api/gantt';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useAppStore } from '@/stores/appStore';
import {
  isApprovalLocked,
  resolveApprovalState,
} from '@/utils/approval';
import PlanForm from './PlanForm';

const APPROVAL_TAGS: Record<string, { label: string; color: string }> = {
  draft: { label: '待提交', color: 'bg-slate-100 text-slate-600' },
  submitted: { label: '已提交', color: 'bg-blue-100 text-blue-700' },
  approved: { label: '已通过', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '已驳回', color: 'bg-amber-100 text-amber-700' },
};

const api = {
  list: productionApi.listProducePlan,
  get: productionApi.getProducePlan,
  add: productionApi.addProducePlan,
  update: productionApi.updateProducePlan,
  remove: productionApi.delProducePlan,
};

export default function ProducePlanPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const [tableKey, setTableKey] = useState(0);
  const [routeMap, setRouteMap] = useState<Record<string, string>>({});
  const [workCenterMap, setWorkCenterMap] = useState<Record<string, string>>({});
  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.plan.form.status.pending') },
    { value: '1', label: t('page.plan.form.status.scheduled') },
    { value: '2', label: t('page.plan.form.status.running') },
    { value: '3', label: t('page.plan.form.status.completed') },
  ]);

  useEffect(() => {
    let cancelled = false;

    processRouteApi
      .listProcessRoute({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        if (cancelled) return;
        const nextMap = (res.rows || []).reduce((acc: Record<string, string>, item: any) => {
          acc[String(item.id)] = item.routeName || `路线#${item.id}`;
          return acc;
        }, {});
        setRouteMap(nextMap);
      })
      .catch(() => {
        if (!cancelled) setRouteMap({});
      });

    workCenterApi
      .listWorkCenter({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        if (cancelled) return;
        const nextMap = (res.rows || []).reduce((acc: Record<string, string>, item: any) => {
          acc[String(item.id)] = item.centerName || `工作中心#${item.id}`;
          return acc;
        }, {});
        setWorkCenterMap(nextMap);
      })
      .catch(() => {
        if (!cancelled) setWorkCenterMap({});
      });

    return () => {
      cancelled = true;
    };
  }, [companySignature]);

  const columns = [
    { key: 'planNo', title: t('page.plan.columns.planNo') },
    { key: 'salesNo', title: t('page.plan.columns.salesNo') },
    { key: 'styleCode', title: t('page.plan.columns.styleCode') },
    { key: 'planQty', title: t('page.plan.columns.planQty') },
    {
      key: 'processRouteId',
      title: '工艺路线',
      render: (value: number | string) => (value ? routeMap[String(value)] || `路线#${value}` : '-'),
    },
    {
      key: 'workCenterId',
      title: '工作中心',
      render: (value: number | string) => (value ? workCenterMap[String(value)] || `工作中心#${value}` : '-'),
    },
    { key: 'planDate', title: t('page.plan.columns.planDate') },
    {
      key: 'planStatus',
      title: t('page.plan.columns.status'),
      render: (value: string) => {
        const tag = planStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {
      key: 'auditStatus',
      title: t('page.plan.columns.auditStatus', { defaultValue: '审批状态' }),
      render: (value: string) => {
        const state = resolveApprovalState(value) || 'draft';
        const tag = APPROVAL_TAGS[state] || APPROVAL_TAGS.draft;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'planNo', label: t('page.plan.columns.planNo') },
    { name: 'customerName', label: t('page.plan.form.customerName', { defaultValue: '客户名称' }) },
    { name: 'styleCode', label: t('page.plan.columns.styleCode') },
    { name: 'planStatus', label: t('page.plan.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  const initialSearchParams = useMemo(
    () => ({
      planNo: searchParams.get('planNo') || '',
      customerName: searchParams.get('customerName') || '',
      styleCode: searchParams.get('styleCode') || '',
      planStatus: searchParams.get('planStatus') || searchParams.get('status') || '',
      techId: searchParams.get('techId') || '',
      noticeId: searchParams.get('noticeId') || '',
      salesOrderId: searchParams.get('salesOrderId') || '',
    }),
    [searchParams],
  );

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.planNo || record.salesNo || '-' }));
    if (!confirmed) {
      return;
    }

    try {
      if (action === 'submit') {
        await productionApi.submitProducePlan(record.id);
      } else if (action === 'approve') {
        await productionApi.approveProducePlan(record.id);
      } else {
        await productionApi.rejectProducePlan(record.id);
      }
      toast.success(
        action === 'submit'
          ? t('approval.submitSuccess')
          : action === 'approve'
            ? t('approval.approveSuccess')
            : t('approval.rejectSuccess'),
      );
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  const inspectPlanConflict = async (planNo: string, hintMode: 'saved' | 'manual' = 'manual') => {
    if (!planNo) {
      return;
    }
    try {
      const response: any = await ganttApi.getGanttData({ planNo });
      const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response?.rows) ? response.rows : [];
      const current = rows.find((item: any) => item.planNo === planNo || item.name === planNo);
      if (!current) {
        if (hintMode === 'manual') {
          toast.warning('当前计划尚未进入甘特数据源，暂不能判断冲突');
        }
        return;
      }
      if (current.conflictLevel === 'WARNING' || current.conflictLevel === 'BLOCKED') {
        toast.warning(`计划 ${planNo} 存在冲突风险：${current.conflictReason || '请去甘特图复核'}`);
        return;
      }
      if (hintMode === 'manual') {
        toast.success(`计划 ${planNo} 当前无冲突，可继续预排`);
      }
    } catch (error: any) {
      if (hintMode === 'manual') {
        toast.error(error.message || '冲突检测失败');
      }
    }
  };

  const handleReschedule = async (record: any) => {
    const newStartDate = window.prompt('请输入新的开始日期（YYYY-MM-DD）', record.startDate?.slice?.(0, 10) || '');
    if (!newStartDate) return;
    const newDueDate = window.prompt('请输入新的交期（YYYY-MM-DD）', record.dueDate?.slice?.(0, 10) || '');
    if (!newDueDate) return;
    if (!(await confirm(`确认重排计划 ${record.planNo} 到 ${newStartDate} ~ ${newDueDate}？`))) return;
    try {
      await ganttApi.rescheduleGanttPlan(record.id, newStartDate, newDueDate);
      toast.success('重排成功，已更新计划日期');
      refreshTable();
      await inspectPlanConflict(record.planNo, 'saved');
    } catch (error: any) {
      toast.error(error.message || '重排失败');
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-blue-700">计划与审批层</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.plan.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              生产计划回答的是“准备在哪个时间、哪个工厂、排多少量”，它属于执行前的计划和审批层，不是现场工单本身。计划一旦通过，才适合继续拆成工单、推到甘特预排和现场执行。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarRange, label: '它是什么', value: '排产与审批源头' },
                { icon: Factory, label: '核心内容', value: '工厂 / 时间 / 数量 / 状态' },
                { icon: ClipboardCheck, label: '下游去向', value: '工单 / 甘特 / 看板' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/production/job', title: '继续看生产工单', detail: '计划批准后，执行载体应该在工单层展开。' },
              { to: '/production/gantt', title: '再看甘特预排', detail: '计划落定后，才适合做时间轴上的预排和调整。' },
              { to: '/production/process', title: '回看工艺指示书', detail: '计划不是孤立表单，应承接上游工艺路线和核版要求。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-blue-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        key={tableKey}
        title={t('page.plan.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={PlanForm}
        initialSearchParams={initialSearchParams}
        onSaved={async (record) => {
          const planNo = record?.planNo;
          if (planNo) {
            await inspectPlanConflict(planNo, 'saved');
          }
        }}
        isEditDisabled={(record) => isApprovalLocked(record.auditStatus)}
        isDeleteDisabled={(record) => isApprovalLocked(record.auditStatus)}
        extraActions={(record: any) => {
          const approvalState = resolveApprovalState(record.auditStatus) || 'draft';
          const canSubmit = approvalState === 'draft' || approvalState === 'rejected';
          const canReview = approvalState === 'submitted';

          return (
            <>
            {canSubmit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'submit');
                }}
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                {t('common.submit')}
              </button>
            )}
            {canReview && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'approve');
                }}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                {t('common.approve')}
              </button>
            )}
            {canReview && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'reject');
                }}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
              >
                {t('common.reject')}
              </button>
            )}
            <NavLink
              to={`/production/plan/${record.id}/overview`}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
            >
              <Eye size={14} />
              查看详情
            </NavLink>
            <NavLink
              to={`/production/plan/print/${record.id}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              {t('common.print')}
            </NavLink>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inspectPlanConflict(record.planNo, 'manual');
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-amber-700 hover:bg-amber-50"
            >
              <AlertTriangle size={14} />
              检测冲突
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleReschedule(record);
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw size={14} />
              重排
            </button>
            </>
          );
        }}
      />
    </div>
  );
}
