import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as employeeApi from '@/api/employee';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: employeeApi.listEmployee,
  get: employeeApi.getEmployee,
  add: employeeApi.addEmployee,
  update: employeeApi.updateEmployee,
  remove: employeeApi.delEmployee,
};

export default function EmployeePage() {
  const employeeStatus = useDictOptions('sys_common_status', [
    {value: '0', label: '在职'},
    {value: '1', label: '离职'},
  ]);

  const columns = [
    {key: 'employeeName', title: '姓名'},
    {key: 'employeeNo', title: '工号'},
    {key: 'department', title: '部门'},
    {key: 'position', title: '职位'},
    {key: 'phone', title: '联系电话'},
    {key: 'entryDate', title: '入职日期'},
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = employeeStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    {name: 'employeeName', label: '姓名'},
    {name: 'employeeNo', label: '工号'},
    {name: 'department', label: '部门'},
  ];

  const formFields = [
    {name: 'employeeName', label: '姓名', required: true},
    {name: 'employeeNo', label: '工号', required: true},
    {name: 'department', label: '部门'},
    {name: 'position', label: '职位'},
    {name: 'phone', label: '联系电话'},
    {name: 'entryDate', label: '入职日期', type: 'date' as const},
    {name: 'status', label: '状态', type: 'select' as const, options: employeeStatus.options},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="员工管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
