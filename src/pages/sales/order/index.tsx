import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ClipboardList, FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import { useCrud } from '@/hooks/useCrud';
import { useDictOptions } from '@/hooks/useDictOptions';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
  isApprovalLocked,
  resolveApprovalState,
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
  const [urlSearchParams] = useSearchParams();
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

  const initialSearchParams = useMemo(
    () => ({
      salesNo: urlSearchParams.get('salesNo') || '',
      customerName: urlSearchParams.get('customerName') || '',
      orderStatus: urlSearchParams.get('orderStatus') || '',
    }),
    [urlSearchParams],
  );
  const initialSearchKey = useMemo(() => JSON.stringify(initialSearchParams), [initialSearchParams]);
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const appliedInitialSearchKeyRef = useRef('');

  useEffect(() => {
    if (appliedInitialSearchKeyRef.current === initialSearchKey) {
      return;
    }
    appliedInitialSearchKeyRef.current = initialSearchKey;
    setSearchParams(initialSearchParams);
    if (Object.values(initialSearchParams).some((value) => String(value || '').trim() !== '')) {
      handleSearch(initialSearchParams);
    } else {
      handleReset();
    }
  }, [initialSearchKey]);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.salesNo || record.styleCode || '-' }));
    if (!confirmed) {
      return;
    }

    try {
      if (action === 'submit') {
        await salesApi.submitSalesOrder(record.id);
      } else if (action === 'approve') {
        await salesApi.approveSalesOrder(record.id);
      } else {
        await salesApi.rejectSalesOrder(record.id);
      }
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
    { key: 'quantity', title: t('page.sales.columns.quantity'), render: (value: any) => value ?? '-' },
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
      width: '320px',
      render: (_: any, record: any) => (
        <div className="flex max-w-[320px] flex-wrap gap-2">
          <NavLink
            to={`/sales/order/print/${record.id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {t('common.print')}
          </NavLink>
          <button
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/sales/order/${record.id}`);
            }}
            className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {t('common.detail')}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setEditingRecord(record);
              setModalOpen(true);
            }}
            disabled={isApprovalLocked(record.auditStatus)}
            className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
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
            disabled={isApprovalLocked(record.auditStatus)}
            className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
          >
            {t('common.delete')}
          </button>
          {resolveApprovalState(record.auditStatus) !== 'approved' && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'submit');
              }}
              className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
            >
              {t('common.submit')}
            </button>
          )}
          {resolveApprovalState(record.auditStatus) !== 'approved' && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'approve');
              }}
              className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              {t('common.approve')}
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleApproval(record, 'reject');
            }}
            className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
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
      <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-indigo-700">商业承诺源头</div>
            <h2 className="mt-3 text-2xl font-bold text-slate-800">{t('page.sales.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              销售订单是整条链路的商业承诺源头，除了客户、交期、数量、金额和款号方向，还应该承接颜色、尺码、数量拆分与客户要求。打样通知、技术单、采购、排期都围绕订单继续展开，而不是各自平行建一套源头数据。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: FileText, label: '它是什么', value: '客户交付承诺单' },
                { icon: ClipboardList, label: '核心内容', value: '客户 / 交期 / 颜色 / 尺码 / 数量' },
                { icon: ArrowRight, label: '下游去向', value: '打样 / 技术 / 采购 / 计划 / 生产' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">订单登记边界</p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                销售先登记客户、款式、颜色、尺码、数量、交期、备注与原料要求，确保订单头和订单明细一次录入完成，不再把源头信息拆散到多个入口。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">下游承接原则</p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                订单确认后，再由打样通知、技术冻结、采购、排期与生产逐级承接。上半区只说明规则，不再放主操作入口，避免正式流程入口分散。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">正式入口顺序</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">主录入入口统一放在订单下方操作区，按正式使用顺序从左到右进入：先新增订单，再跟打样、技术与历史拆分追溯。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              新增订单
            </button>
            <NavLink to="/sales/proofing-notice" className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
              打样通知
            </NavLink>
            <NavLink to="/sales/tech" className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
              技术单
            </NavLink>
            <NavLink to="/sales/sales-item" className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
              历史销售拆分
            </NavLink>
          </div>
        </div>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch(searchParams);
        }}
        className="mb-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_220px_auto] xl:items-end">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span>{t('page.sales.columns.salesNo')}</span>
            <input
              aria-label={t('page.sales.columns.salesNo')}
              value={searchParams.salesNo}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, salesNo: event.target.value }))}
              className="min-h-[44px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
              placeholder={t('page.sales.placeholders.salesNo')}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span>{t('page.sales.columns.customerName')}</span>
            <input
              aria-label={t('page.sales.columns.customerName')}
              value={searchParams.customerName}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, customerName: event.target.value }))}
              className="min-h-[44px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
              placeholder={t('page.sales.placeholders.customerName')}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span>{t('page.sales.columns.orderStatus')}</span>
            <select
              aria-label={t('page.sales.columns.orderStatus')}
              value={searchParams.orderStatus}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, orderStatus: event.target.value }))}
              className="min-h-[44px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            >
              <option value="">{t('common.all')}</option>
              {orderStatus.options.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {t('common.search')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchParams({ salesNo: '', customerName: '', orderStatus: '' });
                handleReset();
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </form>

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
        width="980px"
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
