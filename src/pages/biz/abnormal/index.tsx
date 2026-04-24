import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as bizAbnormalApi from '@/api/bizAbnormal';

const api = {
  list: bizAbnormalApi.listBizAbnormal,
  get: bizAbnormalApi.getBizAbnormal,
  add: bizAbnormalApi.addBizAbnormal,
  update: bizAbnormalApi.updateBizAbnormal,
  remove: bizAbnormalApi.delBizAbnormal,
};

const LEVEL_OPTIONS = [
  { value: '1', label: '一般' },
  { value: '2', label: '严重' },
  { value: '3', label: '致命' },
];

const STATUS_OPTIONS = [
  { value: '0', label: '待处理' },
  { value: '1', label: '处理中' },
  { value: '2', label: '已关闭' },
];

const LEVEL_MAP: Record<string, { label: string; color: string }> = {
  '1': { label: '一般', color: 'bg-yellow-100 text-yellow-700' },
  '2': { label: '严重', color: 'bg-orange-100 text-orange-700' },
  '3': { label: '致命', color: 'bg-red-100 text-red-700' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  '0': { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  '1': { label: '处理中', color: 'bg-blue-100 text-blue-700' },
  '2': { label: '已关闭', color: 'bg-emerald-100 text-emerald-700' },
};

export default function BizAbnormalPage() {
  const columns = [
    { key: 'bizType', title: '业务类型' },
    { key: 'abnormalTitle', title: '异常标题' },
    {
      key: 'abnormalLevel',
      title: '等级',
      render: (v: number | string) => {
        const matched = LEVEL_MAP[String(v)] || { label: String(v), color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${matched.color}`}>{matched.label}</span>;
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (v: string) => {
        const matched = STATUS_MAP[String(v)] || { label: String(v), color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${matched.color}`}>{matched.label}</span>;
      },
    },
    { key: 'handleByName', title: '处理人' },
    { key: 'handleTime', title: '处理时间' },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'bizType', label: '业务类型' },
    { name: 'abnormalTitle', label: '异常标题' },
    { name: 'abnormalLevel', label: '等级', type: 'select' as const, options: LEVEL_OPTIONS },
    { name: 'status', label: '状态', type: 'select' as const, options: STATUS_OPTIONS },
  ];

  const formFields = [
    { name: 'bizType', label: '业务类型', required: true },
    { name: 'bizId', label: '关联业务ID', type: 'number' as const },
    { name: 'abnormalCode', label: '异常编码' },
    { name: 'abnormalTitle', label: '异常标题', required: true },
    { name: 'abnormalDesc', label: '异常描述', type: 'textarea' as const },
    { name: 'abnormalLevel', label: '等级', type: 'select' as const, options: LEVEL_OPTIONS },
    { name: 'status', label: '状态', type: 'select' as const, options: STATUS_OPTIONS },
    { name: 'handleByName', label: '处理人' },
    { name: 'handleResult', label: '处理结果', type: 'textarea' as const },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="业务异常池"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
