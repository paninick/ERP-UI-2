import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { ArrowRight, GitBranch, ListOrdered, Route, ShieldCheck } from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import * as api from '@/api/processRouteItem'

function renderBool(value: any) {
  if (value === 1 || value === '1' || value === true) return '是'
  if (value === 0 || value === '0' || value === false) return '否'
  return '-'
}

export default function ProcessRouteItem() {
  const { t } = useTranslation()
  const pageApi = {
    list: api.listProcessRouteItem,
    get: api.getProcessRouteItem,
    add: api.addProcessRouteItem,
    update: api.updateProcessRouteItem,
    remove: (ids: string) => api.delProcessRouteItem(Number(ids)),
  }

  const columns = [
    { key: 'routeId', title: '路线ID' },
    { key: 'processId', title: '工序ID' },
    { key: 'sortOrder', title: '顺序' },
    { key: 'predecessorSeqs', title: '前置序号' },
    { key: 'isControlPoint', title: '控制点', render: (value: any) => renderBool(value) },
    { key: 'requireCompleteRatio', title: '齐套比率' },
    { key: 'allowForceStart', title: '允许强开', render: (value: any) => renderBool(value) },
    { key: 'isOutsource', title: '可外协', render: (value: any) => renderBool(value) },
    { key: 'standardCycleHours', title: '标准工时' },
    { key: 'requiredMode', title: '适用方式' },
    { key: 'conditionCode', title: '条件代码' },
    { key: 'qcRequired', title: '需质检', render: (value: any) => renderBool(value) },
    { key: 'needleCheckRequired', title: '需检针', render: (value: any) => renderBool(value) },
    { key: 'lossTracked', title: '记损耗', render: (value: any) => renderBool(value) },
    { key: 'pieceWageApplicable', title: '计件适用', render: (value: any) => renderBool(value) },
  ]

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-700">执行节点明细</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('processRouteItem.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              工艺路线明细真正应该回答的是“这条路线怎么执行”。不是再维护一遍路线头名字，而是把顺序、前置依赖、控制点、是否可外协、是否必须质检、是否记录损耗、是否适用计件这些现场执行条件讲清楚。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Route, label: '它是什么', value: '路线的逐工序展开' },
                { icon: GitBranch, label: '关键内容', value: '依赖 / 控制点 / 外协 / 质检 / 损耗' },
                { icon: ListOrdered, label: '它不是什么', value: '不是路线名称重复登记' },
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
              { to: '/production/process', title: '先看工艺路线头', detail: '先知道路线属于哪类产品，再看每一步怎么执行。' },
              { to: '/production/job-process', title: '再看现场报工', detail: '路线明细定义清楚，现场报工才知道先后关系与质检门槛。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-cyan-300 hover:bg-cyan-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-cyan-700">
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
            <p className="text-sm font-semibold text-amber-900">当前数据口径说明</p>
            <p className="mt-1 text-xs leading-6 text-amber-800">
              这一页现在已经按后端真实模型显示路线执行字段。如果你看到数据仍然少，问题就不是页面没有参数，而是业务主数据本身还没维护满，尤其是前置依赖、控制点、外协条件和质检开关还需要补齐。
            </p>
          </div>
        </div>
      </section>

      <CrudPage title={t('processRouteItem.title')} api={pageApi} columns={columns} />
    </div>
  )
}
