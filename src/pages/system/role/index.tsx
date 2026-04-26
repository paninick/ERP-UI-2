import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as systemApi from '@/api/system';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: systemApi.listRole,
  get: systemApi.getRole,
  add: systemApi.addRole,
  update: systemApi.updateRole,
  remove: systemApi.delRole,
};

export default function SystemRolePage() {
  const { t } = useTranslation();
  const commonStatus = useDictOptions('sys_common_status', [
    { value: '0', label: t('page.systemRole.status.normal') },
    { value: '1', label: t('page.systemRole.status.disabled') },
  ]);

  const columns = [
    { key: 'roleName', title: t('page.systemRole.columns.roleName') },
    { key: 'roleKey', title: t('page.systemRole.columns.roleKey') },
    { key: 'roleSort', title: t('page.systemRole.columns.roleSort') },
    {
      key: 'status',
      title: t('page.systemRole.columns.status'),
      render: (value: string) => {
        const tag = commonStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: t('page.systemRole.columns.createTime') },
    { key: 'remark', title: t('page.systemRole.columns.remark') },
  ];

  const searchFields = [
    { name: 'roleName', label: t('page.systemRole.columns.roleName') },
    { name: 'roleKey', label: t('page.systemRole.columns.roleKey') },
    { name: 'status', label: t('page.systemRole.columns.status'), type: 'select' as const, options: commonStatus.options },
  ];

  const formFields = [
    { name: 'roleName', label: t('page.systemRole.columns.roleName'), required: true },
    { name: 'roleKey', label: t('page.systemRole.columns.roleKey'), required: true },
    { name: 'roleSort', label: t('page.systemRole.columns.roleSort'), type: 'number' as const },
    { name: 'status', label: t('page.systemRole.columns.status'), type: 'select' as const, options: commonStatus.options },
    { name: 'remark', label: t('page.systemRole.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.systemRole.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      rowKey="roleId"
    />
  );
}
