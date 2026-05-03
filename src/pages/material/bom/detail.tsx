import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Factory,
  FileStack,
  Plus,
  RotateCcw,
  Save,
  Workflow,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as bomApi from '@/api/bom';
import * as bomSubstituteApi from '@/api/bomSubstitute';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/appStore';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';
import { getCompanyLabel } from '@/utils/companyContext';
import { createRowId, readDraft, writeDraft } from '@/utils/detailDraft';
import { resolveApprovalState } from '@/utils/approval';

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

interface BomSubstituteItem {
  id: number;
  originalMaterialCode?: string;
  originalMaterialName?: string;
  substituteMaterialCode?: string;
  substituteMaterialName?: string;
  scopeType?: string;
  applyReason?: string;
  approvedBy?: string;
  approvedTime?: string;
}

function renderText(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '-';
}

function renderDate(value: unknown) {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, 10) : '-';
}

function renderApprovalTag(value: unknown) {
  const state = resolveApprovalState(value) || 'draft';
  if (state === 'approved') return { label: '已通过', className: 'bg-emerald-50 text-emerald-700' };
  if (state === 'submitted') return { label: '待审核', className: 'bg-blue-50 text-blue-700' };
  if (state === 'rejected') return { label: '已驳回', className: 'bg-amber-50 text-amber-700' };
  return { label: '待提交', className: 'bg-slate-100 text-slate-700' };
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {hint ? <p className="mt-1 text-sm leading-6 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function GridField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-2 break-words text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
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
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [draft, setDraft] = useState<BomDetailDraft | null>(null);
  const [recordMissing, setRecordMissing] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvedSubstitutes, setApprovedSubstitutes] = useState<BomSubstituteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'flow'>('form');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const isNewRecord = id === 'new';
        const response: any = isNewRecord ? null : await bomApi.getBom(Number(id)).catch(() => null);
        const nextRecord = isNewRecord ? null : unwrapAjaxResultData<any>(response);
        if (!mounted) {
          return;
        }
        setRecordMissing(!isNewRecord && !nextRecord);
        setRecord(nextRecord);
        setDraft(isNewRecord || nextRecord ? readDraft('bom-detail', id, defaultDraft(nextRecord)) : null);
        setApprovalLogs([]);
        setApprovedSubstitutes([]);

        if (!isNewRecord && nextRecord) {
          const substituteRes: any = await bomSubstituteApi.listApprovedBomSubstituteByBomId(Number(id)).catch(() => null);
          if (mounted) {
            setApprovedSubstitutes(Array.isArray(substituteRes?.data) ? substituteRes.data : Array.isArray(substituteRes) ? substituteRes : []);
          }
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
  }, [companySignature, id]);

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

  const styleImageUrl = useMemo(() => {
    const value = String(record?.pictureUrl || draft?.baseInfo.styleImageName || '').trim();
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') ? value : '';
  }, [draft?.baseInfo.styleImageName, record?.pictureUrl]);

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
    if (!loading && recordMissing) {
      return (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">
          <div className="mb-2 text-sm text-slate-500">当前公司：{getCompanyLabel(currentCompany.code, t)}</div>
          未找到对应的样衣 BOM
        </div>
      );
    }
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">{t('page.bomDetail.loading')}</div>;
  }

  const mainRows = draft.materialRows.filter((row) => row.category === 'main');
  const auxiliaryRows = draft.materialRows.filter((row) => row.category === 'auxiliary');
  const approvalTag = renderApprovalTag(record?.auditStatus);
  const tabs = [
    { key: 'form' as const, label: '表单信息' },
    { key: 'history' as const, label: '流转记录' },
    { key: 'flow' as const, label: '流程图' },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">
              样衣技术冻结
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/material/bom')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回 BOM 列表
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${approvalTag.className}`}>
                {approvalTag.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                打样编号 {renderText(record?.sampleNo)}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">{t('page.bomDetail.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这一页承接的是样衣阶段的材料冻结，不是采购执行单，也不是正式大货工艺书。重点是把颜色组、主辅料、图纸和来源关系一次讲清楚，让技术、采购和样衣执行看到同一份依据。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={Boxes} label="颜色组" value={`${draft.colorCards.length} 组`} />
              <MetricCard icon={FileStack} label="主料行" value={`${mainRows.length} 条`} />
              <MetricCard icon={FileStack} label="辅料行" value={`${auxiliaryRows.length} 条`} />
              <MetricCard icon={Workflow} label="审批节点" value={`${approvalLogs.length} 条`} />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                title: '回打样总览',
                detail: '先确认这份样衣 BOM 来自哪张打样通知，以及样衣要求和附件是否一致。',
                action: () =>
                  navigate(
                    `/sales/proofing-notice?styleCode=${encodeURIComponent(record?.styleCode || '')}&customerName=${encodeURIComponent(record?.customerName || '')}`,
                  ),
              },
              {
                title: '继续看技术承接',
                detail: '如果技术单已经承接，这里继续下钻工艺参数、负责人和阶段状态。',
                action: () =>
                  navigate(
                    `/sales/tech?styleCode=${encodeURIComponent(record?.styleCode || '')}&customerName=${encodeURIComponent(record?.customerName || '')}`,
                  ),
              },
              {
                title: '后续转生产计划',
                detail: '样衣确认后，再继续进入大货核版、工艺指示书和生产计划。',
                action: () => navigate('/production/plan'),
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.action}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'form' && (
        <div className="space-y-6">
          <SectionCard title="来源与基础信息" hint="先把这份 BOM 属于谁、来自哪张样、当前状态和交期看清楚。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="打样编号" value={renderText(record?.sampleNo)} />
              <GridField label="客户" value={renderText(record?.customerName || draft.baseInfo.customerName)} />
              <GridField label="打样款号" value={renderText(record?.styleCode || draft.baseInfo.styleCode)} />
              <GridField label="大货款号" value={renderText(record?.bulkOrderNo)} />
              <GridField label="样品款式" value={renderText(record?.styleType || draft.baseInfo.sampleType)} />
              <GridField label="样品种类" value={renderText(record?.sampleCategoryType)} />
              <GridField label="业务员" value={renderText(record?.salesName || draft.baseInfo.salesName)} />
              <GridField label="要求交期" value={renderDate(record?.dueDate || draft.baseInfo.dueDate)} />
              <GridField label="紧急程度" value={renderText(record?.emergencyType)} />
              <GridField label="进行状态" value={renderText(record?.progressStatus)} />
              <GridField label="审批人" value={renderText(record?.auditByNickName || record?.auditBy)} />
              <GridField label="审批时间" value={renderDate(record?.auditTime)} />
            </div>
          </SectionCard>

          <SectionCard
            title="已批准替代料"
            hint="这里显示的是已经走完审批的替代关系。原 BOM 主料不会被覆盖，替代料只作为受控旁路记录存在。"
          >
            {approvedSubstitutes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-400">
                当前没有已批准替代料。
              </div>
            ) : (
              <div className="space-y-3">
                {approvedSubstitutes.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-900">
                      <span className="font-medium">{renderText(item.originalMaterialName || item.originalMaterialCode)}</span>
                      <ArrowRight size={14} className="text-slate-400" />
                      <span className="font-medium text-emerald-700">{renderText(item.substituteMaterialName || item.substituteMaterialCode)}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{renderText(item.scopeType)}</span>
                    </div>
                    <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                      <span>原因: {renderText(item.applyReason)}</span>
                      <span>审批人: {renderText(item.approvedBy)}</span>
                      <span>审批时间: {renderDate(item.approvedTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={t('page.bomDetail.sections.formInfo')} hint="这里仍然保留当前可编辑的样衣冻结草稿层，方便继续把图纸、制版和责任人补齐。">
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="图纸与附件"
            hint="样衣阶段至少要把款式图、订标位置图、制版图和说明备注集中起来，避免采购和样衣房各看各的版本。"
          >
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">{t('page.bomDetail.sections.styleImage')}</h4>
                  {styleImageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={styleImageUrl} alt="样衣款式图" className="h-72 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                      {draft.baseInfo.styleImageName || t('page.bomDetail.empty.imagePlaceholder', { label: t('page.bomDetail.sections.styleImage') })}
                    </div>
                  )}
                </div>

                {[
                  ['markerImageName', t('page.bomDetail.sections.markerImage')],
                  ['plateImageName', t('page.bomDetail.sections.plateImage')],
                ].map(([field, label]) => (
                  <div key={String(field)} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                    <div className="mt-4 flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                      {draft.baseInfo[field as keyof BomDetailDraft['baseInfo']] || t('page.bomDetail.empty.imagePlaceholder', { label })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">{t('page.bomDetail.sections.positionRemark')}</label>
                  <textarea
                    value={draft.baseInfo.positionRemark}
                    onChange={(event) => updateBase('positionRemark', event.target.value)}
                    className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">附件备注</label>
                  <textarea
                    value={draft.baseInfo.attachmentNames}
                    onChange={(event) => updateBase('attachmentNames', event.target.value)}
                    className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    placeholder="先记录图纸、订标文件、PDF 或其它补充附件名称"
                  />
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  当前颜色组和主辅料明细仍以详情草稿层维护，用于先把技术冻结心智收正；后续若继续打通结构化后端明细，再把这一层正式入库。
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t('page.bomDetail.sections.colorGroups')} hint={t('page.bomDetail.sections.colorGroupsHint')}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">颜色组里的主色、部位和色号应该能和样衣要求对应起来，后续采购与技术不能各写一套颜色口径。</p>
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
                    className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-400"
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
                            <input value={row.partName} onChange={(event) => updateColorCardRow(card.id, row.id, 'partName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-emerald-400" />
                          </td>
                          <td className="py-2 pr-2">
                            <input value={row.colorNo} onChange={(event) => updateColorCardRow(card.id, row.id, 'colorNo', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-emerald-400" />
                          </td>
                          <td className="py-2">
                            <input value={row.colorName} onChange={(event) => updateColorCardRow(card.id, row.id, 'colorName', event.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-emerald-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t('page.bomDetail.sections.materials')} hint={t('page.bomDetail.sections.materialsHint')}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">主料和辅料先按样衣阶段冻结。真实采购执行、库存状态和成本归集后续再沿这份依据向下游传递。</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => addMaterialRow('main')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.bomDetail.actions.addMainMaterial')}</button>
                <button type="button" onClick={() => addMaterialRow('auxiliary')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{t('page.bomDetail.actions.addAuxMaterial')}</button>
                <button type="button" onClick={resetMaterials} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <RotateCcw size={14} />
                  {t('page.bomDetail.restartSampling')}
                </button>
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
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-emerald-400"
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
          </SectionCard>

          <div className="flex justify-end">
            <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
              <Save size={14} />
              {saving ? t('page.bomDetail.saving') : t('common.save')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <ApprovalTimeline title={t('page.bomDetail.approvalLog')} logs={approvalLogs} loading={approvalLoading} />
      )}

      {activeTab === 'flow' && (
        <SectionCard title="流程图" hint="样衣 BOM 的角色是技术冻结，不是最终工艺发放。这个位置要把上下游责任边界讲清楚。">
          <div className="grid gap-4 lg:grid-cols-5">
            {[
              {
                icon: FileStack,
                title: '打样通知',
                detail: '业务把样衣需求、图片、附件、交期和颜色尺码要求发下来。',
              },
              {
                icon: Workflow,
                title: '打样总览',
                detail: '统一确认这张样目前走到哪一步，有哪些样衣明细和主辅料要求。',
              },
              {
                icon: Boxes,
                title: '样衣 BOM',
                detail: '在这里冻结颜色组、主辅料和图纸说明，形成技术与材料依据。',
              },
              {
                icon: Factory,
                title: '大货核版',
                detail: '样衣确认通过后，再转入大货前的技术确认和问题点收口。',
              },
              {
                icon: ArrowRight,
                title: '工艺指示书 / 计划',
                detail: '最后才继续进入工艺发放和生产计划，不让样衣依据越权替代后续单据。',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="w-fit rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
                  <item.icon size={18} />
                </div>
                <h4 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-xs leading-6 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
