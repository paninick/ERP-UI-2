import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/style';

const pageApi = { list: api.listStyle, get: api.getStyle, add: api.addStyle, update: api.updateStyle, remove: api.delStyle };

export default function StylePage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'styleCode', title: t('style.code') },
    { key: 'customerStyleCode', title: t('style.customerCode') },
    { key: 'styleName', title: t('style.name') },
    { key: 'productFamily', title: t('style.family') },
    { key: 'season', title: t('style.season') },
    { key: 'status', title: t('style.status') },
    { key: 'createTime', title: t('common.createTime') },
  ];
  const searchFields = [
    { name: 'styleCode', label: t('style.code') },
    { name: 'styleName', label: t('style.name') },
  ];
  const formFields = [
    { name: 'styleCode', label: t('style.code'), required: true },
    { name: 'customerStyleCode', label: t('style.customerCode') },
    { name: 'styleName', label: t('style.name'), required: true },
    { name: 'productFamily', label: t('style.family') },
    { name: 'season', label: t('style.season') },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];
  return <CrudPage title={t('style.title')} api={pageApi} columns={columns} searchFields={searchFields} FormComponent={(props) => <GenericForm {...props} fields={formFields} />} />;
}
