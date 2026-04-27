import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';
import * as processDefApi from '@/api/processDef';
import * as processRouteApi from '@/api/processRoute';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, {SearchField} from '@/components/ui/SearchForm';
import {confirm} from '@/components/ui/ConfirmDialog';
import {toast} from '@/components/ui/Toast';
import {useDictOptions} from '@/hooks/useDictOptions';

interface ProcessDef {
  id: number;
  processCode?: string;
  processName?: string;
  processType?: string;
  needQualityCheck?: number;
  enableOutsource?: number;
  defaultPrice?: number;
}

interface RouteItem {
  id?: number;
  routeId?: number;
  processId?: number;
  sortOrder?: number;
  isControlPoint?: number;
  requireCompleteRatio?: number;
  allowForceStart?: number;
  isOutsource?: number;
  standardCycleHours?: number;
  requiredMode?: string;
  conditionCode?: string;
  qcRequired?: number;
  needleCheckRequired?: number;
  lossTracked?: number;
  pieceWageApplicable?: number;
  remark?: string;
}

interface RouteForm {
  id?: number;
  routeName: string;
  productType: string;
  productCode: string;
  isDefault: number;
  status: string;
  remark: string;
}

const emptyRoute: RouteForm = {
  routeName: '',
  productType: '',
  productCode: '',
  isDefault: 0,
  status: '0',
  remark: '',
};

const fallbackProductTypes = [
  {value: 'SWEATER', label: '毛衫'},
  {value: 'SPLICE', label: '拼接款'},
  {value: 'KNIT_TOP', label: '普通针织衫'},
  {value: 'OTHER', label: '其他'},
];

const fallbackStatus = [
  {value: '0', label: '启用'},
  {value: '1', label: '停用'},
];

const requiredModeOptions = [
  {value: 'REQUIRED', label: '必选'},
  {value: 'OPTIONAL', label: '可选'},
  {value: 'CONDITIONAL', label: '条件'},
];

const conditionCodeOptions = [
  {value: '', label: '无'},
  {value: 'HAS_PRINT', label: '有印花'},
  {value: 'HAS_EMBROIDERY', label: '有绣花'},
  {value: 'JAPAN_ORDER', label: '日单'},
  {value: 'NEED_LIGHT_INSPECTION', label: '需照灯/灯检'},
  {value: 'THIRD_PARTY_INSPECTION', label: '检品公司'},
];

function normalizeRows(res: any) {
  return res?.rows || res?.data || [];
}

function toNumber(value: any, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

interface StepCardProps {
  step: number;
  sortOrder: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
}

function StepCard({ step, sortOrder, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onRemove, children }: StepCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
            {step}
          </span>
          <span className="text-[10px] text-slate-400">{sortOrder}</span>
        </div>
        {children}
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProcessRoutePage() {
  const { t } = useTranslation();
  const S = 'page.processRoute';
  const productType = useDictOptions('erp_product_family', fallbackProductTypes);
  const status = useDictOptions('sys_normal_disable', fallbackStatus);
  const requiredMode = useDictOptions('erp_route_item_required_mode', requiredModeOptions);
  const conditionCode = useDictOptions('erp_route_condition_code', conditionCodeOptions);

  const [routes, setRoutes] = useState<any[]>([]);
  const [processDefs, setProcessDefs] = useState<ProcessDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<RouteForm>(emptyRoute);
  const [items, setItems] = useState<RouteItem[]>([]);
  const [search, setSearch] = useState({routeName: '', productType: '', status: ''});
  const [pagination, setPagination] = useState({pageNum: 1, pageSize: 10, total: 0});

  const yesNoOptions = useMemo(() => [
    {value: '0', label: t('common.no')},
    {value: '1', label: t('common.yes')},
  ], [t]);

  const processMap = useMemo(() => {
    const map: Record<string, ProcessDef> = {};
    processDefs.forEach((item) => {
      map[String(item.id)] = item;
    });
    return map;
  }, [processDefs]);

  const loadProcessDefs = useCallback(async () => {
    const res: any = await processDefApi.listProcessDef({
      pageNum: 1,
      pageSize: 999,
      status: '0',
    });
    setProcessDefs(normalizeRows(res));
  }, []);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await processRouteApi.listProcessRoute({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...search,
      });
      setRoutes(res.rows || []);
      setPagination((prev) => ({...prev, total: res.total || 0}));
    } catch (error: any) {
      toast.error(error.message || t(`${S}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, search]);

  useEffect(() => {
    loadProcessDefs().catch(() => {});
  }, [loadProcessDefs]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const openCreate = () => {
    setForm(emptyRoute);
    setItems([]);
    setModalOpen(true);
  };

  const openEdit = async (record: any) => {
    try {
      const res: any = await processRouteApi.getProcessRoute(record.id);
      setForm({
        id: record.id,
        routeName: res.data?.routeName ?? record.routeName ?? '',
        productType: res.data?.productType ?? record.productType ?? '',
        productCode: res.data?.productCode ?? record.productCode ?? '',
        isDefault: toNumber(res.data?.isDefault ?? record.isDefault, 0),
        status: String(res.data?.status ?? record.status ?? '0'),
        remark: res.data?.remark ?? record.remark ?? '',
      });
      setItems((res.items || []).map((item: RouteItem, index: number) => ({
        ...item,
        sortOrder: item.sortOrder ?? (index + 1) * 10,
      })));
      setModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || t(`${S}.loadDetailFailed`));
    }
  };

  const addRouteItem = () => {
    const first = processDefs[0];
    setItems((prev) => [
      ...prev,
      {
        processId: first?.id,
        sortOrder: (prev.length + 1) * 10,
        isControlPoint: 0,
        requireCompleteRatio: 100,
        allowForceStart: 0,
        isOutsource: first?.enableOutsource === 1 ? 1 : 0,
        standardCycleHours: undefined,
        requiredMode: 'REQUIRED',
        conditionCode: '',
        qcRequired: first?.needQualityCheck === 1 ? 1 : 0,
        needleCheckRequired: 0,
        lossTracked: 0,
        pieceWageApplicable: 1,
        remark: '',
      },
    ]);
  };

  const updateItem = (index: number, patch: Partial<RouteItem>) => {
    setItems((prev) => prev.map((item, currentIndex) => (currentIndex === index ? {...item, ...patch} : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const normalizedItems = () => items.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10,
    processId: toNumber(item.processId),
    isControlPoint: toNumber(item.isControlPoint),
    requireCompleteRatio: toNumber(item.requireCompleteRatio, 100),
    allowForceStart: toNumber(item.allowForceStart),
    isOutsource: toNumber(item.isOutsource),
    standardCycleHours: item.standardCycleHours === undefined || item.standardCycleHours === null
      ? undefined
      : toNumber(item.standardCycleHours),
    requiredMode: item.requiredMode || 'REQUIRED',
    conditionCode: item.conditionCode || undefined,
    qcRequired: toNumber(item.qcRequired),
    needleCheckRequired: toNumber(item.needleCheckRequired),
    lossTracked: toNumber(item.lossTracked),
    pieceWageApplicable: item.pieceWageApplicable === undefined || item.pieceWageApplicable === null
      ? 1
      : toNumber(item.pieceWageApplicable, 1),
  }));

  const handleSave = async () => {
    if (!form.routeName.trim()) {
      toast.error(t(`${S}.validation.routeNameRequired`));
      return;
    }
    if (!form.productType) {
      toast.error(t(`${S}.validation.productTypeRequired`));
      return;
    }
    if (items.length === 0) {
      toast.error(t(`${S}.validation.itemsRequired`));
      return;
    }
    if (items.some((item) => !item.processId)) {
      toast.error(t(`${S}.validation.processRequired`));
      return;
    }
    if (items.some((item) => item.requiredMode === 'CONDITIONAL' && !item.conditionCode)) {
      toast.error(t(`${S}.validation.conditionRequired`));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        route: {
          ...form,
          isDefault: toNumber(form.isDefault),
        },
        items: normalizedItems(),
      };
      if (form.id) {
        await processRouteApi.updateProcessRoute(payload);
        toast.success(t(`${S}.updateSuccess`));
      } else {
        await processRouteApi.addProcessRoute(payload);
        toast.success(t(`${S}.addSuccess`));
      }
      setModalOpen(false);
      loadRoutes();
    } catch (error: any) {
      toast.error(error.message || t(`${S}.saveFailed`));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: any) => {
    if (!(await confirm(t(`${S}.deleteConfirm`, { name: record.routeName })))) return;
    try {
      await processRouteApi.delProcessRoute(String(record.id));
      toast.success(t(`${S}.deleteSuccess`));
      loadRoutes();
    } catch (error: any) {
      toast.error(error.message || t(`${S}.deleteFailed`));
    }
  };

  const routeColumns = [
    {key: 'routeName', title: t(`${S}.routeName`)},
    {
      key: 'productType',
      title: t(`${S}.productType`),
      render: (value: string) => productType.toTag(value).label,
    },
    {key: 'productCode', title: t(`${S}.productCode`)},
    {
      key: 'isDefault',
      title: t(`${S}.isDefault`),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {
      key: 'status',
      title: t(`${S}.status`),
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {key: 'createTime', title: t(`${S}.createTime`)},
    {
      key: 'actions',
      title: t(`${S}.actions`),
      width: '150px',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              openEdit(record);
            }}
            className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
          >
            {t(`${S}.edit`)}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(record);
            }}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            {t(`${S}.delete`)}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t(`${S}.title`)}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t(`${S}.description`)}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          {t(`${S}.newRoute`)}
        </button>
      </div>

      <SearchForm
        onSearch={() => setPagination((prev) => ({...prev, pageNum: 1}))}
        onReset={() => {
          setSearch({routeName: '', productType: '', status: ''});
          setPagination((prev) => ({...prev, pageNum: 1}));
        }}
      >
        <SearchField label={t(`${S}.searchRouteName`)}>
          <input
            value={search.routeName}
            onChange={(event) => setSearch((prev) => ({...prev, routeName: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.searchPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.searchProductType`)}>
          <select
            value={search.productType}
            onChange={(event) => setSearch((prev) => ({...prev, productType: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t(`${S}.searchAll`)}</option>
            {productType.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>
        <SearchField label={t(`${S}.searchStatus`)}>
          <select
            value={search.status}
            onChange={(event) => setSearch((prev) => ({...prev, status: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t(`${S}.searchAll`)}</option>
            {status.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>
      </SearchForm>

      <BaseTable columns={routeColumns} data={routes} loading={loading} onRowClick={openEdit} />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(pageNum, pageSize) => setPagination((prev) => ({...prev, pageNum, pageSize}))}
      />

      <BaseModal
        open={modalOpen}
        title={form.id ? t(`${S}.editTitle`) : t(`${S}.newTitle`)}
        onClose={() => setModalOpen(false)}
        width="960px"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">{t(`${S}.form.routeName`)}</span>
              <input
                value={form.routeName}
                onChange={(event) => setForm((prev) => ({...prev, routeName: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">{t(`${S}.form.productType`)}</span>
              <select
                value={form.productType}
                onChange={(event) => setForm((prev) => ({...prev, productType: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              >
                <option value="">{t(`${S}.form.selectPlaceholder`)}</option>
                {productType.options.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">{t(`${S}.form.productCode`)}</span>
              <input
                value={form.productCode}
                onChange={(event) => setForm((prev) => ({...prev, productCode: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-slate-600">{t(`${S}.form.isDefault`)}</span>
                <select
                  value={String(form.isDefault)}
                  onChange={(event) => setForm((prev) => ({...prev, isDefault: Number(event.target.value)}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                >
                  {yesNoOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-600">{t(`${S}.form.status`)}</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({...prev, status: event.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                >
                  {status.options.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="text-slate-600">{t(`${S}.form.remark`)}</span>
            <textarea
              value={form.remark}
              onChange={(event) => setForm((prev) => ({...prev, remark: event.target.value}))}
              className="h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
            />
          </label>

          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="font-semibold text-slate-800">{t(`${S}.routeItems.title`)}</h3>
                <p className="text-xs text-slate-500">{t(`${S}.routeItems.description`)}</p>
              </div>
              <button
                type="button"
                onClick={addRouteItem}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
              >
                <Plus size={13} />
                {t(`${S}.routeItems.addItem`)}
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {t(`${S}.routeItems.empty`)}
                </p>
              ) : (
                items.map((item, index) => {
                  const selectedProcess = processMap[String(item.processId)];
                  const isOutsource = (item.isOutsource ?? 0) === 1;
                  const isQc = (item.qcRequired ?? 0) === 1;
                  const isControlPoint = (item.isControlPoint ?? 0) === 1;
                  const modeLabel = requiredMode.toTag(item.requiredMode || 'REQUIRED').label;

                  return (
                    <StepCard
                      key={`${item.id || 'new'}-${index}`}
                      step={index + 1}
                      sortOrder={(index + 1) * 10}
                      canMoveUp={index > 0}
                      canMoveDown={index < items.length - 1}
                      onMoveUp={() => moveItem(index, -1)}
                      onMoveDown={() => moveItem(index, 1)}
                      onRemove={() => removeItem(index)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <select
                            value={item.processId || ''}
                            onChange={(event) => {
                              const process = processMap[event.target.value];
                              updateItem(index, {
                                processId: Number(event.target.value),
                                isOutsource: process?.enableOutsource === 1 ? 1 : item.isOutsource,
                                qcRequired: process?.needQualityCheck === 1 ? 1 : item.qcRequired,
                              });
                            }}
                            className="flex-1 max-w-xs rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                          >
                            <option value="">{t(`${S}.routeItems.selectProcess`)}</option>
                            {processDefs.map((process) => (
                              <option key={process.id} value={process.id}>
                                {process.processCode ? `${process.processCode} ` : ''}{process.processName}
                              </option>
                            ))}
                          </select>
                          {isControlPoint && (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">{t(`${S}.columns.controlPoint`)}</span>
                          )}
                          {isQc && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{t(`${S}.columns.qc`)}</span>
                          )}
                          {isOutsource && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{t(`${S}.columns.outsource`)}</span>
                          )}
                          <span className="text-xs text-slate-400">{modeLabel}</span>
                        </div>

                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700 select-none">
                            {t(`${S}.routeItems.toggleDetail`)}
                          </summary>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.controlPoint`)}</span>
                              <select
                                value={String(isControlPoint ? 1 : 0)}
                                onChange={(event) => updateItem(index, {isControlPoint: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.mode`)}</span>
                              <select
                                value={item.requiredMode || 'REQUIRED'}
                                onChange={(event) => updateItem(index, {requiredMode: event.target.value})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {requiredMode.options.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.condition`)}</span>
                              <select
                                value={item.conditionCode || ''}
                                onChange={(event) => updateItem(index, {conditionCode: event.target.value})}
                                disabled={(item.requiredMode || 'REQUIRED') !== 'CONDITIONAL'}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-400"
                              >
                                {conditionCode.options.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.outsource`)}</span>
                              <select
                                value={String(item.isOutsource ?? 0)}
                                onChange={(event) => updateItem(index, {isOutsource: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.qc`)}</span>
                              <select
                                value={String(item.qcRequired ?? 0)}
                                onChange={(event) => updateItem(index, {qcRequired: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.needleCheck`)}</span>
                              <select
                                value={String(item.needleCheckRequired ?? 0)}
                                onChange={(event) => updateItem(index, {needleCheckRequired: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.loss`)}</span>
                              <select
                                value={String(item.lossTracked ?? 0)}
                                onChange={(event) => updateItem(index, {lossTracked: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.pieceWage`)}</span>
                              <select
                                value={String(item.pieceWageApplicable ?? 1)}
                                onChange={(event) => updateItem(index, {pieceWageApplicable: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.forceStart`)}</span>
                              <select
                                value={String(item.allowForceStart ?? 0)}
                                onChange={(event) => updateItem(index, {allowForceStart: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              >
                                {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.completeRatio`)}</span>
                              <input
                                type="number"
                                value={item.requireCompleteRatio ?? 100}
                                onChange={(event) => updateItem(index, {requireCompleteRatio: Number(event.target.value)})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              />
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-slate-500">{t(`${S}.columns.cycleHours`)}</span>
                              <input
                                type="number"
                                value={item.standardCycleHours ?? ''}
                                onChange={(event) => updateItem(index, {
                                  standardCycleHours: event.target.value === '' ? undefined : Number(event.target.value),
                                })}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              />
                            </label>
                            <label className="flex items-center gap-2 text-xs sm:col-span-2 lg:col-span-2">
                              <span className="w-20 text-slate-500">{t(`${S}.remark`)}</span>
                              <input
                                value={item.remark || ''}
                                onChange={(event) => updateItem(index, {remark: event.target.value})}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                              />
                            </label>
                          </div>
                        </details>
                      </div>
                    </StepCard>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              {t(`${S}.cancel`)}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? t(`${S}.saving`) : t(`${S}.saveRoute`)}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
