import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  Boxes,
  FileStack,
  ImageIcon,
  Link2,
  Ruler,
  Workflow,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import * as noticeOverviewApi from '@/api/noticeOverview';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';
import { getCompanyLabel } from '@/utils/companyContext';

type NoticeAttachment = {
  id?: number;
  fileName?: string;
  fileUrl?: string;
};

type NoticeDetailLine = {
  id: number;
  sampleColor?: string;
  sampleSize?: string;
  sampleCount?: number;
  dueDate?: string;
  customerComment?: string;
  remark?: string;
};

type NoticeMaterialLine = {
  id: number;
  materialType?: string;
  supplyMethod?: string;
  materialNo?: string;
  name?: string;
  composition?: string;
  width?: string;
  weight?: string;
  substance?: string;
  size?: string;
  unit?: string;
  color?: string;
  requirement?: string;
  remark?: string;
};

type NoticeHistoryLine = {
  id: number;
  sampleNo?: string;
  styleType?: string;
  sampleCategoryType?: string;
  createBy?: string;
  createTime?: string;
  remark?: string;
};

function formatDate(value: unknown) {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, 10) : '-';
}

function renderText(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '-';
}

function parseImageList(value: unknown) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderSupplyMethod(value: unknown) {
  const text = String(value ?? '').trim();
  if (text === '1') return '厂供';
  if (text === '2') return '客供';
  return text || '-';
}

function renderMaterialType(value: unknown) {
  const text = String(value ?? '').trim();
  if (text.includes('主')) return '主料';
  if (text.includes('辅')) return '辅料';
  if (text === '1') return '主料';
  if (text === '2') return '辅料';
  return text || '-';
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Beaker;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-teal-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function GridField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-2 text-sm leading-6 text-slate-800 break-words">{value}</div>
    </div>
  );
}

export default function ProofingNoticeOverviewPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const noticeId = Number(id);
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'flow'>('overview');
  const [notice, setNotice] = useState<any>(null);
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const [detailLines, setDetailLines] = useState<NoticeDetailLine[]>([]);
  const [materialLines, setMaterialLines] = useState<NoticeMaterialLine[]>([]);
  const [historyLines, setHistoryLines] = useState<NoticeHistoryLine[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!Number.isFinite(noticeId) || noticeId <= 0) {
        toast.error('缺少有效的打样通知编号');
        navigate('/sales/proofing-notice');
        return;
      }

      setLoading(true);
      try {
        const noticeRes = await noticeOverviewApi.getNotice(noticeId);
        const nextNotice = unwrapAjaxResultData<any>(noticeRes);

        if (!mounted) {
          return;
        }

        setNotice(nextNotice);
        if (!nextNotice) {
          setAttachments([]);
          setDetailLines([]);
          setMaterialLines([]);
          setHistoryLines([]);
          return;
        }

        const [filesRes, detailRes, materialRes, historyRes] = await Promise.all([
          noticeOverviewApi.listNoticeFiles({ noticeId, pageNum: 1, pageSize: 200 }),
          noticeOverviewApi.getNoticeDetailLines({ noticeId }),
          noticeOverviewApi.getNoticeMaterialLines({ noticeId }),
          noticeOverviewApi.getNoticeHistoryLines({ currentNoticeId: noticeId }),
        ]);

        if (!mounted) {
          return;
        }

        setAttachments(filesRes?.rows || []);
        setDetailLines(detailRes?.rows || []);
        setMaterialLines(materialRes?.rows || []);
        setHistoryLines(historyRes?.rows || []);
      } catch (error: any) {
        if (mounted) {
          toast.error(error.message || '加载打样总览失败');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [companySignature, navigate, noticeId]);

  const colorConfirmImages = useMemo(
    () => parseImageList(notice?.colorConfirmImages),
    [notice?.colorConfirmImages],
  );

  const groupedMaterials = useMemo(() => {
    const mains = materialLines.filter((item) => renderMaterialType(item.materialType) === '主料');
    const auxiliaries = materialLines.filter((item) => renderMaterialType(item.materialType) !== '主料');
    return { mains, auxiliaries };
  }, [materialLines]);

  const tabs = [
    { key: 'overview' as const, label: '总览信息' },
    { key: 'history' as const, label: '流转记录' },
    { key: 'flow' as const, label: '流程图' },
  ];

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          正在加载打样总览...
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          <div className="mb-2 text-xs text-slate-400">当前公司：{getCompanyLabel(currentCompany.code, t)}</div>
          未找到对应的打样通知
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-teal-700">
              打样链路总览
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/sales/proofing-notice')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回打样通知
              </button>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                打样编号 {renderText(notice.sampleNo)}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">打样总览</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里承接的是一张打样通知的统一查看视图，把通知头、款式图片、附件、主辅料、样衣要求、历史记录和当前流程集中起来看，
              让业务、技术和主管不需要在多个列表里来回找上下文。
            </p>
            <p className="mt-2 text-sm text-slate-500">当前公司：{getCompanyLabel(currentCompany.code, t)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <OverviewMetric icon={Beaker} label="当前阶段" value={renderText(notice.sampleType)} />
              <OverviewMetric icon={Boxes} label="样衣行数" value={`${detailLines.length} 条`} />
              <OverviewMetric icon={FileStack} label="材料行数" value={`${materialLines.length} 条`} />
              <OverviewMetric icon={Workflow} label="流转节点" value={`${historyLines.length} 条`} />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                to: `/sales/tech?styleCode=${encodeURIComponent(notice.styleCode || '')}&customerName=${encodeURIComponent(notice.customerName || '')}`,
                title: '继续看技术承接',
                detail: '如果这笔打样已经转技术，这里继续下钻技术员、参数与进度。',
              },
              {
                to: `/material/bom?styleCode=${encodeURIComponent(notice.styleCode || '')}`,
                title: '继续看样衣BOM',
                detail: '如果技术已经开始冻结材料依据，可以继续查看样衣 BOM 明细。',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-teal-300 hover:bg-teal-50/60"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-teal-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <SectionCard
            title="打样通知信息"
            hint="先看来源任务头信息，确认客户、款号、打样类型、交期和当前备注。"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="客户名称" value={renderText(notice.customerName)} />
              <GridField label="业务员" value={renderText(notice.salesName)} />
              <GridField label="打样类型" value={renderText(notice.sampleType)} />
              <GridField label="样品种类" value={renderText(notice.sampleCategoryType)} />
              <GridField label="打样款号" value={renderText(notice.styleCode)} />
              <GridField label="大货款号" value={renderText(notice.bulkOrderNo)} />
              <GridField label="样品款式" value={renderText(notice.styleType)} />
              <GridField label="打样轮次" value={renderText(notice.roundNumber)} />
              <GridField label="要求交期" value={formatDate(notice.dueDate)} />
              <GridField label="加急类型" value={renderText(notice.emergencyType)} />
              <GridField label="客户确认" value={renderText(notice.customerApproved)} />
              <GridField label="工厂确认" value={renderText(notice.factoryConfirmed)} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <GridField label="客户反馈" value={renderText(notice.customerFeedback)} />
              <GridField label="备注" value={renderText(notice.remark)} />
            </div>
          </SectionCard>

          <SectionCard
            title="图片与确认资料"
            hint="这里集中看款式图、颜色确认图和附件，不再分散在多个编辑页里找。"
          >
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ImageIcon size={16} className="text-teal-700" />
                    款式图片
                  </div>
                  {notice.pictureUrl ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={notice.pictureUrl} alt="款式图" className="h-80 w-full object-cover" />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">暂无款式图片</p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Ruler size={16} className="text-teal-700" />
                    颜色确认图片
                  </div>
                  {colorConfirmImages.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {colorConfirmImages.map((url, index) => (
                        <a
                          key={`${url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-sm"
                        >
                          <img src={url} alt={`颜色确认图 ${index + 1}`} className="h-40 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">暂无颜色确认图片</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileStack size={16} className="text-teal-700" />
                    附件列表
                  </div>
                  {attachments.length ? (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, index) => (
                        <a
                          key={`${file.fileUrl}-${index}`}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                        >
                          <Link2 size={16} />
                          <span className="truncate">{file.fileName || file.fileUrl || '-'}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">暂无附件</p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">颜色确认要求</h4>
                  <div className="mt-4 grid gap-3">
                    <GridField label="确认状态" value={renderText(notice.colorConfirmStatus)} />
                    <GridField label="光源类型" value={renderText(notice.lightSourceType)} />
                    <GridField label="客户接受 Delta E" value={renderText(notice.customerAcceptDeltaE)} />
                    <GridField label="工厂确认日期" value={formatDate(notice.factoryConfirmDate)} />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="样衣信息"
            hint="按颜色 / 尺码 / 数量看这次打样具体要做哪些样，方便业务和技术对同一批样理解一致。"
          >
            {detailLines.length ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-500">
                      <th className="px-4 py-3">颜色</th>
                      <th className="px-4 py-3">尺码</th>
                      <th className="px-4 py-3">数量</th>
                      <th className="px-4 py-3">要求交期</th>
                      <th className="px-4 py-3">客户意见</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailLines.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">{renderText(item.sampleColor)}</td>
                        <td className="px-4 py-3">{renderText(item.sampleSize)}</td>
                        <td className="px-4 py-3">{renderText(item.sampleCount)}</td>
                        <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                        <td className="px-4 py-3 whitespace-pre-wrap text-slate-600">
                          {renderText(item.customerComment || item.remark)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                当前没有维护样衣明细
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="主辅料明细"
            hint="先以打样通知层的面辅料要求为准看全貌，后续正式冻结时再下钻样衣 BOM。"
          >
            {materialLines.length ? (
              <div className="space-y-5">
                {[
                  { title: '主料信息', rows: groupedMaterials.mains },
                  { title: '辅料信息', rows: groupedMaterials.auxiliaries },
                ].map((group) => (
                  <div key={group.title}>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">{group.title}</h4>
                    {group.rows.length ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-slate-500">
                              <th className="px-4 py-3">供货方式</th>
                              <th className="px-4 py-3">材料编号</th>
                              <th className="px-4 py-3">材料名称</th>
                              <th className="px-4 py-3">成分/材质</th>
                              <th className="px-4 py-3">规格</th>
                              <th className="px-4 py-3">颜色</th>
                              <th className="px-4 py-3">单位</th>
                              <th className="px-4 py-3">要求</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((item) => (
                              <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">{renderSupplyMethod(item.supplyMethod)}</td>
                                <td className="px-4 py-3">{renderText(item.materialNo)}</td>
                                <td className="px-4 py-3">{renderText(item.name)}</td>
                                <td className="px-4 py-3">{renderText(item.composition || item.substance)}</td>
                                <td className="px-4 py-3">{renderText(item.width || item.size)}</td>
                                <td className="px-4 py-3">{renderText(item.color)}</td>
                                <td className="px-4 py-3">{renderText(item.unit)}</td>
                                <td className="px-4 py-3 whitespace-pre-wrap text-slate-600">
                                  {renderText(item.requirement || item.remark)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-500">
                        暂无{group.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                当前没有维护打样面辅料要求
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'history' && (
        <SectionCard
          title="流转记录"
          hint="先基于当前已有的打样历史记录表展示，不伪造不存在的审批轨迹。"
        >
          {historyLines.length ? (
            <div className="space-y-4">
              {historyLines.map((item, index) => (
                <div key={item.id} className="relative pl-8">
                  {index !== historyLines.length - 1 ? (
                    <span className="absolute left-[10px] top-7 h-[calc(100%-8px)] w-px bg-slate-200" />
                  ) : null}
                  <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-semibold text-teal-700">
                    {index + 1}
                  </span>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {renderText(item.sampleNo)}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{renderText(item.styleType)}</span>
                      <span className="text-xs text-slate-500">{renderText(item.sampleCategoryType)}</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <GridField label="处理人" value={renderText(item.createBy)} />
                      <GridField label="记录时间" value={formatDate(item.createTime)} />
                      <GridField label="备注" value={renderText(item.remark)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
              当前没有记录打样历史
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === 'flow' && (
        <SectionCard
          title="流程图"
          hint="当前先用结构化流程说明代替复杂 BPMN 图，确保业务真实、语义清楚。"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                title: '业务发起阶段',
                items: ['销售/开发发起打样通知', '录入款式图、附件、颜色尺码数量与客户要求', '形成一张可追踪的打样来源任务单'],
              },
              {
                title: '技术承接阶段',
                items: ['技术主管分配技术员/制版员', '进入样衣BOM沉淀图片、主辅料与颜色组', '必要时补客户反馈和返修信息'],
              },
              {
                title: '样衣确认阶段',
                items: ['样衣完成后进入确认', '若需继续开发则回到打样链路', '若转大货则进入大货核版'],
              },
              {
                title: '大货执行前阶段',
                items: ['大货核版通过后形成工艺指示书', '生产计划承接颜色尺码数量与物料需求', '进入工单/甘特/领料/报工'],
              },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
                <div className="mt-4 space-y-3">
                  {card.items.map((item, index) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-teal-700 shadow-sm">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
