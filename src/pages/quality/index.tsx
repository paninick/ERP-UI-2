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
  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: '待检验' },
    { value: '1', label: '检验中' },
    { value: '2', label: '合格' },
    { value: '3', label: '不合格' },
  ]);

  const columns = [
    { key: 'qualityNo', title: '质检单号' },
    { key: 'jobNo', title: '工单编号' },
    { key: 'styleCode', title: '款号' },
    { key: 'checkQty', title: '检验数量' },
    { key: 'defectQty', title: '不良数量' },
    {
      key: 'defectRate',
      title: '不良率',
      render: (value: number) => (value != null ? `${(value * 100).toFixed(1)}%` : '-'),
    },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = processStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'checkDate', title: '检验日期' },
  ];

  const searchFields = [
    { name: 'qualityNo', label: '质检单号' },
    { name: 'jobNo', label: '工单编号' },
    { name: 'status', label: '状态', type: 'select' as const, options: processStatus.options },
  ];

  const formFields = [
    { name: 'qualityNo', label: '质检单号', required: true },
    { name: 'jobNo', label: '工单编号' },
    { name: 'styleCode', label: '款号' },
    { name: 'checkQty', label: '检验数量', type: 'number' as const },
    { name: 'defectQty', label: '不良数量', type: 'number' as const },
    { name: 'checkDate', label: '检验日期', type: 'date' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: processStatus.options },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="品质检验"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
