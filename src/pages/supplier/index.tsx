import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as supplierApi from '@/api/supplier';

const api = {
  list: supplierApi.listSupplier,
  get: supplierApi.getSupplier,
  add: supplierApi.addSupplier,
  update: supplierApi.updateSupplier,
  remove: supplierApi.delSupplier,
};

const columns = [
  {key: 'supplierNo', title: '供应商编号'},
  {key: 'supplierName', title: '供应商名称'},
  {key: 'contacts', title: '联系人'},
  {key: 'phone', title: '电话'},
  {key: 'category', title: '类别'},
  {key: 'rating', title: '评级'},
  {key: 'createTime', title: '创建时间'},
];

const searchFields = [
  {name: 'supplierNo', label: '供应商编号'},
  {name: 'supplierName', label: '供应商名称'},
];

const formFields = [
  {name: 'supplierNo', label: '供应商编号', required: true},
  {name: 'supplierName', label: '供应商名称', required: true},
  {name: 'contacts', label: '联系人'},
  {name: 'phone', label: '电话'},
  {name: 'email', label: '邮箱'},
  {name: 'category', label: '类别'},
  {name: 'address', label: '地址'},
  {name: 'remark', label: '备注', type: 'textarea' as const},
];

export default function SupplierPage() {
  return (
    <CrudPage
      title="供应商管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
