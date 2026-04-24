import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

interface SalesOrderRecord {
  salesNo?: string;
  customerName?: string;
  bulkOrderNo?: string;
  styleCode?: string;
  orderDate?: string;
  deliveryDate?: string;
  quantity?: number;
  amount?: number;
  orderStatus?: string;
  remark?: string;
  detailDraft?: {
    baseInfo?: Record<string, string>;
    bulkRows?: BulkRow[];
  };
}

export default function SalesOrderPrintPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<SalesOrderRecord | null>(null);

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
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.salesPrint.loading')}</div>;
  }

  if (!record) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.salesPrint.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/sales/order')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label={t('page.salesPrint.backAriaLabel')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.salesPrint.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.salesPrint.subtitle')}</p>
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
            <h1 className="text-2xl font-bold text-slate-900">{t('page.salesPrint.heading')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('page.salesPrint.headingHint')}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusTag.color}`}>{statusTag.label}</div>
        </div>

        <DocumentCodeBoard
          title={t('page.salesPrint.hierarchyTitle')}
          description={t('page.salesPrint.hierarchyDescription')}
          items={[
            {
              label: t('page.salesPrint.hierarchyItems.salesPrimary'),
              value: record.salesNo,
              helper: t('page.salesPrint.hierarchyItems.salesPrimaryHelper'),
              tone: 'primary',
            },
            {
              label: t('page.salesPrint.hierarchyItems.bulkOrderNo'),
              value: record.bulkOrderNo || baseInfo.bulkOrderNo,
              helper: t('page.salesPrint.hierarchyItems.bulkOrderNoHelper'),
              tone: 'secondary',
            },
            {
              label: t('page.salesPrint.hierarchyItems.customerPattern'),
              value: baseInfo.patternNo || record.styleCode,
              helper: t('page.salesPrint.hierarchyItems.customerPatternHelper'),
            },
            {
              label: t('page.salesPrint.hierarchyItems.totalQty'),
              value: totalQty || '-',
              helper: t('page.salesPrint.hierarchyItems.totalQtyHelper'),
            },
          ]}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PrintCodeStrip
            label={t('page.salesPrint.scanEntry')}
            value={`SO|${record.salesNo || '-'}|STYLE|${record.bulkOrderNo || record.styleCode || '-'}|QTY|${totalQty || '-'}`}
            qrValue={detailLink}
            note={t('page.salesPrint.scanEntryNote')}
          />
          <PrintCodeStrip
            label={t('page.salesPrint.archiveEntry')}
            value={`PRINT|${record.bulkOrderNo || record.styleCode || '-'}|CUSTOMER|${record.customerName || '-'}|DATE|${record.deliveryDate || '-'}`}
            qrValue={printLink}
            note={t('page.salesPrint.archiveEntryNote')}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [t('page.salesPrint.cards.salesNo'), record.salesNo],
            [t('page.salesPrint.cards.customerName'), record.customerName],
            [t('page.salesPrint.cards.bulkOrderNo'), record.bulkOrderNo || baseInfo.bulkOrderNo || '-'],
            [t('page.salesPrint.cards.styleCode'), record.styleCode || baseInfo.productName || '-'],
            [t('page.salesPrint.cards.orderDate'), record.orderDate],
            [t('page.salesPrint.cards.deliveryDate'), record.deliveryDate],
            [t('page.salesPrint.cards.totalQty'), totalQty || '-'],
            [t('page.salesPrint.cards.orderStatus'), statusTag.label],
            [t('page.salesPrint.cards.amount'), record.amount || '-'],
            [t('page.salesPrint.cards.remark'), record.remark || baseInfo.remark || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</div>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t('page.salesPrint.distributionTitle')}</h3>
            <span className="text-xs text-slate-500">{t('page.salesPrint.distributionHint')}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {[
                    t('page.salesPrint.table.bulkOrderNo'),
                    t('page.salesPrint.table.colorName'),
                    'XS',
                    'S',
                    'M',
                    'L',
                    t('page.salesPrint.table.subtotal'),
                  ].map((header) => (
                    <th key={header} className="px-3 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bulkRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">{t('page.salesPrint.noDistribution')}</td>
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
