import {createBrowserRouter, Navigate} from 'react-router-dom';
import {lazy, Suspense} from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/auth/Login';

const Dashboard = lazy(() => import('@/pages/dashboard/index'));
const SalesOrderPage = lazy(() => import('@/pages/sales/order/index'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales/order/detail'));
const SalesOrderPrintPage = lazy(() => import('@/pages/sales/order/print'));
const CustomerPage = lazy(() => import('@/pages/customer/index'));
const SupplierPage = lazy(() => import('@/pages/supplier/index'));
const MainMaterialPage = lazy(() => import('@/pages/material/main/index'));
const ProducePlanPage = lazy(() => import('@/pages/production/plan/index'));
const ProduceJobPage = lazy(() => import('@/pages/production/job/index'));
const ProducePlanPrintPage = lazy(() => import('@/pages/production/plan/print'));
const ProduceJobPrintPage = lazy(() => import('@/pages/production/job/print'));
const StockInPage = lazy(() => import('@/pages/inventory/stock-in/index'));
const StockOutPage = lazy(() => import('@/pages/inventory/stock-out/index'));
const InventoryListPage = lazy(() => import('@/pages/inventory/list/index'));
const AuxiliaryPage = lazy(() => import('@/pages/material/auxiliary/index'));
const BomPage = lazy(() => import('@/pages/material/bom/index'));
const BomDetailPage = lazy(() => import('@/pages/material/bom/detail'));
const PurchasePage = lazy(() => import('@/pages/purchase/index'));
const OutsourcePage = lazy(() => import('@/pages/outsource/index'));
const QualityPage = lazy(() => import('@/pages/quality/index'));
const PiecewagePage = lazy(() => import('@/pages/piecewage/index'));
const InvoicePage = lazy(() => import('@/pages/finance/invoice/index'));
const WarehousePage = lazy(() => import('@/pages/warehouse/index'));
const EmployeePage = lazy(() => import('@/pages/employee/index'));
const ProcessDefPage = lazy(() => import('@/pages/production/process-def/index'));
const ProcessRoutePage = lazy(() => import('@/pages/production/process/index'));
const NoticePage = lazy(() => import('@/pages/production/notice/index'));
const NoticeDetailPage = lazy(() => import('@/pages/production/notice/detail'));
const JobProcessPage = lazy(() => import('@/pages/production/job-process/index'));
const ProcessReportPage = lazy(() => import('@/pages/production/job-process/report'));
const ProductionKanbanPage = lazy(() => import('@/pages/production/kanban/index'));
const StyleProgressPage = lazy(() => import('@/pages/production/style-progress/index'));
const ProductTracePage = lazy(() => import('@/pages/quality/product-trace/index'));
const QualityInspectionPage = lazy(() => import('@/pages/quality/inspection/index'));
const QualityInspectionPrintPage = lazy(() => import('@/pages/quality/inspection/print'));
const SystemUserPage = lazy(() => import('@/pages/system/user/index'));
const SystemRolePage = lazy(() => import('@/pages/system/role/index'));
const SystemDictPage = lazy(() => import('@/pages/system/dict/index'));
const SystemDictDataPage = lazy(() => import('@/pages/system/dict/data'));
const SystemOrgPage = lazy(() => import('@/pages/system/org/index'));
const ProductionGanttPage = lazy(() => import('@/pages/production/gantt/index'));
const BizAbnormalPage = lazy(() => import('@/pages/biz/abnormal/index'));
const StylePage = lazy(() => import('@/pages/style/index'));
const InspectionBookingPage = lazy(() => import('@/pages/quality/inspection-booking/index'));
const JapanReleasePage = lazy(() => import('@/pages/quality/japan-release/index'));
const ApprovalLogPage = lazy(() => import('@/pages/system/approvallog/index'));
const ShipmentPage = lazy(() => import('@/pages/inventory/shipment/index'));

function ProtectedRoute({children}: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

const lazyPage = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {index: true, element: <Navigate to="/dashboard" replace />},
      {path: 'dashboard', element: lazyPage(<Dashboard />)},

      {path: 'sales/order', element: lazyPage(<SalesOrderPage />)},
      {path: 'sales/order/:id', element: lazyPage(<SalesOrderDetailPage />)},
      {path: 'sales/order/print/:id', element: lazyPage(<SalesOrderPrintPage />)},
      {path: 'customer', element: lazyPage(<CustomerPage />)},
      {path: 'supplier', element: lazyPage(<SupplierPage />)},

      {path: 'production/plan', element: lazyPage(<ProducePlanPage />)},
      {path: 'production/plan/print/:id', element: lazyPage(<ProducePlanPrintPage />)},
      {path: 'production/job', element: lazyPage(<ProduceJobPage />)},
      {path: 'production/job/print/:id', element: lazyPage(<ProduceJobPrintPage />)},
      {path: 'production/gantt', element: lazyPage(<ProductionGanttPage />)},
      {path: 'production/process-def', element: lazyPage(<ProcessDefPage />)},
      {path: 'production/process', element: lazyPage(<ProcessRoutePage />)},
      {path: 'production/notice', element: lazyPage(<NoticePage />)},
      {path: 'production/notice/:id', element: lazyPage(<NoticeDetailPage />)},
      {path: 'production/job-process', element: lazyPage(<JobProcessPage />)},
      {path: 'production/job-process/report/:jobId', element: lazyPage(<ProcessReportPage />)},
      {path: 'production/kanban', element: lazyPage(<ProductionKanbanPage />)},
      {path: 'production/style-progress', element: lazyPage(<StyleProgressPage />)},
      {path: 'production/product-trace', element: lazyPage(<ProductTracePage />)},
      {path: 'quality/product-trace', element: lazyPage(<ProductTracePage />)},

      {path: 'material/main', element: lazyPage(<MainMaterialPage />)},
      {path: 'material/auxiliary', element: lazyPage(<AuxiliaryPage />)},
      {path: 'material/bom', element: lazyPage(<BomPage />)},
      {path: 'material/bom/:id', element: lazyPage(<BomDetailPage />)},

      {path: 'inventory/stock-in', element: lazyPage(<StockInPage />)},
      {path: 'inventory/stock-out', element: lazyPage(<StockOutPage />)},
      {path: 'inventory/list', element: lazyPage(<InventoryListPage />)},
      {path: 'warehouse', element: lazyPage(<WarehousePage />)},

      {path: 'purchase', element: lazyPage(<PurchasePage />)},
      {path: 'outsource', element: lazyPage(<OutsourcePage />)},

      {path: 'quality', element: lazyPage(<QualityPage />)},
      {path: 'quality/inspection', element: lazyPage(<QualityInspectionPage />)},
      {path: 'quality/inspection/print/:id', element: lazyPage(<QualityInspectionPrintPage />)},

      {path: 'piecewage', element: lazyPage(<PiecewagePage />)},
      {path: 'finance/invoice', element: lazyPage(<InvoicePage />)},
      {path: 'employee', element: lazyPage(<EmployeePage />)},

      {path: 'system/user', element: lazyPage(<SystemUserPage />)},
      {path: 'system/role', element: lazyPage(<SystemRolePage />)},
      {path: 'system/dict', element: lazyPage(<SystemDictPage />)},
      {path: 'system/dict-data/:dictId', element: lazyPage(<SystemDictDataPage />)},
      {path: 'system/org', element: lazyPage(<SystemOrgPage />)},

      {path: 'biz/abnormal', element: lazyPage(<BizAbnormalPage />)},

      {path: 'style', element: lazyPage(<StylePage />)},
      {path: 'quality/inspection-booking', element: lazyPage(<InspectionBookingPage />)},
      {path: 'quality/japan-release', element: lazyPage(<JapanReleasePage />)},
      {path: 'system/approvallog', element: lazyPage(<ApprovalLogPage />)},
      {path: 'inventory/shipment', element: lazyPage(<ShipmentPage />)},
    ],
  },
]);
