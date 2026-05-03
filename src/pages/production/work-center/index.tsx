import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/workCenter';
import * as orgApi from '@/api/orgUnit';
import * as productionApi from '@/api/production';
import { SKIP_FACTORY_CONTEXT_HEADER } from '@/api/client';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel, getOrgFactoryIdForCompany } from '@/utils/companyContext';
import { Activity, AlertTriangle, ArrowRight, CalendarRange, CheckCircle2, ClipboardList, Factory, LayoutDashboard, PackageCheck, TimerReset } from 'lucide-react';

const pageApi = {
  list: api.listWorkCenter,
  get: api.getWorkCenter,
  add: api.addWorkCenter,
  update: api.updateWorkCenter,
  remove: api.delWorkCenter,
};

interface WorkshopOption {
  value: string;
  label: string;
}

interface ProduceJobRow {
  id: number;
  jobNo?: string;
  planNo?: string;
  styleCode?: string;
  planQty?: number;
  actualQty?: number;
  defectQty?: number;
  status?: string;
  currentProcessName?: string;
}

export default function WorkCenterPage() {
  const { t } = useTranslation();
  const S = 'workCenter';
  const status = useDictOptions('sys_normal_disable');
  const currentCompany = useAppStore((state) => state.currentCompany);
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [jobs, setJobs] = useState<ProduceJobRow[]>([]);
  const [jobSummary, setJobSummary] = useState({ total: 0, running: 0, pending: 0, completed: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadWorkshops() {
      try {
        const orgFactoryId = getOrgFactoryIdForCompany(currentCompany.code);
        const res: any = await orgApi.listOrgUnit({
          pageNum: 1,
          pageSize: 999,
          orgType: 'WORKSHOP',
          factoryId: orgFactoryId ?? undefined,
          status: '0',
        }, {
          headers: {
            [SKIP_FACTORY_CONTEXT_HEADER]: '1',
          },
        });
        if (cancelled) {
          return;
        }
        setWorkshops(
          (res.rows || []).map((item: any) => ({
            value: String(item.id),
            label: item.orgName || String(item.id),
          }))
        );
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.message || t('workCenter.workshopLoadFailed'));
        }
      }
    }

    loadWorkshops();
    return () => {
      cancelled = true;
    };
  }, [currentCompany.code, t]);

  useEffect(() => {
    let cancelled = false;

    async function loadJobSummary() {
      try {
        const response: any = await productionApi.listProduceJob({ pageNum: 1, pageSize: 200 });
        if (cancelled) {
          return;
        }
        const rows = response.rows || [];
        setJobs(rows);
        setJobSummary({
          total: rows.length,
          running: rows.filter((item: any) => item.status === '1').length,
          pending: rows.filter((item: any) => item.status === '0').length,
          completed: rows.filter((item: any) => item.status === '2').length,
        });
      } catch {
        if (!cancelled) {
          setJobSummary({ total: 0, running: 0, pending: 0, completed: 0 });
        }
      }
    }

    loadJobSummary();
    return () => {
      cancelled = true;
    };
  }, [currentCompany.code]);

  const completionMetrics = useMemo(() => {
    const completedJobs = jobs.filter((item) => item.status === '2');
    const totalPlanQty = jobs.reduce((sum, item) => sum + (Number(item.planQty) || 0), 0);
    const totalActualQty = jobs.reduce((sum, item) => sum + (Number(item.actualQty) || 0), 0);
    const completionRate = totalPlanQty > 0 ? Math.round((totalActualQty / totalPlanQty) * 100) : 0;

    return {
      todayCompleted: completedJobs.length,
      weekCompleted: completedJobs.length,
      completionRate,
      totalActualQty,
    };
  }, [jobs]);

  const riskyJobs = useMemo(() => {
    return jobs
      .map((item) => {
        const planQty = Number(item.planQty) || 0;
        const actualQty = Number(item.actualQty) || 0;
        const defectQty = Number(item.defectQty) || 0;
        const progress = planQty > 0 ? Math.round((actualQty / planQty) * 100) : 0;
        const riskScore =
          (defectQty > 0 ? 100 : 0) +
          (item.status === '0' ? 30 : 0) +
          (item.status === '1' && progress < 70 ? 50 - progress : 0);
        return {
          ...item,
          progress,
          defectQty,
          riskScore,
        };
      })
      .filter((item) => item.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);
  }, [jobs]);

  const workshopLabelMap = useMemo(
    () =>
      workshops.reduce<Record<string, string>>((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {}),
    [workshops]
  );

  const centerTypeOptions = useMemo(
    () => [
      { value: 'KNITTING', label: t('workCenter.types.knitting') },
      { value: 'LINKING', label: t('workCenter.types.linking') },
      { value: 'SEWING', label: t('workCenter.types.sewing') },
      { value: 'FINISHING', label: t('workCenter.types.finishing') },
      { value: 'QUALITY', label: t('workCenter.types.quality') },
      { value: 'MAINTENANCE', label: t('workCenter.types.maintenance') },
    ],
    [t]
  );

  const centerTypeLabelMap = useMemo(
    () =>
      centerTypeOptions.reduce<Record<string, string>>((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {}),
    [centerTypeOptions]
  );

  const columns = [
    { key: 'centerCode', title: t(`${S}.centerCode`) },
    { key: 'centerName', title: t(`${S}.centerName`) },
    {
      key: 'centerType',
      title: t(`${S}.centerType`),
      render: (value: string) => centerTypeLabelMap[value] || value || '-',
    },
    {
      key: 'workshopId',
      title: t(`${S}.workshopId`),
      render: (value: string | number) => workshopLabelMap[String(value)] || value || '-',
    },
    {
      key: 'capacity',
      title: t(`${S}.capacity`),
      render: (value: string | number, record: any) => {
        if (value == null || value === '') {
          return '-';
        }
        return `${value} ${record.capacityUnit || ''}`.trim();
      },
    },
    {
      key: 'shiftCount',
      title: t(`${S}.shiftCount`),
      render: (value: number) => (value != null ? `${value}班` : '-'),
    },
    {
      key: 'headcount',
      title: t(`${S}.headcount`),
      render: (value: number) => (value != null ? `${value}人` : '-'),
    },
    { key: 'manager', title: t(`${S}.manager`) },
    {
      key: 'status',
      title: t(`${S}.status`),
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'remark', title: t(`${S}.remark`) },
  ];

  const searchFields = [
    { name: 'centerCode', label: t(`${S}.centerCode`) },
    { name: 'centerName', label: t(`${S}.centerName`) },
    { name: 'centerType', label: t(`${S}.centerType`), type: 'select' as const, options: centerTypeOptions },
  ];

  const formFields = [
    { name: 'centerCode', label: t(`${S}.centerCode`), required: true },
    { name: 'centerName', label: t(`${S}.centerName`), required: true },
    { name: 'centerType', label: t(`${S}.centerType`), type: 'select' as const, required: true, options: centerTypeOptions },
    { name: 'workshopId', label: t(`${S}.workshopId`), type: 'select' as const, options: workshops },
    { name: 'capacity', label: t(`${S}.capacity`), type: 'number' as const },
    {
      name: 'capacityUnit',
      label: t(`${S}.capacityUnit`),
      type: 'select' as const,
      options: [
        { value: '件/日', label: t('workCenter.units.piecePerDay') },
        { value: '台/日', label: t('workCenter.units.machinePerDay') },
        { value: '工时/日', label: t('workCenter.units.hourPerDay') },
      ],
    },
    { name: 'shiftCount', label: t(`${S}.shiftCount`), type: 'number' as const },
    { name: 'standardWorkHours', label: t(`${S}.standardWorkHours`), type: 'number' as const },
    { name: 'sewingMachines', label: t(`${S}.sewingMachines`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'knittingMachines', label: t(`${S}.knittingMachines`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'linkingMachines', label: t(`${S}.linkingMachines`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'ironingStations', label: t(`${S}.ironingStations`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'inspectionStations', label: t(`${S}.inspectionStations`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'repairStations', label: t(`${S}.repairStations`), type: 'number' as const, group: t(`${S}.equipmentGroup`) },
    { name: 'headcount', label: t(`${S}.headcount`), type: 'number' as const, group: t(`${S}.peopleGroup`) },
    { name: 'teamSize', label: t(`${S}.teamSize`), type: 'number' as const, group: t(`${S}.peopleGroup`) },
    { name: 'manager', label: t(`${S}.manager`) },
    { name: 'status', label: t(`${S}.status`), type: 'select' as const, options: status.options },
    { name: 'remark', label: t(`${S}.remark`), type: 'textarea' as const },
  ];

  const cockpitCards = [
    {
      label: '预排池',
      value: String(jobSummary.pending),
      helper: '当前还没开线、仍可调整顺序的工单',
      icon: TimerReset,
      tone: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: '实际开线',
      value: String(jobSummary.running),
      helper: '当前已经在现场推进的工单',
      icon: Activity,
      tone: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      label: '已完工',
      value: String(jobSummary.completed),
      helper: '当前工厂已完成的工单数',
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: '需关注',
      value: String(Math.max(jobSummary.pending - jobSummary.running, 0)),
      helper: '预排积压高于现场开线时优先关注',
      icon: AlertTriangle,
      tone: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  const cockpitSignals = [
    `当前计划池 ${jobSummary.pending} 单，适合先去甘特图判断是否需要重排。`,
    `现场开线 ${jobSummary.running} 单，说明正在执行的节奏主要落在生产看板与报工。`,
    `若“预排池”明显高于“实际开线”，通常表示排产已堆积、线体尚未完全释放。`,
  ];

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.95),_rgba(30,41,59,0.88),_rgba(99,102,241,0.78))] px-6 py-5 text-white lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
              {t('companyContext.currentLabel')}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{getCompanyLabel(currentCompany.code, t)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">{t('workCenter.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-100">{t('workCenter.cards.capacity')}</p>
              <p className="mt-2 text-lg font-semibold">{t('workCenter.cards.capacityHint')}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-100">{t('workCenter.cards.workshop')}</p>
              <p className="mt-2 text-lg font-semibold">{workshops.length || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">工厂运行情况</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">产线、预排与实际的总入口</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">这里先看当前工厂车间和工单运行的大盘，再决定是去调预排、看现场实际，还是下钻到工序报工。这样比在多个旧页面来回找更直观。</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <LayoutDashboard size={22} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { label: '车间数量', value: String(workshops.length), icon: Factory },
              { label: '工单总数', value: String(jobSummary.total), icon: ClipboardList },
              { label: '生产中', value: String(jobSummary.running), icon: Activity },
              { label: '待开工', value: String(jobSummary.pending), icon: PackageCheck },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-2 text-slate-600 shadow-sm">
                    <card.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { to: '/production/gantt', icon: CalendarRange, title: '看工厂预排', detail: '从计划负荷、时间轴和排期冲突去看是否需要调线。' },
            { to: '/production/kanban', icon: Activity, title: '看现场实际', detail: '查看今日在制、风险工单、完成率和实际推进情况。' },
            { to: '/production/job-process', icon: ClipboardList, title: '看工序报工', detail: '下钻到工票和工序节点，查看具体报工与流转。' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="group rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                  <item.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
                <ArrowRight size={16} className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">预排 vs 实际</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">先看计划池，再看现场开线</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">这一层不是精确 APS，而是给厂长一个先判断方向的面板：现在是排期还没落到线体，还是线体已经在跑但需要追进度。</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Factory size={22} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cockpitCards.map((card) => (
              <div key={card.label} className={`rounded-2xl border px-4 py-4 ${card.tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] opacity-80">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-2">
                    <card.icon size={18} />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 opacity-85">{card.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">驾驶舱提示</h3>
          <div className="mt-4 space-y-3">
            {cockpitSignals.map((signal) => (
              <div key={signal} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                {signal}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            <NavLink to="/production/gantt" className="group rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <div className="flex items-center justify-between gap-3">
                <span>先去预排甘特图</span>
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </div>
            </NavLink>
            <NavLink to="/production/kanban" className="group rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700">
              <div className="flex items-center justify-between gap-3">
                <span>再看现场实际看板</span>
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </div>
            </NavLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">今日运行结果</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">先看完成，再判断是否压线</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">这里先给厂长一个管理口径的完成结果，不伪装成精确日报，但足够判断今天是推进正常还是需要重点催线。</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: '今日完成', value: String(completionMetrics.todayCompleted), helper: '按当前已完工工单口径展示' },
              { label: '本周完成', value: String(completionMetrics.weekCompleted), helper: '先给出最小可解释周完成口径' },
              { label: '完成率', value: `${completionMetrics.completionRate}%`, helper: '按实际数量 / 计划数量估算' },
              { label: '累计报工', value: String(completionMetrics.totalActualQty), helper: '当前工厂已录入的实际数量' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{metric.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">风险工单 Top N</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">今天先盯这几单</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">优先把有次品、低进度、待开工积压的工单提到前面，方便厂长先抓重点。</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
              <AlertTriangle size={22} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {riskyJobs.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">当前没有需要重点跟进的风险工单。</div>
            ) : (
              riskyJobs.map((job) => (
                <NavLink
                  key={job.id}
                  to={job.jobNo ? `/production/job?jobNo=${encodeURIComponent(job.jobNo)}` : '/production/job'}
                  className="group block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-rose-300 hover:bg-rose-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{job.jobNo || '-'}</p>
                      <p className="mt-1 text-xs text-slate-500">{job.styleCode || '-'} / {job.currentProcessName || '待初始化'}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-700">风险 {job.riskScore}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <div>
                      <p>计划</p>
                      <p className="mt-1 font-medium text-slate-900">{job.planQty || 0}</p>
                    </div>
                    <div>
                      <p>进度</p>
                      <p className="mt-1 font-medium text-slate-900">{job.progress}%</p>
                    </div>
                    <div>
                      <p>次品</p>
                      <p className={`mt-1 font-medium ${job.defectQty > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{job.defectQty}</p>
                    </div>
                  </div>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </section>

      <CrudPage
        title={t(`${S}.title`)}
        api={pageApi}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      />
    </div>
  );
}
