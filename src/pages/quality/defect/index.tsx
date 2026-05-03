import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/defect'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function DefectPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ jobNo: '', defectType: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listDefect({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error(t('page.defect.loadFailed'))
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
    const next = { jobNo: '', defectType: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'jobNo', title: t('page.defect.jobNo') },
    { key: 'processName', title: t('page.defect.processName') },
    { key: 'defectType', title: t('page.defect.defectType') },
    { key: 'defectQty', title: t('page.defect.defectQty') },
    { key: 'defectDesc', title: t('page.defect.defectDesc') },
    { key: 'auditStatus', title: t('page.defect.auditStatus') },
    { key: 'createBy', title: t('page.defect.createBy') },
    { key: 'createTime', title: t('page.defect.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.defect.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.defect.jobNo')}>
          <input
            title={t('page.defect.jobNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.jobNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, jobNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.defect.defectType')}>
          <input
            title={t('page.defect.defectType')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.defectType}
            onChange={(e) => setQueryParams((p) => ({ ...p, defectType: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="defect-table" />
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
