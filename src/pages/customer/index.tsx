import { useTranslation } from 'react-i18next';
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

export default function CustomerPage() {
  const { t } = useTranslation();

  const columns = [
    { key: 'customerNo', title: t('page.customer.columns.customerNo') },
    { key: 'customerName', title: t('page.customer.columns.customerName') },
    { key: 'nationality', title: t('page.customer.columns.nationality') },
    { key: 'contacts', title: t('page.customer.columns.contacts') },
    { key: 'phone', title: t('page.customer.columns.phone') },
    { key: 'email', title: t('page.customer.columns.email') },
    { key: 'createTime', title: t('page.customer.columns.createTime') },
  ];

  const searchFields = [
    { name: 'customerNo', label: t('page.customer.columns.customerNo') },
    { name: 'customerName', label: t('page.customer.columns.customerName') },
  ];

  const formFields = [
    { name: 'customerNo', label: t('page.customer.columns.customerNo'), required: true },
    { name: 'customerName', label: t('page.customer.columns.customerName'), required: true },
    { name: 'nationality', label: t('page.customer.columns.nationality') },
    { name: 'contacts', label: t('page.customer.columns.contacts') },
    { name: 'phone', label: t('page.customer.columns.phone') },
    { name: 'email', label: t('page.customer.columns.email') },
    { name: 'address', label: t('page.customer.columns.address') },
    { name: 'remark', label: t('page.customer.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.customer.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
