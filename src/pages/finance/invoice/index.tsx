import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as finInvoiceApi from '@/api/finInvoice';

const api = {
  list: finInvoiceApi.listFinInvoice,
  get: finInvoiceApi.getFinInvoice,
  add: finInvoiceApi.addFinInvoice,
  update: finInvoiceApi.updateFinInvoice,
  remove: finInvoiceApi.delFinInvoice,
};

export default function InvoicePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const statusOptions = useMemo(
    () => [
      { value: 'PENDING', label: t('page.invoice.status.pending', { defaultValue: '待开票' }) },
      { value: 'PARTIAL', label: t('page.invoice.status.partial', { defaultValue: '部分核销' }) },
      { value: 'SETTLED', label: t('page.invoice.status.received', { defaultValue: '已结清' }) },
      { value: 'RED_ISSUED', label: t('page.invoice.status.redIssued', { defaultValue: '已红冲' }) },
    ],
    [t]
  );
  const auditStatusOptions = useMemo(
    () => [
      { value: 'DRAFT', label: t('page.invoice.auditStatus.draft', { defaultValue: '草稿' }) },
      { value: 'SUBMITTED', label: t('page.invoice.auditStatus.submitted', { defaultValue: '已提交' }) },
      { value: 'APPROVED', label: t('page.invoice.auditStatus.approved', { defaultValue: '已通过' }) },
      { value: 'REJECTED', label: t('page.invoice.auditStatus.rejected', { defaultValue: '已驳回' }) },
    ],
    [t]
  );

  const statusMap = useMemo(
    () => Object.fromEntries(statusOptions.map((item) => [item.value, item.label])),
    [statusOptions]
  );
  const auditStatusMap = useMemo(
    () => Object.fromEntries(auditStatusOptions.map((item) => [item.value, item.label])),
    [auditStatusOptions]
  );

  const columns = [
    { key: 'invoiceNo', title: t('page.invoice.columns.invoiceNo') },
    { key: 'customerName', title: t('page.invoice.columns.customerName') },
    { key: 'totalAmount', title: t('page.invoice.columns.totalAmount'), render: (value: number) => (value != null ? `CNY ${Number(value).toFixed(2)}` : '-') },
    {
      key: 'settledAmount',
      title: t('page.invoice.columns.settledAmount', { defaultValue: '已核销金额' }),
      render: (value: number) => (value != null ? `CNY ${Number(value).toFixed(2)}` : '-'),
    },
    { key: 'invoiceDate', title: t('page.invoice.columns.invoiceDate') },
    {
      key: 'status',
      title: t('page.invoice.columns.status'),
      render: (value: string) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{statusMap[value] || value || '-'}</span>,
    },
    {
      key: 'auditStatus',
      title: t('page.invoice.columns.auditStatus', { defaultValue: '审批状态' }),
      render: (value: string) => <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{auditStatusMap[value] || value || '-'}</span>,
    },
    { key: 'remark', title: t('page.invoice.columns.remark') },
  ];

  const searchFields = [
    { name: 'invoiceNo', label: t('page.invoice.columns.invoiceNo') },
    { name: 'customerName', label: t('page.invoice.columns.customerName') },
    { name: 'status', label: t('page.invoice.columns.status'), type: 'select' as const, options: statusOptions },
  ];
  const initialSearchParams = useMemo(
    () => ({
      invoiceNo: searchParams.get('invoiceNo') || '',
      customerName: searchParams.get('customerName') || '',
      status: searchParams.get('status') || '',
    }),
    [searchParams],
  );

  const formFields = [
    { name: 'invoiceNo', label: t('page.invoice.columns.invoiceNo'), required: true },
    { name: 'customerName', label: t('page.invoice.columns.customerName'), required: true },
    { name: 'totalAmount', label: t('page.invoice.columns.totalAmount'), type: 'number' as const, required: true },
    { name: 'settledAmount', label: t('page.invoice.columns.settledAmount', { defaultValue: '已核销金额' }), type: 'number' as const },
    { name: 'invoiceDate', label: t('page.invoice.columns.invoiceDate'), type: 'date' as const },
    { name: 'status', label: t('page.invoice.columns.status'), type: 'select' as const, options: statusOptions },
    { name: 'auditStatus', label: t('page.invoice.columns.auditStatus', { defaultValue: '审批状态' }), type: 'select' as const, options: auditStatusOptions },
    { name: 'remark', label: t('page.invoice.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('page.invoice.chainHint')}
      </div>
      <CrudPage
        title={t('page.invoice.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
        initialSearchParams={initialSearchParams}
      />
    </div>
  );
}
