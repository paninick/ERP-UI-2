import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/ConfirmDialog'
import BaseModal from '@/components/ui/BaseModal'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'
import * as api from '@/api/costVariance'

export default function CostVariancePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ planNo: '', styleCode: '', period: '', freezeStatus: '' })

  // 冻结 Modal
  const [freezeTarget, setFreezeTarget] = useState<any>(null)
  const [freezeReason, setFreezeReason] = useState('月结确认')
  const [freezing, setFreezing] = useState(false)

  // 计算偏差 Modal
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcForm, setCalcForm] = useState({ planId: '', period: '' })
  const [calculating, setCalculating] = useState(false)

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

  const openFreezeModal = (record: any) => {
    setFreezeTarget(record)
    setFreezeReason('月结确认')
  }

  const handleFreezeSubmit = async () => {
    if (!freezeTarget) return
    if (!(await confirm(`确认冻结 ${freezeTarget.planNo || freezeTarget.id}？`))) return
    setFreezing(true)
    try {
      await api.freezeCostVariance(freezeTarget.id, freezeReason)
      toast.success('冻结成功')
      setFreezeTarget(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || '冻结失败')
    } finally {
      setFreezing(false)
    }
  }

  const handleCalculateSubmit = async () => {
    const planId = Number(calcForm.planId)
    if (!Number.isFinite(planId) || planId <= 0) {
      toast.error('请输入有效的生产计划ID')
      return
    }
    if (!(await confirm(`确认计算生产计划 ${planId} 的成本偏差？`))) return
    setCalculating(true)
    try {
      await api.calculateCostVariance(planId, calcForm.period || undefined)
      toast.success('计算成功')
      setCalcOpen(false)
      fetchData({ pageNum: 1, period: calcForm.period || '' })
    } catch (error: any) {
      toast.error(error.message || '计算失败')
    } finally {
      setCalculating(false)
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
                openFreezeModal(record)
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
          onClick={() => {
            setCalcForm({ planId: '', period: queryParams.period || '' })
            setCalcOpen(true)
          }}
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
            placeholder="如 2026-05"
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

      {/* 冻结 Modal — 替代 window.prompt */}
      <BaseModal
        open={!!freezeTarget}
        title={`冻结成本偏差：${freezeTarget?.planNo || ''}`}
        onClose={() => setFreezeTarget(null)}
      >
        <div className="space-y-4 p-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">冻结原因</label>
            <textarea
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFreezeTarget(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button>
            <button type="button" disabled={freezing} onClick={handleFreezeSubmit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">
              {freezing ? '冻结中…' : '确认冻结'}
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 计算偏差 Modal — 替代 window.prompt */}
      <BaseModal
        open={calcOpen}
        title="计算成本偏差"
        onClose={() => setCalcOpen(false)}
      >
        <div className="space-y-4 p-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">生产计划ID <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              value={calcForm.planId}
              onChange={(e) => setCalcForm((prev) => ({ ...prev, planId: e.target.value }))}
              placeholder="请输入生产计划ID"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">期间（可选）</label>
            <input
              type="text"
              value={calcForm.period}
              onChange={(e) => setCalcForm((prev) => ({ ...prev, period: e.target.value }))}
              placeholder="如 2026-05，留空则默认当前月"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCalcOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button>
            <button type="button" disabled={calculating || !calcForm.planId} onClick={handleCalculateSubmit} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
              {calculating ? '计算中…' : '确认计算'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  )
}
