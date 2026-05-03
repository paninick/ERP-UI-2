import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/costSummary'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function CostSummaryPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ planNo: '', styleCode: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listCostSummary({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error(t('page.costSummary.loadFailed'))
      } finally {
        setLoading(false)
      }
    },
    [pagination.current, pagination.pageSize, queryParams, t],
  )

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1 })
  }

  const handleReset = () => {
    const next = { planNo: '', styleCode: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'planNo', title: t('page.costSummary.planNo') },
    { key: 'styleCode', title: t('page.costSummary.styleCode') },
    { key: 'materialCost', title: t('page.costSummary.materialCost') },
    { key: 'wageCost', title: t('page.costSummary.wageCost') },
    { key: 'outsourceCost', title: t('page.costSummary.outsourceCost') },
    { key: 'qualityCost', title: t('page.costSummary.qualityCost') },
    { key: 'totalCost', title: t('page.costSummary.totalCost') },
    { key: 'createTime', title: t('page.costSummary.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.costSummary.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.costSummary.planNo')}>
          <input
            title={t('page.costSummary.planNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.planNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, planNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.costSummary.styleCode')}>
          <input
            title={t('page.costSummary.styleCode')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.styleCode}
            onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="cost-summary-table" />
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
