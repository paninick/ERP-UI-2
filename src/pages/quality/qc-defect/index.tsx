import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, ShieldAlert, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '@/api/qcDefect';
import { toast } from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';

interface QcDefectRow {
  id: number;
  inspectionId?: number;
  defectType?: string;
  defectLevel?: string;
  qty?: number;
  createTime?: string;
}

const DEFECT_LEVEL_META: Record<string, { label: string; color: string; hint: string }> = {
  CRITICAL: { label: '致命', color: 'bg-rose-100 text-rose-700', hint: '必须拦截，不能放行' },
  MAJOR: { label: '严重', color: 'bg-amber-100 text-amber-700', hint: '需返工或复检后再判断' },
  MINOR: { label: '轻微', color: 'bg-sky-100 text-sky-700', hint: '可记录趋势并观察' },
};

const DEFECT_TYPE_META: Record<string, string> = {
  BROKEN_NEEDLE: '断针风险',
  STAIN: '污渍',
  COLOR_DIFF: '色差',
  SIZE_ERROR: '尺寸偏差',
  HOLE: '破洞',
  THREAD: '线头/跳线',
};

function resolveDefectType(value?: string) {
  if (!value) return '未归类缺陷';
  return DEFECT_TYPE_META[value] || value;
}

function resolveDefectLevel(value?: string) {
  if (!value) {
    return { label: '未分级', color: 'bg-slate-100 text-slate-600', hint: '需补充质检等级' };
  }
  return DEFECT_LEVEL_META[value] || {
    label: value,
    color: 'bg-slate-100 text-slate-600',
    hint: '系统未维护该等级的业务解释',
  };
}

export default function QcDefectPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<QcDefectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({ inspectionId: '', defectType: '', defectLevel: '' });

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true);
      try {
        const inspectionId = (params?.inspectionId ?? queryParams.inspectionId)?.trim?.() || '';
        const res: any = await api.listQcDefect({
          pageNum: params?.pageNum ?? pagination.current,
          pageSize: params?.pageSize ?? pagination.pageSize,
          inspectionId: inspectionId ? Number(inspectionId) : undefined,
          defectType: params?.defectType ?? queryParams.defectType,
          defectLevel: params?.defectLevel ?? queryParams.defectLevel,
        });
        setData(res.rows || []);
        setPagination((prev) => ({ ...prev, total: res.total || 0 }));
      } catch {
        setData([]);
        toast.error('质检缺陷数据加载失败');
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, queryParams],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = useMemo(() => {
    const totalQty = data.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const criticalCount = data.filter((item) => item.defectLevel === 'CRITICAL').length;
    const majorCount = data.filter((item) => item.defectLevel === 'MAJOR').length;
    return {
      cases: data.length,
      totalQty,
      criticalCount,
      majorCount,
      topCase: data[0] || null,
    };
  }, [data]);

  const columns = [
    {
      key: 'inspectionId',
      title: '质检案例',
      render: (_: unknown, record: QcDefectRow) => (
        <div>
          <div className="font-medium text-slate-900">检验单 #{record.inspectionId || '-'}</div>
          <div className="mt-1 text-xs text-slate-500">{resolveDefectType(record.defectType)}</div>
        </div>
      ),
    },
    {
      key: 'defectLevel',
      title: '风险等级',
      render: (value: string) => {
        const meta = resolveDefectLevel(value);
        return (
          <div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.color}`}>{meta.label}</span>
            <div className="mt-1 text-xs text-slate-500">{meta.hint}</div>
          </div>
        );
      },
    },
    {
      key: 'qty',
      title: '缺陷数量',
      render: (value: number) => <span className="font-semibold text-slate-900">{Number(value) || 0}</span>,
    },
    {
      key: 'businessAction',
      title: '现场动作建议',
      render: (_: unknown, record: QcDefectRow) => {
        if (record.defectLevel === 'CRITICAL') return '立即拦截，整批复检';
        if (record.defectLevel === 'MAJOR') return '返工后复检';
        if (record.defectLevel === 'MINOR') return '记录并放入趋势观察';
        return '补充判级后再决定';
      },
    },
    {
      key: 'createTime',
      title: '记录时间',
      render: (value: string) => value?.slice(0, 16) ?? '-',
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_42%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-600">Quality Defect Cases</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">质检缺陷案例</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              这里不应该只是数据库字段，而是让质检和车间一眼看懂“哪张检验单、什么缺陷、严重到什么程度、现场该怎么处理”。
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">缺陷案例数</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.cases}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">缺陷总数</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.totalQty}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">致命案例</p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">{summary.criticalCount}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">严重案例</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">{summary.majorCount}</p>
            </div>
          </div>
        </div>
      </section>

      {summary.topCase ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">当前案例样板</p>
              <p className="mt-1 text-sm text-slate-700">
                检验单 #{summary.topCase.inspectionId || '-'} 出现了
                <span className="font-semibold text-slate-900"> {resolveDefectType(summary.topCase.defectType)}</span>，
                等级为
                <span className="font-semibold text-slate-900"> {resolveDefectLevel(summary.topCase.defectLevel).label}</span>，
                缺陷数量
                <span className="font-semibold text-slate-900"> {Number(summary.topCase.qty) || 0}</span>。
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <SearchForm
        onSearch={() => {
          setPagination((prev) => ({ ...prev, current: 1 }));
          fetchData({ pageNum: 1 });
        }}
        onReset={() => {
          const next = { inspectionId: '', defectType: '', defectLevel: '' };
          setQueryParams(next);
          setPagination((prev) => ({ ...prev, current: 1 }));
          fetchData({ pageNum: 1, ...next });
        }}
      >
        <SearchField label="检验单号">
          <input
            title="检验单号"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.inspectionId}
            onChange={(e) => setQueryParams((p) => ({ ...p, inspectionId: e.target.value }))}
          />
        </SearchField>
        <SearchField label="缺陷类型">
          <input
            title="缺陷类型"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.defectType}
            onChange={(e) => setQueryParams((p) => ({ ...p, defectType: e.target.value }))}
            placeholder="如 STAIN / COLOR_DIFF"
          />
        </SearchField>
        <SearchField label="风险等级">
          <select
            title="风险等级"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.defectLevel}
            onChange={(e) => setQueryParams((p) => ({ ...p, defectLevel: e.target.value }))}
          >
            <option value="">全部</option>
            <option value="CRITICAL">致命</option>
            <option value="MAJOR">严重</option>
            <option value="MINOR">轻微</option>
          </select>
        </SearchField>
      </SearchForm>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={16} className="text-amber-600" />
            当前页用途
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">看的是“缺陷案例台账”，不是原始字典字段。重点是快速判断缺陷性质和处理动作。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle size={16} className="text-rose-600" />
            关注重点
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">优先盯致命和严重缺陷，判断是否需要返工、复检或整批拦截。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert size={16} className="text-sky-600" />
            当前限制
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">后端目前只回传基础缺陷记录，所以这里先把“字段”翻成“业务案例”，后续再补责任人和处理结果。</p>
        </div>
      </div>

      <BaseTable columns={columns} data={data} loading={loading} data-testid="qc-defect-table" />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({ ...prev, current: page, pageSize }));
          fetchData({ pageNum: page, pageSize });
        }}
      />
    </div>
  );
}
