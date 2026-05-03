import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Factory,
  FileStack,
  GitBranch,
  Route,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import * as approvalApi from '@/api/approval'
import * as processDefApi from '@/api/processDef'
import * as processRouteApi from '@/api/processRoute'
import * as sampleTechApi from '@/api/sampleTech'
import ApprovalTimeline from '@/components/business/ApprovalTimeline'
import { toast } from '@/components/ui/Toast'

function renderText(value: unknown) {
  const text = String(value ?? '').trim()
  return text || '-'
}

function renderDate(value: unknown) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, 10) : '-'
}

function renderBool(value: unknown) {
  if (value === 1 || value === '1' || value === true) return '是'
  if (value === 0 || value === '0' || value === false) return '否'
  return '-'
}

function renderRouteStatus(value: unknown) {
  const text = String(value ?? '').trim()
  if (text === '0') {
    return { label: '启用', className: 'bg-emerald-100 text-emerald-800' }
  }
  if (text === '1') {
    return { label: '停用', className: 'bg-slate-100 text-slate-700' }
  }
  return { label: renderText(value), className: 'bg-slate-100 text-slate-700' }
}

function renderProductType(value: unknown) {
  const text = String(value ?? '').trim().toUpperCase()
  const map: Record<string, string> = {
    SWEATER: '毛衫',
    SPLICE: '拼接款',
    KNIT_TOP: '常规针织',
    OTHER: '其他',
  }
  return map[text] || renderText(value)
}

function renderRequiredMode(value: unknown) {
  const text = String(value ?? '').trim().toUpperCase()
  const map: Record<string, string> = {
    REQUIRED: '必选',
    OPTIONAL: '可选',
    CONDITIONAL: '条件触发',
  }
  return map[text] || renderText(value)
}

function renderConditionCode(value: unknown) {
  const text = String(value ?? '').trim().toUpperCase()
  const map: Record<string, string> = {
    HAS_PRINT: '有印花',
    HAS_EMBROIDERY: '有绣花',
    JAPAN_ORDER: '日单',
    NEED_LIGHT_INSPECTION: '需照灯/灯检',
    THIRD_PARTY_INSPECTION: '检品公司',
  }
  return map[text] || (text ? text : '-')
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-indigo-700 shadow-sm">
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

export default function ProcessRouteOverviewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const routeId = Number(id)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'flow'>('form')
  const [route, setRoute] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [processMap, setProcessMap] = useState<Map<string, any>>(new Map())
  const [relatedTech, setRelatedTech] = useState<any>(null)
  const [approvalLogs, setApprovalLogs] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!Number.isFinite(routeId) || routeId <= 0) {
        toast.error('缺少有效的工艺路线编号')
        navigate('/production/process')
        return
      }

      setLoading(true)
      try {
        const [routeRes, processRes] = await Promise.all([
          processRouteApi.getProcessRoute(routeId),
          processDefApi.listProcessDef({ pageNum: 1, pageSize: 999, status: '0' }).catch(() => null),
        ])

        const nextRoute = routeRes?.data || null
        const nextItems = routeRes?.items || []

        const nextProcessMap = new Map<string, any>()
        ;(processRes?.rows || []).forEach((item: any) => {
          nextProcessMap.set(String(item.id), item)
        })

        let techRecord: any = null
        let techLogRows: any[] = []

        if (nextRoute?.productCode) {
          const techRes: any = await sampleTechApi.listSampleTech({
            pageNum: 1,
            pageSize: 20,
            styleCode: nextRoute.productCode,
          }).catch(() => null)
          const matched = (techRes?.rows || []).find((item: any) => String(item.styleCode || '') === String(nextRoute.productCode || ''))
          if (matched?.id) {
            const [techDetailRes, logRes] = await Promise.all([
              sampleTechApi.getSampleTech(matched.id).catch(() => null),
              approvalApi.listApprovalLog({
                businessType: 'SAMPLE_TECH',
                businessId: matched.id,
                pageNum: 1,
                pageSize: 50,
              }).catch(() => null),
            ])
            techRecord = techDetailRes?.data || techDetailRes || matched
            techLogRows = logRes?.rows || []
          }
        }

        if (!mounted) {
          return
        }

        setRoute(nextRoute)
        setItems(nextItems)
        setProcessMap(nextProcessMap)
        setRelatedTech(techRecord)
        setApprovalLogs(techLogRows)
      } catch (error: any) {
        if (mounted) {
          toast.error(error.message || '加载工艺指示书失败')
          navigate('/production/process')
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
  }, [navigate, routeId])

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
    [items],
  )

  const tabs = [
    { key: 'form' as const, label: '表单信息' },
    { key: 'history' as const, label: '流转记录' },
    { key: 'flow' as const, label: '流程图' },
  ]

  const routeStatus = renderRouteStatus(route?.status)

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          正在加载工艺指示书...
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          未找到对应的工艺路线
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-indigo-700">
              车间执行指导
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/production/process')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回工艺路线
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${routeStatus.className}`}>
                {routeStatus.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                路线 {renderText(route.routeName)}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">工艺指示书</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这页不是单纯看工序表，而是把路线骨架、工序执行条件和大货核版沉淀下来的工艺要求收在一起，
              让生产、计划、车间和质量看到的是一张真正可执行的工艺指示基面。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={Route} label="产品类型" value={renderProductType(route.productType)} />
              <MetricCard icon={GitBranch} label="路线工序" value={`${sortedItems.length} 道`} />
              <MetricCard icon={ShieldCheck} label="质检/控制点" value={`${sortedItems.filter((item) => item.qcRequired === 1 || item.isControlPoint === 1).length} 个`} />
              <MetricCard icon={ClipboardList} label="核版关联" value={relatedTech ? '已找到' : '待补来源'} />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                to: `/sales/tech?styleCode=${encodeURIComponent(route.productCode || '')}`,
                title: '回看大货核版',
                detail: '工艺指示书应该承接核版结果，而不是脱离技术要求单独存在。',
              },
              {
                to: `/production/process-route-item`,
                title: '继续看路线明细',
                detail: '如果要维护顺序、控制点、外协和损耗条件，继续到路线明细维护。',
              },
              {
                to: `/production/plan?styleCode=${encodeURIComponent(route.productCode || '')}&customerName=${encodeURIComponent(relatedTech?.customerName || '')}&bulkOrderNo=${encodeURIComponent(relatedTech?.bulkOrderNo || '')}&sampleStyleNo=${encodeURIComponent(relatedTech?.styleCode || route.productCode || '')}&techId=${encodeURIComponent(String(relatedTech?.id || ''))}&srcBillType=process_instruction&srcBillId=${encodeURIComponent(String(route.id || ''))}&srcBillNo=${encodeURIComponent(route.routeName || route.productCode || '')}`,
                title: '继续看生产计划',
                detail: '工艺指示书确认后，下游就应该按工厂、数量和时间轴进入排产。',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50/60"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-indigo-700">
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
                  active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
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
          <SectionCard title="基础信息" hint="先确认这张指示书服务哪个产品族、哪条路线、当前是否已启用。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="路线名称" value={renderText(route.routeName)} />
              <GridField label="产品类型" value={renderProductType(route.productType)} />
              <GridField label="产品编码/款号" value={renderText(route.productCode)} />
              <GridField label="是否默认路线" value={renderBool(route.isDefault)} />
              <GridField label="状态" value={routeStatus.label} />
              <GridField label="创建人" value={renderText(route.createBy)} />
              <GridField label="创建时间" value={renderDate(route.createTime)} />
              <GridField label="更新时间" value={renderDate(route.updateTime)} />
            </div>
            <div className="mt-3">
              <GridField label="路线备注" value={renderText(route.remark)} />
            </div>
          </SectionCard>

          <SectionCard title="核版工艺要求" hint="这部分直接承接大货核版的真实工艺要求，不再让车间自己从技术单和路线表里拼上下文。">
            {!relatedTech ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                还没有按当前款号自动找到对应的大货核版技术单。当前工艺指示书先展示路线骨架，后续可继续补强与核版来源的一对一关系。
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <GridField label="客户名称" value={renderText(relatedTech.customerName)} />
                  <GridField label="业务员" value={renderText(relatedTech.salesName)} />
                  <GridField label="打样款号" value={renderText(relatedTech.styleCode)} />
                  <GridField label="大货款号" value={renderText(relatedTech.bulkOrderNo)} />
                  <GridField label="订标位置说明" value={renderText(relatedTech.tagPicRemark)} />
                  <GridField label="整烫要求" value={renderText(relatedTech.ironingTip)} />
                  <GridField label="织造要求" value={renderText(relatedTech.fabricTip)} />
                  <GridField label="套口要求" value={renderText(relatedTech.seamSealingTip)} />
                  <GridField label="手缝要求" value={renderText(relatedTech.handStitchingTip)} />
                  <GridField label="套口手缝检验" value={renderText(relatedTech.handStitchingInspection)} />
                  <GridField label="水洗要求" value={renderText(relatedTech.washingTip)} />
                  <GridField label="后套工艺说明" value={renderText(relatedTech.backGarmentTip)} />
                  <GridField label="吊牌挂法" value={renderText(relatedTech.tagHangingTip)} />
                  <GridField label="缝制说明" value={renderText(relatedTech.sewingTip)} />
                  <GridField label="裁剪要求" value={renderText(relatedTech.cuttingTip)} />
                  <GridField label="用线要求" value={renderText(relatedTech.threadTip)} />
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard title="路线执行明细" hint="这一层是工艺指示书的骨架，把每一道工序、前置关系、控制点、外协和质检条件讲清楚。">
            <div className="space-y-3">
              {sortedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  当前路线还没有维护工序明细，因此这张工艺指示书还不完整。
                </div>
              ) : (
                sortedItems.map((item, index) => {
                  const process = processMap.get(String(item.processId))
                  return (
                    <div key={`${item.id || 'route-item'}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                          第 {index + 1} 道
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {renderText(process?.processName || item.processId)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                          序号 {renderText(item.sortOrder)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                          {renderRequiredMode(item.requiredMode)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <GridField label="工序编码" value={renderText(process?.processCode)} />
                        <GridField label="前置序号" value={renderText(item.predecessorSeqs)} />
                        <GridField label="控制点" value={renderBool(item.isControlPoint)} />
                        <GridField label="齐套比率" value={renderText(item.requireCompleteRatio)} />
                        <GridField label="允许强开" value={renderBool(item.allowForceStart)} />
                        <GridField label="可外协" value={renderBool(item.isOutsource)} />
                        <GridField label="需质检" value={renderBool(item.qcRequired)} />
                        <GridField label="需检针" value={renderBool(item.needleCheckRequired)} />
                        <GridField label="记损耗" value={renderBool(item.lossTracked)} />
                        <GridField label="计件适用" value={renderBool(item.pieceWageApplicable)} />
                        <GridField label="标准工时(小时)" value={renderText(item.standardCycleHours)} />
                        <GridField label="条件代码" value={renderConditionCode(item.conditionCode)} />
                      </div>
                      <div className="mt-3">
                        <GridField label="工序备注" value={renderText(item.remark)} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <ApprovalTimeline title="核版流转记录" logs={approvalLogs} loading={false} />
          <SectionCard title="当前记录边界" hint="当前项目里工艺指示书还没有独立审批主表，所以这里先复用上游大货核版日志。">
            <div className="grid gap-3 md:grid-cols-2">
              <GridField label="来源技术单" value={relatedTech ? `#${relatedTech.id} · ${renderText(relatedTech.styleCode)}` : '未找到'} />
              <GridField label="当前说明" value="当前流转记录代表工艺要求来源的核版审批，不代表已经存在独立的工艺指示书审批实体。" />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="space-y-4">
          <SectionCard title="主链路定位" hint="工艺指示书在链路里负责把核版结果翻译成车间能执行的正式要求。">
            <div className="grid gap-3 lg:grid-cols-5">
              {[
                { title: '样衣 BOM', detail: '冻结样衣颜色组、材料与结构。', tone: 'bg-emerald-50 text-emerald-700' },
                { title: '大货核版', detail: '确认大货技术要求和关键放行参数。', tone: 'bg-violet-100 text-violet-800' },
                { title: '工艺指示书', detail: '把核版结果和路线骨架转成车间可执行指示。', tone: 'bg-indigo-100 text-indigo-800' },
                { title: '生产计划', detail: '按工厂、数量、物料与时间轴进入排产。', tone: 'bg-amber-50 text-amber-700' },
                { title: '工单/报工', detail: '现场按路线顺序、控制点和质检要求执行。', tone: 'bg-sky-50 text-sky-700' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>{item.title}</span>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="工艺差异怎么承接" hint="毛衫、拼接、常规针织不单独拆三套系统，而是通过产品类型、路线工序和核版工艺要求一起承接。">
            <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3 md:grid-cols-2">
                <GridField label="毛衫重点" value="横机、套口、手缝、水洗、整烫等环节更重要。" />
                <GridField label="常规针织重点" value="裁剪、验片、缝制、检验、包装路径更关键。" />
                <GridField label="拼接限制" value="涉及异面料时，应结合路线控制点和工厂约束限制执行去向。" />
                <GridField label="外协与质检" value="是否外协、是否需质检、是否记损耗，应体现在路线明细而不是口头补充。" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Factory size={16} className="text-indigo-700" />
                  当前现实边界
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  当前页面已经把“工艺指示书应该表达什么”收口清楚了，但底层仍是复用 `工艺路线 + 技术单` 的真实数据。
                  这比凭空新建一张空表更接近行业实际。后续如果要补独立导出、独立审批或版本冻结，再沿这条链增量扩展即可。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
