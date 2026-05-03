import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/invoice'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function CorpInvoicePage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ invoiceNo: '', invoiceType: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listInvoice({
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
    const next = { invoiceNo: '', invoiceType: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'invoiceNo', title: t('page.corpInvoice.invoiceNo') },
    { key: 'invoiceType', title: t('page.corpInvoice.invoiceType') },
    { key: 'invoiceAmount', title: t('page.corpInvoice.invoiceAmount') },
    { key: 'taxRate', title: t('page.corpInvoice.taxRate') },
    { key: 'invoiceDate', title: t('page.corpInvoice.invoiceDate'), render: (v: string) => v?.slice(0, 10) ?? '-' },
    { key: 'status', title: t('page.corpInvoice.status') },
    { key: 'createTime', title: t('page.corpInvoice.createTime'), render: (v: string) => v?.slice(0, 16) ?? '-' },
  ]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">{t('page.corpInvoice.title')}</h1>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.corpInvoice.invoiceNo')}>
          <input
            title={t('page.corpInvoice.invoiceNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.invoiceNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, invoiceNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.corpInvoice.invoiceType')}>
          <input
            title={t('page.corpInvoice.invoiceType')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.invoiceType}
            onChange={(e) => setQueryParams((p) => ({ ...p, invoiceType: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="corp-invoice-table" />
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
