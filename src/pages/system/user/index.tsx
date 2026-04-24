import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as systemApi from '@/api/system';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: systemApi.listUser,
  get: systemApi.getUser,
  add: systemApi.addUser,
  update: systemApi.updateUser,
  remove: systemApi.delUser,
  rowKey: 'userId',
};

export default function SystemUserPage() {
  const commonStatus = useDictOptions('sys_common_status', [
    {value: '0', label: '正常'},
    {value: '1', label: '停用'},
  ]);
  const userSex = useDictOptions('sys_user_sex', [
    {value: '0', label: '男'},
    {value: '1', label: '女'},
    {value: '2', label: '未知'},
  ]);

  const columns = [
    {key: 'userName', title: '用户名'},
    {key: 'nickName', title: '昵称'},
    {key: 'phonenumber', title: '手机号'},
    {key: 'email', title: '邮箱'},
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = commonStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {key: 'createTime', title: '创建时间'},
  ];

  const searchFields = [
    {name: 'userName', label: '用户名'},
    {name: 'phonenumber', label: '手机号'},
    {name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options},
  ];

  const formFields = [
    {name: 'userName', label: '用户名', required: true},
    {name: 'nickName', label: '昵称', required: true},
    {name: 'password', label: '密码（新增必填）'},
    {name: 'phonenumber', label: '手机号'},
    {name: 'email', label: '邮箱'},
    {name: 'sex', label: '性别', type: 'select' as const, options: userSex.options},
    {name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="用户管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
