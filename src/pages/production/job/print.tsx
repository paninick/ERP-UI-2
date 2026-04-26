import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as productionApi from '@/api/production';
import * as jobProcessApi from '@/api/produceJobProcess';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildProduceJobPrintLink, buildProduceJobReportLink } from '@/utils/businessLinks';

interface ProcessStep {
  id: number;
  processName?: string;
  processSeq?: number;
  processStatus?: string;
  employeeName?: string;
  inQty?: number;
  outQty?: number;
  defectQty?: number;
  lossQty?: number;
  isOutsource?: string;
}

interface ProduceJobRecord {
  jobNo?: string;
  planNo?: string;
  salesNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  status?: string;
  remark?: string;
}

export default function ProduceJobPrintPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ProduceJobRecord | null>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.kanban.status.pending') },
    { value: '1', label: t('page.kanban.status.running') },
    { value: '2', label: t('page.kanban.status.completed') },
    { value: '3', label: t('common.close') },
  ]);
  const processStatus = useDictOptions('erp_process_status');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [jobResponse, processResponse] = await Promise.all([
          productionApi.getProduceJob(Number(id)).catch(() => null),
          jobProcessApi.listByJob(Number(id)).catch(() => null),
        ]);

        if (!mounted) {
          return;
        }

        setRecord(jobResponse?.data || jobResponse || null);
        const rows = processResponse?.rows || processResponse || [];
        setSteps([...rows].sort((a: ProcessStep, b: ProcessStep) => (a.processSeq || 0) - (b.processSeq || 0)));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusTag = useMemo(() => planStatus.toTag(record?.status), [planStatus, record?.status]);
  const reportProcess = useMemo(
    () => steps.find((step) => step.processStatus === 'PENDING' || step.processStatus === 'RUNNING') || null,
    [steps],
  );
  const reportLink = useMemo(
    () => buildProduceJobReportLink(id, reportProcess?.id),
    [id, reportProcess?.id],
  );
  const printLink = useMemo(() => buildProduceJobPrintLink(id), [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.jobPrint.loading')}</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.jobPrint.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/production/job')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label={t('page.jobPrint.backAriaLabel')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.jobPrint.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.jobPrint.subtitle')}</p>
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
            <h1 className="text-2xl font-bold text-slate-900">{t('page.jobPrint.heading')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('page.jobPrint.headingHint')}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title={t('page.jobPrint.hierarchyTitle')}
          description={t('page.jobPrint.hierarchyDescription')}
          items={[
            {
              label: t('page.jobPrint.hierarchyItems.jobNo'),
              value: record.jobNo,
              helper: t('page.jobPrint.hierarchyItems.jobNoHelper'),
              tone: 'primary',
            },
            {
              label: t('page.jobPrint.hierarchyItems.planNo'),
              value: record.planNo,
              helper: t('page.jobPrint.hierarchyItems.planNoHelper'),
              tone: 'secondary',
            },
            {
              label: t('page.jobPrint.hierarchyItems.salesNo'),
              value: record.salesNo,
              helper: t('page.jobPrint.hierarchyItems.salesNoHelper'),
            },
            {
              label: t('page.jobPrint.hierarchyItems.styleQty'),
              value: `${record.styleCode || '-'} / ${record.planQty || '-'}`,
              helper: t('page.jobPrint.hierarchyItems.styleQtyHelper'),
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label={t('page.jobPrint.reportEntry')}
            value={`JOB|${record.jobNo || '-'}|PLAN|${record.planNo || '-'}|SO|${record.salesNo || '-'}|STYLE|${record.styleCode || '-'}`}
            qrValue={reportLink}
            note={t('page.jobPrint.reportEntryNote')}
          />
          <PrintCodeStrip
            label={t('page.jobPrint.archiveEntry')}
            value={`PRINT|JOB|${record.jobNo || '-'}|PLAN|${record.planNo || '-'}`}
            qrValue={printLink}
            note={t('page.jobPrint.archiveEntryNote')}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [t('page.jobPrint.cards.jobNo'), record.jobNo],
            [t('page.jobPrint.cards.planNo'), record.planNo],
            [t('page.jobPrint.cards.salesNo'), record.salesNo],
            [t('page.jobPrint.cards.styleCode'), record.styleCode],
            [t('page.jobPrint.cards.colorCode'), record.colorCode || '-'],
            [t('page.jobPrint.cards.sizeCode'), record.sizeCode || '-'],
            [t('page.jobPrint.cards.planQty'), record.planQty],
            [t('page.jobPrint.cards.status'), statusTag.label],
            [t('page.jobPrint.cards.remark'), record.remark || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t('page.jobPrint.flowCardTitle')}</h3>
            <span className="text-xs text-slate-500">{t('page.jobPrint.flowCardHint')}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {['seq', 'process', 'status', 'employee', 'inQty', 'outQty', 'defectQty', 'lossQty', 'remark'].map((field) => (
                    <th key={field} className="px-3 py-3">{t(`page.jobPrint.table.${field}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {steps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-slate-400">{t('page.jobPrint.noSteps')}</td>
                  </tr>
                ) : (
                  steps.map((step) => {
                    const processTag = processStatus.toTag(step.processStatus);
                    return (
                      <tr key={step.id} className="border-t border-slate-100">
                        <td className="px-3 py-3">{step.processSeq || '-'}</td>
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {step.processName || '-'}
                          {step.isOutsource === '1' && (
                            <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">{t('page.jobPrint.outsource')}</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${processTag.color}`}>
                            {processTag.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">{step.employeeName || '-'}</td>
                        <td className="px-3 py-3">{step.inQty ?? '-'}</td>
                        <td className="px-3 py-3">{step.outQty ?? '-'}</td>
                        <td className="px-3 py-3">{step.defectQty ?? '-'}</td>
                        <td className="px-3 py-3">{step.lossQty ?? '-'}</td>
                        <td className="px-3 py-3 text-slate-400">{t('page.jobPrint.handwritten')}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{t('page.jobPrint.recommendations')}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.jobPrint.tips.workshop')}</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.jobPrint.tips.quality')}</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{t('page.jobPrint.tips.outsource')}</div>
          </div>
        </section>
      </section>
    </div>
  );
}
