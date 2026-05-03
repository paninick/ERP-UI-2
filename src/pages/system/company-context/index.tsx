import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/companyContext';
import { listOrgUnit } from '@/api/orgUnit';
import { SKIP_FACTORY_CONTEXT_HEADER } from '@/api/client';

const pageApi = {
  list: api.listCompanyContextMapping,
  get: api.getCompanyContextMapping,
  add: api.addCompanyContextMapping,
  update: api.updateCompanyContextMapping,
  remove: api.delCompanyContextMapping,
};

const COMPANY_CODES = ['SHUYANG', 'DONGCHUAN', 'CAMBODIA'] as const;

export default function CompanyContextMappingPage() {
  const { t } = useTranslation();

  const companyOptions = useMemo(
    () =>
      COMPANY_CODES.map((code) => ({
        value: code,
        label: t(`companyContext.${code.toLowerCase()}`),
      })),
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: '0', label: t('common.enabled') },
      { value: '1', label: t('common.disabled') },
    ],
    [t]
  );

  const loadFactoryOrgOptions = async () => {
    const response: any = await listOrgUnit(
      { pageNum: 1, pageSize: 999, orgType: 'FACTORY', status: '0' },
      { headers: { [SKIP_FACTORY_CONTEXT_HEADER]: '1' } }
    );
    return (response.rows || []).map((item: any) => ({
      value: String(item.id),
      label: item.orgCode ? `${item.orgName} (${item.orgCode})` : item.orgName,
    }));
  };

  const columns = [
    {
      key: 'companyCode',
      title: t('page.companyContextMapping.columns.companyCode'),
      render: (value: string) =>
        companyOptions.find((option) => option.value === value)?.label || value,
    },
    {
      key: 'orgUnitName',
      title: t('page.companyContextMapping.columns.orgUnit'),
      render: (_: unknown, record: any) =>
        record.orgUnitCode ? `${record.orgUnitName} (${record.orgUnitCode})` : record.orgUnitName || '-',
    },
    { key: 'businessFactoryId', title: t('page.companyContextMapping.columns.businessFactoryId') },
    {
      key: 'status',
      title: t('page.companyContextMapping.columns.status'),
      render: (value: string) =>
        statusOptions.find((option) => option.value === value)?.label || value,
    },
    { key: 'updateTime', title: t('page.companyContextMapping.columns.updateTime') },
    { key: 'remark', title: t('page.companyContextMapping.columns.remark') },
  ];

  const searchFields = [
    {
      name: 'companyCode',
      label: t('page.companyContextMapping.columns.companyCode'),
      type: 'select' as const,
      options: companyOptions,
    },
    {
      name: 'status',
      label: t('page.companyContextMapping.columns.status'),
      type: 'select' as const,
      options: statusOptions,
    },
  ];

  const formFields = [
    {
      name: 'companyCode',
      label: t('page.companyContextMapping.columns.companyCode'),
      type: 'select' as const,
      options: companyOptions,
      required: true,
    },
    {
      name: 'orgUnitId',
      label: t('page.companyContextMapping.columns.orgUnit'),
      type: 'select' as const,
      loadOptions: loadFactoryOrgOptions,
      required: true,
    },
    {
      name: 'businessFactoryId',
      label: t('page.companyContextMapping.columns.businessFactoryId'),
      type: 'number' as const,
      required: true,
    },
    {
      name: 'status',
      label: t('page.companyContextMapping.columns.status'),
      type: 'select' as const,
      options: statusOptions,
      required: true,
    },
    {
      name: 'remark',
      label: t('page.companyContextMapping.columns.remark'),
      type: 'textarea' as const,
    },
  ];

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {t('page.companyContextMapping.description')}
      </div>
      <CrudPage
        title={t('page.companyContextMapping.title')}
        api={pageApi}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      />
    </div>
  );
}
