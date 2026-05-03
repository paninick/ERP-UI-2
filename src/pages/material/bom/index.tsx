import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, FileStack, ShoppingCart } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as bomApi from '@/api/bom';
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
  add: bomApi.addBom,
  update: bomApi.updateBom,
  remove: bomApi.delBom,
};

export default function BomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tableKey, setTableKey] = useState(0);
  const auditStatus = useDictOptions('erp_sample_audit_status');

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
          </div>
          <div className="grid gap-3">
            {[
              { to: '/sales/tech', title: '先看技术单', detail: '技术要求先清楚，BOM 才能成为真正可执行的材料依据。' },
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

      <CrudPage
        key={tableKey}
        title={t('page.bom.title')}
        api={api}
        columns={[
          { key: 'styleCode', title: t('page.bom.columns.styleCode') },
          { key: 'bulkOrderNo', title: t('page.bom.columns.bulkOrderNo') },
          {
            key: 'auditStatus',
            title: t('page.bom.columns.auditStatus'),
            render: (value: string) => {
              const tag = auditStatus.toTag(value);
              return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
            },
          },
          { key: 'salesName', title: t('page.bom.columns.salesName') },
        ]}
        searchFields={[
          { name: 'styleCode', label: t('page.bom.columns.styleCode') },
          {
            name: 'auditStatus',
            label: t('page.bom.columns.auditStatus'),
            type: 'select',
            options: auditStatus.options,
          },
        ]}
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
