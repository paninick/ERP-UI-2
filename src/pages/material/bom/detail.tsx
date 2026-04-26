import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as bomApi from '@/api/bom';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import { toast } from '@/components/ui/Toast';
import { createRowId, readDraft, writeDraft } from '@/utils/detailDraft';

interface MaterialDetailRow {
  id: string;
  supplyMode: string;
  productCode: string;
  productName: string;
  ingredient: string;
  mainColor: string;
  partName: string;
  colorNo: string;
  colorName: string;
  purchaseQty: string;
  remark: string;
  category: 'main' | 'auxiliary';
}

interface ColorCard {
  id: string;
  title: string;
  rows: Array<{ id: string; partName: string; colorNo: string; colorName: string }>;
}

interface BomDetailDraft {
  baseInfo: {
    customerName: string;
    styleCode: string;
    sampleType: string;
    salesName: string;
    dueDate: string;
    expectDate: string;
    makerName: string;
    patternMaker: string;
    styleImageName: string;
    markerImageName: string;
    plateImageName: string;
    positionRemark: string;
    attachmentNames: string;
  };
  colorCards: ColorCard[];
  materialRows: MaterialDetailRow[];
}

function defaultDraft(record: any): BomDetailDraft {
  return {
    baseInfo: {
      customerName: record?.customerName || '',
      styleCode: record?.styleCode || '',
      sampleType: record?.sampleType || '',
      salesName: record?.salesName || '',
      dueDate: record?.dueDate || '',
      expectDate: record?.expectDate || record?.dueDate || '',
      makerName: record?.makerName || '',
      patternMaker: record?.patternMaker || '',
      styleImageName: record?.styleImageName || '',
      markerImageName: record?.markerImageName || '',
      plateImageName: record?.plateImageName || '',
      positionRemark: record?.positionRemark || '',
      attachmentNames: record?.attachmentNames || '',
    },
    colorCards: [],
    materialRows: [],
  };
}

export default function BomDetailPage() {
  const { t } = useTranslation();
  const { id = 'new' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [draft, setDraft] = useState<BomDetailDraft | null>(null);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response: any = id === 'new' ? null : await bomApi.getBom(Number(id)).catch(() => null);
        const nextRecord = response?.data || response || {};
        if (!mounted) {
          return;
        }
        setRecord(nextRecord);
        setDraft(readDraft('bom-detail', id, defaultDraft(nextRecord)));

        if (id !== 'new') {
          setApprovalLoading(true);
          const approvalRes: any = await approvalApi.listApprovalLog({
            businessType: 'BOM',
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
    if (draft) {
      writeDraft('bom-detail', id, draft);
    }
  }, [draft, id]);

  const updateBase = (field: keyof BomDetailDraft['baseInfo'], value: string) => {
    setDraft((prev) => prev ? { ...prev, baseInfo: { ...prev.baseInfo, [field]: value } } : prev);
  };

  const addColorCard = () => {
    setDraft((prev) => prev ? {
      ...prev,
      colorCards: [
        ...prev.colorCards,
        {
          id: createRowId('bom-color-card'),
          title: `${t('page.bomDetail.sections.colorGroups')} - NEW`,
          rows: [{ id: createRowId('bom-color-row'), partName: '', colorNo: '', colorName: '' }],
        },
      ],
    } : prev);
  };

  const updateColorCardTitle = (cardId: string, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorCards: prev.colorCards.map((card) => card.id === cardId ? { ...card, title: value } : card),
    } : prev);
  };

  const updateColorCardRow = (
    cardId: string,
    rowId: string,
    field: 'partName' | 'colorNo' | 'colorName',
    value: string,
  ) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorCards: prev.colorCards.map((card) => card.id === cardId ? {
        ...card,
        rows: card.rows.map((row) => row.id === rowId ? { ...row, [field]: value } : row),
      } : card),
    } : prev);
  };

  const addMaterialRow = (category: 'main' | 'auxiliary') => {
    setDraft((prev) => prev ? {
      ...prev,
      materialRows: [
        ...prev.materialRows,
        {
          id: createRowId(`bom-material-${category}`),
          supplyMode: '',
          productCode: '',
          productName: '',
          ingredient: '',
          mainColor: '',
          partName: '',
          colorNo: '',
          colorName: '',
          purchaseQty: '',
          remark: '',
          category,
        },
      ],
    } : prev);
  };

  const updateMaterialRow = (rowId: string, field: keyof MaterialDetailRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      materialRows: prev.materialRows.map((row) => row.id === rowId ? { ...row, [field]: value } : row),
    } : prev);
  };

  const resetMaterials = () => {
    setDraft((prev) => prev ? { ...prev, materialRows: [] } : prev);
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(record || {}),
        customerName: draft.baseInfo.customerName,
        styleCode: draft.baseInfo.styleCode,
        sampleType: draft.baseInfo.sampleType,
        dueDate: draft.baseInfo.dueDate,
        salesName: draft.baseInfo.salesName,
        detailDraft: draft,
      };
      if (id === 'new') {
        await bomApi.addBom(payload);
      } else {
        await bomApi.updateBom({ ...payload, id: Number(id) });
      }
      toast.success(t('page.bomDetail.saveSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('page.bomDetail.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.bomDetail.loading')}</div>;
  }

  const mainRows = draft.materialRows.filter((row) => row.category === 'main');
  const auxiliaryRows = draft.materialRows.filter((row) => row.category === 'auxiliary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/material/bom')} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.bomDetail.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.bomDetail.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={resetMaterials} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <RotateCcw size={14} />
            {t('page.bomDetail.restartSampling')}
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
            <Save size={14} />
            {saving ? t('page.bomDetail.saving') : t('common.save')}
          </button>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">{t('page.bomDetail.sections.formInfo')}</h3>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            'customerName',
            'styleCode',
            'sampleType',
            'salesName',
            'dueDate',
            'expectDate',
            'makerName',
            'patternMaker',
          ].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm text-slate-500">{t(`page.bomDetail.fields.${field}`)}</label>
              <input
                value={draft.baseInfo[field as keyof BomDetailDraft['baseInfo']] || ''}
                onChange={(event) => updateBase(field as keyof BomDetailDraft['baseInfo'], event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[180px_1fr]">
          <div className="space-y-4">
            {[
              ['styleImageName', t('page.bomDetail.sections.styleImage')],
              ['markerImageName', t('page.bomDetail.sections.markerImage')],
              ['plateImageName', t('page.bomDetail.sections.plateImage')],
            ].map(([field, label]) => (
              <div key={String(field)}>
                <label className="mb-1 block text-sm text-slate-500">{label}</label>
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                  {draft.baseInfo[field as keyof BomDetailDraft['baseInfo']] || t('page.bomDetail.empty.imagePlaceholder', { label })}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-500">{t('page.bomDetail.sections.positionRemark')}</label>
            <textarea
              value={`${draft.baseInfo.positionRemark}${draft.baseInfo.attachmentNames ? `\n\n${draft.baseInfo.attachmentNames}` : ''}`}
              onChange={(event) => updateBase('positionRemark', event.target.value)}
              className="h-full min-h-[260px] w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </section>

      <ApprovalTimeline title="BOM 审批记录" logs={approvalLogs} loading={approvalLoading} />

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.bomDetail.sections.colorGroups')}</h3>
            <p className="text-sm text-slate-500">{t('page.bomDetail.sections.colorGroupsHint')}</p>
          </div>
          <button type="button" onClick={addColorCard} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Plus size={14} />
            {t('page.bomDetail.actions.addColorGroup')}
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {draft.colorCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">{t('page.bomDetail.empty.colorGroups')}</div>
          ) : draft.colorCards.map((card) => (
            <div key={card.id} className="rounded-2xl border border-slate-200 p-4">
              <input
                value={card.title}
                onChange={(event) => updateColorCardTitle(card.id, event.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400"
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2">{t('page.bomDetail.fields.partName')}</th>
                    <th className="py-2">{t('page.bomDetail.fields.colorNo')}</th>
                    <th className="py-2">{t('page.bomDetail.fields.colorName')}</th>
                  </tr>
                </thead>
                <tbody>
                  {card.rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">
                        <input value={row.partName} onChange={(event) => updateColorCardRow(card.id, row.id, 'partName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" />
                      </td>
                      <td className="py-2 pr-2">
                        <input value={row.colorNo} onChange={(event) => updateColorCardRow(card.id, row.id, 'colorNo', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" />
                      </td>
                      <td className="py-2">
                        <input value={row.colorName} onChange={(event) => updateColorCardRow(card.id, row.id, 'colorName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.bomDetail.sections.materials')}</h3>
            <p className="text-sm text-slate-500">{t('page.bomDetail.sections.materialsHint')}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => addMaterialRow('main')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.bomDetail.actions.addMainMaterial')}</button>
            <button type="button" onClick={() => addMaterialRow('auxiliary')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.bomDetail.actions.addAuxMaterial')}</button>
          </div>
        </div>

        {[
          { title: t('page.bomDetail.groups.mainMaterials'), rows: mainRows },
          { title: t('page.bomDetail.groups.auxiliaryMaterials'), rows: auxiliaryRows },
        ].map(({ title, rows }) => (
          <div key={title} className="mb-6 last:mb-0">
            <h4 className="mb-3 font-medium text-slate-800">{title}</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    {['supplyMode', 'productCode', 'productName', 'ingredient', 'mainColor', 'partName', 'colorNo', 'colorName', 'purchaseQty', 'remark'].map((field) => (
                      <th key={field} className="px-3 py-3">{t(`page.bomDetail.fields.${field}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-slate-400">{t('page.bomDetail.empty.noRows')}</td>
                    </tr>
                  ) : rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      {(['supplyMode', 'productCode', 'productName', 'ingredient', 'mainColor', 'partName', 'colorNo', 'colorName', 'purchaseQty', 'remark'] as Array<keyof MaterialDetailRow>).map((field) => (
                        <td key={field} className="px-3 py-3">
                          <input
                            value={row[field] as string}
                            onChange={(event) => updateMaterialRow(row.id, field, event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
