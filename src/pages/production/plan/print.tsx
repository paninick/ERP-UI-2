import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import * as productionApi from '@/api/production';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildProducePlanPrintLink } from '@/utils/businessLinks';

interface ProducePlanRecord {
  planNo?: string;
  salesNo?: string;
  styleCode?: string;
  planQty?: number;
  planDate?: string;
  status?: string;
  remark?: string;
}

export default function ProducePlanPrintPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ProducePlanRecord | null>(null);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.kanban.status.pending') },
    { value: '1', label: t('page.kanban.status.running') },
    { value: '2', label: t('page.kanban.status.completed') },
    { value: '3', label: t('common.close') },
  ]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setApprovalLoading(true);
      try {
        const response: any = await productionApi.getProducePlan(Number(id)).catch(() => null);
        if (mounted) {
          setRecord(response?.data || response || null);
        }
        const approvalRes: any = await approvalApi.listApprovalLog({
          businessType: 'PRODUCE_PLAN',
          businessId: Number(id),
          pageNum: 1,
          pageSize: 50,
        }).catch(() => null);
        if (mounted) {
          setApprovalLogs(approvalRes?.rows || []);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setApprovalLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusTag = useMemo(() => planStatus.toTag(record?.status), [planStatus, record?.status]);
  const printLink = useMemo(() => buildProducePlanPrintLink(id), [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.planPrint.loading')}</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.planPrint.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/production/plan')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label={t('page.planPrint.backAriaLabel')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.planPrint.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.planPrint.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          <Printer size={14} />
          {t('common.print')}
        </button>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm print:shadow-none">
        <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('page.planPrint.heading')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('page.planPrint.headingHint')}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title={t('page.planPrint.hierarchyTitle')}
          description={t('page.planPrint.hierarchyDescription')}
          items={[
            {
              label: t('page.planPrint.hierarchyItems.planNo'),
              value: record.planNo,
              helper: t('page.planPrint.hierarchyItems.planNoHelper'),
              tone: 'primary',
            },
            {
              label: t('page.planPrint.hierarchyItems.salesNo'),
              value: record.salesNo,
              helper: t('page.planPrint.hierarchyItems.salesNoHelper'),
              tone: 'secondary',
            },
            {
              label: t('page.planPrint.hierarchyItems.styleCode'),
              value: record.styleCode,
              helper: t('page.planPrint.hierarchyItems.styleCodeHelper'),
            },
            {
              label: t('page.planPrint.hierarchyItems.planQty'),
              value: record.planQty,
              helper: t('page.planPrint.hierarchyItems.planQtyHelper'),
            },
          ]}
        />

        <div className="mt-6">
          <PrintCodeStrip
            label={t('page.planPrint.scanEntry')}
            value={`PLAN|${record.planNo || '-'}|SO|${record.salesNo || '-'}|STYLE|${record.styleCode || '-'}|QTY|${record.planQty || '-'}`}
            qrValue={printLink}
            note={t('page.planPrint.scanEntryNote')}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [t('page.planPrint.cards.planNo'), record.planNo],
            [t('page.planPrint.cards.salesNo'), record.salesNo],
            [t('page.planPrint.cards.styleCode'), record.styleCode],
            [t('page.planPrint.cards.planQty'), record.planQty],
            [t('page.planPrint.cards.planDate'), record.planDate],
            [t('page.planPrint.cards.status'), statusTag.label],
            [t('page.planPrint.cards.remark'), record.remark || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{t('page.planPrint.recommendations')}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.planPrint.tips.planning')}</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.planPrint.tips.workshop')}</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.planPrint.tips.downstream')}</div>
          </div>
        </section>

        <div className="mt-6">
          <ApprovalTimeline title="计划审批记录" logs={approvalLogs} loading={approvalLoading} />
        </div>
      </section>
    </div>
  );
}
