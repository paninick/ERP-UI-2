import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Factory,
  FileStack,
  Gauge,
  ImageIcon,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import * as approvalApi from '@/api/approval'
import * as employeeApi from '@/api/employee'
import * as sampleTechApi from '@/api/sampleTech'
import ApprovalTimeline from '@/components/business/ApprovalTimeline'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/appStore'
import { unwrapAjaxResultData } from '@/utils/ajaxResult'
import { getCompanyLabel } from '@/utils/companyContext'

function renderText(value: unknown) {
  const text = String(value ?? '').trim()
  return text || '-'
}

function renderDate(value: unknown) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, 10) : '-'
}

function renderStatus(value: unknown) {
  const text = String(value ?? '').trim().toUpperCase()
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: '草稿', className: 'bg-slate-100 text-slate-700' },
    SUBMITTED: { label: '待审核', className: 'bg-amber-100 text-amber-800' },
    APPROVED: { label: '已通过', className: 'bg-emerald-100 text-emerald-800' },
    REJECTED: { label: '已驳回', className: 'bg-rose-100 text-rose-800' },
    UNASSIGNED: { label: '待分配', className: 'bg-slate-100 text-slate-700' },
    ASSIGNED: { label: '已分配', className: 'bg-fuchsia-100 text-fuchsia-800' },
    ACCEPTED: { label: '已接单', className: 'bg-sky-100 text-sky-800' },
    IN_PROGRESS: { label: '进行中', className: 'bg-cyan-100 text-cyan-800' },
  }
  return map[text] || { label: renderText(value), className: 'bg-slate-100 text-slate-700' }
}

function renderBoolean(value: unknown) {
  if (value === 1 || value === '1' || value === true) return '是'
  if (value === 0 || value === '0' || value === false) return '否'
  return '-'
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-violet-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

function GridField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-2 break-words text-sm leading-6 text-slate-800">{value}</div>
    </div>
  )
}

function ImageCard({
  title,
  src,
  fallback,
}: {
  title: string
  src?: string
  fallback: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ImageIcon size={16} className="text-violet-700" />
        {title}
      </div>
      {src ? (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-sm"
        >
          <img src={src} alt={title} className="h-72 w-full object-cover" />
        </a>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{fallback}</p>
      )}
    </div>
  )
}

export default function SampleTechOverviewPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const techId = Number(id)
  const currentCompany = useAppStore((state) => state.currentCompany)
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'flow'>('form')
  const [record, setRecord] = useState<any>(null)
  const [approvalLogs, setApprovalLogs] = useState<any[]>([])
  const [employeeMap, setEmployeeMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!Number.isFinite(techId) || techId <= 0) {
        toast.error('缺少有效的技术单编号')
        navigate('/sales/tech')
        return
      }

      setLoading(true)
      try {
        const techRes = await sampleTechApi.getSampleTech(techId)

        if (!mounted) {
          return
        }

        const nextRecord = unwrapAjaxResultData<any>(techRes)
        setRecord(nextRecord)
        if (!nextRecord) {
          setApprovalLogs([])
          setEmployeeMap(new Map())
          return
        }

        const [approvalRes, employeeRes] = await Promise.all([
          approvalApi.listApprovalLog({
            businessType: 'SAMPLE_TECH',
            businessId: techId,
            pageNum: 1,
            pageSize: 50,
          }).catch(() => null),
          employeeApi.listEmployee({ pageNum: 1, pageSize: 999, status: '0' }).catch(() => null),
        ])

        if (!mounted) {
          return
        }

        const employees = new Map<string, string>()
        ;(employeeRes?.rows || []).forEach((item: any) => {
          const key = String(item.id ?? '')
          if (!key) return
          employees.set(
            key,
            `${item.employeeName || item.employeeCode || item.id}${item.department ? ` · ${item.department}` : ''}`,
          )
        })

        setApprovalLogs(approvalRes?.rows || [])
        setEmployeeMap(employees)
      } catch (error: any) {
        if (mounted) {
          toast.error(error.message || '加载大货核版失败')
          navigate('/sales/tech')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [companySignature, navigate, techId])

  const tabs = [
    { key: 'form' as const, label: '表单信息' },
    { key: 'history' as const, label: '流转记录' },
    { key: 'flow' as const, label: '流程图' },
  ]

  const approvalStatus = renderStatus(record?.auditStatus)
  const progressStatus = renderStatus(record?.progressStatus)

  const getEmployeeLabel = useMemo(() => {
    return (value: unknown) => {
      const key = String(value ?? '').trim()
      if (!key) return '-'
      return employeeMap.get(key) || key
    }
  }, [employeeMap])

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          正在加载大货核版...
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          <div className="mb-2 text-xs text-slate-400">当前公司：{getCompanyLabel(currentCompany.code, t)}</div>
          未找到对应的大货核版信息
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-violet-700">
              大货前技术确认
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/sales/tech')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回技术单
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${approvalStatus.className}`}>
                审批 {approvalStatus.label}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${progressStatus.className}`}>
                进度 {progressStatus.label}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">大货核版</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这页承接的是样衣确认后进入大货前的技术冻结，不重新发明一个模块，而是把现有技术单真正收口成核版基面。
              这里要回答的是谁在负责、哪些参数已经放行、图片和工艺要求是否足够支撑后续工艺指示书与生产计划。
            </p>
            <p className="mt-2 text-sm text-slate-500">当前公司：{getCompanyLabel(currentCompany.code, t)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={ClipboardCheck} label="技术员" value={getEmployeeLabel(record.pattenMarker)} />
              <MetricCard icon={ShieldCheck} label="核版/主管" value={getEmployeeLabel(record.pattenChecker)} />
              <MetricCard icon={Gauge} label="参数门槛" value="缩水 / 色差 / 温度 / pH" />
              <MetricCard icon={Workflow} label="流转记录" value={`${approvalLogs.length} 条`} />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                to: `/material/bom?styleCode=${encodeURIComponent(record.styleCode || '')}`,
                title: '回看样衣 BOM',
                detail: '核版前先核对样衣材料冻结依据，确认颜色组、主辅料与部位关系是否完整。',
              },
              {
                to: `/production/plan?styleCode=${encodeURIComponent(record.styleCode || '')}&customerName=${encodeURIComponent(record.customerName || '')}&bulkOrderNo=${encodeURIComponent(record.bulkOrderNo || '')}&sampleStyleNo=${encodeURIComponent(record.styleCode || '')}&techId=${encodeURIComponent(String(record.id || ''))}&srcBillType=sample_tech&srcBillId=${encodeURIComponent(String(record.id || ''))}&srcBillNo=${encodeURIComponent(record.bulkOrderNo || record.styleCode || '')}`,
                title: '继续看生产计划',
                detail: '核版通过后，下游就应该进入计划数量、工厂去向和排产准备。',
              },
              {
                to: '/production/process-route-item',
                title: '继续看工艺路线明细',
                detail: '针型和工艺差异不另起系统，放到工艺路线和工艺指示书里去承接。',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-violet-300 hover:bg-violet-50/60"
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

      <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </section>

      {activeTab === 'form' && (
        <div className="space-y-4">
          <SectionCard title="基础信息" hint="先确认这张核版单来自哪一笔业务，由谁负责，当前处于哪一个核版节点。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="客户名称" value={renderText(record.customerName)} />
              <GridField label="业务员" value={renderText(record.salesName)} />
              <GridField label="打样款号" value={renderText(record.styleCode)} />
              <GridField label="大货款号" value={renderText(record.bulkOrderNo)} />
              <GridField label="打样类型" value={renderText(record.sampleTypeDisplay || record.sampleType)} />
              <GridField label="样品款式" value={renderText(record.styleType)} />
              <GridField label="样品种类" value={renderText(record.sampleCategoryType)} />
              <GridField label="要求交期" value={renderDate(record.dueDate)} />
              <GridField label="技术员" value={getEmployeeLabel(record.pattenMarker)} />
              <GridField label="主管/核版" value={getEmployeeLabel(record.pattenChecker)} />
              <GridField label="审批人" value={renderText(record.auditBy)} />
              <GridField label="审批时间" value={renderDate(record.auditTime)} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <GridField label="备注" value={renderText(record.remark)} />
              <GridField label="订标位置说明" value={renderText(record.tagPicRemark)} />
            </div>
          </SectionCard>

          <SectionCard title="物料与放行关键参数" hint="这部分就是大货前要卡住的放行门槛，避免生产拿着不完整要求直接上线。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="缩水率上限(%)" value={renderText(record.shrinkageRateLimit)} />
              <GridField label="色差等级下限" value={renderText(record.colorDifferenceGradeMin)} />
              <GridField label="定型温度下限(℃)" value={renderText(record.settingTempMin)} />
              <GridField label="定型温度上限(℃)" value={renderText(record.settingTempMax)} />
              <GridField label="水洗色牢度要求" value={renderText(record.washFastnessRequirement)} />
              <GridField label="摩擦色牢度要求" value={renderText(record.rubFastnessRequirement)} />
              <GridField label="pH 范围" value={renderText(record.phRange)} />
              <GridField label="客户确认是否完成" value={renderBoolean(record.customerApproved)} />
            </div>
          </SectionCard>

          <SectionCard title="图片与核版说明" hint="现阶段技术单已经能承接款式图和订标位置图，这里作为大货核版查看入口更真实。">
            <div className="grid gap-4 xl:grid-cols-2">
              <ImageCard title="款式图" src={record.stylePic} fallback="暂无款式图" />
              <ImageCard title="订标位置图" src={record.tagPic} fallback="暂无订标位置图" />
            </div>
          </SectionCard>

          <SectionCard title="工艺要求" hint="毛衫、拼接、常规针织的差异先落在这里，再由工艺路线和指示书继续细化，不单独再拆一套系统。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <GridField label="裁剪要求" value={renderText(record.cuttingTip)} />
              <GridField label="用衬要求" value={renderText(record.liningTip)} />
              <GridField label="用线要求" value={renderText(record.threadTip)} />
              <GridField label="运针要求" value={renderText(record.needleTip)} />
              <GridField label="缝制说明" value={renderText(record.sewingTip)} />
              <GridField label="后套说明" value={renderText(record.backGarmentTip)} />
              <GridField label="织造要求" value={renderText(record.fabricTip)} />
              <GridField label="套口要求" value={renderText(record.seamSealingTip)} />
              <GridField label="手缝要求" value={renderText(record.handStitchingTip)} />
              <GridField label="套口手缝检验" value={renderText(record.handStitchingInspection)} />
              <GridField label="水洗要求" value={renderText(record.washingTip)} />
              <GridField label="整烫要求" value={renderText(record.ironingTip)} />
              <GridField label="吊牌挂法" value={renderText(record.tagHangingTip)} />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'history' && (
        <ApprovalTimeline title="核版流转记录" logs={approvalLogs} loading={false} />
      )}

      {activeTab === 'flow' && (
        <div className="space-y-4">
          <SectionCard title="链路定位" hint="大货核版不单飞，它应该夹在样衣材料冻结和生产执行准备之间。">
            <div className="grid gap-3 lg:grid-cols-5">
              {[
                { title: '打样通知', detail: '业务发起来源任务，定义客户需求与交期。', tone: 'bg-slate-100 text-slate-700' },
                { title: '样衣 BOM', detail: '冻结样衣颜色组、主辅料与附件依据。', tone: 'bg-emerald-50 text-emerald-700' },
                { title: '大货核版', detail: '确认大货放行参数、技术员、核版人与关键工艺要求。', tone: 'bg-violet-100 text-violet-800' },
                { title: '工艺指示书', detail: '把核版结果转成车间可执行的正式工艺要求。', tone: 'bg-sky-50 text-sky-700' },
                { title: '生产计划', detail: '承接工厂、数量、物料与时间轴，进入排期准备。', tone: 'bg-amber-50 text-amber-700' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>{item.title}</span>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="工厂维度怎么接" hint="总部看全链，工厂看自己的执行维度。核版的职责是把模糊样衣意见变成工厂能拿去排与做的依据。">
            <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3 md:grid-cols-2">
                <GridField label="总部视角" value="可看来源任务、技术冻结、工艺路线、工厂去向与排产准备。" />
                <GridField label="工厂视角" value="直接看到与自己相关的工艺要求、关键参数、计划和现场执行。" />
                <GridField label="毛衫差异" value="更多关注织造、套口、手缝、水洗、整烫等环节。" />
                <GridField label="常规针织差异" value="更多依赖裁剪、缝制、检验、包装等路径。" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Factory size={16} className="text-violet-700" />
                  当前页面边界
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  当前这页是基于现有 `SampleTech` 真正能承接的数据做出来的核版基面，不是假装已经有单独的大货核版后端实体。
                  后续如果要更细化到织片技术数据、套口参数块、外发核版节点，可以再在这条链上增量扩字段，而不是推翻现有模块。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
