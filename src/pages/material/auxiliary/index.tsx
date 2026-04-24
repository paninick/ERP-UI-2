import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as auxiliaryApi from '@/api/auxiliary';
import * as supplierApi from '@/api/supplier';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: auxiliaryApi.listAuxiliary,
  get: auxiliaryApi.getAuxiliary,
  add: auxiliaryApi.addAuxiliary,
  update: auxiliaryApi.updateAuxiliary,
  remove: auxiliaryApi.delAuxiliary,
};

export default function AuxiliaryPage() {
  const auxiliaryType = useDictOptions('erp_auxiliary_material_type');
  const unitOptions = useDictOptions('erp_unit');
  const supplyMethod = useDictOptions('erp_supply_method');

  const columns = [
    {key: 'auxiliaryMaterialNo', title: '辅料编号'},
    {key: 'name', title: '名称'},
    {
      key: 'auxiliaryMaterialType',
      title: '类型',
      render: (value: string) => {
        const tag = auxiliaryType.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {key: 'substance', title: '材质'},
    {key: 'size', title: '规格'},
    {
      key: 'unit',
      title: '单位',
      render: (value: string) => unitOptions.labelMap[String(value)] || value || '-',
    },
    {
      key: 'supplyMethod',
      title: '供应方式',
      render: (value: string) => supplyMethod.labelMap[String(value)] || value || '-',
    },
    {key: 'supplierName', title: '供应商'},
  ];

  const searchFields = [
    {name: 'auxiliaryMaterialNo', label: '辅料编号'},
    {name: 'name', label: '名称'},
    {name: 'auxiliaryMaterialType', label: '类型', type: 'select' as const, options: auxiliaryType.options},
  ];

  const formFields = [
    {name: 'auxiliaryMaterialNo', label: '辅料编号'},
    {name: 'name', label: '名称'},
    {name: 'auxiliaryMaterialType', label: '类型', type: 'select' as const, options: auxiliaryType.options},
    {name: 'substance', label: '材质'},
    {name: 'size', label: '规格'},
    {name: 'unit', label: '单位', type: 'select' as const, options: unitOptions.options},
    {name: 'supplyMethod', label: '供应方式', type: 'select' as const, options: supplyMethod.options},
    {
      name: 'supplierId',
      label: '供应商',
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await supplierApi.listSupplier({pageNum: 1, pageSize: 200});
        return (res.rows || []).map((s: any) => ({value: String(s.id), label: s.supplierName || String(s.id)}));
      },
    },
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="辅料管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
