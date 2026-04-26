import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: t('page.invoice.status.pending') },
    { value: '1', label: t('page.invoice.status.invoiced') },
    { value: '2', label: t('page.invoice.status.received') },
  ]);

  const columns = [
    { key: 'invoiceNo', title: t('page.invoice.columns.invoiceNo') },
    { key: 'customerName', title: t('page.invoice.columns.customerName') },
    { key: 'salesNo', title: t('page.invoice.columns.salesNo') },
    { key: 'amount', title: t('page.invoice.columns.amount'), render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-') },
    { key: 'taxAmount', title: t('page.invoice.columns.taxAmount'), render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-') },
    { key: 'totalAmount', title: t('page.invoice.columns.totalAmount'), render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-') },
    { key: 'invoiceDate', title: t('page.invoice.columns.invoiceDate') },
    {
      key: 'status',
      title: t('page.invoice.columns.status'),
      render: (value: string) => {
        const tag = confirmStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'invoiceNo', label: t('page.invoice.columns.invoiceNo') },
    { name: 'customerName', label: t('page.invoice.columns.customerName') },
    { name: 'status', label: t('page.invoice.columns.status'), type: 'select' as const, options: confirmStatus.options },
  ];

  const formFields = [
    { name: 'invoiceNo', label: t('page.invoice.columns.invoiceNo'), required: true },
    { name: 'customerName', label: t('page.invoice.columns.customerName') },
    { name: 'salesNo', label: t('page.invoice.columns.salesNo') },
    { name: 'amount', label: t('page.invoice.columns.amount'), type: 'number' as const },
    { name: 'taxAmount', label: t('page.invoice.columns.taxAmount'), type: 'number' as const },
    { name: 'totalAmount', label: t('page.invoice.columns.totalAmount'), type: 'number' as const },
    { name: 'invoiceDate', label: t('page.invoice.columns.invoiceDate'), type: 'date' as const },
    { name: 'status', label: t('page.invoice.columns.status'), type: 'select' as const, options: confirmStatus.options },
    { name: 'remark', label: t('page.invoice.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.invoice.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
