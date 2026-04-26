import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as orgUnitApi from '@/api/orgUnit';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: orgUnitApi.listOrgUnit,
  get: orgUnitApi.getOrgUnit,
  add: orgUnitApi.addOrgUnit,
  update: orgUnitApi.updateOrgUnit,
  remove: orgUnitApi.delOrgUnit,
};

export default function OrgUnitPage() {
  const { t } = useTranslation();

  const orgType = useDictOptions('erp_org_type');
  const status = useDictOptions('sys_normal_disable');

  const columns = [
    { key: 'orgName', title: t('page.orgunit.columns.orgName') },
    { key: 'orgCode', title: t('page.orgunit.columns.orgCode') },
    {
      key: 'orgType',
      title: t('page.orgunit.columns.orgType'),
      render: (value: string) => {
        const tag = orgType.toLabel(String(value));
        return <span>{tag}</span>;
      },
    },
    { key: 'leader', title: t('page.orgunit.columns.leader') },
    { key: 'phone', title: t('page.orgunit.columns.phone') },
    {
      key: 'status',
      title: t('page.orgunit.columns.status'),
      render: (value: string) => {
        const tag = status.toTag(String(value), value === '0' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'orgName', label: t('page.orgunit.columns.orgName') },
    { name: 'orgCode', label: t('page.orgunit.columns.orgCode') },
    {
      name: 'orgType',
      label: t('page.orgunit.columns.orgType'),
      type: 'select' as const,
      options: orgType.options,
    },
    {
      name: 'status',
      label: t('page.orgunit.columns.status'),
      type: 'select' as const,
      options: status.options,
    },
  ];

  const flattenTree = (items: any[], parentId: number = 0, prefix: string = ''): { value: string; label: string }[] => {
    return items
      .filter((item: any) => item.parentId === parentId)
      .flatMap((item: any) => [
        { value: String(item.id), label: prefix + item.orgName },
        ...flattenTree(items, item.id, prefix + ' ' + item.orgName + ' → '),
      ]);
  };

  const formFields = [
    {
      name: 'parentId',
      label: t('page.orgunit.columns.parentId'),
      type: 'select' as const,
      loadOptions: async () => {
        const res = await orgUnitApi.listOrgUnit({});
        return [{ value: '0', label: t('common.none') }, ...flattenTree(res.rows || [])];
      },
    },
    { name: 'orgName', label: t('page.orgunit.columns.orgName'), required: true },
    { name: 'orgCode', label: t('page.orgunit.columns.orgCode') },
    {
      name: 'orgType',
      label: t('page.orgunit.columns.orgType'),
      type: 'select' as const,
      required: true,
      options: orgType.options,
    },
    { name: 'factoryId', label: t('page.orgunit.columns.factoryId'), type: 'number' as const },
    { name: 'orderNum', label: t('page.orgunit.columns.orderNum'), type: 'number' as const, defaultValue: 0 },
    { name: 'leader', label: t('page.orgunit.columns.leader') },
    { name: 'phone', label: t('page.orgunit.columns.phone') },
    {
      name: 'status',
      label: t('page.orgunit.columns.status'),
      type: 'select' as const,
      required: true,
      options: status.options,
      defaultValue: '0',
    },
    { name: 'remark', label: t('page.orgunit.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.orgunit.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
