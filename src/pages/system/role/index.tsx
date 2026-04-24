import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as systemApi from '@/api/system';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: systemApi.listRole,
  get: systemApi.getRole,
  add: systemApi.addRole,
  update: systemApi.updateRole,
  remove: systemApi.delRole,
  rowKey: 'roleId',
};

export default function SystemRolePage() {
  const commonStatus = useDictOptions('sys_common_status', [
    {value: '0', label: '正常'},
    {value: '1', label: '停用'},
  ]);

  const columns = [
    {key: 'roleName', title: '角色名称'},
    {key: 'roleKey', title: '权限字符'},
    {key: 'roleSort', title: '排序'},
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = commonStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {key: 'createTime', title: '创建时间'},
    {key: 'remark', title: '备注'},
  ];

  const searchFields = [
    {name: 'roleName', label: '角色名称'},
    {name: 'roleKey', label: '权限字符'},
    {name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options},
  ];

  const formFields = [
    {name: 'roleName', label: '角色名称', required: true},
    {name: 'roleKey', label: '权限字符', required: true},
    {name: 'roleSort', label: '排序', type: 'number' as const},
    {name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="角色管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
