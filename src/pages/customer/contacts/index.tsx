import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Building2, Network, Users } from 'lucide-react'
import * as api from '@/api/corpContacts'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

export default function CorpContactsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ contactName: '', phone: '' })

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listCorpContacts({
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
    const next = { contactName: '', phone: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const columns = [
    { key: 'contactName', title: t('page.corpContacts.contactName') },
    { key: 'phone', title: t('page.corpContacts.phone') },
    { key: 'email', title: t('page.corpContacts.email') },
    { key: 'position', title: t('page.corpContacts.position') },
    { key: 'customerName', title: t('page.corpContacts.customerName') },
    { key: 'remark', title: t('page.corpContacts.remark') },
    {
      key: 'businessLinks',
      title: '客户详情',
      render: (_: any, record: any) => record.customerName ? (
        <div className="flex gap-1">
          <NavLink
            to={`/customer/detail?customerName=${encodeURIComponent(record.customerName)}&contactName=${encodeURIComponent(record.contactName || '')}`}
            className="rounded px-2 py-2 text-xs text-emerald-700 hover:bg-emerald-100"
          >
            进入详情
          </NavLink>
        </div>
      ) : '-',
    },
  ]

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">客户多窗口名录</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.corpContacts.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              客户联系人不是重复建一遍客户主档，而是把一个客户下面不同岗位、不同职责、不同沟通窗口拆开维护。业务、采购、QC、财务、船务联系人都可以在这里沉淀，解决“同一个客人有很多对接人”的真实情况。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Users, label: '它是什么', value: '客户下的多联系人窗口' },
                { icon: Network, label: '核心内容', value: '岗位 / 电话 / 邮箱 / 对应客户' },
                { icon: Building2, label: '它不是什么', value: '不是客户主体主档复制' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/customer', title: '回到客户主档', detail: '客户页只定义客户主体与默认主窗口，这里继续展开多联系人。' },
              { to: '/customer/detail', title: '进入客户业务详情', detail: '联系人更适合先把你带到该客户统一详情页，再继续展开订单、生产、质检、出货与结算。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-emerald-50/50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">联系人服务的不是通讯录，而是客户业务链</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">当你需要确认颜色、催样、追交期、确认包装或处理异常时，真正起作用的是这里的不同岗位联系人；默认建议先进入客户详情，再按链路继续追。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/customer/detail" className="rounded-full bg-emerald-700 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-emerald-800">
              打开客户业务详情页
            </NavLink>
          </div>
        </div>
      </section>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.corpContacts.contactName')}>
          <input
            title={t('page.corpContacts.contactName')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.contactName}
            onChange={(e) => setQueryParams((p) => ({ ...p, contactName: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.corpContacts.phone')}>
          <input
            title={t('page.corpContacts.phone')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.phone}
            onChange={(e) => setQueryParams((p) => ({ ...p, phone: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable columns={columns} data={data} loading={loading} data-testid="corp-contacts-table" />
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
