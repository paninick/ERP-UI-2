import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Fingerprint, Link2, Shirt } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/style';

const pageApi = { list: api.listStyle, get: api.getStyle, add: api.addStyle, update: api.updateStyle, remove: api.delStyle };

export default function StylePage() {
  const { t } = useTranslation();
  const S = 'page.style';
  const columns = [
    { key: 'styleCode', title: t(`${S}.code`) },
    { key: 'customerStyleCode', title: t(`${S}.customerCode`) },
    { key: 'styleName', title: t(`${S}.name`) },
    { key: 'productFamily', title: t(`${S}.family`) },
    { key: 'season', title: t(`${S}.season`) },
    { key: 'status', title: t(`${S}.status`) },
    { key: 'createTime', title: t('common.createTime') },
  ];
  const searchFields = [
    { name: 'styleCode', label: t(`${S}.code`) },
    { name: 'styleName', label: t(`${S}.name`) },
  ];
  const formFields = [
    { name: 'styleCode', label: t(`${S}.code`), required: true },
    { name: 'customerStyleCode', label: t(`${S}.customerCode`) },
    { name: 'styleName', label: t(`${S}.name`), required: true },
    { name: 'productFamily', label: t(`${S}.family`) },
    { name: 'season', label: t(`${S}.season`) },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-sky-200 bg-sky-50 px-6 py-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700">款式识别主键</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t(`${S}.title`)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              款号是连接销售、技术、BOM、工艺路线和进度的统一识别键，不是客户订单号的简单别名。客户可以有自己的款号表达，但系统内部仍需要稳定的内部款号来串起一条款式从接单到出货的全链路。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Fingerprint, label: '它是什么', value: '系统内部款式主键' },
                { icon: Link2, label: '连接对象', value: '销售 / 技术 / BOM / 进度' },
                { icon: Shirt, label: '它不是什么', value: '不是客户单号替身' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-sky-100/80 p-2 text-sky-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-sky-600">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/sales/order', title: '先看销售订单', detail: '订单确定后，款号才能稳定贯穿后续技术和生产。' },
              { to: '/sales/tech', title: '再看技术单', detail: '技术单应围绕款号沉淀工艺和 BOM，而不是另起一套识别键。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-sky-100 bg-white/80 px-4 py-4 transition hover:border-sky-300 hover:bg-white">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                <div className="mt-3 flex justify-end text-sky-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t(`${S}.title`)} api={pageApi} columns={columns} searchFields={searchFields} FormComponent={(props) => <GenericForm {...props} fields={formFields} />} />
    </div>
  );
}
