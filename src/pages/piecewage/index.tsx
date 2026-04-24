import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as piecewageApi from '@/api/piecewage';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: piecewageApi.listPiecewage,
  get: piecewageApi.getPiecewage,
  add: piecewageApi.addPiecewage,
  update: piecewageApi.updatePiecewage,
  remove: piecewageApi.delPiecewage,
};

export default function PiecewagePage() {
  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
  ]);

  const columns = [
    { key: 'wageNo', title: '计件单号' },
    { key: 'employeeName', title: '员工' },
    { key: 'jobNo', title: '工单编号' },
    { key: 'processName', title: '工序' },
    { key: 'quantity', title: '数量' },
    { key: 'unitPrice', title: '单价', render: (v: number) => (v != null ? `¥${v.toFixed(2)}` : '-') },
    { key: 'amount', title: '金额', render: (v: number) => (v != null ? `¥${v.toFixed(2)}` : '-') },
    { key: 'wageDate', title: '日期' },
    {
      key: 'status',
      title: '状态',
      render: (v: string) => {
        const tag = confirmStatus.toTag(v, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'wageNo', label: '计件单号' },
    { name: 'employeeName', label: '员工' },
    { name: 'jobNo', label: '工单编号' },
    { name: 'status', label: '状态', type: 'select' as const, options: confirmStatus.options },
  ];

  const formFields = [
    { name: 'wageNo', label: '计件单号', required: true },
    { name: 'employeeName', label: '员工', required: true },
    { name: 'jobNo', label: '工单编号' },
    { name: 'processName', label: '工序' },
    { name: 'quantity', label: '数量', type: 'number' as const, required: true },
    { name: 'unitPrice', label: '单价', type: 'number' as const },
    { name: 'wageDate', label: '日期', type: 'date' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: confirmStatus.options },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="计件工资"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
