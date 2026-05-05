import { NavLink } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowRight, CalendarRange, ClipboardCheck, Eye, Factory, Plus, RefreshCw } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import BaseModal from '@/components/ui/BaseModal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as productionApi from '@/api/production';
import * as processRouteApi from '@/api/processRoute';
import * as workCenterApi from '@/api/workCenter';
import * as ganttApi from '@/api/gantt';
import * as salesApi from '@/api/sales';
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
  update: productionApi.updateProducePlan,
  remove: productionApi.delProducePlan,
};

function isActiveProductionPlan(plan: any) {
  return String(plan?.planStatus || '') !== '10';
}

function getLinkedSalesOrderIds(plan: any) {
  return [
    plan?.salesOrderId,
    plan?.orderId,
    plan?.srcBillType === 'sales_order' ? plan?.srcBillId : null,
  ]
    .filter((id: any) => id != null && id !== '')
    .map((id: any) => String(id));
}

export default function ProducePlanPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const [tableKey, setTableKey] = useState(0);
  const [routeMap, setRouteMap] = useState<Record<string, string>>({});
  const [workCenterMap, setWorkCenterMap] = useState<Record<string, string>>({});
  const [ganttStatusMap, setGanttStatusMap] = useState<Record<string, any>>({});
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ startDate: '', dueDate: '' });
  const [rescheduling, setRescheduling] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);

  const [orderPool, setOrderPool] = useState<any[]>([]);
  const [orderPoolLoading, setOrderPoolLoading] = useState(false);
  const [orderPoolQuery, setOrderPoolQuery] = useState('');

  const loadOrderPool = useCallback(async (query: string) => {
    setOrderPoolLoading(true);
    try {
      const [salesRes, planRes]: any[] = await Promise.all([
        salesApi.listSalesOrder({
          pageNum: 1,
          pageSize: 50,
          styleCode: query,
          customerName: query,
        }),
        productionApi.listProducePlan({
          pageNum: 1,
          pageSize: 1000,
        }),
      ]);
      const plannedOrderIds = new Set(
        (planRes.rows || [])
          .filter(isActiveProductionPlan)
          .flatMap(getLinkedSalesOrderIds),
      );
      setOrderPool((salesRes.rows || []).filter((order: any) => !plannedOrderIds.has(String(order.id || ''))));
    } catch {
      setOrderPool([]);
    } finally {
      setOrderPoolLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrderPool('');
  }, [loadOrderPool]);

  const handleScheduleOrder = (order: any) => {
    setScheduleTarget({
      salesOrderId: String(order.id || ''),
      orderId: String(order.id || ''),
      salesNo: order.salesNo || '',
      styleCode: order.styleCode || '',
      styleCategory: order.styleCategory || order.productType || '',
      customerName: order.customerName || '',
      planQty: order.quantity ?? order.totalQty ?? '',
      dueDate: order.deliveryDate || order.dueDate || '',
      startDate: new Date().toISOString().slice(0, 10),
      planDate: new Date().toISOString().slice(0, 10),
      srcBillType: 'sales_order',
      srcBillId: String(order.id || ''),
      srcBillNo: order.salesNo || '',
    });
  };
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

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, unknown> = {};
    if (currentCompany.mode === 'factory' && currentCompany.factoryId != null) {
      params.factoryId = currentCompany.factoryId;
    }

    ganttApi
      .getGanttData(params)
      .then((res: any) => {
        if (cancelled) return;
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const nextMap = rows.reduce((acc: Record<string, any>, item: any) => {
          const key = String(item.planNo || item.name || item.id || '').trim();
          if (key) {
            acc[key] = item;
          }
          return acc;
        }, {});
        setGanttStatusMap(nextMap);
      })
      .catch(() => {
        if (!cancelled) setGanttStatusMap({});
      });

    return () => {
      cancelled = true;
    };
  }, [companySignature, currentCompany.factoryId, currentCompany.mode]);

  const columns = [
    { key: 'planNo', title: t('page.plan.columns.planNo') },
    { key: 'salesNo', title: t('page.plan.columns.salesNo') },
    { key: 'styleCode', title: t('page.plan.columns.styleCode') },
    {
      key: 'srcBillNo',
      title: '来源单据',
      render: (value: string, record: any) => value || record.srcBillType || '-',
    },
    {
      key: 'techId',
      title: '技术单',
      render: (value: number | string) => (value ? `#${value}` : '-'),
    },
    {
      key: 'noticeId',
      title: '打样单',
      render: (value: number | string) => (value ? `#${value}` : '-'),
    },
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
    {
      key: 'scheduleReady',
      title: '预排状态',
      render: (_: any, record: any) => {
        const ganttState = ganttStatusMap[String(record.planNo || '')];
        if (!ganttState) {
          return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">未进入预排池</span>;
        }
        if (ganttState.scheduleReady) {
          return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">可预排</span>;
        }
        if (ganttState.conflictLevel === 'BLOCKED') {
          return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-700">阻断</span>;
        }
        return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">待补数据</span>;
      },
    },
    {
      key: 'preScheduleReason',
      title: '阻断原因',
      render: (_: any, record: any) => {
        const ganttState = ganttStatusMap[String(record.planNo || '')];
        return ganttState?.conflictReason || '-';
      },
      width: '260px',
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
    { name: 'srcBillNo', label: '来源单据' },
    { name: 'planStatus', label: t('page.plan.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  const initialSearchParams = useMemo(
    () => ({
      planNo: searchParams.get('planNo') || '',
      customerName: searchParams.get('customerName') || '',
      styleCode: searchParams.get('styleCode') || '',
      srcBillNo: searchParams.get('srcBillNo') || '',
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

  const handleScheduleSubmit = async (values: any) => {
    setScheduling(true);
    try {
      await productionApi.addProducePlan(values);
      toast.success('排产计划已创建');
      setScheduleTarget(null);
      setOrderPool((prev) => prev.filter((order) => String(order.id || '') !== String(values.salesOrderId || values.orderId || '')));
      await loadOrderPool(orderPoolQuery);
      refreshTable();
      if (values?.planNo) {
        await inspectPlanConflict(values.planNo, 'saved');
      }
    } catch (error: any) {
      toast.error(error.message || '排产失败');
      throw error;
    } finally {
      setScheduling(false);
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

  const handleReschedule = (record: any) => {
    setRescheduleTarget(record);
    setRescheduleForm({
      startDate: record.startDate?.slice?.(0, 10) || '',
      dueDate: record.dueDate?.slice?.(0, 10) || '',
    });
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget) return;
    if (!rescheduleForm.startDate || !rescheduleForm.dueDate) {
      toast.error('请填写开始日期和交期');
      return;
    }
    if (!(await confirm(`确认重排计划 ${rescheduleTarget.planNo} 到 ${rescheduleForm.startDate} ~ ${rescheduleForm.dueDate}？`))) return;
    setRescheduling(true);
    try {
      await ganttApi.rescheduleGanttPlan(rescheduleTarget.id, rescheduleForm.startDate, rescheduleForm.dueDate);
      toast.success('重排成功，已更新计划日期');
      setRescheduleTarget(null);
      refreshTable();
      await inspectPlanConflict(rescheduleTarget.planNo, 'saved');
    } catch (error: any) {
      toast.error(error.message || '重排失败');
    } finally {
      setRescheduling(false);
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
              生产计划回答的是"准备在哪个时间、哪个工厂、排多少量"，它属于执行前的计划和审批层，不是现场工单本身。计划一旦通过，才适合继续拆成工单、推到甘特预排和现场执行。
            </p>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              生产计划必须来自销售订单。请在下方「待排产订单池」选择订单后点「排产」，系统会自动带入款号、客户和来源信息。
            </div>
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
              { to: '/sales/order', title: '先去销售订单', detail: '生产计划必须来自销售订单，先在这里确认订单已存在并放行。' },
              { to: '/production/job', title: '继续看生产工单', detail: '计划批准后，执行载体应该在工单层展开。' },
              { to: '/production/gantt', title: '再看甘特预排', detail: '计划落定后，才适合做时间轴上的预排和调整。' },
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

      {/* 待排产订单池 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">待排产订单池</h2>
            <p className="mt-1 text-sm text-slate-500">从已有销售订单选择，点「排产」进入计划表单，系统自动带入来源信息。</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="按款号或客户名称搜索..."
          value={orderPoolQuery}
          onChange={(e) => {
            setOrderPoolQuery(e.target.value);
            loadOrderPool(e.target.value);
          }}
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 max-w-sm"
        />
        {orderPoolLoading ? (
          <div className="py-6 text-center text-sm text-slate-400">加载中...</div>
        ) : orderPool.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
            未找到销售订单。请先在「销售订单」页面创建并放行订单。
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3">销售单号</th>
                  <th className="px-4 py-3">款号</th>
                  <th className="px-4 py-3">客户</th>
                  <th className="px-4 py-3">数量</th>
                  <th className="px-4 py-3">交期</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {orderPool.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.salesNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{order.styleCode || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{order.quantity ?? order.totalQty ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{order.deliveryDate ? String(order.deliveryDate).slice(0, 10) : order.dueDate ? String(order.dueDate).slice(0, 10) : '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleScheduleOrder(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <Plus size={12} />
                        排产
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            <NavLink
              to={`/production/gantt?planNo=${encodeURIComponent(record.planNo || '')}&styleCode=${encodeURIComponent(record.styleCode || '')}&customerName=${encodeURIComponent(record.customerName || '')}`}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
            >
              <CalendarRange size={14} />
              去预排
            </NavLink>
            </>
          );
        }}
      />
      {/* 重排日期 Modal — 替代 window.prompt */}
      <BaseModal
        open={!!scheduleTarget}
        title={`订单排产：${scheduleTarget?.salesNo || ''}`}
        onClose={() => setScheduleTarget(null)}
        width="860px"
        loading={scheduling}
      >
        <PlanForm
          initialValues={scheduleTarget}
          onSubmit={handleScheduleSubmit}
          onCancel={() => setScheduleTarget(null)}
        />
      </BaseModal>

      <BaseModal
        open={!!rescheduleTarget}
        title={`重排计划：${rescheduleTarget?.planNo || ''}`}
        onClose={() => setRescheduleTarget(null)}
      >
        <div className="space-y-4 p-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">开始日期</label>
            <input
              type="date"
              value={rescheduleForm.startDate}
              onChange={(e) => setRescheduleForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">交期</label>
            <input
              type="date"
              value={rescheduleForm.dueDate}
              onChange={(e) => setRescheduleForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="button"
              disabled={rescheduling}
              onClick={handleRescheduleSubmit}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {rescheduling ? '重排中…' : '确认重排'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
