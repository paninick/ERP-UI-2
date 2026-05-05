import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, FileStack, Plus, ShoppingCart } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as bomApi from '@/api/bom';
import * as noticeApi from '@/api/notice';
import BaseModal from '@/components/ui/BaseModal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import {
  isApprovalLocked,
  resolveApprovalState,
} from '@/utils/approval';
import BomForm from './form';

const api = {
  list: bomApi.listBom,
  get: bomApi.getBom,
  update: bomApi.updateBom,
  remove: bomApi.delBom,
};

export default function BomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tableKey, setTableKey] = useState(0);
  const auditStatus = useDictOptions('erp_sample_audit_status');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeQuery, setNoticeQuery] = useState('');

  const loadNotices = useCallback(async (query: string) => {
    setNoticeLoading(true);
    try {
      const res: any = await noticeApi.listNotice({ pageNum: 1, pageSize: 30, styleCode: query, sampleNo: query });
      setNotices(res.rows || []);
    } catch {
      setNotices([]);
    } finally {
      setNoticeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pickerOpen) {
      loadNotices('');
      setNoticeQuery('');
    }
  }, [pickerOpen, loadNotices]);

  const handlePickNotice = (notice: any) => {
    setPickerOpen(false);
    const params = new URLSearchParams({
      noticeId: String(notice.id || ''),
      sampleNo: notice.sampleNo || '',
      styleCode: notice.styleCode || '',
      salesName: notice.salesName || '',
      customerName: notice.customerName || '',
      dueDate: notice.dueDate ? String(notice.dueDate).slice(0, 10) : '',
      bulkOrderNo: notice.bulkOrderNo || '',
    });
    navigate(`/material/bom/new?${params.toString()}`);
  };

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.styleCode || record.bulkOrderNo || '-' }));
    if (!confirmed) {
      return;
    }

    try {
      if (action === 'submit') {
        await bomApi.submitBom(record.id);
      } else if (action === 'approve') {
        await bomApi.approveBom(record.id);
      } else {
        await bomApi.rejectBom(record.id);
      }
      toast.success(
        action === 'submit'
          ? t('approval.submitSuccess')
          : action === 'approve'
            ? t('approval.approveSuccess')
            : t('approval.rejectSuccess'),
      );
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">材料技术依据</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.bom.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              BOM 不是采购单，也不是工艺路线。它负责把一款样衣或大货真正需要哪些主料辅料讲清楚，并在审批后成为采购、入库、出库和成本归集的重要依据。
            </p>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              样衣 BOM 必须来自打样通知。点击下方「从打样通知新建」选择来源，系统会自动带入款号、客户和交期。
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Boxes, label: '它是什么', value: '材料与单耗依据' },
                { icon: FileStack, label: '它不是什么', value: '不是采购执行单' },
                { icon: ShoppingCart, label: '下游去向', value: '采购 / 入库 / 领料 / 成本' },
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
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus size={14} />
                从打样通知新建 BOM
              </button>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/sales/proofing-notice', title: '先去打样通知', detail: '样衣 BOM 必须来自打样通知，先在这里确认打样任务已存在。' },
              { to: '/sales/tech', title: '再看技术单', detail: '技术要求先清楚，BOM 才能成为真正可执行的材料依据。' },
              { to: '/production/process', title: '再看工艺路线', detail: '材料和工艺是并行依据，两者一起支撑采购与生产。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* 打样通知选择器弹窗 */}
      <BaseModal
        open={pickerOpen}
        title="选择打样通知来源"
        onClose={() => setPickerOpen(false)}
        width="640px"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">选择一张打样通知作为 BOM 来源，系统将自动带入款号、客户、业务员和交期。</p>
          <input
            type="text"
            placeholder="按款号或打样编号搜索..."
            value={noticeQuery}
            onChange={(e) => {
              setNoticeQuery(e.target.value);
              loadNotices(e.target.value);
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
          {noticeLoading ? (
            <div className="py-6 text-center text-sm text-slate-400">加载中...</div>
          ) : notices.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">未找到打样通知，请先在「打样通知」页面创建。</div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => handlePickNotice(notice)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{notice.sampleNo || '-'}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{notice.styleCode || '-'}</span>
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-slate-500">
                    <span>客户：{notice.customerName || '-'}</span>
                    <span>业务员：{notice.salesName || '-'}</span>
                    {notice.dueDate && <span>交期：{String(notice.dueDate).slice(0, 10)}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </BaseModal>

      <CrudPage
        key={tableKey}
        title={t('page.bom.title')}
        api={api}
        columns={[
          { key: 'styleCode', title: t('page.bom.columns.styleCode') },
          { key: 'bulkOrderNo', title: t('page.bom.columns.bulkOrderNo') },
          { key: 'customerName', title: '客户' },
          { key: 'salesName', title: t('page.bom.columns.salesName') },
          {
            key: 'auditStatus',
            title: t('page.bom.columns.auditStatus'),
            render: (value: string) => {
              const tag = auditStatus.toTag(value);
              return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
            },
          },
        ]}
        searchFields={[
          { name: 'styleCode', label: t('page.bom.columns.styleCode') },
          { name: 'bulkOrderNo', label: t('page.bom.columns.bulkOrderNo') },
          {
            name: 'auditStatus',
            label: t('page.bom.columns.auditStatus'),
            type: 'select',
            options: auditStatus.options,
          },
        ]}
        initialSearchParams={{
          styleCode: searchParams.get('styleCode') || '',
          bulkOrderNo: searchParams.get('bulkOrderNo') || '',
          auditStatus: searchParams.get('auditStatus') || '',
        }}
        FormComponent={BomForm}
        isEditDisabled={(record) => isApprovalLocked(record.auditStatus, auditStatus.options)}
        isDeleteDisabled={(record) => isApprovalLocked(record.auditStatus, auditStatus.options)}
        extraActions={(record) => (
          <>
            {resolveApprovalState(record.auditStatus, auditStatus.options) !== 'approved' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'submit');
                }}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                {t('common.submit')}
              </button>
            )}
            {resolveApprovalState(record.auditStatus, auditStatus.options) !== 'approved' && (
              <button
                type="button"
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
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'reject');
              }}
              className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
            >
              {t('common.reject')}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/material/bom-substitute?bomId=${encodeURIComponent(String(record.id || ''))}&styleCode=${encodeURIComponent(record.styleCode || '')}`);
              }}
              className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
            >
              替代料
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/material/bom/${record.id}`);
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              {t('common.detail')}
            </button>
          </>
        )}
      />
    </div>
  );
}
