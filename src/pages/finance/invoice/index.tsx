import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as invoiceApi from '@/api/invoice';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: invoiceApi.listInvoice,
  get: invoiceApi.getInvoice,
  add: invoiceApi.addInvoice,
  update: invoiceApi.updateInvoice,
  remove: invoiceApi.delInvoice,
};

export default function InvoicePage() {
  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: '待开票' },
    { value: '1', label: '已开票' },
    { value: '2', label: '已作废' },
  ]);

  const columns = [
    { key: 'invoiceNo', title: '发票号' },
    { key: 'customerName', title: '客户' },
    { key: 'salesNo', title: '关联订单' },
    { key: 'amount', title: '金额', render: (v: number) => (v != null ? `¥${v.toFixed(2)}` : '-') },
    { key: 'taxAmount', title: '税额', render: (v: number) => (v != null ? `¥${v.toFixed(2)}` : '-') },
    { key: 'totalAmount', title: '价税合计', render: (v: number) => (v != null ? `¥${v.toFixed(2)}` : '-') },
    { key: 'invoiceDate', title: '开票日期' },
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
    { name: 'invoiceNo', label: '发票号' },
    { name: 'customerName', label: '客户' },
    { name: 'status', label: '状态', type: 'select' as const, options: confirmStatus.options },
  ];

  const formFields = [
    { name: 'invoiceNo', label: '发票号', required: true },
    { name: 'customerName', label: '客户' },
    { name: 'salesNo', label: '关联订单' },
    { name: 'amount', label: '金额', type: 'number' as const },
    { name: 'taxAmount', label: '税额', type: 'number' as const },
    { name: 'totalAmount', label: '价税合计', type: 'number' as const },
    { name: 'invoiceDate', label: '开票日期', type: 'date' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: confirmStatus.options },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="财务发票"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
