import CrudPage from '@/components/ui/CrudPage'
import GenericForm from '@/components/ui/GenericForm'
import * as thresholdApi from '@/api/dashboardThreshold'

const api = {
  list: thresholdApi.listDashboardThresholdRules,
  get: thresholdApi.getDashboardThresholdRule,
  add: thresholdApi.addDashboardThresholdRule,
  update: thresholdApi.updateDashboardThresholdRule,
  remove: thresholdApi.delDashboardThresholdRule,
}

const operatorOptions = [
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'eq', label: '=' },
  { value: 'ne', label: '!=' },
]

const severityOptions = [
  { value: 'INFO', label: 'INFO' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'CRITICAL', label: 'CRITICAL' },
]

const sourceRequirementOptions = [
  { value: 'CONFIRMED', label: '仅确认来源' },
  { value: 'DRAFT_OK', label: '草稿可见' },
]

const enabledOptions = [
  { value: '1', label: '启用' },
  { value: '0', label: '停用' },
]

export default function DashboardThresholdPage() {
  const columns = [
    { key: 'metricCode', title: '指标编码' },
    { key: 'metricName', title: '指标名称' },
    { key: 'operatorCode', title: '比较符' },
    { key: 'thresholdValue', title: '阈值' },
    { key: 'severity', title: '级别' },
    { key: 'sourceRequirement', title: '来源要求' },
    { key: 'enabled', title: '启用状态' },
    { key: 'version', title: '版本' },
    { key: 'remark', title: '备注' },
  ]

  const searchFields = [
    { name: 'metricCode', label: '指标编码' },
    {
      name: 'enabled',
      label: '启用状态',
      type: 'select' as const,
      options: enabledOptions,
    },
  ]

  const formFields = [
    { name: 'metricCode', label: '指标编码', required: true },
    { name: 'metricName', label: '指标名称', required: true },
    { name: 'operatorCode', label: '比较符', type: 'select' as const, options: operatorOptions, required: true },
    { name: 'thresholdValue', label: '阈值', type: 'number' as const, required: true },
    { name: 'severity', label: '级别', type: 'select' as const, options: severityOptions },
    {
      name: 'sourceRequirement',
      label: '来源要求',
      type: 'select' as const,
      options: sourceRequirementOptions,
    },
    { name: 'enabled', label: '启用状态', type: 'select' as const, options: enabledOptions },
    { name: 'version', label: '版本', type: 'number' as const },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ]

  return (
    <div className="space-y-4 p-6">
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-900">
        阈值命中只生成预警，不自动封供应商、不自动停产。这里维护的是管理提醒门槛，不是业务状态机。
      </div>
      <CrudPage
        title="阈值规则"
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      />
    </div>
  )
}
