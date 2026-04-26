import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { useCrud } from '@/hooks/useCrud';
import { useDictOptions } from '@/hooks/useDictOptions';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import * as approvalApi from '@/api/approval';
import {
  buildApprovalLog,
  buildApprovalPayload,
  getApprovalActorName,
  isApprovalLocked,
  resolveApprovalState,
  resolveApprovalValue,
} from '@/utils/approval';
import * as salesApi from '@/api/sales';
import SalesOrderForm from './form';

const salesCrudApi = {
  list: salesApi.listSalesOrder,
  get: salesApi.getSalesOrder,
  add: salesApi.addSalesOrder,
  update: salesApi.updateSalesOrder,
  remove: salesApi.delSalesOrder,
};

export default function SalesOrderPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const orderStatus = useDictOptions('sales_order_status');
  const {
    data,
    loading,
    pagination,
    handleSearch,
    handleReset,
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useCrud(salesCrudApi);

  const [searchParams, setSearchParams] = useState({
    salesNo: '',
    customerName: '',
    orderStatus: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actorName = getApprovalActorName(user);
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.salesNo || record.styleCode || '-' }));
    if (!confirmed) {
      return;
    }

    const nextStatus = action === 'reject'
      ? resolveApprovalValue(orderStatus.options, 'rejected')
      : action === 'approve'
        ? resolveApprovalValue(orderStatus.options, 'approved')
        : resolveApprovalValue(orderStatus.options, 'submitted');

    try {
      await salesApi.updateSalesOrder(buildApprovalPayload({
        record,
        statusField: 'orderStatus',
        nextStatus,
        action,
        actorName,
      }));
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'SALES_ORDER',
        businessId: record.id,
        businessNo: record.salesNo,
        nodeCode: 'SALES_APPROVE',
        actionType: action === 'submit' ? 'SUBMIT' : action === 'approve' ? 'APPROVE' : 'REJECT',
        fromStatus: String(record.orderStatus || ''),
        toStatus: String(nextStatus || ''),
        actionBy: actorName,
      })).catch(() => null);
      toast.success(
        action === 'submit'
          ? t('approval.submitSuccess')
          : action === 'approve'
            ? t('approval.approveSuccess')
            : t('approval.rejectSuccess'),
      );
      handleSearch(searchParams);
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  const columns = [
    { key: 'salesNo', title: t('page.sales.columns.salesNo') },
    { key: 'customerName', title: t('page.sales.columns.customerName') },
    { key: 'bulkOrderNo', title: t('page.sales.columns.bulkOrderNo') },
    { key: 'styleCode', title: t('page.sales.columns.styleCode') },
    { key: 'salesDate', title: t('page.sales.columns.orderDate') },
    { key: 'dueDate', title: t('page.sales.columns.deliveryDate') },
    { key: 'quantity', title: t('page.sales.columns.quantity') },
    {
      key: 'amount',
      title: t('page.sales.columns.amount'),
      render: (value: number) => value ? String(value) : '-',
    },
    {
      key: 'orderStatus',
      title: t('page.sales.columns.orderStatus'),
      render: (value: string) => {
        const status = orderStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>;
      },
    },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '220px',
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          <NavLink
            to={`/sales/order/print/${record.id}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t('common.print')}
          </NavLink>
          <button
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/sales/order/${record.id}`);
            }}
            className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
          >
            {t('common.detail')}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setEditingRecord(record);
              setModalOpen(true);
            }}
            disabled={isApprovalLocked(record.orderStatus, orderStatus.options)}
            className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={async (event) => {
              event.stopPropagation();
              if (await confirm(t('page.sales.confirmDelete'))) {
                handleDelete(String(record.id));
              }
            }}
            disabled={isApprovalLocked(record.orderStatus, orderStatus.options)}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            {t('common.delete')}
          </button>
          {resolveApprovalState(record.orderStatus, orderStatus.options) !== 'approved' && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'submit');
              }}
              className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              {t('common.submit')}
            </button>
          )}
          {resolveApprovalState(record.orderStatus, orderStatus.options) !== 'approved' && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'approve');
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              {t('common.approve')}
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleApproval(record, 'reject');
            }}
            className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
          >
            {t('common.reject')}
          </button>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleModalOk = async (values: any) => {
    if (editingRecord) {
      await handleUpdate({ ...values, id: editingRecord.id });
    } else {
      await handleAdd(values);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('page.sales.title')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/sales/order/new')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t('page.sales.businessDetail')}
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <Plus size={14} />
            {t('common.add')}
          </button>
        </div>
      </div>

      <SearchForm
        onSearch={() => handleSearch(searchParams)}
        onReset={() => {
          setSearchParams({ salesNo: '', customerName: '', orderStatus: '' });
          handleReset();
        }}
      >
        <SearchField label={t('page.sales.columns.salesNo')}>
          <input
            aria-label={t('page.sales.columns.salesNo')}
            value={searchParams.salesNo}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, salesNo: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.sales.placeholders.salesNo')}
          />
        </SearchField>
        <SearchField label={t('page.sales.columns.customerName')}>
          <input
            aria-label={t('page.sales.columns.customerName')}
            value={searchParams.customerName}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, customerName: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.sales.placeholders.customerName')}
          />
        </SearchField>
        <SearchField label={t('page.sales.columns.orderStatus')}>
          <select
            aria-label={t('page.sales.columns.orderStatus')}
            value={searchParams.orderStatus}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, orderStatus: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t('common.all')}</option>
            {orderStatus.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>
      </SearchForm>

      <BaseTable
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={(record) => navigate(`/sales/order/${record.id}`)}
      />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />

      <BaseModal
        open={modalOpen}
        title={editingRecord ? t('page.sales.editTitle') : t('page.sales.addTitle')}
        onClose={() => setModalOpen(false)}
      >
        <SalesOrderForm
          initialValues={editingRecord}
          onSubmit={handleModalOk}
          onCancel={() => setModalOpen(false)}
        />
      </BaseModal>
    </div>
  );
}
