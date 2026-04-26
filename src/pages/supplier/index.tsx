import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as supplierApi from '@/api/supplier';

const api = {
  list: supplierApi.listSupplier,
  get: supplierApi.getSupplier,
  add: supplierApi.addSupplier,
  update: supplierApi.updateSupplier,
  remove: supplierApi.delSupplier,
};

export default function SupplierPage() {
  const { t } = useTranslation();

  const columns = [
    { key: 'supplierNo', title: t('page.supplier.columns.supplierNo') },
    { key: 'supplierName', title: t('page.supplier.columns.supplierName') },
    { key: 'contacts', title: t('page.supplier.columns.contacts') },
    { key: 'phone', title: t('page.supplier.columns.phone') },
    { key: 'category', title: t('page.supplier.columns.category') },
    { key: 'rating', title: t('page.supplier.columns.rating') },
    { key: 'createTime', title: t('page.supplier.columns.createTime') },
  ];

  const searchFields = [
    { name: 'supplierNo', label: t('page.supplier.columns.supplierNo') },
    { name: 'supplierName', label: t('page.supplier.columns.supplierName') },
  ];

  const formFields = [
    { name: 'supplierNo', label: t('page.supplier.columns.supplierNo'), required: true },
    { name: 'supplierName', label: t('page.supplier.columns.supplierName'), required: true },
    { name: 'contacts', label: t('page.supplier.columns.contacts') },
    { name: 'phone', label: t('page.supplier.columns.phone') },
    { name: 'email', label: t('page.supplier.columns.email') },
    { name: 'category', label: t('page.supplier.columns.category') },
    { name: 'address', label: t('page.supplier.columns.address') },
    { name: 'remark', label: t('page.supplier.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.supplier.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
