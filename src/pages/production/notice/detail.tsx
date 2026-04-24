import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as noticeApi from '@/api/notice';
import { toast } from '@/components/ui/Toast';
import { createRowId, readDraft, writeDraft } from '@/utils/detailDraft';

interface SampleRow {
  id: string;
  colorNo: string;
  colorName: string;
  sizeCode: string;
  needleType: string;
  quantity: string;
  remark: string;
}

interface ColorPanel {
  id: string;
  title: string;
  lines: Array<{ id: string; partName: string; colorNo: string; colorName: string }>;
}

interface NoticeMaterialRow {
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

interface NoticeDetailDraft {
  baseInfo: {
    noticeNo: string;
    sampleType: string;
    sampleNo: string;
    sampleCategory: string;
    customerName: string;
    bulkOrderNo: string;
    dueDate: string;
    expectDate: string;
    styleImageName: string;
    applicant: string;
    applyDate: string;
    reviewer: string;
    reviewDate: string;
    attachmentNames: string;
    remark: string;
  };
  sampleRows: SampleRow[];
  colorPanels: ColorPanel[];
  materialRows: NoticeMaterialRow[];
}

function defaultDraft(record: any): NoticeDetailDraft {
  return {
    baseInfo: {
      noticeNo: record?.noticeNo || '',
      sampleType: record?.sampleType || '',
      sampleNo: record?.styleCode || '',
      sampleCategory: record?.sampleCategory || '',
      customerName: record?.customerName || '',
      bulkOrderNo: record?.bulkOrderNo || '',
      dueDate: record?.dueDate || '',
      expectDate: record?.expectDate || record?.dueDate || '',
      styleImageName: record?.styleImageName || '',
      applicant: record?.applicant || '',
      applyDate: record?.applyDate || new Date().toISOString().slice(0, 10),
      reviewer: record?.reviewer || '',
      reviewDate: record?.reviewDate || '',
      attachmentNames: record?.attachmentNames || '',
      remark: record?.remark || '',
    },
    sampleRows: [],
    colorPanels: [],
    materialRows: [],
  };
}

export default function NoticeDetailPage() {
  const { t } = useTranslation();
  const { id = 'new' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [draft, setDraft] = useState<NoticeDetailDraft | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response: any = id === 'new' ? null : await noticeApi.getNotice(Number(id)).catch(() => null);
        const nextRecord = response?.data || response || {};
        if (!mounted) {
          return;
        }
        setRecord(nextRecord);
        setDraft(readDraft('notice-detail', id, defaultDraft(nextRecord)));
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
      writeDraft('notice-detail', id, draft);
    }
  }, [draft, id]);

  const updateBase = (field: keyof NoticeDetailDraft['baseInfo'], value: string) => {
    setDraft((prev) => prev ? { ...prev, baseInfo: { ...prev.baseInfo, [field]: value } } : prev);
  };

  const addSampleRow = () => {
    setDraft((prev) => prev ? {
      ...prev,
      sampleRows: [
        ...prev.sampleRows,
        { id: createRowId('notice-sample-row'), colorNo: '', colorName: '', sizeCode: '', needleType: '', quantity: '', remark: '' },
      ],
    } : prev);
  };

  const updateSampleRow = (rowId: string, field: keyof SampleRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      sampleRows: prev.sampleRows.map((row) => row.id === rowId ? { ...row, [field]: value } : row),
    } : prev);
  };

  const addColorPanel = () => {
    setDraft((prev) => prev ? {
      ...prev,
      colorPanels: [
        ...prev.colorPanels,
        {
          id: createRowId('notice-color-panel'),
          title: `${t('page.noticeDetail.sections.colorGroups')} - NEW`,
          lines: [{ id: createRowId('notice-color-line'), partName: '', colorNo: '', colorName: '' }],
        },
      ],
    } : prev);
  };

  const updateColorPanelTitle = (panelId: string, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorPanels: prev.colorPanels.map((panel) => panel.id === panelId ? { ...panel, title: value } : panel),
    } : prev);
  };

  const updateColorLine = (
    panelId: string,
    lineId: string,
    field: 'partName' | 'colorNo' | 'colorName',
    value: string,
  ) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorPanels: prev.colorPanels.map((panel) => panel.id === panelId ? {
        ...panel,
        lines: panel.lines.map((line) => line.id === lineId ? { ...line, [field]: value } : line),
      } : panel),
    } : prev);
  };

  const addMaterialRow = (category: 'main' | 'auxiliary') => {
    setDraft((prev) => prev ? {
      ...prev,
      materialRows: [
        ...prev.materialRows,
        {
          id: createRowId(`notice-material-${category}`),
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

  const updateMaterialRow = (rowId: string, field: keyof NoticeMaterialRow, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      materialRows: prev.materialRows.map((row) => row.id === rowId ? { ...row, [field]: value } : row),
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
        noticeNo: draft.baseInfo.noticeNo,
        styleCode: draft.baseInfo.sampleNo,
        sampleType: draft.baseInfo.sampleType,
        customerName: draft.baseInfo.customerName,
        dueDate: draft.baseInfo.dueDate,
        remark: draft.baseInfo.remark,
        detailDraft: draft,
      };
      if (id === 'new') {
        await noticeApi.addNotice(payload);
      } else {
        await noticeApi.updateNotice({ ...payload, id: Number(id) });
      }
      toast.success(t('page.noticeDetail.saveSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('page.noticeDetail.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.noticeDetail.loading')}</div>;
  }

  const mainRows = draft.materialRows.filter((row) => row.category === 'main');
  const auxiliaryRows = draft.materialRows.filter((row) => row.category === 'auxiliary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/production/notice')} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('page.noticeDetail.title')}</h2>
            <p className="text-sm text-slate-500">{t('page.noticeDetail.subtitle')}</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
          <Save size={14} />
          {saving ? t('page.noticeDetail.saving') : t('common.save')}
        </button>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">{t('page.noticeDetail.sections.formInfo')}</h3>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            'noticeNo',
            'sampleType',
            'sampleNo',
            'sampleCategory',
            'customerName',
            'bulkOrderNo',
            'dueDate',
            'expectDate',
            'applicant',
            'applyDate',
            'reviewer',
            'reviewDate',
          ].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm text-slate-500">{t(`page.noticeDetail.fields.${field}`)}</label>
              <input
                value={draft.baseInfo[field as keyof NoticeDetailDraft['baseInfo']] || ''}
                onChange={(event) => updateBase(field as keyof NoticeDetailDraft['baseInfo'], event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[200px_1fr]">
          <div>
            <label className="mb-1 block text-sm text-slate-500">{t('page.noticeDetail.sections.styleImage')}</label>
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              {draft.baseInfo.styleImageName || t('page.noticeDetail.empty.styleImagePlaceholder')}
            </div>
            <label className="mt-4 mb-1 block text-sm text-slate-500">{t('page.noticeDetail.sections.attachments')}</label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              {draft.baseInfo.attachmentNames || t('page.noticeDetail.sections.attachmentsPlaceholder')}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-500">{t('page.noticeDetail.sections.remark')}</label>
            <textarea
              value={draft.baseInfo.remark}
              onChange={(event) => updateBase('remark', event.target.value)}
              className="min-h-[220px] w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.noticeDetail.sections.sampleInfo')}</h3>
            <p className="text-sm text-slate-500">{t('page.noticeDetail.sections.sampleHint')}</p>
          </div>
          <button type="button" onClick={addSampleRow} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Plus size={14} />
            {t('page.noticeDetail.actions.addSample')}
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {['colorNo', 'colorName', 'sizeCode', 'needleType', 'quantity', 'remark'].map((field) => (
                  <th key={field} className="px-3 py-3">{t(`page.noticeDetail.fields.${field}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.sampleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">{t('page.noticeDetail.empty.samples')}</td>
                </tr>
              ) : draft.sampleRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  {(['colorNo', 'colorName', 'sizeCode', 'needleType', 'quantity', 'remark'] as Array<keyof SampleRow>).map((field) => (
                    <td key={field} className="px-3 py-3">
                      <input
                        value={row[field]}
                        onChange={(event) => updateSampleRow(row.id, field, event.target.value)}
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

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('page.noticeDetail.sections.colorGroups')}</h3>
            <p className="text-sm text-slate-500">{t('page.noticeDetail.sections.colorGroupsHint')}</p>
          </div>
          <button type="button" onClick={addColorPanel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Plus size={14} />
            {t('page.noticeDetail.actions.addColorGroup')}
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {draft.colorPanels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">{t('page.noticeDetail.empty.colorGroups')}</div>
          ) : draft.colorPanels.map((panel) => (
            <div key={panel.id} className="rounded-2xl border border-slate-200 p-4">
              <input value={panel.title} onChange={(event) => updateColorPanelTitle(panel.id, event.target.value)} className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2">{t('page.noticeDetail.fields.partName')}</th>
                    <th className="py-2">{t('page.noticeDetail.fields.colorNo')}</th>
                    <th className="py-2">{t('page.noticeDetail.fields.colorName')}</th>
                  </tr>
                </thead>
                <tbody>
                  {panel.lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2"><input value={line.partName} onChange={(event) => updateColorLine(panel.id, line.id, 'partName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" /></td>
                      <td className="py-2 pr-2"><input value={line.colorNo} onChange={(event) => updateColorLine(panel.id, line.id, 'colorNo', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" /></td>
                      <td className="py-2"><input value={line.colorName} onChange={(event) => updateColorLine(panel.id, line.id, 'colorName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-indigo-400" /></td>
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
            <h3 className="text-lg font-semibold text-slate-900">{t('page.noticeDetail.sections.materials')}</h3>
            <p className="text-sm text-slate-500">{t('page.noticeDetail.sections.materialsHint')}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => addMaterialRow('main')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.noticeDetail.actions.addMainMaterial')}</button>
            <button type="button" onClick={() => addMaterialRow('auxiliary')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.noticeDetail.actions.addAuxMaterial')}</button>
          </div>
        </div>

        {[
          { title: t('page.noticeDetail.groups.mainMaterials'), rows: mainRows },
          { title: t('page.noticeDetail.groups.auxiliaryMaterials'), rows: auxiliaryRows },
        ].map(({ title, rows }) => (
          <div key={title} className="mb-6 last:mb-0">
            <h4 className="mb-3 font-medium text-slate-800">{title}</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    {['supplyMode', 'productCode', 'productName', 'ingredient', 'mainColor', 'partName', 'colorNo', 'colorName', 'purchaseQty', 'remark'].map((field) => (
                      <th key={field} className="px-3 py-3">{t(`page.noticeDetail.fields.${field}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-slate-400">{t('page.noticeDetail.empty.noRows')}</td>
                    </tr>
                  ) : rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      {(['supplyMode', 'productCode', 'productName', 'ingredient', 'mainColor', 'partName', 'colorNo', 'colorName', 'purchaseQty', 'remark'] as Array<keyof NoticeMaterialRow>).map((field) => (
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
