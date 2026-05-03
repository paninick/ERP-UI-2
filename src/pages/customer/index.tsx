import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Building2, FileUser, UserRound } from 'lucide-react';
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
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700">客户主体主档</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.customer.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              客户管理维护的是“这个客户是谁”，负责客户编号、国家、结算主体和默认主要联络窗口。它解决的是客户主体归属问题；如果一个客户下面有多个业务、采购、QC 或财务窗口，应到客户联系人里继续展开，而不是把两张页面当成重复主档。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Building2, label: '它是什么', value: '客户主体身份主档' },
                { icon: UserRound, label: '核心内容', value: '编号 / 国家 / 主联系人 / 结算主体' },
                { icon: FileUser, label: '它不是什么', value: '不是多联系人名录本身' },
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
              { to: '/customer/contacts', title: '继续看客户联系人', detail: '一个客户往往不止一个窗口，业务、采购、QC、财务联系人应在那里展开。' },
              { to: '/customer/customer-template', title: '再看客户偏好库', detail: '偏好库沉淀包装、材料和验货习惯，不承担主体主档。' },
              { to: '/customer/detail', title: '进入客户业务详情', detail: '先收口到一个统一入口，再按销售、生产、质量、出货、结算继续追该客户业务链。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100/80">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-slate-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">从客户继续追业务，但默认先收口到详情页</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">客户主档不应该是一张静态资料卡，但也不该平铺十几个入口。现在更推荐先进入客户业务详情，再由详情页继续展开销售、生产、质量、出货和结算。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/customer/detail" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-slate-800">
              打开客户业务详情页
            </NavLink>
            <NavLink to="/customer/customer-template" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100">
              查看客户偏好库
            </NavLink>
          </div>
        </div>
      </section>

      <CrudPage
        title={t('page.customer.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
        extraActions={(record) => (
          <>
            <NavLink
              to={`/customer/detail?customerName=${encodeURIComponent(record.customerName || '')}&customerNo=${encodeURIComponent(record.customerNo || '')}`}
              className="rounded px-2 py-2 text-xs text-slate-700 hover:bg-slate-100"
            >
              客户详情
            </NavLink>
            <NavLink
              to={`/sales/order?customerName=${encodeURIComponent(record.customerName || '')}`}
              className="rounded px-2 py-2 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              直接看订单
            </NavLink>
            <NavLink
              to={`/production/plan?customerName=${encodeURIComponent(record.customerName || '')}`}
              className="rounded px-2 py-2 text-xs text-blue-600 hover:bg-blue-50"
            >
              直接看计划
            </NavLink>
          </>
        )}
      />
    </div>
  );
}
