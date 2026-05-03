import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, PackageCheck, Route, Ticket } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import * as productionApi from '@/api/production';
import { useDictOptions } from '@/hooks/useDictOptions';
import JobForm from './JobForm';

const api = {
  list: productionApi.listProduceJob,
  get: productionApi.getProduceJob,
  add: productionApi.addProduceJob,
  update: productionApi.updateProduceJob,
  remove: productionApi.delProduceJob,
};

export default function ProduceJobPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [tableKey, setTableKey] = useState(0);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.kanban.status.pending') },
    { value: '1', label: t('page.kanban.status.running') },
    { value: '2', label: t('page.kanban.status.completed') },
    { value: '3', label: t('common.close') },
  ]);

  const columns = [
    { key: 'jobNo', title: t('page.job.columns.jobNo') },
    { key: 'planNo', title: t('page.job.columns.planNo') },
    { key: 'salesNo', title: t('page.job.columns.salesNo') },
    { key: 'styleCode', title: t('page.job.columns.styleCode') },
    { key: 'colorCode', title: t('page.job.columns.colorCode') },
    { key: 'sizeCode', title: t('page.job.columns.sizeCode') },
    { key: 'planQty', title: t('page.job.columns.planQty') },
    { key: 'actualQty', title: t('page.job.columns.actualQty') },
    { key: 'defectQty', title: t('page.job.columns.defectQty') },
    {
      key: 'status',
      title: t('page.job.columns.status'),
      render: (value: string) => {
        const tag = planStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'jobNo', label: t('page.job.columns.jobNo') },
    { name: 'customerName', label: t('page.plan.form.customerName', { defaultValue: '客户名称' }) },
    { name: 'salesNo', label: t('page.job.columns.salesNo') },
    { name: 'styleCode', label: t('page.job.columns.styleCode') },
    { name: 'status', label: t('page.job.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  const initialSearchParams = useMemo(
    () => ({
      jobNo: searchParams.get('jobNo') || '',
      customerName: searchParams.get('customerName') || '',
      salesNo: searchParams.get('salesNo') || '',
      styleCode: searchParams.get('styleCode') || '',
      status: searchParams.get('status') || '',
      producePlanId: searchParams.get('producePlanId') || searchParams.get('planId') || '',
    }),
    [searchParams],
  );

  const handleInitProcesses = async (record: any) => {
    const routeId = record.processRouteId;
    if (!routeId) {
      toast.error(t('page.job.toasts.routeMissing'));
      return;
    }

    const confirmed = await confirm(t('page.job.confirmInit', { jobNo: record.jobNo }));
    if (!confirmed) {
      return;
    }

    setLoading((prev) => ({ ...prev, [record.id]: true }));
    try {
      await productionApi.initJobProcesses(record.id, Number(routeId));
      toast.success(t('page.job.toasts.initSuccess'));
      setTableKey((prev) => prev + 1);
    } catch {
      toast.error(t('page.job.toasts.initFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">执行载体层</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.job.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              生产工单是把计划真正落到执行层的载体。计划回答“准备做什么”，工单回答“这次具体做哪张单、哪种颜色尺码、走哪条路线、初始化哪些工序”，是车间、班组和报工共同围绕的核心单据。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Ticket, label: '它是什么', value: '计划落地后的执行单' },
                { icon: Route, label: '核心动作', value: '初始化工序 / 打印 / 开工' },
                { icon: PackageCheck, label: '下游去向', value: '看板 / 报工 / 质检' },
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
              { to: '/production/kanban', title: '继续看生产看板', detail: '工单下达到现场后，运行状态应在看板层集中呈现。' },
              { to: '/production/job-process', title: '再看工序报工', detail: '工单初始化工序后，班组实际执行和报工在这里继续展开。' },
              { to: '/production/plan', title: '回看生产计划', detail: '工单不是独立来源，必须承接已经确认的生产计划。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        key={tableKey}
        title={t('page.job.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={JobForm}
        initialSearchParams={initialSearchParams}
        extraActions={(record: any) => (
          <>
            <NavLink
              to={`/production/job/print/${record.id}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              {t('common.print')}
            </NavLink>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleInitProcesses(record);
              }}
              disabled={loading[record.id]}
              className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
              {loading[record.id] ? t('page.job.initializing') : t('page.job.initProcess')}
            </button>
          </>
        )}
      />
    </div>
  );
}
