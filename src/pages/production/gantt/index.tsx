import { startTransition, useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowRight, CalendarRange, CheckCircle2, Clock3, Factory, Search, UserRound } from 'lucide-react';
import GanttChart, { GanttTask } from '@/components/ui/GanttChart';
import * as ganttApi from '@/api/gantt';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel } from '@/utils/companyContext';

type ViewMode = 'Day' | 'Week' | 'Month';

export default function ProductionGanttPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentCompany = useAppStore((state) => state.currentCompany);
  const S = 'page.gantt';
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState<any[]>([]);
  const customerName = searchParams.get('customerName') || '';
  const planNo = searchParams.get('planNo') || '';
  const styleCode = searchParams.get('styleCode') || '';
  const [search, setSearch] = useState(planNo || styleCode || customerName);

  const loadData = () => {
    setLoading(true);
    const params: Record<string, unknown> = { customerName };
    if (currentCompany.mode === 'factory' && currentCompany.factoryId != null) {
      params.factoryId = currentCompany.factoryId;
    }
    ganttApi
      .getGanttData(params)
      .then((res: any) => {
        const raw: any[] = res.data || res || [];
        startTransition(() => {
          setRawData(raw);
          setError('');
          setLoading(false);
        });
      })
      .catch(() => {
        setError(t(`${S}.loadFailed`));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [customerName, currentCompany.code, currentCompany.factoryId, currentCompany.mode]);

  useEffect(() => {
    setSearch(planNo || styleCode || customerName);
  }, [customerName, planNo, styleCode]);

  const filtered = useMemo(
    () =>
      search
        ? rawData.filter((task: any) =>
            `${task.name || task.planNo || ''} ${task.styleCode || ''} ${task.customerName || ''} ${task.routeName || ''} ${task.workCenterName || ''}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : rawData,
    [rawData, search],
  );

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, item: any) => {
        if (item.scheduleReady) {
          acc.ready += 1;
        } else {
          acc.pending += 1;
        }
        if (item.conflictLevel === 'WARNING' || item.conflictLevel === 'BLOCKED') {
          acc.conflict += 1;
        }
        return acc;
      },
      { ready: 0, pending: 0, conflict: 0 },
    );
  }, [filtered]);

  const tasks: GanttTask[] = useMemo(
    () =>
      filtered.map((task: any) => ({
        id: String(task.id),
        name: task.name || task.planNo || `${t(`${S}.planPrefix`)}#${task.id}`,
        start: task.start ? task.start.split('T')[0] : new Date().toISOString().split('T')[0],
        end: task.end ? task.end.split('T')[0] : new Date().toISOString().split('T')[0],
        progress: task.progress ?? 0,
        owner: task.owner || task.salesName || '',
        status: task.status || '',
        customerName: task.customerName || '',
        styleCategory: task.styleCategory || '',
        color:
          task.conflictLevel === 'BLOCKED'
            ? '#ef4444'
            : task.conflictLevel === 'WARNING'
              ? '#f59e0b'
              : '#10b981',
      })),
    [filtered, t],
  );

  const topRows = useMemo(() => filtered.slice(0, 8), [filtered]);

  const handleDateChange = (task: GanttTask, start: Date, end: Date) => {
    ganttApi
      .updateGanttDate(
        Number(task.id),
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
      )
      .catch(() => toast.error(t(`${S}.updateFailed`)));
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 p-4">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#dbeafe_100%)] px-6 py-6 text-white shadow-lg">
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">计划时间轴与负荷判断</p>
            <h1 className="mt-2 text-3xl font-semibold">{t(`${S}.title`)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/90">
              这里先看计划时间轴、工艺路线、工作中心和是否具备正式预排条件。只有路线、数量、产能口径齐备时，负荷判断才可信；现场实际执行仍然要去工厂总览和生产看板看。
            </p>
            {customerName ? (
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50/95 backdrop-blur">
                当前客户：{customerName}，当前公司：{getCompanyLabel(currentCompany.code, t)}
              </div>
            ) : null}
            {planNo ? (
              <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50/95 backdrop-blur">
                当前预排定位：计划单 {planNo}{styleCode ? ` · 款号 ${styleCode}` : ''}
              </div>
            ) : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: '可正式预排', value: summary.ready || 0, helper: '路线、数量、产能口径齐备的计划数' },
                { label: '待补数据', value: summary.pending || 0, helper: '缺路线、缺数量、缺工作中心或口径不统一' },
                { label: '存在冲突', value: summary.conflict || 0, helper: '时间窗不足或工作中心叠加超负荷' },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold">{card.value}</p>
                  <p className="mt-1 text-xs text-blue-100/85">{card.helper}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 rounded-[28px] border border-white/12 bg-slate-950/25 p-4 backdrop-blur">
            {[
              {
                title: '查看工厂运行情况',
                detail: '看工厂产线、工作中心、在制工单和去报工的入口。',
                icon: Factory,
                to: customerName ? `/production/work-center?customerName=${encodeURIComponent(customerName)}` : '/production/work-center',
              },
              {
                title: '切到生产看板',
                detail: '排期确认后，在看板里看今日实际、风险工单和报工入口。',
                icon: CalendarRange,
                to: customerName ? `/production/kanban?customerName=${encodeURIComponent(customerName)}` : '/production/kanban',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-white/12 bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/15 p-2 text-white">
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-blue-100/90">{item.detail}</p>
                  </div>
                  <ArrowRight size={16} className="mt-1 transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">计划时间轴明细</h2>
          <p className="text-xs text-slate-500">先核对路线、工作中心、负荷和冲突原因，再决定是否拖动时间轴。</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <Search size={14} className="text-slate-400" />
          <input
            className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder={t(`${S}.searchPlaceholder`)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {(['Day', 'Week', 'Month'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                viewMode === m
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t(m === 'Day' ? `${S}.viewModeDay` : m === 'Week' ? `${S}.viewModeWeek` : `${S}.viewModeMonth`)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {t(`${S}.totalLabel`, { count: filtered.length })}
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}
        {!loading && error && (
          <div className="flex h-64 items-center justify-center text-slate-400">{error}</div>
        )}
        {!loading && !error && tasks.length === 0 && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            {t(`${S}.noData`)}
          </div>
        )}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3 px-4 pt-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-semibold">可正式预排</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-emerald-700/85">路线、计划数量、工作中心和工时/日产能口径都已齐备。</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock3 size={16} />
                  <span className="text-sm font-semibold">待补数据</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-amber-700/85">当前最常见的是缺路线、缺数量或工作中心产能单位还不是工时/日。</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-semibold">冲突提示</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-rose-700/85">当前只对时间窗不足和同工作中心叠加超负荷做最小冲突判断，不伪装成高级排产。</p>
              </div>
            </div>

            <div className="grid gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 md:grid-cols-[minmax(180px,1.5fr)_120px_120px_140px_120px_2fr]">
              <span>{t(`${S}.taskName`)}</span>
              <span>{t(`${S}.owner`)}</span>
              <span>工艺路线</span>
              <span>工作中心</span>
              <span>负荷判断</span>
              <span>待补数据 / 冲突原因</span>
            </div>
            {topRows.map((task: any) => (
              <div key={task.id} className="grid gap-2 border-b border-slate-100 px-4 py-3 text-xs text-slate-600 md:grid-cols-[minmax(180px,1.5fr)_120px_120px_140px_120px_2fr]">
                <div className="min-w-0">
                  <span className="font-medium text-slate-800">{task.name}</span>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span>客户：{task.customerName || '-'}</span>
                    <span>数量：{task.planQty ?? '-'}</span>
                    <span>分类：{task.styleCategory || '-'}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1">
                  <UserRound size={12} className="text-slate-400" />
                  {task.owner || t(`${S}.unassigned`)}
                </span>
                <span>{task.routeName || '-'}</span>
                <span>{task.workCenterName || '-'}</span>
                <span
                  className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-medium ${
                    task.conflictLevel === 'BLOCKED'
                      ? 'bg-rose-100 text-rose-700'
                      : task.conflictLevel === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {task.scheduleReady ? `可预排 · ${task.estimatedDays ?? '-'}天` : '待补数据'}
                </span>
                <div className="text-[11px] leading-5 text-slate-500">
                  <div>{task.conflictReason || '-'}</div>
                  <div className="text-slate-400">
                    标准工时：{task.totalStandardHours ?? '-'} / 总需求工时：{task.totalRequiredHours ?? '-'} / 负荷：{task.loadPercent ?? '-'}%
                  </div>
                </div>
              </div>
            ))}
            <div className="px-4 pb-4">
              <div className="mb-2 text-xs text-slate-500">时间轴仅用于查看和调整日期，正式预排判断以上方数据为准。</div>
              <GanttChart tasks={tasks} viewMode={viewMode} onDateChange={handleDateChange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
