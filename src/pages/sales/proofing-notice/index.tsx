import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Beaker, Eye, FileSearch, Scissors } from 'lucide-react';
import * as api from '@/api/notice';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import ProofingNoticeForm from './form';

export default function ProofingNoticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const initialQueryParams = useMemo(
    () => ({
      sampleNo: urlSearchParams.get('sampleNo') || urlSearchParams.get('noticeNo') || '',
      styleCode: urlSearchParams.get('styleCode') || '',
      customerName: urlSearchParams.get('customerName') || '',
    }),
    [urlSearchParams],
  );
  const initialQueryKey = useMemo(() => JSON.stringify(initialQueryParams), [initialQueryParams]);
  const [queryParams, setQueryParams] = useState(initialQueryParams);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingAttachments, setEditingAttachments] = useState<any[]>([]);

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true);
      try {
        const res: any = await api.listNotice({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        });
        setData(res.rows || []);
        setPagination((prev) => ({ ...prev, total: res.total || 0 }));
      } catch {
        setData([]);
        toast.error(t('common.loadDataFailed'));
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, queryParams, t],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setQueryParams(initialQueryParams);
    setPagination((prev) => (prev.current === 1 ? prev : { ...prev, current: 1 }));
  }, [initialQueryKey, initialQueryParams]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    const next = { sampleNo: '', styleCode: '', customerName: '' };
    setQueryParams(next);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData({ pageNum: 1, ...next });
  };

  const openEditModal = async (record: any) => {
    try {
      const [res, fileRes]: any = await Promise.all([
        api.getNotice(record.id),
        api.listNoticeFiles({ noticeId: record.id, pageNum: 1, pageSize: 200 }),
      ]);
      setEditingRecord(res?.data || res || record);
      setEditingAttachments(fileRes?.rows || []);
      setModalOpen(true);
    } catch {
      toast.error(t('common.loadDataFailed'));
    }
  };

  const handleDelete = async (record: any) => {
    if (!(await confirm(t('page.proofingNotice.confirmDelete', { name: record.sampleNo || record.styleCode || '-' })))) {
      return;
    }
    try {
      await api.delNotice(String(record.id));
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error: any) {
      toast.error(error.message || t('common.deleteFailed'));
    }
  };

  const handleCreateTech = async (record: any) => {
    const confirmed = await confirm(`确认要从打样通知 ${record.sampleNo || record.styleCode || '-'} 生成技术承接单吗？`);
    if (!confirmed) {
      return;
    }
    try {
      const res: any = await api.createTechFromNotice(record.id);
      const tech = res?.data || res;
      if (!tech?.id) {
        toast.error('技术承接单生成失败');
        return;
      }
      toast.success('技术承接单已就绪');
      navigate(`/sales/tech/${tech.id}/overview`);
    } catch (error: any) {
      toast.error(error.message || '技术承接单生成失败');
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (!editingRecord?.id) {
        toast.error(t('page.proofingNotice.createOnlyFromSales'));
        return;
      }
      const { attachments = [], ...noticeValues } = values;
      await api.updateNotice({
        ...editingRecord,
        ...noticeValues,
        id: editingRecord.id,
        version: noticeValues.version ?? editingRecord.version,
      });
      await syncNoticeFiles(editingRecord.id, attachments, editingAttachments);
      toast.success(t('common.updateSuccess'));
      setModalOpen(false);
      setEditingRecord(null);
      setEditingAttachments([]);
      fetchData({ pageNum: pagination.current });
    } catch (error: any) {
      toast.error(error.message || t('common.saveFailed'));
    }
  };

  const syncNoticeFiles = async (noticeId: number, nextAttachments: any[], currentAttachments: any[]) => {
    const currentByKey = new Map(
      currentAttachments
        .filter((item) => item?.id != null)
        .map((item) => [`${item.fileName}::${item.fileUrl}`, item]),
    );
    const nextKeys = new Set(nextAttachments.map((item) => `${item.fileName}::${item.fileUrl}`));
    const removeIds = currentAttachments
      .filter((item) => item?.id != null && !nextKeys.has(`${item.fileName}::${item.fileUrl}`))
      .map((item) => item.id);

    if (removeIds.length) {
      await api.delNoticeFile(removeIds.join(','));
    }

    const addTasks = nextAttachments
      .filter((item) => !currentByKey.has(`${item.fileName}::${item.fileUrl}`))
      .map((item) =>
        api.addNoticeFile({
          noticeId,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
        }),
      );

    if (addTasks.length) {
      await Promise.all(addTasks);
    }
  };

  const columns = [
    { key: 'sampleNo', title: t('page.proofingNotice.form.fields.sampleNo') },
    { key: 'styleCode', title: t('page.proofingNotice.styleCode') },
    { key: 'customerName', title: t('page.proofingNotice.customerName') },
    { key: 'sampleType', title: t('page.proofingNotice.sampleType') },
    { key: 'roundNumber', title: t('page.proofingNotice.form.fields.roundNumber') },
    { key: 'emergencyType', title: t('page.proofingNotice.form.fields.emergencyType') },
    { key: 'dueDate', title: t('page.proofingNotice.form.fields.dueDate'), render: (v: string) => v?.slice(0, 10) ?? '-' },
    { key: 'customerApproved', title: t('page.proofingNotice.form.fields.customerApproved'), render: (v: string) => v === 'Y' ? t('page.proofingNotice.form.options.boolean.yes') : v === 'N' ? t('page.proofingNotice.form.options.boolean.no') : '-' },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '180px',
      render: (_: any, record: any) => (
        <div className="flex flex-wrap gap-1">
          <NavLink
            to={`/sales/proofing-notice/${record.id}/overview`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 rounded px-2 py-2 text-xs text-teal-700 hover:bg-teal-50"
          >
            <Eye size={14} />
            查看总览
          </NavLink>
          <button
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(record);
            }}
            className="rounded px-2 py-2 text-xs text-fuchsia-700 hover:bg-fuchsia-50"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(record);
            }}
            className="rounded px-2 py-2 text-xs text-red-600 hover:bg-red-50"
          >
            {t('common.delete')}
          </button>
          <NavLink
            to={`/sales/tech?styleCode=${encodeURIComponent(record.styleCode || '')}&customerName=${encodeURIComponent(record.customerName || '')}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded px-2 py-2 text-xs text-violet-700 hover:bg-violet-50"
          >
            {t('page.proofingNotice.toTech')}
          </NavLink>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleCreateTech(record);
            }}
            className="rounded px-2 py-2 text-xs text-indigo-700 hover:bg-indigo-50"
          >
            生成技术承接
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-fuchsia-700">研发 / 样衣任务</div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{t('page.proofingNotice.title')}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  打样通知是“要不要先做样、样该怎么做、谁来跟”的任务单，不是正式大货销售订单。它更像销售或开发发给技术/样衣的工作指令，用来驱动一次、二次、三次样或摄影样等研发动作。
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  从客户维度看，这里适合追某个客户当前有哪些开发任务、哪些样在返工、哪些客户窗口还在反复确认。客户主档、联系人和偏好库都应该能顺着走到这里。
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {t('page.proofingNotice.salesOwnedHint')}
                </div>
                <NavLink
                  to="/sales/order"
                  className="flex min-h-[44px] items-center rounded-lg bg-fuchsia-600 px-4 py-3 text-sm text-white hover:bg-fuchsia-700"
                >
                  {t('page.proofingNotice.goSalesToCreate')}
                </NavLink>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Beaker, label: '它是什么', value: '样衣 / 开发任务单' },
                { icon: FileSearch, label: '它不是什么', value: '不是正式大货订单' },
                { icon: Scissors, label: '下游去向', value: '技术单 / 样衣执行 / BOM' },
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
            {[
              { to: '/sales/order', title: '先看销售订单', detail: '先确认这是打样需求还是正式大货需求。' },
              { to: '/sales/tech', title: '继续看技术单', detail: '打样通知下游应沉淀为技术要求、BOM 和进度状态。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-fuchsia-300 hover:bg-fuchsia-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-fuchsia-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-fuchsia-50/50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">从客户继续追打样</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">如果你是从客户页或联系人页过来的，这里建议按客户名和款号一起看，判断这个客户当前是开发中、返修中还是已转正式订单。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/customer" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-fuchsia-100/80">
              回客户主档
            </NavLink>
            <NavLink to="/customer/contacts" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-fuchsia-100/80">
              回客户联系人
            </NavLink>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-amber-900">{t('page.proofingNotice.handoffHintTitle')}</p>
          <p className="text-xs leading-6 text-amber-800">{t('page.proofingNotice.handoffHintBody')}</p>
        </div>
      </section>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.proofingNotice.form.fields.sampleNo')}>
          <input
            title={t('page.proofingNotice.form.fields.sampleNo')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.sampleNo}
            onChange={(e) => setQueryParams((p) => ({ ...p, sampleNo: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.proofingNotice.styleCode')}>
          <input
            title={t('page.proofingNotice.styleCode')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.styleCode}
            onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
          />
        </SearchField>
        <SearchField label={t('page.proofingNotice.customerName')}>
          <input
            title={t('page.proofingNotice.customerName')}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
            value={queryParams.customerName}
            onChange={(e) => setQueryParams((p) => ({ ...p, customerName: e.target.value }))}
          />
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} data-testid="proofing-notice-table" />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({ ...prev, current: page, pageSize }));
          fetchData({ pageNum: page, pageSize });
        }}
      />

      <BaseModal
        open={modalOpen}
        title={t('page.proofingNotice.editTitle')}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
          setEditingAttachments([]);
        }}
        width="920px"
      >
        <ProofingNoticeForm
          initialValues={editingRecord}
          initialAttachments={editingAttachments}
          onSubmit={handleModalSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingRecord(null);
            setEditingAttachments([]);
          }}
        />
      </BaseModal>
    </div>
  );
}
