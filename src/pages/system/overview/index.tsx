import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/overview'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function OverviewPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ noticeNo: '', styleCode: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listOverview({
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
    const next = { noticeNo: '', styleCode: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'noticeNo', title: t('page.overview.noticeNo') },
    { key: 'styleCode', title: t('page.overview.styleCode') },
    { key: 'customerName', title: t('page.overview.customerName') },
    { key: 'sampleType', title: t('page.overview.sampleType') },
    { key: 'auditStatus', title: t('page.overview.auditStatus') },
    { key: 'createTime', title: t('page.overview.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.overview.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.overview.noticeNo')}>
          <input
            title={t('page.overview.noticeNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.noticeNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, noticeNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.overview.styleCode')}>
          <input
            title={t('page.overview.styleCode')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.styleCode}
            onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="overview-table" />
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
