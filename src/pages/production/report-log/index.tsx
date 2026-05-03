import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowRight, ClipboardList, Factory, ScanSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import * as api from '@/api/produceReportLog'
import { toast } from '@/components/ui/Toast'
import BaseTable from '@/components/ui/BaseTable'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'
import { useAppStore } from '@/stores/appStore'
import { getCompanyLabel } from '@/utils/companyContext'

export default function ReportLogPage() {
  const { t } = useTranslation()
  const currentCompany = useAppStore((state) => state.currentCompany)
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({ jobNo: '', employeeName: '', reportType: '' })
  const text = {
    title: t('page.reportLog.title', { defaultValue: '生产报工日志' }),
    currentCompany: t('companyContext.currentLabel', { defaultValue: '当前公司' }),
    jobNo: t('page.reportLog.jobNo', { defaultValue: '工单号' }),
    processName: t('page.reportLog.processName', { defaultValue: '工序名称' }),
    employeeName: t('page.reportLog.employeeName', { defaultValue: '员工姓名' }),
    operatorName: t('page.reportLog.operatorName', { defaultValue: '操作人' }),
    reportQty: t('page.reportLog.reportQty', { defaultValue: '报工数量' }),
    completedQty: t('page.reportLog.completedQty', { defaultValue: '完工数量' }),
    defectQty: t('page.reportLog.defectQty', { defaultValue: '次品数量' }),
    lossQty: t('page.reportLog.lossQty', { defaultValue: '损耗数量' }),
    reportType: t('page.reportLog.reportType', { defaultValue: '报工类型' }),
    isOutsourced: t('page.reportLog.isOutsourced', { defaultValue: '是否外协' }),
    eventTime: t('page.reportLog.eventTime', { defaultValue: '报工时间' }),
    loadFailed: t('page.reportLog.loadFailed', { defaultValue: '加载报工日志失败' }),
    yes: t('common.yes', { defaultValue: '是' }),
    no: t('common.no', { defaultValue: '否' }),
  }

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listProduceReportLog({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        })
        setData(res.rows || [])
        setPagination((prev) => ({ ...prev, total: res.total || 0 }))
      } catch {
        setData([])
        toast.error(text.loadFailed)
      } finally {
        setLoading(false)
      }
    },
    [pagination.current, pagination.pageSize, queryParams, companySignature, text.loadFailed],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1 })
  }

  const handleReset = () => {
    const next = { jobNo: '', employeeName: '', reportType: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }))
    fetchData({ pageNum: page, pageSize })
  }

  const columns = [
    { key: 'jobNo', title: text.jobNo },
    { key: 'processName', title: text.processName },
    { key: 'employeeName', title: text.employeeName },
    { key: 'operatorName', title: text.operatorName },
    { key: 'reportQty', title: text.reportQty },
    { key: 'completedQty', title: text.completedQty },
    { key: 'defectQty', title: text.defectQty },
    { key: 'lossQty', title: text.lossQty },
    { key: 'reportType', title: text.reportType },
    {
      key: 'isOutsourced',
      title: text.isOutsourced,
      render: (v: string) => (v === '1' ? text.yes : text.no),
    },
    {
      key: 'eventTime',
      title: text.eventTime,
      render: (v: string) => v?.slice(0, 16) ?? '-',
    },
  ]

  const hasActiveFilters = Boolean(queryParams.jobNo || queryParams.employeeName || queryParams.reportType)
  const emptyAction = useMemo(
    () => (
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_55%,#f8fafc_100%)] p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start gap-3">
          <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
            <ClipboardList size={18} />
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {hasActiveFilters ? '当前筛选下还没有报工事件' : `${getCompanyLabel(currentCompany.code, t)} 还没有形成报工日志`}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {hasActiveFilters
                ? '这通常表示工票、员工或报工类型筛选过窄，也可能是该工票还停留在待生产，尚未提交首道报工。'
                : '报工日志只有在产线实际提交了报工后才会生成。若这里为空，一般说明该工厂的工票还在待生产、未开首道工序，或者现场尚未录入报工。'}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <NavLink
            to="/production/job-process"
            className="group rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 transition hover:border-sky-300 hover:bg-white"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ScanSearch size={16} className="text-sky-600" />
              回到工序报工
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              先看当前工厂有哪些工票仍处于待生产、生产中，确认是否已经产生首道报工。
            </p>
            <div className="mt-3 flex justify-end text-sky-700">
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </div>
          </NavLink>
          <NavLink
            to="/production/work-center"
            className="group rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 transition hover:border-emerald-300 hover:bg-white"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Factory size={16} className="text-emerald-600" />
              查看工厂运行情况
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              从工厂总览判断当前是否只是预排完成、还没正式开线，因此暂时没有报工日志。
            </p>
            <div className="mt-3 flex justify-end text-emerald-700">
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </div>
          </NavLink>
        </div>
      </div>
    ),
    [currentCompany.code, hasActiveFilters, queryParams.employeeName, queryParams.jobNo, queryParams.reportType, t],
  )

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{text.title}</h1>
        <p className="text-sm text-slate-500">{text.currentCompany}：{getCompanyLabel(currentCompany.code, t)}</p>
      </div>
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={text.jobNo}>
          <input
            title={text.jobNo}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.jobNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, jobNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={text.employeeName}>
          <input
            title={text.employeeName}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.employeeName}
            onChange={(e) => setQueryParams((p) => ({ ...p, employeeName: e.target.value }))}
          />
        </SearchField>
        <SearchField label={text.reportType}>
          <input
            title={text.reportType}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.reportType}
            onChange={(e) => setQueryParams((p) => ({ ...p, reportType: e.target.value }))}
          />
        </SearchField>
      </SearchForm>
      <BaseTable
        columns={columns}
        data={data}
        loading={loading}
        ariaLabel={text.title}
        emptyAction={emptyAction}
        testId="report-log-table"
      />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />
    </div>
  )
}
