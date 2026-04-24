import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as defectApi from '@/api/defect';
import * as jobProcessApi from '@/api/produceJobProcess';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useAuthStore } from '@/stores/authStore';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildQualityInspectionLink, buildQualityInspectionPrintLink } from '@/utils/businessLinks';

interface JobProcessRecord {
  id?: number;
  jobId?: number;
  jobNo?: string;
  planNo?: string;
  salesNo?: string;
  processId?: number;
  processName?: string;
  processSeq?: number;
  processStatus?: string;
  employeeName?: string;
  inQty?: number;
  outQty?: number;
  defectQty?: number;
  lossQty?: number;
  lossExceed?: string;
  rejectReason?: string;
  releaseBy?: string;
}

interface DefectRecord {
  defectCategory?: string;
  defectLevel?: string;
  defectQty?: number;
  handleType?: string;
  responsibility?: string;
  isBrokenNeedle?: string;
  remark?: string;
}

export default function QualityInspectionPrintPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<JobProcessRecord | null>(null);
  const [defects, setDefects] = useState<DefectRecord[]>([]);

  const processStatus = useDictOptions('erp_process_status');
  const defectCategory = useDictOptions('erp_defect_category');
  const defectLevel = useDictOptions('erp_defect_level');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const detail: any = await jobProcessApi.getProduceJobProcess(Number(id)).catch(() => null);
        const nextRecord = detail?.data || detail || null;
        if (!mounted) {
          return;
        }
        setRecord(nextRecord);

        if (nextRecord?.jobId && nextRecord?.processId) {
          const defectResponse: any = await defectApi.listDefect({
            jobId: nextRecord.jobId,
            processId: nextRecord.processId,
          }).catch(() => null);
          if (mounted) {
            setDefects(defectResponse?.rows || []);
          }
        } else if (mounted) {
          setDefects([]);
        }
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

  const statusTag = useMemo(() => processStatus.toTag(record?.processStatus), [processStatus, record?.processStatus]);
  const inspectorName = user?.nickname || user?.username || record?.releaseBy || t('page.qualityInspection.inspectorFallback');
  const inspectionLink = useMemo(
    () => buildQualityInspectionLink(record?.id || id),
    [id, record?.id],
  );
  const printLink = useMemo(
    () => buildQualityInspectionPrintLink(record?.id || id),
    [id, record?.id],
  );

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.qualityInspectionPrint.loading')}</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.qualityInspectionPrint.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/quality/inspection')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label={t('page.qualityInspectionPrint.backAriaLabel')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.qualityInspectionPrint.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.qualityInspectionPrint.subtitle')}</p>
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
            <h1 className="text-2xl font-bold text-slate-900">{t('page.qualityInspectionPrint.heading')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('page.qualityInspectionPrint.headingHint')}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title={t('page.qualityInspectionPrint.hierarchyTitle')}
          description={t('page.qualityInspectionPrint.hierarchyDescription')}
          items={[
            {
              label: t('page.qualityInspectionPrint.hierarchyItems.jobNo'),
              value: record.jobNo || record.jobId,
              helper: t('page.qualityInspectionPrint.hierarchyItems.jobNoHelper'),
              tone: 'primary',
            },
            {
              label: t('page.qualityInspectionPrint.hierarchyItems.process'),
              value: record.processName || `#${record.processSeq || '-'}`,
              helper: t('page.qualityInspectionPrint.hierarchyItems.processHelper'),
              tone: 'secondary',
            },
            {
              label: t('page.qualityInspectionPrint.hierarchyItems.source'),
              value: `${record.planNo || '-'} / ${record.salesNo || '-'}`,
              helper: t('page.qualityInspectionPrint.hierarchyItems.sourceHelper'),
            },
            {
              label: t('page.qualityInspectionPrint.hierarchyItems.result'),
              value: statusTag.label,
              helper: t('page.qualityInspectionPrint.hierarchyItems.resultHelper'),
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label={t('page.qualityInspectionPrint.scanEntry')}
            value={`QC|${record.id || '-'}|JOB|${record.jobNo || record.jobId || '-'}|PROCESS|${record.processId || '-'}`}
            qrValue={inspectionLink}
            note={t('page.qualityInspectionPrint.scanEntryNote')}
          />
          <PrintCodeStrip
            label={t('page.qualityInspectionPrint.archiveEntry')}
            value={`RELEASE|${record.jobNo || record.jobId || '-'}|STEP|${record.processSeq || '-'}|STATUS|${record.processStatus || '-'}`}
            qrValue={printLink}
            note={t('page.qualityInspectionPrint.archiveEntryNote')}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [t('page.qualityInspectionPrint.cards.jobNo'), record.jobNo || record.jobId],
            [t('page.qualityInspectionPrint.cards.process'), record.processName || `#${record.processSeq || '-'}`],
            [t('page.qualityInspectionPrint.cards.employee'), record.employeeName || '-'],
            [t('page.qualityInspectionPrint.cards.inspector'), inspectorName],
            [t('page.qualityInspectionPrint.cards.inQty'), record.inQty ?? '-'],
            [t('page.qualityInspectionPrint.cards.outQty'), record.outQty ?? '-'],
            [t('page.qualityInspectionPrint.cards.defectQty'), record.defectQty ?? '-'],
            [t('page.qualityInspectionPrint.cards.lossQty'), record.lossQty ?? '-'],
            [t('page.qualityInspectionPrint.cards.lossExceed'), record.lossExceed === '1' ? t('common.yes') : t('common.no')],
            [t('page.qualityInspectionPrint.cards.rejectReason'), record.rejectReason || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t('page.qualityInspectionPrint.defectTitle')}</h3>
            <span className="text-xs text-slate-500">{t('page.qualityInspectionPrint.defectHint')}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {[
                    t('page.qualityInspectionPrint.table.category'),
                    t('page.qualityInspectionPrint.table.level'),
                    t('page.qualityInspectionPrint.table.qty'),
                    t('page.qualityInspectionPrint.table.handleType'),
                    t('page.qualityInspectionPrint.table.responsibility'),
                    t('page.qualityInspectionPrint.table.brokenNeedle'),
                    t('page.qualityInspectionPrint.table.remark'),
                  ].map((header) => (
                    <th key={header} className="px-3 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {defects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">{t('page.qualityInspectionPrint.noDefects')}</td>
                  </tr>
                ) : (
                  defects.map((defect, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-3 py-3">{defectCategory.labelMap[String(defect.defectCategory)] || defect.defectCategory || '-'}</td>
                      <td className="px-3 py-3">{defectLevel.labelMap[String(defect.defectLevel)] || defect.defectLevel || '-'}</td>
                      <td className="px-3 py-3">{defect.defectQty ?? '-'}</td>
                      <td className="px-3 py-3">{defect.handleType || '-'}</td>
                      <td className="px-3 py-3">{defect.responsibility || '-'}</td>
                      <td className="px-3 py-3">{defect.isBrokenNeedle === '1' ? t('common.yes') : t('common.no')}</td>
                      <td className="px-3 py-3">{defect.remark || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
