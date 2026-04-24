import {AlertTriangle} from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as materialApi from '@/api/material';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: materialApi.listMainMaterial,
  get: materialApi.getMainMaterial,
  add: materialApi.addMainMaterial,
  update: materialApi.updateMainMaterial,
  remove: materialApi.delMainMaterial,
};

export default function MainMaterialPage() {
  const materialType = useDictOptions('erp_main_material_type');
  const supplyMethod = useDictOptions('erp_supply_method');
  const unitOptions = useDictOptions('erp_unit');

  const columns = [
    {key: 'mainMaterialNo', title: '物料编号'},
    {key: 'name', title: '物料名称'},
    {
      key: 'mainMaterialType',
      title: '主料类型',
      render: (value: string) => materialType.labelMap[String(value)] || value || '-',
    },
    {key: 'composition', title: '成分'},
    {key: 'width', title: '幅宽'},
    {key: 'weight', title: '克重'},
    {
      key: 'unit',
      title: '单位',
      render: (value: string) => unitOptions.labelMap[String(value)] || value || '-',
    },
    {
      key: 'supplyMethod',
      title: '供货方式',
      render: (value: string) => supplyMethod.labelMap[String(value)] || value || '-',
    },
    {key: 'price', title: '单价', render: (value: number) => value ? `¥${value}` : '-'},
    {
      key: 'safeStockQty',
      title: '安全库存',
      render: (value: number) => value?.toFixed(2) || '-',
    },
    {
      key: 'currentStockQty',
      title: '当前库存',
      render: (value: number, record: any) => {
        const safe = record.safeStockQty;
        if (value === undefined || value === null || safe === undefined || safe === null) {
          return value?.toFixed(2) || '-';
        }
        if (value < safe) {
          return (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle size={14} />
              <span className="font-medium">{value.toFixed(2)}</span>
            </div>
          );
        }
        return <span className="text-green-600">{value.toFixed(2)}</span>;
      },
    },
    {
      key: 'stockAlert',
      title: '预警',
      render: (_: any, record: any) => {
        const current = record.currentStockQty;
        const safe = record.safeStockQty;
        if (current === undefined || current === null || safe === undefined || safe === null) {
          return '-';
        }
        if (current < safe) {
          return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">低于安全库存</span>;
        }
        return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">正常</span>;
      },
    },
    {key: 'createTime', title: '创建时间'},
  ];

  const searchFields = [
    {name: 'mainMaterialNo', label: '物料编号'},
    {name: 'name', label: '物料名称'},
    {name: 'mainMaterialType', label: '主料类型', type: 'select' as const, options: materialType.options},
  ];

  const formFields = [
    {name: 'mainMaterialNo', label: '物料编号', required: true},
    {name: 'name', label: '物料名称', required: true},
    {name: 'mainMaterialType', label: '主料类型', type: 'select' as const, options: materialType.options},
    {name: 'composition', label: '成分'},
    {name: 'width', label: '幅宽'},
    {name: 'weight', label: '克重'},
    {name: 'yarnCount', label: '纱支'},
    {name: 'unit', label: '单位', type: 'select' as const, options: unitOptions.options},
    {name: 'supplyMethod', label: '供货方式', type: 'select' as const, options: supplyMethod.options},
    {name: 'price', label: '单价', type: 'number' as const},
    {name: 'safeStockQty', label: '安全库存', type: 'number' as const},
    {name: 'minStockQty', label: '最低库存', type: 'number' as const},
    {name: 'maxStockQty', label: '最高库存', type: 'number' as const},
    {name: 'minOrderQty', label: '最小订货量', type: 'number' as const},
    {name: 'purchasePrice', label: '采购价', type: 'number' as const},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="主料管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
