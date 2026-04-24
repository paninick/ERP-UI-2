import CrudPage from '@/components/ui/CrudPage';
import * as outsourceApi from '@/api/outsource';
import { useDictOptions } from '@/hooks/useDictOptions';
import OutsourceForm from './form';

const api = {
  list: outsourceApi.listOutsource,
  get: outsourceApi.getOutsource,
  add: outsourceApi.addOutsource,
  update: outsourceApi.updateOutsource,
  remove: outsourceApi.delOutsource,
};

export default function OutsourcePage() {
  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
    { value: '2', label: '生产中' },
    { value: '3', label: '已完成' },
    { value: '4', label: '已取消' },
  ]);

  const columns = [
    { key: 'outsourceNo', title: '外协单号' },
    { key: 'supplierName', title: '供应商' },
    { key: 'jobNo', title: '工单编号' },
    { key: 'processName', title: '工序' },
    { key: 'styleCode', title: '款号' },
    { key: 'quantity', title: '数量' },
    {
      key: 'unitPrice',
      title: '单价',
      render: (value: number) => (value != null ? `¥${value.toFixed(2)}` : '-'),
    },
    { key: 'expectedDate', title: '预计交期' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = processStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'outsourceNo', label: '外协单号' },
    { name: 'styleCode', label: '款号' },
    { name: 'status', label: '状态', type: 'select' as const, options: processStatus.options },
  ];

  return (
    <CrudPage
      title="外协加工"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={OutsourceForm}
    />
  );
}
