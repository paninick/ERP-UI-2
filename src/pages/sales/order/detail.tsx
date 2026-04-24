import {useEffect, useMemo, useState} from 'react';
import {NavLink, useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Download, Plus, Printer, Save} from 'lucide-react';
import * as salesApi from '@/api/sales';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import {toast} from '@/components/ui/Toast';
import {createRowId, readDraft, writeDraft} from '@/utils/detailDraft';

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
  parts: Array<{id: string; partName: string; colorNo: string; colorName: string}>;
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
  const {id = 'new'} = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [draft, setDraft] = useState<SalesDetailDraft | null>(null);

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
    [draft]
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
      bulkRows: prev.bulkRows.map((item) => item.id === rowId ? {...item, [field]: value} : item),
    } : prev);
  };

  const addBulkRow = () => {
    setDraft((prev) => prev ? {
      ...prev,
      bulkRows: [
        ...prev.bulkRows,
        {id: createRowId('bulk'), bulkOrderNo: '', colorName: '', xs: '', s: '', m: '', l: ''},
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
          title: `主色 - ${prev.baseInfo.bulkOrderNo || '新配色'}`,
          parts: [{id: createRowId('color-part'), partName: '', colorNo: '', colorName: ''}],
        },
      ],
    } : prev);
  };

  const updateColorGroupTitle = (groupId: string, value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => group.id === groupId ? {...group, title: value} : group),
    } : prev);
  };

  const updateColorPart = (groupId: string, partId: string, field: 'partName' | 'colorNo' | 'colorName', value: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        return {
          ...group,
          parts: group.parts.map((part) => part.id === partId ? {...part, [field]: value} : part),
        };
      }),
    } : prev);
  };

  const addColorPart = (groupId: string) => {
    setDraft((prev) => prev ? {
      ...prev,
      colorGroups: prev.colorGroups.map((group) => (
        group.id === groupId
          ? {...group, parts: [...group.parts, {id: createRowId('color-part'), partName: '', colorNo: '', colorName: ''}]}
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
      materials: prev.materials.map((item) => item.id === materialId ? {...item, [field]: value} : item),
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
      cartons: prev.cartons.map((item) => item.id === cartonId ? {...item, [field]: value} : item),
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
        await salesApi.updateSalesOrder({...payload, id: Number(id)});
      }
      toast.success('销售订单详情已保存');
    } catch (error: any) {
      toast.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">加载中...</div>;
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
            aria-label="返回销售订单列表"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">销售订单详情</h2>
            <p className="text-sm text-slate-500">恢复业务版详情页，保留大货信息、颜色组、物料、纸箱与图片附件容器。</p>
          </div>
        </div>
        <div className="flex gap-2">
          <NavLink
            to={`/sales/order/print/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} />
            打印单
          </NavLink>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} />
            打印
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} />
            导出
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <DocumentCodeBoard
        title="单号与打印规则"
        description="销售端打印以销售单号和打印款号为主，打样编号和客户款号作为辅助追溯字段。"
        items={[
          {
            label: '销售主号',
            value: draft.baseInfo.salesNo,
            helper: '客户、业务、计划排产都应围绕这个主号追踪。',
            tone: 'primary',
          },
          {
            label: '打印款号',
            value: draft.baseInfo.bulkOrderNo,
            helper: '外发资料、包装资料、客户确认时优先展示。',
            tone: 'secondary',
          },
          {
            label: '打样编号',
            value: draft.baseInfo.printNo,
            helper: '样办、纸样、打印图纸的参考号。',
          },
          {
            label: '客户/打样款号',
            value: draft.baseInfo.patternNo || draft.baseInfo.productName,
            helper: '用于对照客款与内部款式，不替代销售单号。',
          },
        ]}
      />

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">基础信息</h3>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ['salesNo', '销售单号'],
            ['printNo', '打样编号'],
            ['customerName', '客户名称'],
            ['categoryName', '品类'],
            ['patternNo', '打样款号'],
            ['createDate', '制单日期'],
            ['salesName', '业务员'],
            ['totalQty', '总数量'],
            ['bulkOrderNo', '大货款号'],
            ['productName', '品名'],
            ['deliveryDate', '交货日期'],
            ['cmtPrice', 'CMT 价格'],
            ['fobPrice', 'FOB 价格'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="mb-1 block text-sm text-slate-500">{label}</label>
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
            <label className="mb-1 block text-sm text-slate-500">留档图片</label>
            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              {draft.baseInfo.orderImageName || '图片占位，业务容器保留'}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-500">备注</label>
            <textarea
              value={draft.baseInfo.remark}
              onChange={(event) => updateBaseInfo('remark', event.target.value)}
              className="h-44 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">大货信息</h3>
            <p className="text-sm text-slate-500">保留尺码分配与大货颜色维度，避免销售详情只剩主表字段。</p>
          </div>
          <button
            type="button"
            onClick={addBulkRow}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            新增大货行
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">大货款号</th>
                <th className="px-3 py-3">颜色</th>
                <th className="px-3 py-3">XS</th>
                <th className="px-3 py-3">S</th>
                <th className="px-3 py-3">M</th>
                <th className="px-3 py-3">L</th>
                <th className="px-3 py-3">小计</th>
                <th className="px-3 py-3">操作</th>
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
                      删除
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
            <h3 className="text-lg font-semibold text-slate-900">颜色组信息</h3>
            <p className="text-sm text-slate-500">恢复颜色组和部位配色容器，避免后续物料映射失联。</p>
          </div>
          <button
            type="button"
            onClick={addColorGroup}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            新增颜色组
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {draft.colorGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              暂无颜色组，业务容器已恢复，可直接新增。
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
                    <th className="py-2">部位</th>
                    <th className="py-2">色番</th>
                    <th className="py-2">色名</th>
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
                + 新增部位颜色
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">物料信息</h3>
            <p className="text-sm text-slate-500">主料、辅料分表恢复，方便销售侧把颜色组和物料需求对齐到后续 BOM。</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => addMaterial('main')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">新增主料</button>
            <button type="button" onClick={() => addMaterial('auxiliary')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">新增辅料</button>
          </div>
        </div>

        {[
          {title: '主料信息', rows: mainMaterials},
          {title: '辅料信息', rows: auxiliaryMaterials},
        ].map(({title, rows}) => (
          <div key={title} className="mb-6 last:mb-0">
            <h4 className="mb-3 font-medium text-slate-800">{title}</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    {['材料编号', '材料名称', '主色', '部位', '色番', '色名', '单耗', '损耗%', '订单数', '需求量', '备注', '操作'].map((header) => (
                      <th key={header} className="px-3 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(rows as MaterialRow[]).length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-3 py-8 text-center text-slate-400">暂无数据</td>
                    </tr>
                  ) : (rows as MaterialRow[]).map((item) => (
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
                        <button type="button" onClick={() => removeMaterial(item.id)} className="text-xs text-red-500 hover:text-red-600">删除</button>
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
            <h3 className="text-lg font-semibold text-slate-900">包装信息</h3>
            <p className="text-sm text-slate-500">纸箱信息容器恢复，后续可继续接真实箱规与件件重量逻辑。</p>
          </div>
          <button
            type="button"
            onClick={addCarton}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            新增纸箱
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {['日期', '成衣品番', '胶袋种类', '胶袋尺寸', '胶袋数量', '纸箱唛头', '类型胃号', '纸箱尺寸', '纸箱数量', '每箱数量', '单件毛重'].map((header) => (
                  <th key={header} className="px-3 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.cartons.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-slate-400">暂无纸箱数据</td>
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
