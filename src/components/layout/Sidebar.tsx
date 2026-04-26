import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  children?: Array<{ key: string; label: string; path: string }>;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggle = useAppStore((state) => state.toggleSidebar);

  const navItems = useMemo<NavItem[]>(() => [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      children: [{ key: 'dashboardWorkbench', label: t('nav.dashboardWorkbench'), path: '/dashboard' }],
    },
    {
      key: 'sales',
      label: t('nav.sales'),
      icon: ShoppingCart,
      children: [
        { key: 'salesOrder', label: t('nav.salesOrder'), path: '/sales/order' },
        { key: 'customer', label: t('nav.customer'), path: '/customer' },
        { key: 'supplier', label: t('nav.supplier'), path: '/supplier' },
        { key: 'style', label: '款号档案', path: '/style' },
      ],
    },
    {
      key: 'production',
      label: t('nav.production'),
      icon: Factory,
      children: [
        { key: 'jobProcess', label: t('nav.jobProcess'), path: '/production/job-process' },
        { key: 'kanban', label: t('nav.kanban'), path: '/production/kanban' },
        { key: 'styleProgress', label: t('nav.styleProgress'), path: '/production/style-progress' },
        { key: 'plan', label: t('nav.plan'), path: '/production/plan' },
        { key: 'job', label: t('nav.job'), path: '/production/job' },
        { key: 'processDef', label: t('nav.processDef'), path: '/production/process-def' },
        { key: 'process', label: t('nav.process'), path: '/production/process' },
        { key: 'notice', label: t('nav.notice'), path: '/production/notice' },
        { key: 'gantt', label: t('nav.gantt'), path: '/production/gantt' },
      ],
    },
    {
      key: 'material',
      label: t('nav.material'),
      icon: Package,
      children: [
        { key: 'mainMaterial', label: t('nav.mainMaterial'), path: '/material/main' },
        { key: 'auxiliaryMaterial', label: t('nav.auxiliaryMaterial'), path: '/material/auxiliary' },
        { key: 'bom', label: t('nav.bom'), path: '/material/bom' },
      ],
    },
    {
      key: 'inventory',
      label: t('nav.inventory'),
      icon: Truck,
      children: [
        { key: 'stockIn', label: t('nav.stockIn'), path: '/inventory/stock-in' },
        { key: 'stockOut', label: t('nav.stockOut'), path: '/inventory/stock-out' },
        { key: 'inventoryList', label: t('nav.inventoryList'), path: '/inventory/list' },
        { key: 'shipment', label: '出货单', path: '/inventory/shipment' },
        { key: 'warehouse', label: t('nav.warehouse'), path: '/warehouse' },
      ],
    },
    {
      key: 'purchase',
      label: t('nav.purchase'),
      icon: Truck,
      children: [
        { key: 'purchaseOrder', label: t('nav.purchaseOrder'), path: '/purchase' },
        { key: 'outsource', label: t('nav.outsource'), path: '/outsource' },
      ],
    },
    {
      key: 'quality',
      label: t('nav.quality'),
      icon: ClipboardCheck,
      children: [
        { key: 'qualityCheck', label: t('nav.qualityCheck'), path: '/quality' },
        { key: 'qualityInspection', label: t('nav.qualityRelease'), path: '/quality/inspection' },
        { key: 'inspectionBooking', label: '检品预约', path: '/quality/inspection-booking' },
        { key: 'japanRelease', label: '日单放行', path: '/quality/japan-release' },
        { key: 'productTrace', label: '产品追溯', path: '/quality/product-trace' },
      ],
    },
    {
      key: 'finance',
      label: t('nav.finance'),
      icon: DollarSign,
      children: [
        { key: 'piecewage', label: t('nav.piecewage'), path: '/piecewage' },
        { key: 'invoice', label: t('nav.invoice'), path: '/finance/invoice' },
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
        { key: 'systemOrg', label: '组织架构', path: '/system/org' },
        { key: 'systemApprovalLog', label: '审批日志', path: '/system/approvallog' },
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
        <button onClick={toggle} className="rounded p-1 hover:bg-slate-700">
          {collapsed ? <ChevronRight size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="mt-2 h-[calc(100%-3.5rem)] overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.key}>
            <button
              onClick={() => toggleGroup(group.key)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              <group.icon size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    size={14}
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
                  {group.children.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => (
                        `block py-2 pl-12 pr-4 text-sm transition-colors ${
                          isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                      )}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </aside>
  );
}
