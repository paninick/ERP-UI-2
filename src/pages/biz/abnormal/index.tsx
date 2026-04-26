import { useTranslation } from 'react-i18next';
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

export default function BizAbnormalPage() {
  const { t } = useTranslation();

  const levelOptions = [
    { value: '1', label: t('page.abnormal.levels.normal') },
    { value: '2', label: t('page.abnormal.levels.serious') },
    { value: '3', label: t('page.abnormal.levels.critical') },
  ];

  const statusOptions = [
    { value: '0', label: t('page.abnormal.status.pending') },
    { value: '1', label: t('page.abnormal.status.processing') },
    { value: '2', label: t('page.abnormal.status.closed') },
  ];

  const bizTypeOptions = [
    { value: 'MATERIAL_CONSUME', label: '物料消耗' },
    { value: 'PRODUCE_JOB', label: '生产工单' },
    { value: 'PRODUCE_JOB_PROCESS', label: '生产工序' },
    { value: 'QUALITY', label: '质量' },
    { value: 'OUTSOURCE', label: '外协' },
  ];

  const levelMap: Record<string, { label: string; color: string }> = {
    '1': { label: t('page.abnormal.levels.normal'), color: 'bg-yellow-100 text-yellow-700' },
    '2': { label: t('page.abnormal.levels.serious'), color: 'bg-orange-100 text-orange-700' },
    '3': { label: t('page.abnormal.levels.critical'), color: 'bg-red-100 text-red-700' },
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    '0': { label: t('page.abnormal.status.pending'), color: 'bg-yellow-100 text-yellow-700' },
    '1': { label: t('page.abnormal.status.processing'), color: 'bg-blue-100 text-blue-700' },
    '2': { label: t('page.abnormal.status.closed'), color: 'bg-emerald-100 text-emerald-700' },
  };

  const columns = [
    { key: 'bizType', title: t('page.abnormal.columns.bizType') },
    { key: 'abnormalTitle', title: t('page.abnormal.columns.abnormalTitle') },
    {
      key: 'abnormalLevel',
      title: t('page.abnormal.columns.abnormalLevel'),
      render: (value: number | string) => {
        const matched = levelMap[String(value)] || {
          label: String(value),
          color: 'bg-slate-100 text-slate-600',
        };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${matched.color}`}>{matched.label}</span>;
      },
    },
    {
      key: 'status',
      title: t('page.abnormal.columns.status'),
      render: (value: string) => {
        const matched = statusMap[String(value)] || {
          label: String(value),
          color: 'bg-slate-100 text-slate-600',
        };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${matched.color}`}>{matched.label}</span>;
      },
    },
    { key: 'handleByName', title: t('page.abnormal.columns.handleByName') },
    { key: 'handleTime', title: t('page.abnormal.columns.handleTime') },
    { key: 'createTime', title: t('page.abnormal.columns.createTime') },
  ];

  const searchFields = [
    { name: 'bizType', label: t('page.abnormal.columns.bizType'), type: 'select' as const, options: bizTypeOptions },
    { name: 'abnormalTitle', label: t('page.abnormal.columns.abnormalTitle') },
    { name: 'abnormalLevel', label: t('page.abnormal.columns.abnormalLevel'), type: 'select' as const, options: levelOptions },
    { name: 'status', label: t('page.abnormal.columns.status'), type: 'select' as const, options: statusOptions },
  ];

  const formFields = [
    { name: 'bizType', label: t('page.abnormal.columns.bizType'), type: 'select' as const, required: true, options: bizTypeOptions },
    { name: 'bizId', label: t('page.abnormal.columns.bizId'), type: 'number' as const },
    { name: 'abnormalCode', label: t('page.abnormal.columns.abnormalCode') },
    { name: 'abnormalTitle', label: t('page.abnormal.columns.abnormalTitle'), required: true },
    { name: 'abnormalDesc', label: t('page.abnormal.columns.abnormalDesc'), type: 'textarea' as const },
    { name: 'abnormalLevel', label: t('page.abnormal.columns.abnormalLevel'), type: 'select' as const, options: levelOptions },
    { name: 'status', label: t('page.abnormal.columns.status'), type: 'select' as const, options: statusOptions },
    { name: 'handleByName', label: t('page.abnormal.columns.handleByName') },
    { name: 'handleResult', label: t('page.abnormal.columns.handleResult'), type: 'textarea' as const },
    { name: 'remark', label: t('page.abnormal.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.abnormal.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
