import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Plus, Printer, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as salesApi from '@/api/sales';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { createRowId, readDraft, writeDraft } from '@/utils/detailDraft';

interface BulkRow {
  id: string;
  bulkOrderNo: string;
  colorName: string;
  xs: string;
  s: string;
  m: string;
  l: string;
}

interface ColorGroupCard {
  id: string;
  title: string;
  parts: Array<{ id: string; partName: string; colorNo: string; colorName: string }>;
}

interface MaterialRow {
  id: string;
  materialCode: string;
  materialName: string;
  mainColor: string;
  partName: string;
  colorNo: string;
  colorName: string;
  unitUsage: string;
  lossRate: string;
  orderQty: string;
  demandQty: string;
  remark: string;
  category: 'main' | 'auxiliary';
}

interface CartonRow {
  id: string;
  date: string;
  finishedSku: string;
  bagType: string;
  bagSize: string;
  bagQty: string;
  cartonHead: string;
  cartonTypeNo: string;
  cartonSize: string;
  cartonQty: string;
  qtyPerCarton: string;
  netWeight: string;
}

interface SalesDetailDraft {
  baseInfo: {
    salesNo: string;
    printNo: string;
    customerName: string;
    categoryName: string;
    patternNo: string;
    createDate: string;
    salesName: string;
    totalQty: string;
    bulkOrderNo: string;
    productName: string;
    deliveryDate: string;
    cmtPrice: string;
    fobPrice: string;
    remark: string;
    orderImageName: string;
  };
  bulkRows: BulkRow[];
  colorGroups: ColorGroupCard[];
  materials: MaterialRow[];
  cartons: CartonRow[];
}

function buildDefaultDraft(record: any): SalesDetailDraft {
  return {
    baseInfo: {
      salesNo: record?.salesNo || '',
      printNo: record?.printNo || `SAM-${record?.salesNo || ''}`,
      customerName: record?.customerName || '',
      categoryName: record?.categoryName || '',
      patternNo: record?.patternNo || record?.styleCode || '',
      createDate: record?.orderDate || new Date().toISOString().slice(0, 10),
      salesName: record?.salesName || '',
      totalQty: String(record?.quantity || ''),
      bulkOrderNo: record?.bulkOrderNo || record?.styleCode || '',
      productName: record?.productName || record?.styleCode || '',
      deliveryDate: record?.deliveryDate || '',
      cmtPrice: String(record?.cmtPrice || ''),
      fobPrice: String(record?.amount || ''),
      remark: record?.remark || '',
      orderImageName: record?.orderImageName || '',
    },
    bulkRows: [
      {
        id: createRowId('bulk'),
        bulkOrderNo: record?.bulkOrderNo || record?.styleCode || '',
        colorName: record?.mainColor || '',
        xs: '',
        s: '',
        m: '',
        l: '',
      },
    ],
    colorGroups: [],
    materials: [],
    cartons: [],
  };
}

function calcSubtotal(row: BulkRow) {
  return ['xs', 's', 'm', 'l'].reduce((sum, key) => sum + (Number(row[key as keyof BulkRow]) || 0), 0);
}

export default function SalesOrderDetailPage() {
  const { t } = useTranslation();
  const { id = 'new' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [draft, setDraft] = useState<SalesDetailDraft | null>(null);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response: any = id === 'new' ? null : await salesApi.getSalesOrder(Number(id)).catch(() => null);
        const nextRecord = response?.data || response || {};
        if (!mounted) {
          return;
        }
        setRecord(nextRecord);
        const fallback = buildDefaultDraft(nextRecord);
        setDraft(readDraft('sales-order-detail', id, fallback));

        if (id !== 'new') {
          setApprovalLoading(true);
          const approvalRes: any = await approvalApi.listApprovalLog({
            businessType: 'SALES_ORDER',
            businessId: Number(id),
            pageNum: 1,
            pageSize: 50,
          }).catch(() => null);
          if (mounted) {
            setApprovalLogs(approvalRes?.rows || []);
          }
          if (mounted) {
            setApprovalLoading(false);
          }
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

  useEffect(() => {
    if (!draft) {
      return;
    }
    writeDraft('sales-order-detail', id, draft);
  }, [draft, id]);

  const totalBulkQty = useMemo(
    () => (draft?.bulkRows || []).reduce((sum, item) => sum + calcSubtotal(item), 0),
    [draft],
  );

  const updateBaseInfo = (field: keyof SalesDetailDraft['baseInfo'], value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      baseInfo: {
        ...prev.baseInfo,
        [field]: value,
      },
    } : prev);
  };

  const updateBulkRow = (rowId: string, field: keyof BulkRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      bulkRows: prev.bulkRows.map((item) => item.id === rowId ? { ...item, [field]: value } : item),
    } : prev);
  };

  const addBulkRow = () => {
    setDraft((prev) => prev ? {
      ...prev,
      bulkRows: [
        ...prev.bulkRows,
        { id: createRowId('bulk'), bulkOrderNo: '', colorName: '', xs: '', s: '', m: '', l: '' },
      ],
    } : prev);
  };

  const removeBulkRow = (rowId: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      bulkRows: prev.bulkRows.filter((item) => item.id !== rowId),
    } : prev);
  };

  const addColorGroup = () => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: [
        ...prev.colorGroups,
        {
          id: createRowId('color-group'),
          title: `${t('page.salesDetail.sections.colorGroups')} - ${prev.baseInfo.bulkOrderNo || 'NEW'}`,
          parts: [{ id: createRowId('color-part'), partName: '', colorNo: '', colorName: '' }],
        },
      ],
    } : prev);
  };

  const updateColorGroupTitle = (groupId: string, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => group.id === groupId ? { ...group, title: value } : group),
    } : prev);
  };

  const updateColorPart = (
    groupId: string,
    partId: string,
    field: 'partName' | 'colorNo' | 'colorName',
    value: string,
  ) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        return {
          ...group,
          parts: group.parts.map((part) => part.id === partId ? { ...part, [field]: value } : part),
        };
      }),
    } : prev);
  };

  const addColorPart = (groupId: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => (
        group.id === groupId
          ? { ...group, parts: [...group.parts, { id: createRowId('color-part'), partName: '', colorNo: '', colorName: '' }] }
          : group
      )),
    } : prev);
  };

  const addMaterial = (category: 'main' | 'auxiliary') => {
    setDraft((prev) => prev ? {
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: createRowId(`material-${category}`),
          materialCode: '',
          materialName: '',
          mainColor: '',
          partName: '',
          colorNo: '',
          colorName: '',
          unitUsage: '',
          lossRate: '',
          orderQty: prev.baseInfo.totalQty || '',
          demandQty: '',
          remark: '',
          category,
        },
      ],
    } : prev);
  };

  const updateMaterial = (materialId: string, field: keyof MaterialRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      materials: prev.materials.map((item) => item.id === materialId ? { ...item, [field]: value } : item),
    } : prev);
  };

  const removeMaterial = (materialId: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      materials: prev.materials.filter((item) => item.id !== materialId),
    } : prev);
  };

  const addCarton = () => {
    setDraft((prev) => prev ? {
      ...prev,
      cartons: [
        ...prev.cartons,
        {
          id: createRowId('carton'),
          date: '',
          finishedSku: '',
          bagType: '',
          bagSize: '',
          bagQty: '',
          cartonHead: '',
          cartonTypeNo: '',
          cartonSize: '',
          cartonQty: '',
          qtyPerCarton: '',
          netWeight: '',
        },
      ],
    } : prev);
  };

  const updateCarton = (cartonId: string, field: keyof CartonRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      cartons: prev.cartons.map((item) => item.id === cartonId ? { ...item, [field]: value } : item),
    } : prev);
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(record || {}),
        salesNo: draft.baseInfo.salesNo,
        customerName: draft.baseInfo.customerName,
        styleCode: draft.baseInfo.productName,
        bulkOrderNo: draft.baseInfo.bulkOrderNo,
        quantity: Number(draft.baseInfo.totalQty) || totalBulkQty || undefined,
        orderDate: draft.baseInfo.createDate,
        deliveryDate: draft.baseInfo.deliveryDate,
        amount: Number(draft.baseInfo.fobPrice) || undefined,
        remark: draft.baseInfo.remark,
        detailDraft: draft,
      };

      if (id === 'new') {
        await salesApi.addSalesOrder(payload);
      } else {
        await salesApi.updateSalesOrder({ ...payload, id: Number(id) });
      }
      toast.success(t('page.salesDetail.saveSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('page.salesDetail.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.salesDetail.loading')}</div>;
  }

  const mainMaterials = draft.materials.filter((item) => item.category === 'main');
  const auxiliaryMaterials = draft.materials.filter((item) => item.category === 'auxiliary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/sales/order')}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label={t('page.salesDetail.backAriaLabel')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.salesDetail.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.salesDetail.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <NavLink
            to={`/sales/order/print/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} />
            {t('page.salesDetail.businessPrint')}
          </NavLink>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} />
            {t('common.print')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} />
            {t('common.export')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? t('page.salesDetail.saving') : t('common.save')}
          </button>
        </div>
      </div>

      <DocumentCodeBoard
        title={t('page.salesDetail.hierarchyTitle')}
        description={t('page.salesDetail.hierarchyDescription')}
        items={[
          {
            label: t('page.salesDetail.hierarchyItems.salesNo'),
            value: draft.baseInfo.salesNo,
            helper: t('page.salesDetail.hierarchyItems.salesNoHelper'),
            tone: 'primary',
          },
          {
            label: t('page.salesDetail.hierarchyItems.bulkOrderNo'),
            value: draft.baseInfo.bulkOrderNo,
            helper: t('page.salesDetail.hierarchyItems.bulkOrderNoHelper'),
            tone: 'secondary',
          },
          {
            label: t('page.salesDetail.hierarchyItems.printNo'),
            value: draft.baseInfo.printNo,
            helper: t('page.salesDetail.hierarchyItems.printNoHelper'),
          },
          {
            label: t('page.salesDetail.hierarchyItems.patternNo'),
            value: draft.baseInfo.patternNo || draft.baseInfo.productName,
            helper: t('page.salesDetail.hierarchyItems.patternNoHelper'),
          },
        ]}
      />

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">{t('page.salesDetail.sections.baseInfo')}</h3>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ['salesNo', 'salesNo'],
            ['printNo', 'printNo'],
            ['customerName', 'customerName'],
            ['categoryName', 'categoryName'],
            ['patternNo', 'patternNo'],
            ['createDate', 'createDate'],
            ['salesName', 'salesName'],
            ['totalQty', 'totalQty'],
            ['bulkOrderNo', 'bulkOrderNo'],
            ['productName', 'productName'],
            ['deliveryDate', 'deliveryDate'],
            ['cmtPrice', 'cmtPrice'],
            ['fobPrice', 'fobPrice'],
          ].map(([field, key]) => (
            <div key={field}>
              <label className="mb-1 block text-sm text-slate-500">
                {t(`page.salesDetail.fields.${key}`)}
              </label>
              <input
                value={draft.baseInfo[field as keyof SalesDetailDraft['baseInfo']] || ''}
                onChange={(event) => updateBaseInfo(field as keyof SalesDetailDraft['baseInfo'], event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr]">
          <div>
            <label className="mb-1 block text-sm text-slate-500">{t('page.salesDetail.sections.archiveImage')}</label>
            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              {draft.baseInfo.orderImageName || t('page.salesDetail.sections.imagePlaceholder')}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-500">{t('page.salesDetail.fields.remark')}</label>
            <textarea
              value={draft.baseInfo.remark}
              onChange={(event) => updateBaseInfo('remark', event.target.value)}
              className="h-44 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </section>

      <ApprovalTimeline title="销售审批记录" logs={approvalLogs} loading={approvalLoading} />

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.salesDetail.sections.bulkInfo')}</h3>
            <p className="text-sm text-slate-500">{t('page.salesDetail.sections.bulkHint')}</p>
          </div>
          <button
            type="button"
            onClick={addBulkRow}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            {t('page.salesDetail.actions.addBulkRow')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">{t('page.salesDetail.fields.bulkOrderNo')}</th>
                <th className="px-3 py-3">{t('page.salesDetail.fields.colorName')}</th>
                <th className="px-3 py-3">XS</th>
                <th className="px-3 py-3">S</th>
                <th className="px-3 py-3">M</th>
                <th className="px-3 py-3">L</th>
                <th className="px-3 py-3">{t('page.salesDetail.fields.subtotal')}</th>
                <th className="px-3 py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {draft.bulkRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  {(['bulkOrderNo', 'colorName', 'xs', 's', 'm', 'l'] as Array<keyof BulkRow>).map((field) => (
                    <td key={field} className="px-3 py-3">
                      <input
                        value={row[field] as string}
                        onChange={(event) => updateBulkRow(row.id, field, event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3 font-medium text-indigo-600">{calcSubtotal(row)}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => removeBulkRow(row.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      {t('page.salesDetail.actions.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.salesDetail.sections.colorGroups')}</h3>
            <p className="text-sm text-slate-500">{t('page.salesDetail.sections.colorGroupsHint')}</p>
          </div>
          <button
            type="button"
            onClick={addColorGroup}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            {t('page.salesDetail.actions.addColorGroup')}
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {draft.colorGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              {t('page.salesDetail.empty.colorGroups')}
            </div>
          ) : draft.colorGroups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-200 p-4">
              <input
                value={group.title}
                onChange={(event) => updateColorGroupTitle(group.id, event.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400"
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2">{t('page.salesDetail.fields.partName')}</th>
                    <th className="py-2">{t('page.salesDetail.fields.colorNo')}</th>
                    <th className="py-2">{t('page.salesDetail.fields.colorName')}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.parts.map((part) => (
                    <tr key={part.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">
                        <input
                          value={part.partName}
                          onChange={(event) => updateColorPart(group.id, part.id, 'partName', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          value={part.colorNo}
                          onChange={(event) => updateColorPart(group.id, part.id, 'colorNo', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          value={part.colorName}
                          onChange={(event) => updateColorPart(group.id, part.id, 'colorName', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => addColorPart(group.id)}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
              >
                + {t('page.salesDetail.actions.addColorPart')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.salesDetail.sections.materials')}</h3>
            <p className="text-sm text-slate-500">{t('page.salesDetail.sections.materialsHint')}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => addMaterial('main')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {t('page.salesDetail.actions.addMainMaterial')}
            </button>
            <button type="button" onClick={() => addMaterial('auxiliary')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {t('page.salesDetail.actions.addAuxMaterial')}
            </button>
          </div>
        </div>

        {[
          { title: t('page.bomDetail.groups.mainMaterials'), rows: mainMaterials },
          { title: t('page.bomDetail.groups.auxiliaryMaterials'), rows: auxiliaryMaterials },
        ].map(({ title, rows }) => (
          <div key={title} className="mb-6 last:mb-0">
            <h4 className="mb-3 font-medium text-slate-800">{title}</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    {[
                      'materialCode',
                      'materialName',
                      'mainColor',
                      'partName',
                      'colorNo',
                      'colorName',
                      'unitUsage',
                      'lossRate',
                      'orderQty',
                      'demandQty',
                      'remark',
                    ].map((field) => (
                      <th key={field} className="px-3 py-3">{t(`page.salesDetail.fields.${field}`)}</th>
                    ))}
                    <th className="px-3 py-3">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-3 py-8 text-center text-slate-400">{t('page.salesDetail.empty.noRows')}</td>
                    </tr>
                  ) : rows.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      {(['materialCode', 'materialName', 'mainColor', 'partName', 'colorNo', 'colorName', 'unitUsage', 'lossRate', 'orderQty', 'demandQty', 'remark'] as Array<keyof MaterialRow>).map((field) => (
                        <td key={field} className="px-3 py-3">
                          <input
                            value={item[field] as string}
                            onChange={(event) => updateMaterial(item.id, field, event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => removeMaterial(item.id)} className="text-xs text-red-500 hover:text-red-600">
                          {t('page.salesDetail.actions.remove')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.salesDetail.sections.cartonInfo')}</h3>
            <p className="text-sm text-slate-500">{t('page.salesDetail.sections.cartonHint')}</p>
          </div>
          <button
            type="button"
            onClick={addCarton}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            {t('page.salesDetail.actions.addCarton')}
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {[
                  'date',
                  'finishedSku',
                  'bagType',
                  'bagSize',
                  'bagQty',
                  'cartonHead',
                  'cartonTypeNo',
                  'cartonSize',
                  'cartonQty',
                  'qtyPerCarton',
                  'netWeight',
                ].map((field) => (
                  <th key={field} className="px-3 py-3">{t(`page.salesDetail.fields.${field}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.cartons.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-slate-400">{t('page.salesDetail.empty.noCartons')}</td>
                </tr>
              ) : draft.cartons.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  {(['date', 'finishedSku', 'bagType', 'bagSize', 'bagQty', 'cartonHead', 'cartonTypeNo', 'cartonSize', 'cartonQty', 'qtyPerCarton', 'netWeight'] as Array<keyof CartonRow>).map((field) => (
                    <td key={field} className="px-3 py-3">
                      <input
                        value={item[field]}
                        onChange={(event) => updateCarton(item.id, field, event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
