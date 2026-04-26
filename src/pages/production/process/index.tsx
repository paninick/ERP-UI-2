import {useCallback, useEffect, useMemo, useState} from 'react';
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

const yesNoOptions = [
  {value: '0', label: '否'},
  {value: '1', label: '是'},
];

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

export default function ProcessRoutePage() {
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
      toast.error(error.message || '加载工艺路线失败');
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
      toast.error(error.message || '加载路线详情失败');
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
      toast.error('请填写工艺路线名称');
      return;
    }
    if (!form.productType) {
      toast.error('请选择产品类型');
      return;
    }
    if (items.length === 0) {
      toast.error('请至少添加一道工序');
      return;
    }
    if (items.some((item) => !item.processId)) {
      toast.error('路线明细中存在未选择的工序');
      return;
    }
    if (items.some((item) => item.requiredMode === 'CONDITIONAL' && !item.conditionCode)) {
      toast.error('条件工序必须选择条件编码');
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
        toast.success('工艺路线已更新');
      } else {
        await processRouteApi.addProcessRoute(payload);
        toast.success('工艺路线已新增');
      }
      setModalOpen(false);
      loadRoutes();
    } catch (error: any) {
      toast.error(error.message || '保存工艺路线失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: any) => {
    if (!(await confirm(`确认删除工艺路线「${record.routeName}」吗？`))) return;
    try {
      await processRouteApi.delProcessRoute(String(record.id));
      toast.success('工艺路线已删除');
      loadRoutes();
    } catch (error: any) {
      toast.error(error.message || '删除工艺路线失败');
    }
  };

  const routeColumns = [
    {key: 'routeName', title: '工艺路线名称'},
    {
      key: 'productType',
      title: '产品类型',
      render: (value: string) => productType.toTag(value).label,
    },
    {key: 'productCode', title: '款号/产品编码'},
    {
      key: 'isDefault',
      title: '默认路线',
      render: (value: number | string) => (String(value ?? '0') === '1' ? '是' : '否'),
    },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {key: 'createTime', title: '创建时间'},
    {
      key: 'actions',
      title: '操作',
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
            编辑
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(record);
            }}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">工艺路线</h2>
          <p className="mt-1 text-sm text-slate-500">
            按产品类型、款号维护标准工序顺序；照灯/灯检、印花、绣花等先在工序定义中维护后再加入路线。
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          新增路线
        </button>
      </div>

      <SearchForm
        onSearch={() => setPagination((prev) => ({...prev, pageNum: 1}))}
        onReset={() => {
          setSearch({routeName: '', productType: '', status: ''});
          setPagination((prev) => ({...prev, pageNum: 1}));
        }}
      >
        <SearchField label="路线名称">
          <input
            value={search.routeName}
            onChange={(event) => setSearch((prev) => ({...prev, routeName: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="请输入路线名称"
          />
        </SearchField>
        <SearchField label="产品类型">
          <select
            value={search.productType}
            onChange={(event) => setSearch((prev) => ({...prev, productType: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">全部</option>
            {productType.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>
        <SearchField label="状态">
          <select
            value={search.status}
            onChange={(event) => setSearch((prev) => ({...prev, status: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">全部</option>
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
        title={form.id ? '编辑工艺路线' : '新增工艺路线'}
        onClose={() => setModalOpen(false)}
        width="960px"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">路线名称 *</span>
              <input
                value={form.routeName}
                onChange={(event) => setForm((prev) => ({...prev, routeName: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">产品类型 *</span>
              <select
                value={form.productType}
                onChange={(event) => setForm((prev) => ({...prev, productType: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              >
                <option value="">请选择</option>
                {productType.options.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">款号/产品编码</span>
              <input
                value={form.productCode}
                onChange={(event) => setForm((prev) => ({...prev, productCode: event.target.value}))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-slate-600">默认路线</span>
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
                <span className="text-slate-600">状态</span>
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
            <span className="text-slate-600">备注</span>
            <textarea
              value={form.remark}
              onChange={(event) => setForm((prev) => ({...prev, remark: event.target.value}))}
              className="h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
            />
          </label>

          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="font-semibold text-slate-800">路线工序明细</h3>
                <p className="text-xs text-slate-500">顺序会按 10、20、30 自动写入 sortOrder，方便后续插入工序。</p>
              </div>
              <button
                type="button"
                onClick={addRouteItem}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
              >
                <Plus size={13} />
                添加工序
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-sm">
                <thead className="bg-white">
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-3 py-2">序号</th>
                    <th className="px-3 py-2">工序</th>
                    <th className="px-3 py-2">控制点</th>
                    <th className="px-3 py-2">模式</th>
                    <th className="px-3 py-2">条件</th>
                    <th className="px-3 py-2">外协</th>
                    <th className="px-3 py-2">质检</th>
                    <th className="px-3 py-2">检针</th>
                    <th className="px-3 py-2">损耗</th>
                    <th className="px-3 py-2">计件</th>
                    <th className="px-3 py-2">允许强制开工</th>
                    <th className="px-3 py-2">完成比例%</th>
                    <th className="px-3 py-2">标准周期h</th>
                    <th className="px-3 py-2">备注</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="px-3 py-10 text-center text-slate-400">
                        暂无工序，请先添加。照灯/灯检等节点需先在工序定义中维护。
                      </td>
                    </tr>
                  ) : items.map((item, index) => {
                    const selectedProcess = processMap[String(item.processId)];
                    return (
                      <tr key={`${item.id || 'new'}-${index}`} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-slate-500">{(index + 1) * 10}</td>
                        <td className="px-3 py-2">
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
                            className="w-44 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            <option value="">请选择</option>
                            {processDefs.map((process) => (
                              <option key={process.id} value={process.id}>
                                {process.processCode ? `${process.processCode} ` : ''}{process.processName}
                              </option>
                            ))}
                          </select>
                          {selectedProcess?.needQualityCheck === 1 && (
                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">质检</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.isControlPoint ?? 0)}
                            onChange={(event) => updateItem(index, {isControlPoint: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.requiredMode || 'REQUIRED'}
                            onChange={(event) => updateItem(index, {requiredMode: event.target.value})}
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {requiredMode.options.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.conditionCode || ''}
                            onChange={(event) => updateItem(index, {conditionCode: event.target.value})}
                            disabled={(item.requiredMode || 'REQUIRED') !== 'CONDITIONAL'}
                            className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            {conditionCode.options.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.isOutsource ?? 0)}
                            onChange={(event) => updateItem(index, {isOutsource: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.qcRequired ?? 0)}
                            onChange={(event) => updateItem(index, {qcRequired: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.needleCheckRequired ?? 0)}
                            onChange={(event) => updateItem(index, {needleCheckRequired: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.lossTracked ?? 0)}
                            onChange={(event) => updateItem(index, {lossTracked: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.pieceWageApplicable ?? 1)}
                            onChange={(event) => updateItem(index, {pieceWageApplicable: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={String(item.allowForceStart ?? 0)}
                            onChange={(event) => updateItem(index, {allowForceStart: Number(event.target.value)})}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          >
                            {yesNoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.requireCompleteRatio ?? 100}
                            onChange={(event) => updateItem(index, {requireCompleteRatio: Number(event.target.value)})}
                            className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.standardCycleHours ?? ''}
                            onChange={(event) => updateItem(index, {
                              standardCycleHours: event.target.value === '' ? undefined : Number(event.target.value),
                            })}
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={item.remark || ''}
                            onChange={(event) => updateItem(index, {remark: event.target.value})}
                            className="w-36 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(index, 1)}
                              disabled={index === items.length - 1}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="rounded p-1 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存路线'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
