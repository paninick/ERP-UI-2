import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/produceMaterialConsume'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function MaterialConsumePage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ jobNo: '', materialName: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listProduceMaterialConsume({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error(t('page.materialConsume.loadFailed'))
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
    const next = { jobNo: '', materialName: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'jobNo', title: t('page.materialConsume.jobNo') },
    { key: 'materialName', title: t('page.materialConsume.materialName') },
    { key: 'batchNo', title: t('page.materialConsume.batchNo') },
    { key: 'consumeQty', title: t('page.materialConsume.consumeQty') },
    { key: 'unitCost', title: t('page.materialConsume.unitCost') },
    { key: 'costAmount', title: t('page.materialConsume.costAmount') },
    { key: 'eventSource', title: t('page.materialConsume.eventSource') },
    { key: 'createTime', title: t('page.materialConsume.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.materialConsume.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.materialConsume.jobNo')}>
          <input
            title={t('page.materialConsume.jobNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.jobNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, jobNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.materialConsume.materialName')}>
          <input
            title={t('page.materialConsume.materialName')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.materialName}
            onChange={(e) => setQueryParams((p) => ({ ...p, materialName: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="material-consume-table" />
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
