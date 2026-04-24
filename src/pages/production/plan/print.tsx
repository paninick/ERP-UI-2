import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as productionApi from '@/api/production';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildProducePlanPrintLink } from '@/utils/businessLinks';

export default function ProducePlanPrintPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待排产' },
    { value: '1', label: '已排产' },
    { value: '2', label: '生产中' },
    { value: '3', label: '已完成' },
  ]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response: any = await productionApi.getProducePlan(Number(id)).catch(() => null);
        if (mounted) {
          setRecord(response?.data || response || null);
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

  const statusTag = useMemo(() => planStatus.toTag(record?.status), [planStatus, record?.status]);
  const printLink = useMemo(() => buildProducePlanPrintLink(id), [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">加载中...</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">未找到生产计划数据</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/production/plan')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="返回生产计划"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">生产计划打印单</h2>
            <p className="text-sm text-slate-500">计划单打印以计划编号为主，销售单号作为来源依据。</p>
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
            <h1 className="text-2xl font-bold text-slate-900">生产计划单</h1>
            <p className="mt-1 text-sm text-slate-500">计划主号用于排产调度，来源号用于追溯销售需求。</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title="单号层级"
          description="打印时优先展示计划主号，销售单号作为来源，避免现场重复维护来源数据。"
          items={[
            {
              label: '计划主号',
              value: record.planNo,
              helper: '计划、调度、看板统一识别号。',
              tone: 'primary',
            },
            {
              label: '销售来源号',
              value: record.salesNo,
              helper: '用于追溯客户订单来源。',
              tone: 'secondary',
            },
            {
              label: '款号',
              value: record.styleCode,
              helper: '产品识别字段，不替代单号。',
            },
            {
              label: '计划数量',
              value: record.planQty,
              helper: '计划层可以拆分，但必须保留来源依据。',
            },
          ]}
        />

        <div className="mt-6">
          <PrintCodeStrip
            label="计划扫码入口"
            value={`PLAN|${record.planNo || '-'}|SO|${record.salesNo || '-'}|STYLE|${record.styleCode || '-'}|QTY|${record.planQty || '-'}`}
            qrValue={printLink}
            note="当前先接回稳定的计划打印页，便于计划和调度部门扫码归档。"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['计划编号', record.planNo],
            ['销售单号', record.salesNo],
            ['款号', record.styleCode],
            ['计划数量', record.planQty],
            ['计划日期', record.planDate],
            ['状态', statusTag.label],
            ['备注', record.remark || '-'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-semibold text-slate-900">打印建议</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">计划部使用：计划号 + 销售来源号 + 款号 + 计划数量。</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">车间调度使用：计划号 + 款号 + 数量，不直接拿销售单替代计划单。</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">后续工单必须从计划派生，避免来源串单。</div>
          </div>
        </section>
      </section>
    </div>
  );
}
