import {useCallback, useEffect, useMemo, useState} from 'react';
import {NavLink} from 'react-router-dom';
import * as jobApi from '@/api/production';
import {toast} from '@/components/ui/Toast';
import {
  AlertTriangle,
  ArrowRight,
  CircleDot,
  Factory,
  Play,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface ProduceJob {
  id: number;
  jobNo: string;
  planNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  actualQty?: number;
  defectQty?: number;
  currentProcessName?: string;
  status?: string;
}

type FilterKey = 'all' | 'running' | 'pending' | 'risk';

const STATUS_META: Record<string, {label: string; chip: string}> = {
  '0': {label: '待生产', chip: 'bg-slate-100 text-slate-700'},
  '1': {label: '生产中', chip: 'bg-amber-100 text-amber-700'},
  '2': {label: '已完成', chip: 'bg-emerald-100 text-emerald-700'},
};

function toNumber(value: number | undefined) {
  return Number(value) || 0;
}

export default function ProductionKanbanPage() {
  const [jobs, setJobs] = useState<ProduceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [keyword, setKeyword] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await jobApi.listProduceJob({pageNum: 1, pageSize: 200});
      setJobs(response.rows || []);
    } catch {
      toast.error('加载生产工单失败');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = useMemo(() => {
    const running = jobs.filter((item) => item.status === '1');
    const pending = jobs.filter((item) => item.status === '0');
    const risky = jobs.filter((item) => {
      const planQty = toNumber(item.planQty);
      const actualQty = toNumber(item.actualQty);
      const defectQty = toNumber(item.defectQty);
      const progress = planQty > 0 ? (actualQty / planQty) * 100 : 0;
      return defectQty > 0 || (item.status === '1' && actualQty > 0 && progress < 70);
    });
    const totalPlanQty = jobs.reduce((sum, item) => sum + toNumber(item.planQty), 0);
    const totalActualQty = jobs.reduce((sum, item) => sum + toNumber(item.actualQty), 0);
    const totalDefectQty = jobs.reduce((sum, item) => sum + toNumber(item.defectQty), 0);
    const completionRate = totalPlanQty > 0 ? Math.round((totalActualQty / totalPlanQty) * 100) : 0;

    return {
      running,
      pending,
      risky,
      totalPlanQty,
      totalActualQty,
      totalDefectQty,
      completionRate,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return jobs.filter((item) => {
      const planQty = toNumber(item.planQty);
      const actualQty = toNumber(item.actualQty);
      const defectQty = toNumber(item.defectQty);
      const progress = planQty > 0 ? (actualQty / planQty) * 100 : 0;
      const matchesFilter = activeFilter === 'all'
        || (activeFilter === 'running' && item.status === '1')
        || (activeFilter === 'pending' && item.status === '0')
        || (activeFilter === 'risk' && (defectQty > 0 || (item.status === '1' && actualQty > 0 && progress < 70)));
      const matchesKeyword = !normalizedKeyword || [
        item.jobNo,
        item.planNo,
        item.styleCode,
        item.currentProcessName,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedKeyword));

      return matchesFilter && matchesKeyword;
    });
  }, [activeFilter, jobs, keyword]);

  const filterTabs: Array<{key: FilterKey; label: string; count: number}> = [
    {key: 'all', label: '全部工单', count: jobs.length},
    {key: 'running', label: '生产中', count: metrics.running.length},
    {key: 'pending', label: '待开工', count: metrics.pending.length},
    {key: 'risk', label: '需关注', count: metrics.risky.length},
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#dbeafe_100%)] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-100">Production Pulse</p>
            <h2 className="mt-2 text-3xl font-semibold">生产看板</h2>
            <p className="mt-2 text-sm text-blue-50/90">
              先看总量、再看风险、最后下钻到报工。让管理动作围绕真实工票和工序节奏展开。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索工单号 / 款号 / 当前工序"
              className="min-w-[240px] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-100/70 outline-none backdrop-blur focus:border-white/50"
            />
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur transition hover:bg-white/20"
            >
              <RefreshCw size={15} />
              刷新看板
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <Factory size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-100">工单总数</p>
                <p className="text-2xl font-semibold">{jobs.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-100/90">当前计划总量 {metrics.totalPlanQty.toLocaleString()} 件</p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <Play size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-100">生产中工单</p>
                <p className="text-2xl font-semibold">{metrics.running.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-100/90">待开工 {metrics.pending.length} 单</p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-100">完成率</p>
                <p className="text-2xl font-semibold">{metrics.completionRate}%</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-100/90">已报工 {metrics.totalActualQty.toLocaleString()} 件</p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-100">风险工单</p>
                <p className="text-2xl font-semibold">{metrics.risky.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-100/90">累计次品 {metrics.totalDefectQty.toLocaleString()} 件</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {filterTabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    activeFilter === item.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label} {item.count}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-12 text-center text-slate-400 shadow-sm">加载中...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center text-slate-400 shadow-sm">当前筛选下暂无工单</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredJobs.map((job) => {
                const planQty = toNumber(job.planQty);
                const actualQty = toNumber(job.actualQty);
                const defectQty = toNumber(job.defectQty);
                const progress = planQty > 0 ? Math.round((actualQty / planQty) * 100) : 0;
                const isRisk = defectQty > 0 || (job.status === '1' && actualQty > 0 && progress < 70);
                const statusMeta = STATUS_META[job.status || '0'] || STATUS_META['0'];

                return (
                  <div key={job.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900" data-testid={`kanban-job-${job.jobNo}`}>
                          {job.jobNo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {job.styleCode || '-'} / {job.colorCode || '-'} / {job.sizeCode || '-'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.chip}`}>
                          {statusMeta.label}
                        </span>
                        {isRisk && (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            重点关注
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="text-slate-400">计划</p>
                        <p className="mt-1 font-medium text-slate-800">{planQty}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">已报工</p>
                        <p className="mt-1 font-medium text-slate-800">{actualQty}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">次品</p>
                        <p className={`mt-1 font-medium ${defectQty > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {defectQty}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                        <span>完成进度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress >= 100 ? 'bg-emerald-500' :
                            progress >= 70 ? 'bg-blue-500' :
                            progress >= 40 ? 'bg-amber-500' : 'bg-red-400'
                          }`}
                          style={{width: `${Math.min(progress, 100)}%`}}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <div>
                        <p className="text-slate-400">当前工序</p>
                        <p className="mt-1 font-medium text-slate-700">{job.currentProcessName || '待初始化'}</p>
                      </div>
                      {job.status !== '2' ? (
                        <NavLink
                          to={`/production/job-process/report/${job.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                        >
                          去报工
                          <ArrowRight size={14} />
                        </NavLink>
                      ) : (
                        <span className="rounded-2xl bg-emerald-50 px-4 py-2 text-emerald-600">已完工</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CircleDot size={16} className="text-slate-500" />
              <h3 className="font-semibold text-slate-900">现场关注点</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
                生产中但完成率低于 50% 的工单会自动进入“需关注”，适合班组长先排查卡点。
              </div>
              <div className="rounded-2xl bg-red-50 p-4 text-red-700">
                出现次品的工单会直接带风险标识，避免问题被淹没在普通进度里。
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                点击“去报工”直接进入当前工序录入页，减少页面跳转和定位成本。
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">风险工单速览</h3>
            <div className="mt-4 space-y-3">
              {metrics.risky.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">当前没有需要重点跟进的工单。</div>
              ) : (
                metrics.risky.slice(0, 5).map((job) => (
                  <div key={job.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{job.jobNo}</p>
                        <p className="mt-1 text-xs text-slate-500">{job.currentProcessName || '待初始化'}</p>
                      </div>
                      <span className="text-xs font-medium text-red-600">次品 {toNumber(job.defectQty)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
