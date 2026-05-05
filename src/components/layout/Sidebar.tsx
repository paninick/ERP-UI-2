import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Factory,
  FlaskConical,
  Ruler,
  Settings,
  ShoppingCart,
  Truck,
  Warehouse,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';

interface NavItem {
  key: string;
  label: string;
  icon: any;
  hint?: string;
  children?: Array<{ key: string; label: string; path: string }>;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const uiTheme = useAppStore((state) => state.uiTheme);
  const toggle = useAppStore((state) => state.toggleSidebar);

  const navItems = useMemo<NavItem[]>(() => [
    // 1. 销售与客户
    {
      key: 'orderFlow',
      label: '1. 销售与客户',
      icon: ShoppingCart,
      hint: '接单 / 款号 / 客户',
      children: [
        { key: 'salesOrder', label: t('nav.salesOrder'), path: '/sales/order' },
        { key: 'salesItem', label: t('nav.salesItem'), path: '/sales/sales-item' },
        { key: 'style', label: t('nav.style'), path: '/style' },
        { key: 'customer', label: t('nav.customer'), path: '/customer' },
        { key: 'corpContacts', label: t('nav.corpContacts'), path: '/customer/contacts' },
        { key: 'customerTemplate', label: t('nav.customerTemplate'), path: '/customer/customer-template' },
      ],
    },
    // 2. 打样与开发
    {
      key: 'proofingFlow',
      label: '2. 打样与开发',
      icon: Ruler,
      // proofingNotice 列表页即打样通知入口；点进单条记录后进入打样总览详情页
      // 打样总览无独立列表路由，从打样通知列表进入
      hint: '打样通知 / 打样总览 / 样衣BOM',
      children: [
        { key: 'proofingNotice', label: t('nav.proofingNotice'), path: '/sales/proofing-notice' },
        { key: 'notice', label: t('nav.notice'), path: '/production/notice' },
        { key: 'bom', label: t('nav.bomSample'), path: '/material/bom' },
        { key: 'bomSubstitute', label: '替代料申请', path: '/material/bom-substitute' },
      ],
    },
    // 3. 技术与放行
    // /production/process 是工艺路线列表，overview 页是工艺指示书详情（过渡态复用）
    // /production/notice 是打样通知（旧入口），已在"打样与开发"中保留
    {
      key: 'techFlow',
      label: '3. 技术与放行',
      icon: Factory,
      hint: '核版 / 工艺路线 / 工序定义',
      children: [
        { key: 'sampleTech', label: t('nav.bulkApproval'), path: '/sales/tech' },
        { key: 'process', label: t('nav.processInstruction'), path: '/production/process' },
        { key: 'processDef', label: t('nav.processDef'), path: '/production/process-def' },
        { key: 'processRouteItem', label: t('nav.processRouteItem'), path: '/production/process-route-item' },
        { key: 'processLossMatrix', label: t('nav.processLossMatrix'), path: '/masterdata/process-loss-matrix' },
      ],
    },
    // 4. 计划与生产
    {
      key: 'productionFlow',
      label: '4. 计划与生产',
      icon: Factory,
      hint: '计划 / 工单 / 排期',
      children: [
        { key: 'plan', label: t('nav.plan'), path: '/production/plan' },
        { key: 'planClothes', label: t('nav.planClothes'), path: '/production/plan-clothes' },
        { key: 'planMaterial', label: t('nav.planMaterial'), path: '/production/plan-material' },
        { key: 'gantt', label: t('nav.ganttSchedule'), path: '/production/gantt' },
        { key: 'job', label: t('nav.job'), path: '/production/job' },
        { key: 'teamTaskPool', label: '班组任务池', path: '/production/team-task-pool' },
        { key: 'employeeDispatch', label: '员工派工', path: '/production/employee-dispatch' },
        { key: 'jobProcess', label: t('nav.jobProcess'), path: '/production/job-process' },
        { key: 'reportLog', label: t('nav.reportLog'), path: '/production/report-log' },
        { key: 'wipLedger', label: t('nav.wipLedger'), path: '/production/wip-ledger' },
        { key: 'kanban', label: t('nav.kanban'), path: '/production/kanban' },
        { key: 'styleProgress', label: t('nav.styleProgress'), path: '/production/style-progress' },
        { key: 'workCenter', label: t('nav.workCenter'), path: '/production/work-center' },
        { key: 'workshopCapacity', label: t('nav.workshopCapacity'), path: '/production/workshop-capacity' },
        { key: 'changeOrder', label: '变更单', path: '/change/order' },
      ],
    },
    // 5. 采购与供应
    {
      key: 'supplyFlow',
      label: '5. 采购与供应',
      icon: Truck,
      hint: '采购执行 / 供应商 / 外协',
      children: [
        { key: 'purchaseOrder', label: t('nav.purchaseExec'), path: '/purchase' },
        { key: 'supplier', label: t('nav.supplier'), path: '/supplier' },
        { key: 'outsource', label: t('nav.outsource'), path: '/outsource' },
        { key: 'mainMaterial', label: t('nav.mainMaterial'), path: '/material/main' },
        { key: 'auxiliaryMaterial', label: t('nav.auxiliaryMaterial'), path: '/material/auxiliary' },
        { key: 'materialSku', label: t('nav.materialSku'), path: '/masterdata/material-sku' },
        { key: 'standardColor', label: t('nav.standardColor'), path: '/masterdata/standard-color' },
        { key: 'unitConversion', label: t('nav.unitConversion'), path: '/masterdata/unit-conversion' },
        { key: 'processPrice', label: t('nav.processPrice'), path: '/masterdata/process-price' },
      ],
    },
    // 6. 仓储与交付
    {
      key: 'warehouseFlow',
      label: '6. 仓储与交付',
      icon: Warehouse,
      hint: '入库 / 交付 / 库存',
      children: [
        { key: 'stockIn', label: t('nav.stockIn'), path: '/inventory/stock-in' },
        { key: 'stockOut', label: t('nav.deliveryMgmt'), path: '/inventory/stock-out' },
        { key: 'shipment', label: t('nav.shipment'), path: '/inventory/shipment' },
        { key: 'inventoryList', label: t('nav.inventoryList'), path: '/inventory/list' },
        { key: 'materialBatch', label: t('nav.materialBatch'), path: '/inventory/material-batch' },
        { key: 'materialConsume', label: t('nav.materialConsume'), path: '/inventory/material-consume' },
        { key: 'materialBalance', label: '物料平衡', path: '/production/material-balance' },
        { key: 'materialReturn', label: '退库管理', path: '/production/material-return' },
        { key: 'productSerial', label: t('nav.productSerial'), path: '/inventory/product-serial' },
        { key: 'stockLog', label: t('nav.stockLog'), path: '/inventory/stock-log' },
        { key: 'warehouse', label: t('nav.warehouse'), path: '/warehouse' },
        { key: 'warehouseLocation', label: t('nav.warehouseLocation'), path: '/warehouse/location' },
        { key: 'warehouseArea', label: t('nav.warehouseArea'), path: '/warehouse/warehouse-area' },
      ],
    },
    // 7. 质量与追溯
    {
      key: 'qualityFlow',
      label: '7. 质量与追溯',
      icon: ClipboardCheck,
      hint: '质检 / 缺陷 / 追溯',
      children: [
        { key: 'qualityCheck', label: t('nav.qualityCheck'), path: '/quality' },
        { key: 'qualityInspection', label: t('nav.qualityRelease'), path: '/quality/inspection' },
        { key: 'inspectionBooking', label: t('nav.inspectionBooking'), path: '/quality/inspection-booking' },
        { key: 'japanRelease', label: t('nav.japanRelease'), path: '/quality/japan-release' },
        { key: 'defectAbnormal', label: t('nav.defectAbnormal'), path: '/quality/defect' },
        { key: 'abnormal', label: t('nav.abnormal'), path: '/biz/abnormal' },
        { key: 'productTrace', label: t('nav.productTrace'), path: '/quality/product-trace' },
        { key: 'controlPlan', label: t('nav.controlPlan'), path: '/quality/control-plan' },
        { key: 'check', label: t('nav.check'), path: '/quality/check' },
      ],
    },
    // 8. 经营分析
    {
      key: 'analyticsFlow',
      label: '8. 经营分析',
      icon: BarChart2,
      hint: '驾驶舱 / 成本 / 预警',
      children: [
        { key: 'dashboardInsight', label: t('nav.bizCockpit'), path: '/dashboard/insight' },
        { key: 'supplierRating', label: t('nav.supplierRating'), path: '/dashboard/supplier-rating' },
        { key: 'costVariance', label: t('nav.costVariance'), path: '/finance/cost-variance' },
        { key: 'costSummary', label: t('nav.costSummary'), path: '/finance/cost-summary' },
        { key: 'piecewage', label: t('nav.piecewage'), path: '/piecewage' },
        { key: 'piecewageDetail', label: t('nav.piecewageDetail'), path: '/piecewage/detail' },
        { key: 'dashboardThreshold', label: t('nav.alertRules'), path: '/dashboard/threshold' },
      ],
    },
    // 9. 系统管理 — 严格按 TD-79 Spec 第 10 节：用户/角色/组织与公司映射/审批日志/首页待办
    // 员工管理（人员基础数据）和数据导入（工具）一并保留
    {
      key: 'system',
      label: '9. 系统管理',
      icon: Settings,
      hint: '用户 / 角色 / 组织',
      children: [
        { key: 'overview', label: t('nav.homeTodo'), path: '/dashboard' },
        { key: 'systemUser', label: t('nav.systemUser'), path: '/system/user' },
        { key: 'systemRole', label: t('nav.systemRole'), path: '/system/role' },
        { key: 'systemDict', label: t('nav.systemDict'), path: '/system/dict' },
        { key: 'systemOrg', label: t('nav.systemOrg'), path: '/system/org' },
        { key: 'companyContextMapping', label: t('nav.companyContextMapping'), path: '/system/company-context' },
        { key: 'systemApprovalLog', label: t('nav.approvalLog'), path: '/system/approvallog' },
        { key: 'employee', label: t('nav.employee'), path: '/employee' },
        { key: 'dataImport', label: t('nav.dataImport'), path: '/system/data-import' },
      ],
    },
    // 10. Demo — 未闭环/二期/演示/试验页
    {
      key: 'demo',
      label: '10. Demo',
      icon: FlaskConical,
      hint: '演示 / 二期 / 试验',
      children: [
        { key: 'invoice', label: t('nav.invoice'), path: '/finance/invoice' },
        { key: 'corpInvoice', label: t('nav.corpInvoice'), path: '/finance/corp-invoice' },
        { key: 'channelSettlement', label: t('nav.channelSettlement'), path: '/finance/channel-settlement' },
        { key: 'channelRefund', label: t('nav.channelRefund'), path: '/finance/channel-refund' },
        { key: 'report', label: t('nav.report'), path: '/report' },
        { key: 'systemOverview', label: t('nav.overview'), path: '/system/overview' },
        { key: 'qcDefect', label: t('nav.qcDefect'), path: '/quality/qc-defect' },
        { key: 'demoWms', label: 'WMS 仓储系统', path: '/demo/wms' },
        { key: 'demoComfyui', label: '电商自动化', path: '/demo/comfyui' },
        { key: 'demoEcommerceCrawler', label: '数据爬虫', path: '/demo/ecommerce-crawler' },
        { key: 'demoMaterialCrawler', label: '素材爬虫', path: '/demo/material-crawler' },
        { key: 'demoMediaCrawler', label: '社媒爬取', path: '/demo/media-crawler' },
        { key: 'demo1688', label: '1688 平台爬取', path: '/demo/1688' },
        { key: 'demoRuoyiApp', label: '若依移动端', path: '/demo/ruoyi-app' },
        { key: 'demoRuoyiAi', label: 'AI 助手平台', path: '/demo/ruoyi-ai' },
      ],
    },
  ], [t]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ dashboard: true });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-full transition-all duration-300 ${
        uiTheme === 'google'
          ? 'border-r border-slate-200 bg-white text-slate-700'
          : uiTheme === 'night'
            ? 'border-r border-white/8 bg-slate-950/88 text-slate-100 backdrop-blur-2xl'
          : 'border-r border-white/10 bg-[#1a2035] text-slate-200'
      } ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className={`flex h-16 items-center justify-between px-4 ${
        uiTheme === 'google' ? 'border-b border-slate-200' : uiTheme === 'night' ? 'border-b border-white/8' : 'border-b border-white/10'
      }`}>
        {!collapsed && (
          <div>
            <span className={`text-lg font-semibold tracking-[0.18em] ${
              uiTheme === 'google' ? 'text-slate-800' : uiTheme === 'night' ? 'text-slate-100' : 'text-amber-400'
            }`}>ERP</span>
            <p className={`text-[10px] uppercase tracking-[0.28em] ${
              uiTheme === 'google' ? 'text-slate-400' : uiTheme === 'night' ? 'text-slate-400/70' : 'text-slate-400/65'
            }`}>{uiTheme === 'google' ? 'Workspace' : uiTheme === 'night' ? 'Night Console' : 'J-Tech Panel'}</p>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          className={`rounded-2xl p-2 transition ${
            uiTheme === 'google' ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/8'
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="mt-2 h-[calc(100%-3.5rem)] overflow-y-auto" aria-label={t('nav.mainNavigation')}>
        {navItems.map((group) => (
          <div key={group.key} role="group" aria-label={group.label}>
            <button
              onClick={() => toggleGroup(group.key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.key); } }}
              aria-expanded={!!openGroups[group.key]}
              aria-label={group.label}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                uiTheme === 'google'
                  ? 'text-slate-600 hover:bg-slate-50'
                  : 'text-slate-300 hover:bg-white/6'
              }`}
            >
              <group.icon size={18} aria-hidden="true" />
              {!collapsed && (
                <>
                  <div className="flex flex-1 flex-col text-left">
                    <span>{group.label}</span>
                    {group.hint ? <span className={`text-[10px] uppercase tracking-[0.16em] ${
                      uiTheme === 'google' ? 'text-slate-400' : 'text-slate-500/80'
                    }`}>{group.hint}</span> : null}
                  </div>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`transition-transform ${openGroups[group.key] ? 'rotate-0' : '-rotate-90'}`}
                  />
                </>
              )}
            </button>
            <AnimatePresence>
              {!collapsed && openGroups[group.key] && group.children && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  {group.children.map((item) => {
                    const isExactActive = location.pathname === item.path;
                    return (
                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.985 }}>
                    <NavLink
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      end
                      className={() => (
                        `mx-2 mb-1 block rounded-xl py-2 pl-12 pr-4 text-sm transition-all ${
                          isExactActive
                            ? uiTheme === 'google'
                              ? 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.14)]'
                              : uiTheme === 'night'
                                ? 'bg-amber-400/14 text-amber-200 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)]'
                              : 'bg-amber-400/18 text-amber-300 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.22)]'
                            : uiTheme === 'google'
                              ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
                        }`
                      )}
                    >
                      {item.label}
                    </NavLink>
                    </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </aside>
  );
}
