import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as qualityApi from '@/api/quality';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: qualityApi.listQuality,
  get: qualityApi.getQuality,
  add: qualityApi.addQuality,
  update: qualityApi.updateQuality,
  remove: qualityApi.delQuality,
};

export default function QualityPage() {
  const { t } = useTranslation();
  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: t('page.quality.status.pending') },
    { value: '1', label: t('page.quality.status.inspecting') },
    { value: '2', label: t('page.quality.status.pass') },
    { value: '3', label: t('page.quality.status.fail') },
  ]);

  const columns = [
    { key: 'qualityNo', title: t('page.quality.columns.qualityNo') },
    { key: 'jobNo', title: t('page.quality.columns.jobNo') },
    { key: 'styleCode', title: t('page.quality.columns.styleCode') },
    { key: 'checkQty', title: t('page.quality.columns.checkQty') },
    { key: 'defectQty', title: t('page.quality.columns.defectQty') },
    {
      key: 'defectRate',
      title: t('page.quality.columns.defectRate'),
      render: (value: number) => (value != null ? `${(value * 100).toFixed(1)}%` : '-'),
    },
    {
      key: 'status',
      title: t('page.quality.columns.status'),
      render: (value: string) => {
        const tag = processStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'checkDate', title: t('page.quality.columns.checkDate') },
  ];

  const searchFields = [
    { name: 'qualityNo', label: t('page.quality.columns.qualityNo') },
    { name: 'jobNo', label: t('page.quality.columns.jobNo') },
    { name: 'status', label: t('page.quality.columns.status'), type: 'select' as const, options: processStatus.options },
  ];

  const formFields = [
    { name: 'qualityNo', label: t('page.quality.columns.qualityNo'), required: true },
    { name: 'jobNo', label: t('page.quality.columns.jobNo') },
    { name: 'styleCode', label: t('page.quality.columns.styleCode') },
    { name: 'checkQty', label: t('page.quality.columns.checkQty'), type: 'number' as const },
    { name: 'defectQty', label: t('page.quality.columns.defectQty'), type: 'number' as const },
    { name: 'checkDate', label: t('page.quality.columns.checkDate'), type: 'date' as const },
    { name: 'status', label: t('page.quality.columns.status'), type: 'select' as const, options: processStatus.options },
    { name: 'remark', label: t('page.quality.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.quality.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
