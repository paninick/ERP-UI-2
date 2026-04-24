import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as salesApi from '@/api/sales';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import PrintCodeStrip from '@/components/business/PrintCodeStrip';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildSalesOrderDetailLink, buildSalesOrderPrintLink } from '@/utils/businessLinks';

interface BulkRow {
  id: string;
  bulkOrderNo: string;
  colorName: string;
  xs: string;
  s: string;
  m: string;
  l: string;
}

function calcSubtotal(row: BulkRow) {
  return ['xs', 's', 'm', 'l'].reduce((sum, key) => sum + (Number(row[key as keyof BulkRow]) || 0), 0);
}

export default function SalesOrderPrintPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);

  const orderStatus = useDictOptions('sales_order_status');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response: any = await salesApi.getSalesOrder(Number(id)).catch(() => null);
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

  const statusTag = useMemo(() => orderStatus.toTag(record?.orderStatus), [orderStatus, record?.orderStatus]);

  const detailDraft = record?.detailDraft || {};
  const baseInfo = detailDraft.baseInfo || {};
  const bulkRows: BulkRow[] = detailDraft.bulkRows || [];
  const totalQty = bulkRows.length > 0
    ? bulkRows.reduce((sum, item) => sum + calcSubtotal(item), 0)
    : Number(record?.quantity || 0);
  const detailLink = useMemo(() => buildSalesOrderDetailLink(id), [id]);
  const printLink = useMemo(() => buildSalesOrderPrintLink(id), [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">加载中...</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">未找到销售订单数据</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/sales/order')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="返回销售订单"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">销售确认单</h2>
            <p className="text-sm text-slate-500">销售打印以销售单号为主，打印款号与客户款号作为识别辅助。</p>
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
            <h1 className="text-2xl font-bold text-slate-900">销售确认单</h1>
            <p className="mt-1 text-sm text-slate-500">客户确认、业务跟单、打样和大货对照统一使用。</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title="单号层级"
          description="销售单号是业务主号，打印款号和客户款号用于外发识别，但不替代销售主号。"
          items={[
            {
              label: '销售主号',
              value: record.salesNo,
              helper: '业务、计划、财务统一追踪主号。',
              tone: 'primary',
            },
            {
              label: '打印款号',
              value: record.bulkOrderNo || baseInfo.bulkOrderNo,
              helper: '客户确认、包装资料、图纸资料优先展示。',
              tone: 'secondary',
            },
            {
              label: '客户/打样款号',
              value: baseInfo.patternNo || record.styleCode,
              helper: '用于对照客款，不替代销售单号。',
            },
            {
              label: '总数量',
              value: totalQty || '-',
              helper: '后续计划和工单应从这里继承或拆分。',
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label="业务扫码入口"
            value={`SO|${record.salesNo || '-'}|STYLE|${record.bulkOrderNo || record.styleCode || '-'}|QTY|${totalQty || '-'}`}
            qrValue={detailLink}
            note="扫码后直接打开销售订单详情页，减少人工搜索单号。"
          />
          <PrintCodeStrip
            label="打印归档入口"
            value={`PRINT|${record.bulkOrderNo || record.styleCode || '-'}|CUSTOMER|${record.customerName || '-'}|DATE|${record.deliveryDate || '-'}`}
            qrValue={printLink}
            note="适合贴在销售确认单或外发资料首页，扫码回到打印页。"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['销售单号', record.salesNo],
            ['客户名称', record.customerName],
            ['打印款号', record.bulkOrderNo || baseInfo.bulkOrderNo || '-'],
            ['款号', record.styleCode || baseInfo.productName || '-'],
            ['销售日期', record.orderDate],
            ['交货日期', record.deliveryDate],
            ['总数量', totalQty || '-'],
            ['订单状态', statusTag.label],
            ['货值', record.amount || '-'],
            ['备注', record.remark || baseInfo.remark || '-'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">颜色 / 尺码分配</h3>
            <span className="text-xs text-slate-500">打印时保留颜色与尺码分布，避免后续部门重复录入。</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {['打印款号', '颜色', 'XS', 'S', 'M', 'L', '小计'].map((header) => (
                    <th key={header} className="px-3 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bulkRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">暂无颜色尺码明细</td>
                  </tr>
                ) : (
                  bulkRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-3">{row.bulkOrderNo || '-'}</td>
                      <td className="px-3 py-3">{row.colorName || '-'}</td>
                      <td className="px-3 py-3">{row.xs || '-'}</td>
                      <td className="px-3 py-3">{row.s || '-'}</td>
                      <td className="px-3 py-3">{row.m || '-'}</td>
                      <td className="px-3 py-3">{row.l || '-'}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">{calcSubtotal(row)}</td>
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
