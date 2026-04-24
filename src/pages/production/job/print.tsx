import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
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

export default function ProduceJobPrintPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
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
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">加载中...</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">未找到生产工单数据</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/production/job')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="返回生产工单"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">生产工单 / 流转卡</h2>
            <p className="text-sm text-slate-500">车间现场以工单号为执行主号，计划号和销售号仅作来源辅助。</p>
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
            <h1 className="text-2xl font-bold text-slate-900">生产工单 / 流转卡</h1>
            <p className="mt-1 text-sm text-slate-500">工单是现场主号，流转、报工、质检、外协都应围绕工单执行。</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title="单号层级"
          description="工单打印以工单号为主，计划号和销售号作为来源追溯，避免车间拿客户单号直接报工。"
          items={[
            {
              label: '工单主号',
              value: record.jobNo,
              helper: '车间流转、报工、质检统一使用。',
              tone: 'primary',
            },
            {
              label: '计划来源号',
              value: record.planNo,
              helper: '用于追溯该工单来自哪张生产计划。',
              tone: 'secondary',
            },
            {
              label: '销售来源号',
              value: record.salesNo,
              helper: '业务追单、交期追溯时使用。',
            },
            {
              label: '款号 / 数量',
              value: `${record.styleCode || '-'} / ${record.planQty || '-'}`,
              helper: '作为辅助识别字段，不替代工单号。',
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label="报工扫码入口"
            value={`JOB|${record.jobNo || '-'}|PLAN|${record.planNo || '-'}|SO|${record.salesNo || '-'}|STYLE|${record.styleCode || '-'}`}
            qrValue={reportLink}
            note="扫码后直接进入报工页，并优先定位当前应处理的工序。"
          />
          <PrintCodeStrip
            label="工单归档入口"
            value={`PRINT|JOB|${record.jobNo || '-'}|PLAN|${record.planNo || '-'}`}
            qrValue={printLink}
            note="用于流转卡、纸质工单和后续归档查询，扫码回到工单打印页。"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['工单编号', record.jobNo],
            ['计划编号', record.planNo],
            ['销售单号', record.salesNo],
            ['款号', record.styleCode],
            ['颜色', record.colorCode || '-'],
            ['尺码', record.sizeCode || '-'],
            ['计划数量', record.planQty],
            ['状态', statusTag.label],
            ['备注', record.remark || '-'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">工序流转卡</h3>
            <span className="text-xs text-slate-500">打印时保留收数、出数、次品、损耗字段，避免现场手写重复表头。</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {['序号', '工序', '状态', '操作工', '收数', '出数', '次品', '损耗', '备注'].map((header) => (
                    <th key={header} className="px-3 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {steps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-slate-400">暂无工序队列，请先初始化工序</td>
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
                            <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">外协</span>
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
                        <td className="px-3 py-3 text-slate-400">现场填写</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-semibold text-slate-900">打印建议</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">车间流转卡使用：工单号 + 工序 + 数量 + 现场签名位。</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">质检使用：工单号 + 工序状态 + 次品/损耗，不以销售单号为主。</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">外协单建议引用工单主号，避免外协环节重新发明编号。</div>
          </div>
        </section>
      </section>
    </div>
  );
}
