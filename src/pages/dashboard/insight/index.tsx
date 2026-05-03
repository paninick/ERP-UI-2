import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import BaseTable from '@/components/ui/BaseTable'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'
import { toast } from '@/components/ui/Toast'
import * as insightApi from '@/api/dashboardInsight'

function StatusBadge({ status }: { status?: string }) {
  const tone =
    status === 'CONFIRMED'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'DRAFT'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-200 text-slate-700'
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone}`}>{status || 'UNKNOWN'}</span>
}

export default function DashboardInsightPage() {
  const [period, setPeriod] = useState('')
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (nextPeriod?: string) => {
    setLoading(true)
    try {
      const res: any = await insightApi.getDashboardInsightOverview(nextPeriod)
      const data = res.data || {}
      setMetrics(data.metrics || [])
      setAlerts(data.alerts || [])
    } catch (error: any) {
      setMetrics([])
      setAlerts([])
      toast.error(error.message || '加载经营驾驶舱失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const metricColumns = [
    { key: 'metricName', title: '指标' },
    { key: 'period', title: '期间' },
    { key: 'displayValue', title: '当前值' },
    {
      key: 'sourceStatus',
      title: '来源状态',
      render: (value: any) => <StatusBadge status={value} />,
    },
    { key: 'sampleCount', title: '样本数' },
    { key: 'explanation', title: '口径说明' },
    {
      key: 'sourceRefs',
      title: '来源单据',
      render: (value: string[] | undefined) =>
        value && value.length > 0 ? (
          <div className="max-w-[320px] whitespace-normal break-all text-xs text-slate-600">
            {value.join(', ')}
          </div>
        ) : (
          '-'
        ),
    },
  ]

  const alertColumns = [
    { key: 'metricName', title: '预警指标' },
    { key: 'severity', title: '级别' },
    { key: 'actualValue', title: '实际值' },
    { key: 'operatorCode', title: '比较符' },
    { key: 'thresholdValue', title: '阈值' },
    {
      key: 'sourceStatus',
      title: '来源状态',
      render: (value: any) => <StatusBadge status={value} />,
    },
    { key: 'message', title: '说明' },
    {
      key: 'sourceRefs',
      title: '来源单据',
      render: (value: string[] | undefined) =>
        value && value.length > 0 ? (
          <div className="max-w-[320px] whitespace-normal break-all text-xs text-slate-600">
            {value.join(', ')}
          </div>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">经营驾驶舱</h1>
          <p className="mt-1 text-sm text-slate-500">
            只展示可解释的经营指标。若来源未确认，则明确标记为 DRAFT 或 DATA_MISSING，不自动做业务决策。
          </p>
        </div>
        <div className="flex gap-2">
          <NavLink
            to="/dashboard/supplier-rating"
            className="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            供应商评级
          </NavLink>
          <NavLink
            to="/dashboard/threshold"
            className="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            阈值规则
          </NavLink>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
        P2 当前定位：管理只读视图，不替代结算、成本、质检主链；命中阈值只报警，不自动冻结、不自动拒绝。
      </div>

      <SearchForm onSearch={() => fetchData(period || undefined)} onReset={() => { setPeriod(''); fetchData() }}>
        <SearchField label="期间">
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="如 2026-05"
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </SearchField>
      </SearchForm>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">指标总览</h2>
          <p className="text-sm text-slate-500">每个指标都保留来源状态、样本数和来源单据引用。</p>
        </div>
        <BaseTable columns={metricColumns} data={metrics} loading={loading} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">阈值预警</h2>
          <p className="text-sm text-slate-500">这里只展示命中结果，后续处置仍需人工判断。</p>
        </div>
        <BaseTable columns={alertColumns} data={alerts} loading={loading} />
      </section>
    </div>
  )
}
