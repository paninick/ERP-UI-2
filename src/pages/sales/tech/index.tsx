import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ClipboardList,
  Eye,
  FileCog,
  Layers3,
  ShieldCheck,
  Shirt,
} from 'lucide-react'
import * as api from '@/api/sampleTech'
import * as employeeApi from '@/api/employee'
import { confirm } from '@/components/ui/ConfirmDialog'
import { toast } from '@/components/ui/Toast'
import BaseModal from '@/components/ui/BaseModal'
import BaseTable from '@/components/ui/BaseTable'
import GenericForm from '@/components/ui/GenericForm'
import Pagination from '@/components/ui/Pagination'
import SearchForm, { SearchField } from '@/components/ui/SearchForm'

const statusToneMap: Record<string, string> = {
  '0': 'bg-slate-100 text-slate-700',
  '1': 'bg-amber-100 text-amber-800',
  '2': 'bg-emerald-100 text-emerald-800',
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  UNASSIGNED: 'bg-slate-100 text-slate-700',
  ASSIGNED: 'bg-fuchsia-100 text-fuchsia-800',
  ACCEPTED: 'bg-sky-100 text-sky-800',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-800',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  closed: 'bg-slate-100 text-slate-700',
}

function renderTag(value: any) {
  const text = String(value ?? '-').trim() || '-'
  const labelMap: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    UNASSIGNED: '待分配',
    ASSIGNED: '已分配',
    ACCEPTED: '已接单',
    IN_PROGRESS: '进行中',
  }
  const normalized = text.toUpperCase()
  const tone = statusToneMap[text] || statusToneMap[normalized] || 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone}`}>{labelMap[normalized] || text}</span>
}

function renderText(value: any) {
  const text = String(value ?? '').trim()
  return text || '-'
}

function renderDate(value: any) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, 10) : '-'
}

function renderBool(value: any) {
  if (value === 1 || value === '1' || value === true) {
    return '是'
  }
  if (value === 0 || value === '0' || value === false) {
    return '否'
  }
  return '-'
}

function normalizeAuditStatus(value: any) {
  const text = String(value ?? '').trim().toUpperCase()
  if (!text) return 'DRAFT'
  return text
}

function normalizeProgressStatus(value: any) {
  return String(value ?? '').trim().toUpperCase()
}

function DetailCard({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; value: any }>
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-white px-3 py-3 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap break-words">
              {renderText(item.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function SampleTechPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [queryParams, setQueryParams] = useState({
    styleCode: searchParams.get('styleCode') || '',
    customerName: searchParams.get('customerName') || '',
    auditStatus: '',
  })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<any>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRecord, setAssignRecord] = useState<any>(null)
  const [employeeOptions, setEmployeeOptions] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    employeeApi.listEmployee({ pageNum: 1, pageSize: 999, status: '0' })
      .then((res: any) => {
        const rows = res.rows || []
        setEmployeeOptions(
          rows.map((item: any) => ({
            value: String(item.id),
            label: `${item.employeeName || item.employeeCode || item.id}${item.department ? ` · ${item.department}` : ''}`,
          })),
        )
      })
      .catch(() => {
        setEmployeeOptions([])
      })
      }, [])

  const employeeLabelMap = useMemo(
    () => new Map(employeeOptions.map((item) => [item.value, item.label])),
    [employeeOptions],
  )

  const getEmployeeLabel = useCallback(
    (value: any) => {
      const key = String(value ?? '').trim()
      if (!key) {
        return '-'
      }
      return employeeLabelMap.get(key) || key
    },
    [employeeLabelMap],
  )

  const handleAuditAction = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const submitLabel = normalizeAuditStatus(record.auditStatus) === 'REJECTED'
      ? t('page.sampleTech.resubmit', '重新提交')
      : '提交'
    const labelMap = {
      submit: submitLabel,
      approve: '审核通过',
      reject: '驳回',
    }
    const confirmed = await confirm(`确认要${labelMap[action]}技术单 ${record.styleCode || '-'} 吗？`)
    if (!confirmed) {
      return
    }

    try {
      if (action === 'submit') {
        await api.submitSampleTech(record.id)
      } else if (action === 'approve') {
        await api.approveSampleTech(record.id)
      } else {
        await api.rejectSampleTech(record.id)
      }
      toast.success(`${labelMap[action]}成功`)
      if (detailRecord?.id === record.id) {
        const refreshed: any = await api.getSampleTech(record.id)
        setDetailRecord(refreshed?.data || refreshed || record)
      }
      fetchData({ pageNum: pagination.current })
    } catch (error: any) {
      toast.error(error.message || `${labelMap[action]}失败`)
    }
  }

  const handleProgressAction = async (record: any, action: 'accept' | 'start') => {
    const actionLabel = action === 'accept' ? '接单' : '开始处理'
    const confirmed = await confirm(`确认要${actionLabel}技术单 ${record.styleCode || '-'} 吗？`)
    if (!confirmed) {
      return
    }

    try {
      if (action === 'accept') {
        await api.acceptSampleTech(record.id)
      } else {
        await api.startSampleTech(record.id)
      }
      toast.success(`${actionLabel}成功`)
      if (detailRecord?.id === record.id) {
        const refreshed: any = await api.getSampleTech(record.id)
        setDetailRecord(refreshed?.data || refreshed || record)
      }
      fetchData({ pageNum: pagination.current })
    } catch (error: any) {
      toast.error(error.message || `${actionLabel}失败`)
    }
  }

  const handleAssignSubmit = async (values: any) => {
    if (!assignRecord?.id) {
      return
    }
    try {
      await api.assignSampleTech(assignRecord.id, {
        pattenMarker: Number(values.pattenMarker),
        pattenChecker: values.pattenChecker ? Number(values.pattenChecker) : undefined,
        remark: values.remark,
      })
      toast.success('分配技术员成功')
      setAssignOpen(false)
      setAssignRecord(null)
      fetchData({ pageNum: pagination.current })
    } catch (error: any) {
      toast.error(error.message || '分配技术员失败')
      throw error
    }
  }

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      try {
        const res: any = await api.listSampleTech({
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const nextQueryParams = {
      styleCode: searchParams.get('styleCode') || '',
      customerName: searchParams.get('customerName') || '',
      auditStatus: '',
    }
    const queryChanged =
      nextQueryParams.styleCode !== queryParams.styleCode
      || nextQueryParams.customerName !== queryParams.customerName

    if (!queryChanged && pagination.current === 1) {
      return
    }

    if (queryChanged) {
      setQueryParams(nextQueryParams)
    }
    if (pagination.current !== 1) {
      setPagination((prev) => ({ ...prev, current: 1 }))
    }
  }, [pagination.current, queryParams.customerName, queryParams.styleCode, searchParams])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1 })
  }

  const handleReset = () => {
    const next = { styleCode: '', customerName: '', auditStatus: '' }
    setQueryParams(next)
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData({ pageNum: 1, ...next })
  }

  const handleViewDetail = async (record: any) => {
    setDetailLoading(true)
    setDetailOpen(true)
    try {
      const res: any = await api.getSampleTech(record.id)
      setDetailRecord(res?.data || res || record)
    } catch {
      setDetailRecord(record)
      toast.error(t('common.loadDataFailed'))
    } finally {
      setDetailLoading(false)
    }
  }

  const summaryCards = useMemo(
    () => [
      { icon: FileCog, label: '它是什么', value: '技术要求与生产依据冻结页' },
      { icon: Layers3, label: '承接内容', value: '打样任务 / 技术参数 / 工艺提示 / 进度' },
      { icon: Shirt, label: '它不是什么', value: '不是销售重复录入，也不是空跳转页' },
    ],
    [],
  )

  const detailBasicItems = detailRecord
    ? [
        { label: '客户', value: detailRecord.customerName },
        { label: '款号', value: detailRecord.styleCode },
        { label: '大货款号', value: detailRecord.bulkOrderNo },
        { label: '业务员', value: detailRecord.salesName },
        { label: '打样类型', value: detailRecord.sampleTypeDisplay || detailRecord.sampleType },
        { label: '样品款式', value: detailRecord.styleType },
        { label: '样品种类', value: detailRecord.sampleCategoryType },
        { label: '审批状态', value: detailRecord.auditStatus },
        { label: '进行状态', value: detailRecord.progressStatus },
        { label: '技术员', value: getEmployeeLabel(detailRecord.pattenMarker) },
        { label: '主管/核版', value: getEmployeeLabel(detailRecord.pattenChecker) },
        { label: '要求交期', value: renderDate(detailRecord.dueDate) },
        { label: '审批人', value: detailRecord.auditBy },
        { label: '审批时间', value: renderDate(detailRecord.auditTime) },
      ]
    : []

  const detailParamItems = detailRecord
    ? [
        { label: '缩水率上限(%)', value: detailRecord.shrinkageRateLimit },
        { label: '色差等级下限', value: detailRecord.colorDifferenceGradeMin },
        { label: '定型温度下限(℃)', value: detailRecord.settingTempMin },
        { label: '定型温度上限(℃)', value: detailRecord.settingTempMax },
        { label: '水洗色牢度要求', value: detailRecord.washFastnessRequirement },
        { label: '摩擦色牢度要求', value: detailRecord.rubFastnessRequirement },
        { label: 'pH 范围', value: detailRecord.phRange },
      ]
    : []

  const detailProcessItems = detailRecord
    ? [
        { label: '裁剪要求', value: detailRecord.cuttingTip },
        { label: '用衬要求', value: detailRecord.liningTip },
        { label: '用线要求', value: detailRecord.threadTip },
        { label: '运针要求', value: detailRecord.needleTip },
        { label: '缝制说明', value: detailRecord.sewingTip },
        { label: '后套说明', value: detailRecord.backGarmentTip },
        { label: '吊牌挂法', value: detailRecord.tagHangingTip },
        { label: '整烫要求', value: detailRecord.ironingTip },
        { label: '织造要求', value: detailRecord.fabricTip },
        { label: '套口要求', value: detailRecord.seamSealingTip },
        { label: '手缝要求', value: detailRecord.handStitchingTip },
        { label: '套口手缝检验', value: detailRecord.handStitchingInspection },
        { label: '水洗要求', value: detailRecord.washingTip },
      ]
    : []

  const columns = [
    { key: 'styleCode', title: '款号' },
    { key: 'customerName', title: '客户' },
    { key: 'sampleTypeDisplay', title: '打样类型', render: (value: any, record: any) => renderText(value || record.sampleType) },
    { key: 'auditStatus', title: '审批状态', render: (value: any) => renderTag(value) },
    { key: 'progressStatus', title: '进行状态', render: (value: any) => renderTag(value) },
    { key: 'pattenMarker', title: '技术员', render: (value: any) => getEmployeeLabel(value) },
    { key: 'salesName', title: '业务员' },
    { key: 'dueDate', title: '要求交期', render: (value: any) => renderDate(value) },
    {
      key: 'params',
      title: '关键参数',
      render: (_: any, record: any) => (
        <div className="space-y-1 text-xs text-slate-500">
          <div>缩水率: {renderText(record.shrinkageRateLimit)}</div>
          <div>色差等级: {renderText(record.colorDifferenceGradeMin)}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '340px',
      render: (_: any, record: any) => {
        const auditStatus = normalizeAuditStatus(record.auditStatus)
        const progressStatus = normalizeProgressStatus(record.progressStatus)
        const canAssign = auditStatus !== 'SUBMITTED' && auditStatus !== 'APPROVED'
        const canAccept = progressStatus === 'ASSIGNED'
        const canStart = progressStatus === 'ACCEPTED'
        const canSubmit = auditStatus !== 'SUBMITTED' && auditStatus !== 'APPROVED' && progressStatus === 'IN_PROGRESS'
        const canAudit = auditStatus === 'SUBMITTED'
        const submitLabel = auditStatus === 'REJECTED'
          ? t('page.sampleTech.resubmit', '重新提交')
          : '提交'

        return (
          <div className="flex flex-wrap gap-1">
            <NavLink
              to={`/sales/tech/${record.id}/overview`}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1 rounded px-2 py-2 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              <FileCog size={14} />
              查看核版
            </NavLink>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleViewDetail(record)
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-2 text-xs text-violet-700 hover:bg-violet-50"
            >
              <Eye size={14} />
              查看承接
            </button>
            {canAssign && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setAssignRecord(record)
                  setAssignOpen(true)
                }}
                className="rounded px-2 py-2 text-xs text-fuchsia-700 hover:bg-fuchsia-50"
              >
                分配技术员
              </button>
            )}
            {canAccept && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleProgressAction(record, 'accept')
                }}
                className="rounded px-2 py-2 text-xs text-sky-700 hover:bg-sky-50"
              >
                接单
              </button>
            )}
            {canStart && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleProgressAction(record, 'start')
                }}
                className="rounded px-2 py-2 text-xs text-cyan-700 hover:bg-cyan-50"
              >
                开始处理
              </button>
            )}
            {canSubmit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleAuditAction(record, 'submit')
                }}
                className="rounded px-2 py-2 text-xs text-blue-600 hover:bg-blue-50"
              >
                {submitLabel}
              </button>
            )}
            {canAudit && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleAuditAction(record, 'approve')
                  }}
                  className="rounded px-2 py-2 text-xs text-emerald-600 hover:bg-emerald-50"
                >
                  通过
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleAuditAction(record, 'reject')
                  }}
                  className="rounded px-2 py-2 text-xs text-amber-600 hover:bg-amber-50"
                >
                  驳回
                </button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-violet-700">技术承接 / 大货核版过渡层</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.sampleTech.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              技术单现在既承接打样来源任务，也作为大货前核版的过渡基面。它不是简单复写销售单，而是把技术要求、客户约束、工艺提示、核版参数和进度状态沉淀下来，供 BOM、采购、工艺和生产共同参照。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {summaryCards.map((item) => (
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
              {
                to: '/sales/proofing-notice',
                title: '回看打样通知',
                detail: '打样通知负责来源任务，技术单负责把任务沉淀成可执行要求。',
              },
              {
                to: '/material/bom',
                title: '继续看 BOM',
                detail: '技术要求清楚之后，BOM 才能成为真正的采购与发料依据。',
              },
              {
                to: '/production/plan',
                title: '继续看生产计划',
                detail: '大货核版通过后，下游应该进入排产准备，而不是继续停留在来源单。',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-violet-300 hover:bg-violet-50/50"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-violet-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 text-amber-700 shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">当前工作流状态</p>
            <p className="mt-1 text-xs leading-6 text-amber-800">
              技术单页面现在已经补到“分配技术员 到 接单 到 开始处理 到 提交审批 到 通过/驳回”的真实链路，并新增了“查看核版”正式总览入口。当前仍未单独拆出更细的主管派工表，但现场已经可以先按待分配、已分配、已接单、进行中来走。
            </p>
          </div>
        </div>
      </section>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label="款号">
          <input
            title="款号"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.styleCode}
            onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
          />
        </SearchField>
        <SearchField label="客户">
          <input
            title="客户"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.customerName}
            onChange={(e) => setQueryParams((p) => ({ ...p, customerName: e.target.value }))}
          />
        </SearchField>
        <SearchField label="审批状态">
          <input
            title="审批状态"
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.auditStatus}
            onChange={(e) => setQueryParams((p) => ({ ...p, auditStatus: e.target.value }))}
          />
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} data-testid="sample-tech-table" />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({ ...prev, current: page, pageSize }))
          fetchData({ pageNum: page, pageSize })
        }}
      />

      <BaseModal
        open={detailOpen}
        title={detailRecord ? `技术承接详情 · ${detailRecord.styleCode || '-'}` : '技术承接详情'}
        onClose={() => {
          setDetailOpen(false)
          setDetailRecord(null)
        }}
        width="1080px"
      >
        {detailLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">加载中...</div>
        ) : !detailRecord ? (
          <div className="py-10 text-center text-sm text-slate-500">暂无可查看的技术承接数据</div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-violet-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-violet-500">审批状态</p>
                  <div className="mt-3">{renderTag(detailRecord.auditStatus)}</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-500">进行状态</p>
                  <div className="mt-3">{renderTag(detailRecord.progressStatus)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">客户</p>
                  <p className="mt-3 text-sm font-medium text-slate-900">{renderText(detailRecord.customerName)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">业务员</p>
                  <p className="mt-3 text-sm font-medium text-slate-900">{renderText(detailRecord.salesName)}</p>
                </div>
              </div>
            </section>

            <DetailCard title="基础承接信息" items={detailBasicItems} />
            <DetailCard title="关键技术参数" items={detailParamItems} />
            <DetailCard title="工艺要求与操作提示" items={detailProcessItems} />

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">图片与备注</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">款式图</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 break-all">{renderText(detailRecord.stylePic)}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">订标位置图</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 break-all">{renderText(detailRecord.tagPic)}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">订标位置说明</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{renderText(detailRecord.tagPicRemark)}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">备注</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{renderText(detailRecord.remark)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-cyan-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-2 text-cyan-700 shadow-sm">
                  <ClipboardList size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-900">你现在看到的是什么</p>
                  <p className="mt-1 text-xs leading-6 text-cyan-800">
                    这页代表技术已经承接到的真实要求。当前已经补上分配、接单、开始处理、提交、通过、驳回这条链；下一步如果要继续完整化，就应该在这里再补更正式的技术科角色权限与重提节点，而不是继续让打样通知页承担这些职责。
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </BaseModal>

      <BaseModal
        open={assignOpen}
        title={assignRecord ? `分配技术员 · ${assignRecord.styleCode || '-'}` : '分配技术员'}
        onClose={() => {
          setAssignOpen(false)
          setAssignRecord(null)
        }}
        width="720px"
      >
        <GenericForm
          initialValues={{
            pattenMarker: assignRecord?.pattenMarker ? String(assignRecord.pattenMarker) : '',
            pattenChecker: assignRecord?.pattenChecker ? String(assignRecord.pattenChecker) : '',
            remark: '',
          }}
          fields={[
            {
              name: 'pattenMarker',
              label: '技术员',
              type: 'select',
              required: true,
              options: employeeOptions,
              group: '分配信息',
            },
            {
              name: 'pattenChecker',
              label: '主管/核版',
              type: 'select',
              options: employeeOptions,
              group: '分配信息',
            },
            {
              name: 'remark',
              label: '分配说明',
              type: 'textarea',
              group: '分配信息',
            },
          ]}
          onSubmit={handleAssignSubmit}
          onCancel={() => {
            setAssignOpen(false)
            setAssignRecord(null)
          }}
        />
      </BaseModal>
    </div>
  )
}
