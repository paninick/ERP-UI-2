import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as customerApi from '@/api/customer';

const api = {
  list: customerApi.listCustomer,
  get: customerApi.getCustomer,
  add: customerApi.addCustomer,
  update: customerApi.updateCustomer,
  remove: customerApi.delCustomer,
};

const columns = [
  {key: 'customerNo', title: '客户编号'},
  {key: 'customerName', title: '客户名称'},
  {key: 'nationality', title: '国籍'},
  {key: 'contacts', title: '联系人'},
  {key: 'phone', title: '电话'},
  {key: 'email', title: '邮箱'},
  {key: 'createTime', title: '创建时间'},
];

const searchFields = [
  {name: 'customerNo', label: '客户编号'},
  {name: 'customerName', label: '客户名称'},
];

const formFields = [
  {name: 'customerNo', label: '客户编号', required: true},
  {name: 'customerName', label: '客户名称', required: true},
  {name: 'nationality', label: '国籍'},
  {name: 'contacts', label: '联系人'},
  {name: 'phone', label: '电话'},
  {name: 'email', label: '邮箱'},
  {name: 'address', label: '地址'},
  {name: 'remark', label: '备注', type: 'textarea' as const},
];

export default function CustomerPage() {
  return (
    <CrudPage
      title="客户管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
