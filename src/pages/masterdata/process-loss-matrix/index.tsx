import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { ArrowRight, Percent, ShieldAlert, Waves } from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import * as api from '@/api/processLossMatrix'

export default function ProcessLossMatrix() {
  const { t } = useTranslation()
  const pageApi = {
    list: api.listProcessLossMatrix,
    get: api.getProcessLossMatrix,
    add: api.addProcessLossMatrix,
    update: api.updateProcessLossMatrix,
    remove: (ids: string) => api.delProcessLossMatrix(Number(ids)),
  }

  const columns = [
    { key: 'materialAType', title: '主料类型' },
    { key: 'materialBType', title: '辅料类型' },
    { key: 'processCode', title: '工艺代码' },
    { key: 'standardLossRate', title: '标准损耗率(%)' },
    { key: 'actualAvgLoss', title: '历史平均损耗' },
    { key: 'remark', title: '说明' },
  ]

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700">损耗参数口径</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('processLossMatrix.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              工序损耗矩阵在行业里是合理存在的，但它不是随便填个损耗率就结束。它应该回答“哪类主料、哪类辅料、走什么工艺代码时，标准损耗是多少，历史实际平均又是多少”，这样计划用料、异常预警和成本分析才有判断基线。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Percent, label: '它是什么', value: '损耗判断基线' },
                { icon: Waves, label: '关联维度', value: '主料 / 辅料 / 工艺代码' },
                { icon: ShieldAlert, label: '作用', value: '预警 / 成本 / 合理性判断' },
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
              { to: '/production/process-route-item', title: '先看路线明细', detail: '先确认什么工艺节点会记录损耗，再维护这里的默认口径。' },
              { to: '/masterdata/process-price', title: '再看工序价格', detail: '损耗和工序价格一起决定成本归集是否偏差。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-amber-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-amber-900">当前数据口径说明</p>
          <p className="text-xs leading-6 text-amber-800">
            这一页已经按后端真实结构显示主料类型、辅料类型、工艺代码、标准损耗率和历史平均损耗。现在如果看起来仍然数据少，问题不在页面，而在默认矩阵尚未按针织工厂常见组合维护完整。
          </p>
        </div>
      </section>

      <CrudPage title={t('processLossMatrix.title')} api={pageApi} columns={columns} />
    </div>
  )
}
