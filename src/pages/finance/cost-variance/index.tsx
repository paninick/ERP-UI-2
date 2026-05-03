import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/ConfirmDialog'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'
import * as api from '@/api/costVariance'

export default function CostVariancePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ planNo: '', styleCode: '', period: '', freezeStatus: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listCostVariance({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error('加载成本偏差失败')
      } finally {
        setLoading(false)
      }
    },
    [pagination.current, pagination.pageSize, queryParams],
  )

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1 })
  }

  const handleReset = () => {
    const next = { planNo: '', styleCode: '', period: '', freezeStatus: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const handleFreeze = async (record: any) => {
    const reason = window.prompt('请输入冻结原因', '月结确认') || '月结确认'
    if (!(await confirm(`确认冻结 ${record.planNo || record.id}？`))) return
    try {
      await api.freezeCostVariance(record.id, reason)
      toast.success('冻结成功')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || '冻结失败')
    }
  }

  const handleCalculate = async () => {
    const planIdText = window.prompt('请输入生产计划ID')
    if (!planIdText) return
    const planId = Number(planIdText)
    if (!Number.isFinite(planId) || planId <= 0) {
      toast.error('请输入有效的生产计划ID')
      return
    }
    const period = window.prompt('请输入期间（可为空，默认当前月）', queryParams.period || '') || undefined
    if (!(await confirm(`确认计算生产计划 ${planId} 的成本偏差？`))) return
    try {
      await api.calculateCostVariance(planId, period)
      toast.success('计算成功')
      fetchData({ pageNum: 1, period: period || '' })
    } catch (error: any) {
      toast.error(error.message || '计算失败')
    }
  }

  const columns = [
    { key: 'planNo', title: '计划单号' },
    { key: 'styleCode', title: '款号' },
    { key: 'period', title: '期间' },
    { key: 'snapshotVersion', title: '版本' },
    { key: 'standardCost', title: '标准成本' },
    { key: 'estimatedCost', title: '预计成本' },
    { key: 'actualCost', title: '实际成本' },
    { key: 'varianceAmount', title: '偏差金额' },
    { key: 'varianceRate', title: '偏差率' },
    { key: 'freezeStatus', title: '冻结状态' },
    { key: 'varianceReasons', title: '原因' },
    {
      key: 'actions',
      title: '操作',
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          {record.freezeStatus === 'DRAFT' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleFreeze(record)
              }}
              className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              冻结
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">工单成本偏差</h1>
        <button
          type="button"
          onClick={handleCalculate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          计算偏差
        </button>
      </div>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label="计划单号">
          <input
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.planNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, planNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label="款号">
          <input
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.styleCode}
            onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
          />
        </SearchField>
        <SearchField label="期间">
          <input
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.period}
            onChange={(e) => setQueryParams((p) => ({ ...p, period: e.target.value }))}
          />
        </SearchField>
        <SearchField label="冻结状态">
          <select
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.freezeStatus}
            onChange={(e) => setQueryParams((p) => ({ ...p, freezeStatus: e.target.value }))}
          >
            <option value="">全部</option>
            <option value="DRAFT">草稿</option>
            <option value="FROZEN">已冻结</option>
          </select>
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="cost-variance-table" />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({ ...prev, current: page, pageSize }))
          fetchData({ pageNum: page, pageSize })
        }}
      />
    </div>
  )
}
