import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Factory,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
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
  const toggle = useAppStore((state) => state.toggleSidebar);

  const navItems = useMemo<NavItem[]>(() => [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      hint: '总览 / 快速入口',
      children: [
        { key: 'dashboardWorkbench', label: t('nav.dashboardWorkbench'), path: '/dashboard' },
        { key: 'dashboardInsight', label: t('nav.dashboardInsight'), path: '/dashboard/insight' },
        { key: 'supplierRating', label: t('nav.supplierRating'), path: '/dashboard/supplier-rating' },
        { key: 'dashboardThreshold', label: t('nav.dashboardThreshold'), path: '/dashboard/threshold' },
      ],
    },
    {
      key: 'orderFlow',
      label: '1. 销售与客户',
      icon: ShoppingCart,
      hint: '接单 / 打样 / 客户',
      children: [
        { key: 'salesOrder', label: t('nav.salesOrder'), path: '/sales/order' },
        { key: 'style', label: t('nav.style'), path: '/style' },
        { key: 'customer', label: t('nav.customer'), path: '/customer' },
        { key: 'corpContacts', label: t('nav.corpContacts'), path: '/customer/contacts' },
      ],
    },
    {
      key: 'techFlow',
      label: '2. 技术与BOM',
      icon: Factory,
      hint: '技术单 / BOM / 路线',
      children: [
        { key: 'proofingNotice', label: t('nav.proofingNotice'), path: '/sales/proofing-notice' },
        { key: 'sampleTech', label: t('nav.sampleTech'), path: '/sales/tech' },
        { key: 'notice', label: t('nav.notice'), path: '/production/notice' },
        { key: 'bom', label: t('nav.bom'), path: '/material/bom' },
        { key: 'bomSubstitute', label: '替代料申请', path: '/material/bom-substitute' },
        { key: 'processDef', label: t('nav.processDef'), path: '/production/process-def' },
        { key: 'process', label: t('nav.process'), path: '/production/process' },
        { key: 'processRouteItem', label: t('nav.processRouteItem'), path: '/production/process-route-item' },
        { key: 'processLossMatrix', label: t('nav.processLossMatrix'), path: '/masterdata/process-loss-matrix' },
      ],
    },
    {
      key: 'supplyFlow',
      label: '3. 采购与供应',
      icon: Truck,
      hint: '主数据 / 采购 / 到料',
      children: [
        { key: 'mainMaterial', label: t('nav.mainMaterial'), path: '/material/main' },
        { key: 'auxiliaryMaterial', label: t('nav.auxiliaryMaterial'), path: '/material/auxiliary' },
        { key: 'materialSku', label: t('nav.materialSku'), path: '/masterdata/material-sku' },
        { key: 'standardColor', label: t('nav.standardColor'), path: '/masterdata/standard-color' },
        { key: 'unitConversion', label: t('nav.unitConversion'), path: '/masterdata/unit-conversion' },
        { key: 'purchaseOrder', label: t('nav.purchaseOrder'), path: '/purchase' },
        { key: 'supplier', label: t('nav.supplier'), path: '/supplier' },
      ],
    },
    {
      key: 'productionFlow',
      label: '4. 生产与排期',
      icon: Factory,
      hint: '计划 / 外协 / 现场',
      children: [
        { key: 'plan', label: t('nav.plan'), path: '/production/plan' },
        { key: 'changeOrder', label: '变更单', path: '/change/order' },
        { key: 'planClothes', label: t('nav.planClothes'), path: '/production/plan-clothes' },
        { key: 'planMaterial', label: t('nav.planMaterial'), path: '/production/plan-material' },
        { key: 'gantt', label: t('nav.gantt'), path: '/production/gantt' },
        { key: 'workCenter', label: t('nav.workCenter'), path: '/production/work-center' },
        { key: 'workshopCapacity', label: t('nav.workshopCapacity'), path: '/production/workshop-capacity' },
        { key: 'job', label: t('nav.job'), path: '/production/job' },
        { key: 'teamTaskPool', label: '班组任务池', path: '/production/team-task-pool' },
        { key: 'employeeDispatch', label: '员工派工', path: '/production/employee-dispatch' },
        { key: 'wipLedger', label: '在制台账', path: '/production/wip-ledger' },
        { key: 'outsource', label: t('nav.outsource'), path: '/outsource' },
        { key: 'kanban', label: t('nav.kanban'), path: '/production/kanban' },
        { key: 'jobProcess', label: t('nav.jobProcess'), path: '/production/job-process' },
        { key: 'reportLog', label: t('nav.reportLog'), path: '/production/report-log' },
        { key: 'styleProgress', label: t('nav.styleProgress'), path: '/production/style-progress' },
      ],
    },
    {
      key: 'qualityFlow',
      label: '5. 质量与放行',
      icon: ClipboardCheck,
      hint: '检验 / 缺陷 / 放行',
      children: [
        { key: 'qualityCheck', label: t('nav.qualityCheck'), path: '/quality' },
        { key: 'qualityInspection', label: t('nav.qualityRelease'), path: '/quality/inspection' },
        { key: 'inspectionBooking', label: t('nav.inspectionBooking'), path: '/quality/inspection-booking' },
        { key: 'japanRelease', label: t('nav.japanRelease'), path: '/quality/japan-release' },
        { key: 'defect', label: t('nav.defect'), path: '/quality/defect' },
        { key: 'qcDefect', label: t('nav.qcDefect'), path: '/quality/qc-defect' },
        { key: 'productTrace', label: t('nav.productTrace'), path: '/quality/product-trace' },
        { key: 'controlPlan', label: t('nav.controlPlan'), path: '/quality/control-plan' },
        { key: 'check', label: t('nav.check'), path: '/quality/check' },
      ],
    },
    {
      key: 'warehouseFlow',
      label: '6. 仓储与出货',
      icon: Package,
      hint: '入库 / 出库 / 出货',
      children: [
        { key: 'stockIn', label: t('nav.stockIn'), path: '/inventory/stock-in' },
        { key: 'stockOut', label: t('nav.stockOut'), path: '/inventory/stock-out' },
        { key: 'shipment', label: t('nav.shipment'), path: '/inventory/shipment' },
        { key: 'materialBatch', label: t('nav.materialBatch'), path: '/inventory/material-batch' },
        { key: 'materialConsume', label: t('nav.materialConsume'), path: '/inventory/material-consume' },
        { key: 'productSerial', label: t('nav.productSerial'), path: '/inventory/product-serial' },
        { key: 'stockLog', label: t('nav.stockLog'), path: '/inventory/stock-log' },
        { key: 'inventoryList', label: t('nav.inventoryList'), path: '/inventory/list' },
        { key: 'warehouse', label: t('nav.warehouse'), path: '/warehouse' },
        { key: 'warehouseLocation', label: t('nav.warehouseLocation'), path: '/warehouse/location' },
        { key: 'warehouseArea', label: t('nav.warehouseArea'), path: '/warehouse/warehouse-area' },
        { key: 'materialBalance', label: '物料平衡', path: '/production/material-balance' },
        { key: 'materialReturn', label: '退库管理', path: '/production/material-return' },
      ],
    },
    {
      key: 'financeFlow',
      label: '7. 财务与结算',
      icon: DollarSign,
      hint: '成本 / 发票 / 工资',
      children: [
        { key: 'processPrice', label: t('nav.processPrice'), path: '/masterdata/process-price' },
        { key: 'costSummary', label: t('nav.costSummary'), path: '/finance/cost-summary' },
        { key: 'costVariance', label: t('nav.costVariance'), path: '/finance/cost-variance' },
        { key: 'piecewage', label: t('nav.piecewage'), path: '/piecewage' },
        { key: 'piecewageDetail', label: t('nav.piecewageDetail'), path: '/piecewage/detail' },
        { key: 'invoice', label: t('nav.invoice'), path: '/finance/invoice' },
        { key: 'corpInvoice', label: t('nav.corpInvoice'), path: '/finance/corp-invoice' },
        { key: 'channelSettlement', label: t('nav.channelSettlement'), path: '/finance/channel-settlement' },
        { key: 'channelRefund', label: t('nav.channelRefund'), path: '/finance/channel-refund' },
      ],
    },
    {
      key: 'hr',
      label: t('nav.hr'),
      icon: Users,
      children: [{ key: 'employee', label: t('nav.employee'), path: '/employee' }],
    },
    {
      key: 'system',
      label: t('nav.system'),
      icon: Settings,
      children: [
        { key: 'systemUser', label: t('nav.systemUser'), path: '/system/user' },
        { key: 'systemRole', label: t('nav.systemRole'), path: '/system/role' },
        { key: 'systemDict', label: t('nav.systemDict'), path: '/system/dict' },
        { key: 'systemOrg', label: t('nav.systemOrg'), path: '/system/org' },
        { key: 'companyContextMapping', label: t('nav.companyContextMapping'), path: '/system/company-context' },
        { key: 'systemApprovalLog', label: t('nav.approvalLog'), path: '/system/approvallog' },
        { key: 'overview', label: t('nav.overview'), path: '/system/overview' },
        { key: 'dataImport', label: t('nav.dataImport'), path: '/system/data-import' },
        { key: 'customerTemplate', label: t('nav.customerTemplate'), path: '/customer/customer-template' },
        { key: 'report', label: t('nav.report'), path: '/report' },
        { key: 'abnormal', label: t('nav.abnormal'), path: '/biz/abnormal' },
      ],
    },
  ], [t]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ dashboard: true });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-full bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && <span className="text-lg font-bold">ERP</span>}
        <button
          onClick={toggle}
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          className="rounded p-1 hover:bg-slate-700"
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
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              <group.icon size={18} aria-hidden="true" />
              {!collapsed && (
                <>
                  <div className="flex flex-1 flex-col text-left">
                    <span>{group.label}</span>
                    {group.hint ? <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{group.hint}</span> : null}
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
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {group.children.map((item) => {
                    const isExactActive = location.pathname === item.path;
                    return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      end
                      className={() => (
                        `block py-2 pl-12 pr-4 text-sm transition-colors ${
                          isExactActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                      )}
                    >
                      {item.label}
                    </NavLink>
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
