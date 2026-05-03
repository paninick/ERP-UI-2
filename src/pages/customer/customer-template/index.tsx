import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, PackageOpen, Ruler, UserRoundCog } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/customerTemplate';

export default function CustomerTemplate() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listCustomerTemplate,
    get: api.getCustomerTemplate,
    add: api.addCustomerTemplate,
    update: api.updateCustomerTemplate,
    remove: (ids: string) => api.delCustomerTemplate(Number(ids)),
  };
  const columns = [
    { key: 'templateName', title: t('customerTemplate.templateName') },
    { key: 'customerName', title: t('customerTemplate.customerName') },
    { key: 'season', title: t('customerTemplate.season') },
    { key: 'status', title: t('customerTemplate.status') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700">客户偏好沉淀库</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('customerTemplate.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里收口为客户偏好库，不再强调“模板”心智。它承接的是客人习惯、默认规则和历史偏好的沉淀，适合沉淀尺码偏好、包装要求、季节性用料习惯、验货要求等默认配置，减少每次接单和打样都从零描述。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: UserRoundCog, label: '它是什么', value: '客户偏好与默认规则沉淀' },
                { icon: PackageOpen, label: '常见内容', value: '包装 / 洗标 / 材料偏好 / 验货习惯' },
                { icon: Ruler, label: '它不是什么', value: '不是客户主体，也不是销售起单页' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/customer', title: '先看客户主档', detail: '客户主档负责主体信息，模板只负责偏好和默认规则。' },
              { to: '/customer/contacts', title: '再看客户联系人', detail: '客户窗口分工在联系人里展开，模板不承担联系人管理。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-sky-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('customerTemplate.title')} api={pageApi} columns={columns} />
    </div>
  );
}
