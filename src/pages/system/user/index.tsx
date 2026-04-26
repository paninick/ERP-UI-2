import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as systemApi from '@/api/system';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: systemApi.listUser,
  get: systemApi.getUser,
  add: systemApi.addUser,
  update: systemApi.updateUser,
  remove: systemApi.delUser,
};

export default function SystemUserPage() {
  const { t } = useTranslation();
  const commonStatus = useDictOptions('sys_common_status', [
    { value: '0', label: t('page.systemUser.status.normal') },
    { value: '1', label: t('page.systemUser.status.disabled') },
  ]);
  const userSex = useDictOptions('sys_user_sex', [
    { value: '0', label: t('page.systemUser.sex.male') },
    { value: '1', label: t('page.systemUser.sex.female') },
    { value: '2', label: t('page.systemUser.sex.unknown') },
  ]);

  const columns = [
    { key: 'userName', title: t('page.systemUser.columns.userName') },
    { key: 'nickName', title: t('page.systemUser.columns.nickName') },
    { key: 'phonenumber', title: t('page.systemUser.columns.phonenumber') },
    { key: 'email', title: t('page.systemUser.columns.email') },
    {
      key: 'status',
      title: t('page.systemUser.columns.status'),
      render: (value: string) => {
        const tag = commonStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: t('page.systemUser.columns.createTime') },
  ];

  const searchFields = [
    { name: 'userName', label: t('page.systemUser.columns.userName') },
    { name: 'phonenumber', label: t('page.systemUser.columns.phonenumber') },
    { name: 'status', label: t('page.systemUser.columns.status'), type: 'select' as const, options: commonStatus.options },
  ];

  const formFields = [
    { name: 'userName', label: t('page.systemUser.columns.userName'), required: true },
    { name: 'nickName', label: t('page.systemUser.columns.nickName'), required: true },
    { name: 'password', label: t('page.systemUser.columns.password') },
    { name: 'phonenumber', label: t('page.systemUser.columns.phonenumber') },
    { name: 'email', label: t('page.systemUser.columns.email') },
    { name: 'sex', label: t('page.systemUser.columns.sex'), type: 'select' as const, options: userSex.options },
    { name: 'status', label: t('page.systemUser.columns.status'), type: 'select' as const, options: commonStatus.options },
    { name: 'remark', label: t('page.systemUser.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.systemUser.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      rowKey="userId"
    />
  );
}
