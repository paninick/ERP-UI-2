import { useCallback, useEffect, useState } from 'react'
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

export default function SupplierRatingPage() {
  const [windowMonths, setWindowMonths] = useState('12')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (months?: number) => {
    setLoading(true)
    try {
      const res: any = await insightApi.listSupplierRatings(months)
      setRows(res.data || [])
    } catch (error: any) {
      setRows([])
      toast.error(error.message || '加载供应商评级失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(12)
  }, [fetchData])

  const columns = [
    { key: 'supplierName', title: '供应商' },
    { key: 'supplierType', title: '类型' },
    { key: 'windowLabel', title: '时间窗' },
    {
      key: 'weightSummary',
      title: '权重明细',
      render: (_: any, record: any) =>
        `质量 ${(Number(record.qualityWeight || 0) * 100).toFixed(0)}% / 交期 ${(Number(record.deliveryWeight || 0) * 100).toFixed(0)}% / 价格 ${(Number(record.priceWeight || 0) * 100).toFixed(0)}%`,
    },
    { key: 'qualityScore', title: '质量分' },
    {
      key: 'qualitySourceStatus',
      title: '质量来源',
      render: (value: any) => <StatusBadge status={value} />,
    },
    { key: 'deliveryScore', title: '交期分' },
    {
      key: 'deliverySourceStatus',
      title: '交期来源',
      render: (value: any) => <StatusBadge status={value} />,
    },
    { key: 'priceScore', title: '价格分' },
    {
      key: 'priceSourceStatus',
      title: '价格来源',
      render: (value: any) => <StatusBadge status={value} />,
    },
    { key: 'overallScore', title: '综合分' },
    { key: 'ratingLevel', title: '等级' },
    {
      key: 'overallSourceStatus',
      title: '综合状态',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'missingSources',
      title: '缺失来源',
      render: (value: any) => value || '-',
    },
    {
      key: 'sourceRefs',
      title: '来源单据',
      render: (value: string[] | undefined) =>
        value && value.length > 0 ? (
          <div className="max-w-[280px] whitespace-normal break-all text-xs text-slate-600">
            {value.join(', ')}
          </div>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">供应商评级</h1>
        <p className="mt-1 text-sm text-slate-500">
          评级拆成质量、交期、价格三段，不允许用默认分冒充真实评级；来源缺失时直接暴露缺口。
        </p>
        <p className="mt-1 text-xs text-slate-400">当前默认权重：质量 50% / 交期 30% / 价格 20%。</p>
      </div>

      <SearchForm
        onSearch={() => fetchData(Number(windowMonths) || 12)}
        onReset={() => {
          setWindowMonths('12')
          fetchData(12)
        }}
      >
        <SearchField label="统计月数">
          <input
            value={windowMonths}
            onChange={(e) => setWindowMonths(e.target.value)}
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={rows} loading={loading} />
    </div>
  )
}
