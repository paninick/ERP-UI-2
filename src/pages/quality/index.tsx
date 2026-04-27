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
  const qcResult = useDictOptions('erp_qc_result', [
    { value: 'PASS', label: t('quality.result.pass') },
    { value: 'FAIL', label: t('quality.result.fail') },
    { value: 'PENDING', label: t('quality.result.pending') },
  ]);
  const qcType = useDictOptions('erp_qc_type', [
    { value: 'DAILY', label: t('quality.type.daily') },
    { value: 'FINAL', label: t('quality.type.final') },
    { value: 'OUTSOURCE', label: t('quality.type.outsource') },
  ]);

  const columns = [
    { key: 'batchNo', title: t('quality.columns.batchNo') },
    { key: 'orderNo', title: t('quality.columns.orderNo') },
    { key: 'styleCode', title: t('quality.columns.styleCode') },
    { key: 'sampleQty', title: t('quality.columns.sampleQty') },
    { key: 'defectQty', title: t('quality.columns.defectQty') },
    {
      key: 'passRate',
      title: t('quality.columns.passRate'),
      render: (value: number) => (value != null ? `${(value * 100).toFixed(1)}%` : '-'),
    },
    {
      key: 'result',
      title: t('quality.columns.result'),
      render: (value: string) => {
        const tag = qcResult.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'inspectorName', title: t('quality.columns.inspector') },
    { key: 'createTime', title: t('quality.columns.checkDate') },
  ];

  const searchFields = [
    { name: 'batchNo', label: t('quality.columns.batchNo') },
    { name: 'orderNo', label: t('quality.columns.orderNo') },
    { name: 'result', label: t('quality.columns.result'), type: 'select' as const, options: qcResult.options },
  ];

  const formFields = [
    { name: 'batchNo', label: t('quality.columns.batchNo'), required: true },
    { name: 'orderNo', label: t('quality.columns.orderNo') },
    { name: 'styleCode', label: t('quality.columns.styleCode') },
    { name: 'sampleQty', label: t('quality.columns.sampleQty'), type: 'number' as const },
    { name: 'defectQty', label: t('quality.columns.defectQty'), type: 'number' as const },
    { name: 'qcType', label: t('quality.columns.qcType'), type: 'select' as const, options: qcType.options },
    { name: 'result', label: t('quality.columns.result'), type: 'select' as const, options: qcResult.options },
    { name: 'inspectorName', label: t('quality.columns.inspector') },
    { name: 'remark', label: t('quality.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('quality.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
