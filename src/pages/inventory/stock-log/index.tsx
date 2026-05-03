import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/stockLog'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function StockLogPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ materialName: '', changeType: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listStockLog({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error(t('common.loadDataFailed'))
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
    const next = { materialName: '', changeType: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'materialName', title: t('page.stockLog.materialName') },
    { key: 'changeType', title: t('page.stockLog.changeType') },
    { key: 'changeQty', title: t('page.stockLog.changeQty') },
    { key: 'beforeQty', title: t('page.stockLog.beforeQty') },
    { key: 'afterQty', title: t('page.stockLog.afterQty') },
    { key: 'warehouseName', title: t('page.stockLog.warehouseName') },
    { key: 'createTime', title: t('page.stockLog.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.stockLog.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.stockLog.materialName')}>
          <input
            title={t('page.stockLog.materialName')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.materialName}
            onChange={(e) => setQueryParams((p) => ({ ...p, materialName: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.stockLog.changeType')}>
          <input
            title={t('page.stockLog.changeType')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.changeType}
            onChange={(e) => setQueryParams((p) => ({ ...p, changeType: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="stock-log-table" />
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
