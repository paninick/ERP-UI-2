import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as defectApi from '@/api/defect';
import * as jobProcessApi from '@/api/produceJobProcess';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useAuthStore } from '@/stores/authStore';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildQualityInspectionLink, buildQualityInspectionPrintLink } from '@/utils/businessLinks';

export default function QualityInspectionPrintPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);

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
  const inspectorName = user?.nickname || user?.username || record?.releaseBy || '质检员';
  const inspectionLink = useMemo(
    () => buildQualityInspectionLink(record?.id || id),
    [id, record?.id],
  );
  const printLink = useMemo(
    () => buildQualityInspectionPrintLink(record?.id || id),
    [id, record?.id],
  );

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">加载中...</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">未找到质检记录</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/quality/inspection')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="返回质检放行"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">质检放行单</h2>
            <p className="text-sm text-slate-500">质检单以工单和工序为主，不直接以销售单作为现场质检主号。</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          <Printer size={14} />
          打印
        </button>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm print:shadow-none">
        <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">质检放行单</h1>
            <p className="mt-1 text-sm text-slate-500">工序检验、放行、驳回和异常追溯统一使用。</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title="单号层级"
          description="质检放行单以工单和工序为主，计划和销售仅作为上游追溯。"
          items={[
            {
              label: '工单号',
              value: record.jobNo || record.jobId,
              helper: '现场质检和放行主号。',
              tone: 'primary',
            },
            {
              label: '工序',
              value: record.processName || `工序 ${record.processSeq || '-'}`,
              helper: '应与流转卡中的工序节点一致。',
              tone: 'secondary',
            },
            {
              label: '计划 / 销售',
              value: `${record.planNo || '-'} / ${record.salesNo || '-'}`,
              helper: '作为来源追溯，不直接替代质检主号。',
            },
            {
              label: '检验结果',
              value: statusTag.label,
              helper: '放行、待检、驳回都应保留痕迹。',
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label="质检扫码入口"
            value={`QC|${record.id || '-'}|JOB|${record.jobNo || record.jobId || '-'}|PROCESS|${record.processId || '-'}`}
            qrValue={inspectionLink}
            note="在待检或复检场景中，扫码可直接进入质检审核页。"
          />
          <PrintCodeStrip
            label="放行归档入口"
            value={`RELEASE|${record.jobNo || record.jobId || '-'}|STEP|${record.processSeq || '-'}|STATUS|${record.processStatus || '-'}`}
            qrValue={printLink}
            note="放行或驳回后用于留档和复查，扫码回到当前放行单。"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['工单号', record.jobNo || record.jobId],
            ['工序', record.processName || `工序 ${record.processSeq || '-'}`],
            ['操作工', record.employeeName || '-'],
            ['检验人', inspectorName],
            ['接收数', record.inQty ?? '-'],
            ['合格数', record.outQty ?? '-'],
            ['次品数', record.defectQty ?? '-'],
            ['损耗数', record.lossQty ?? '-'],
            ['损耗超标', record.lossExceed === '1' ? '是' : '否'],
            ['驳回原因', record.rejectReason || '-'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">缺陷记录</h3>
            <span className="text-xs text-slate-500">缺陷类型、等级、数量和断针标记必须保留。</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {['缺陷类型', '等级', '数量', '处理方式', '责任归属', '断针', '备注'].map((header) => (
                    <th key={header} className="px-3 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {defects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">暂无缺陷记录</td>
                  </tr>
                ) : (
                  defects.map((defect, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-3 py-3">{defectCategory.labelMap[String(defect.defectCategory)] || defect.defectCategory || '-'}</td>
                      <td className="px-3 py-3">{defectLevel.labelMap[String(defect.defectLevel)] || defect.defectLevel || '-'}</td>
                      <td className="px-3 py-3">{defect.defectQty ?? '-'}</td>
                      <td className="px-3 py-3">{defect.handleType || '-'}</td>
                      <td className="px-3 py-3">{defect.responsibility || '-'}</td>
                      <td className="px-3 py-3">{defect.isBrokenNeedle === '1' ? '是' : '否'}</td>
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
