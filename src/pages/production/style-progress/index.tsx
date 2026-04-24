import {useCallback, useEffect, useMemo, useState} from 'react';
import * as styleProgressApi from '@/api/styleProgress';
import {toast} from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, {SearchField} from '@/components/ui/SearchForm';
import {Calendar, PackageCheck, TrendingUp, User} from 'lucide-react';

interface StyleProgress {
  styleCode: string;
  bulkOrderNo: string;
  customerName: string;
  salesNo: string;
  totalJobs: number;
  totalPlanQty: number;
  totalActualQty: number;
  completeRatePct: number;
  shippedQty: number;
  dueDate: string;
}

const EMPTY_SEARCH = {
  styleCode: '',
  customerName: '',
  salesNo: '',
};

function safeNumber(value: number | undefined) {
  return Number(value) || 0;
}

export default function StyleProgressPage() {
  const [data, setData] = useState<StyleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState(EMPTY_SEARCH);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await styleProgressApi.listStyleProgress({
        ...searchParams,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      const rows = res.rows || res || [];
      setData(rows);
      setPagination((prev) => ({...prev, total: res.total || rows.length}));
    } catch {
      setData([]);
      setPagination((prev) => ({...prev, total: 0}));
      toast.error('加载款号进度数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const totalStyles = data.length;
    const totalPlanQty = data.reduce((sum, item) => sum + safeNumber(item.totalPlanQty), 0);
    const totalActualQty = data.reduce((sum, item) => sum + safeNumber(item.totalActualQty), 0);
    const delayed = data.filter((item) => {
      if (!item.dueDate) {
        return false;
      }
      return new Date(item.dueDate) < new Date() && safeNumber(item.completeRatePct) < 100;
    }).length;
    const averageRate = totalStyles > 0
      ? Math.round(data.reduce((sum, item) => sum + safeNumber(item.completeRatePct), 0) / totalStyles)
      : 0;

    return {
      totalStyles,
      totalPlanQty,
      totalActualQty,
      delayed,
      averageRate,
    };
  }, [data]);

  const getProgressColor = (rate: number) => {
    if (rate >= 100) return 'bg-emerald-500';
    if (rate >= 70) return 'bg-blue-500';
    if (rate >= 30) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getProgressTextColor = (rate: number) => {
    if (rate >= 100) return 'text-emerald-700';
    if (rate >= 70) return 'text-blue-700';
    if (rate >= 30) return 'text-amber-700';
    return 'text-slate-700';
  };

  const isOverdue = (dueDate: string, rate: number) => {
    if (!dueDate || rate >= 100) {
      return false;
    }
    return new Date(dueDate) < new Date();
  };

  const columns = [
    {
      key: 'styleCode',
      title: '款号',
      render: (value: string, record: StyleProgress) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-400">{record.bulkOrderNo || '-'}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      title: '客户',
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-slate-400" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'salesNo',
      title: '销售单号',
    },
    {
      key: 'totalPlanQty',
      title: '计划 / 完成',
      render: (_value: number, record: StyleProgress) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">{safeNumber(record.totalPlanQty).toLocaleString()}</div>
          <div className="text-slate-400">完成 {safeNumber(record.totalActualQty).toLocaleString()}</div>
        </div>
      ),
    },
    {
      key: 'completeRatePct',
      title: '进度',
      width: '220px',
      render: (value: number, record: StyleProgress) => {
        const rate = safeNumber(value);
        const colorClass = getProgressColor(rate);
        const textClass = getProgressTextColor(rate);
        return (
          <div className="w-full">
            <div className="mb-1 flex justify-between text-xs">
              <span className={`font-medium ${textClass}`}>{rate.toFixed(1)}%</span>
              <span className="text-slate-400">
                {safeNumber(record.totalActualQty)}/{safeNumber(record.totalPlanQty)}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200">
              <div
                className={`h-2.5 rounded-full ${colorClass}`}
                style={{width: `${Math.min(rate, 100)}%`}}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'shippedQty',
      title: '已发货',
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <PackageCheck size={14} className="text-slate-400" />
          <span>{safeNumber(value)}</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      title: '交期',
      render: (value: string, record: StyleProgress) => {
        const overdue = isOverdue(value, safeNumber(record.completeRatePct));
        return (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className={overdue ? 'text-red-400' : 'text-slate-400'} />
            <span className={overdue ? 'font-medium text-red-600' : 'text-slate-600'}>
              {value || '-'}
              {overdue ? ' 逾期' : ''}
            </span>
          </div>
        );
      },
    },
    {
      key: 'totalJobs',
      title: '工单数',
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-slate-400" />
          <span>{safeNumber(value)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fff7ed_42%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Style Progress</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">款号进度视图</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              把款号维度的订单、工单、发货和交期放到同一屏，便于判断哪些款还缺工序推进、哪些款已经可以转交业务和仓储。
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-slate-400">在制款号</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalStyles}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-slate-400">计划总量</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalPlanQty}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-slate-400">已完成</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalActualQty}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-slate-400">平均达成</p>
              <p className={`mt-1 text-2xl font-semibold ${stats.delayed > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {stats.averageRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <SearchForm
        onSearch={() => {
          setPagination((prev) => ({...prev, pageNum: 1}));
          loadData();
        }}
        onReset={() => {
          setSearchParams(EMPTY_SEARCH);
          setPagination((prev) => ({...prev, pageNum: 1}));
        }}
      >
        <SearchField label="款号">
          <input
            value={searchParams.styleCode}
            onChange={(event) => setSearchParams((prev) => ({...prev, styleCode: event.target.value}))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入款号"
          />
        </SearchField>
        <SearchField label="客户">
          <input
            value={searchParams.customerName}
            onChange={(event) => setSearchParams((prev) => ({...prev, customerName: event.target.value}))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入客户"
          />
        </SearchField>
        <SearchField label="销售单号">
          <input
            value={searchParams.salesNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, salesNo: event.target.value}))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入销售单号"
          />
        </SearchField>
      </SearchForm>

      {stats.delayed > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          当前列表中有 {stats.delayed} 个款号已逾期但尚未完成，建议优先核查对应工单的当前工序与质检状态。
        </div>
      )}

      <BaseTable columns={columns} data={data} loading={loading} rowKey="styleCode" />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => setPagination((prev) => ({...prev, pageNum: page, pageSize}))}
      />
    </div>
  );
}
