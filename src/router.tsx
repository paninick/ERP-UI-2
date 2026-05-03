import {createBrowserRouter, Navigate} from 'react-router-dom';
import {lazy, Suspense} from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/auth/Login';

const Dashboard = lazy(() => import('@/pages/dashboard/index'));
const SalesOrderPage = lazy(() => import('@/pages/sales/order/index'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales/order/detail'));
const SalesOrderPrintPage = lazy(() => import('@/pages/sales/order/print'));
const CustomerPage = lazy(() => import('@/pages/customer/index'));
const CustomerBusinessDetailPage = lazy(() => import('@/pages/customer/detail/index'));
const SupplierPage = lazy(() => import('@/pages/supplier/index'));
const MainMaterialPage = lazy(() => import('@/pages/material/main/index'));
const ProducePlanPage = lazy(() => import('@/pages/production/plan/index'));
const ProducePlanOverviewPage = lazy(() => import('@/pages/production/plan/overview'));
const ProduceJobPage = lazy(() => import('@/pages/production/job/index'));
const ProducePlanPrintPage = lazy(() => import('@/pages/production/plan/print'));
const ProduceJobPrintPage = lazy(() => import('@/pages/production/job/print'));
const StockInPage = lazy(() => import('@/pages/inventory/stock-in/index'));
const StockOutPage = lazy(() => import('@/pages/inventory/stock-out/index'));
const InventoryListPage = lazy(() => import('@/pages/inventory/list/index'));
const AuxiliaryPage = lazy(() => import('@/pages/material/auxiliary/index'));
const BomPage = lazy(() => import('@/pages/material/bom/index'));
const BomDetailPage = lazy(() => import('@/pages/material/bom/detail'));
const BomSubstitutePage = lazy(() => import('@/pages/material/bom-substitute/index'));
const PurchasePage = lazy(() => import('@/pages/purchase/index'));
const OutsourcePage = lazy(() => import('@/pages/outsource/index'));
const QualityPage = lazy(() => import('@/pages/quality/index'));
const PiecewagePage = lazy(() => import('@/pages/piecewage/index'));
const InvoicePage = lazy(() => import('@/pages/finance/invoice/index'));
const WarehousePage = lazy(() => import('@/pages/warehouse/index'));
const EmployeePage = lazy(() => import('@/pages/employee/index'));
const ProcessDefPage = lazy(() => import('@/pages/production/process-def/index'));
const ProcessRoutePage = lazy(() => import('@/pages/production/process/index'));
const ProcessRouteOverviewPage = lazy(() => import('@/pages/production/process/overview'));
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
const CompanyContextMappingPage = lazy(() => import('@/pages/system/company-context/index'));
const ProductionGanttPage = lazy(() => import('@/pages/production/gantt/index'));
const BizAbnormalPage = lazy(() => import('@/pages/biz/abnormal/index'));
const StylePage = lazy(() => import('@/pages/style/index'));
const InspectionBookingPage = lazy(() => import('@/pages/quality/inspection-booking/index'));
const JapanReleasePage = lazy(() => import('@/pages/quality/japan-release/index'));
const ApprovalLogPage = lazy(() => import('@/pages/system/approvallog/index'));
const ShipmentPage = lazy(() => import('@/pages/inventory/shipment/index'));
const WarehouseLocationPage = lazy(() => import('@/pages/warehouse/location/index'));
const WorkCenterPage = lazy(() => import('@/pages/production/work-center/index'));
const WorkshopCapacityPage = lazy(() => import('@/pages/production/workshop-capacity/index'));
const MaterialBatchPage = lazy(() => import('@/pages/inventory/material-batch/index'));
const ReportLogPage = lazy(() => import('@/pages/production/report-log/index'));
const DefectPage = lazy(() => import('@/pages/quality/defect/index'));
const QcDefectPage = lazy(() => import('@/pages/quality/qc-defect/index'));
const CostSummaryPage = lazy(() => import('@/pages/finance/cost-summary/index'));
const MaterialConsumePage = lazy(() => import('@/pages/inventory/material-consume/index'));
const ProductSerialPage = lazy(() => import('@/pages/inventory/product-serial/index'));
const SampleTechPage = lazy(() => import('@/pages/sales/tech/index'));
const SampleTechOverviewPage = lazy(() => import('@/pages/sales/tech/overview'));
const ProofingNoticePage = lazy(() => import('@/pages/sales/proofing-notice/index'));
const ProofingNoticeOverviewPage = lazy(() => import('@/pages/sales/proofing-notice/overview'));
const CorpContactsPage = lazy(() => import('@/pages/customer/contacts/index'));
const PieceWageDetailPage = lazy(() => import('@/pages/piecewage/detail/index'));
const StockLogPage = lazy(() => import('@/pages/inventory/stock-log/index'));
const OverviewPage = lazy(() => import('@/pages/system/overview/index'));
const CorpInvoicePage = lazy(() => import('@/pages/finance/corp-invoice/index'));
const MaterialSkuPage = lazy(() => import('@/pages/masterdata/material-sku/index'));
const ProcessLossMatrixPage = lazy(() => import('@/pages/masterdata/process-loss-matrix/index'));
const ProcessPricePage = lazy(() => import('@/pages/masterdata/process-price/index'));
const StandardColorPage = lazy(() => import('@/pages/masterdata/standard-color/index'));
const UnitConversionPage = lazy(() => import('@/pages/masterdata/unit-conversion/index'));
const WarehouseAreaPage = lazy(() => import('@/pages/warehouse/warehouse-area/index'));
const CustomerTemplatePage = lazy(() => import('@/pages/customer/customer-template/index'));
const PlanClothesPage = lazy(() => import('@/pages/production/plan-clothes/index'));
const PlanMaterialPage = lazy(() => import('@/pages/production/plan-material/index'));
const ProcessRouteItemPage = lazy(() => import('@/pages/production/process-route-item/index'));
const SalesItemPage = lazy(() => import('@/pages/sales/sales-item/index'));
const ChangeOrderPage = lazy(() => import('@/pages/change/order/index'));
const TeamTaskPoolPage = lazy(() => import('@/pages/production/team-task-pool/index'));
const EmployeeDispatchPage = lazy(() => import('@/pages/production/employee-dispatch/index'));
const WipLedgerPage = lazy(() => import('@/pages/production/wip-ledger/index'));
const MaterialBalancePage = lazy(() => import('@/pages/production/material-balance/index'));
const MaterialReturnPage = lazy(() => import('@/pages/production/material-return/index'));
const CheckPage = lazy(() => import('@/pages/quality/check/index'));
const DataImportPage = lazy(() => import('@/pages/system/data-import/index'));
const ReportPage = lazy(() => import('@/pages/report/index'));

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
      {path: 'sales/tech', element: lazyPage(<SampleTechPage />)},
      {path: 'sales/tech/:id/overview', element: lazyPage(<SampleTechOverviewPage />)},
      {path: 'sales/proofing-notice', element: lazyPage(<ProofingNoticePage />)},
      {path: 'sales/proofing-notice/:id/overview', element: lazyPage(<ProofingNoticeOverviewPage />)},
      {path: 'customer', element: lazyPage(<CustomerPage />)},
      {path: 'customer/detail', element: lazyPage(<CustomerBusinessDetailPage />)},
      {path: 'customer/contacts', element: lazyPage(<CorpContactsPage />)},
      {path: 'supplier', element: lazyPage(<SupplierPage />)},

      {path: 'change/order', element: lazyPage(<ChangeOrderPage />)},

      {path: 'production/plan', element: lazyPage(<ProducePlanPage />)},
      {path: 'production/plan/:id/overview', element: lazyPage(<ProducePlanOverviewPage />)},
      {path: 'production/plan/print/:id', element: lazyPage(<ProducePlanPrintPage />)},
      {path: 'production/job', element: lazyPage(<ProduceJobPage />)},
      {path: 'production/job/print/:id', element: lazyPage(<ProduceJobPrintPage />)},
      {path: 'production/team-task-pool', element: lazyPage(<TeamTaskPoolPage />)},
      {path: 'production/employee-dispatch', element: lazyPage(<EmployeeDispatchPage />)},
      {path: 'production/wip-ledger', element: lazyPage(<WipLedgerPage />)},
      {path: 'production/material-balance', element: lazyPage(<MaterialBalancePage />)},
      {path: 'production/material-return', element: lazyPage(<MaterialReturnPage />)},
      {path: 'production/gantt', element: lazyPage(<ProductionGanttPage />)},
      {path: 'production/work-center', element: lazyPage(<WorkCenterPage />)},
      {path: 'production/workshop-capacity', element: lazyPage(<WorkshopCapacityPage />)},
      {path: 'production/process-def', element: lazyPage(<ProcessDefPage />)},
      {path: 'production/process', element: lazyPage(<ProcessRoutePage />)},
      {path: 'production/process/:id/overview', element: lazyPage(<ProcessRouteOverviewPage />)},
      {path: 'production/notice', element: lazyPage(<NoticePage />)},
      {path: 'production/notice/:id', element: lazyPage(<NoticeDetailPage />)},
      {path: 'production/job-process', element: lazyPage(<JobProcessPage />)},
      {path: 'production/job-process/report/:jobId', element: lazyPage(<ProcessReportPage />)},
      {path: 'production/report-log', element: lazyPage(<ReportLogPage />)},
      {path: 'production/kanban', element: lazyPage(<ProductionKanbanPage />)},
      {path: 'production/style-progress', element: lazyPage(<StyleProgressPage />)},
      {path: 'production/product-trace', element: lazyPage(<ProductTracePage />)},
      {path: 'quality/product-trace', element: lazyPage(<ProductTracePage />)},

      {path: 'material/main', element: lazyPage(<MainMaterialPage />)},
      {path: 'material/auxiliary', element: lazyPage(<AuxiliaryPage />)},
      {path: 'material/bom', element: lazyPage(<BomPage />)},
      {path: 'material/bom/:id', element: lazyPage(<BomDetailPage />)},
      {path: 'material/bom-substitute', element: lazyPage(<BomSubstitutePage />)},

      {path: 'inventory/stock-in', element: lazyPage(<StockInPage />)},
      {path: 'inventory/stock-out', element: lazyPage(<StockOutPage />)},
      {path: 'inventory/material-batch', element: lazyPage(<MaterialBatchPage />)},
      {path: 'inventory/material-consume', element: lazyPage(<MaterialConsumePage />)},
      {path: 'inventory/product-serial', element: lazyPage(<ProductSerialPage />)},
      {path: 'inventory/stock-log', element: lazyPage(<StockLogPage />)},
      {path: 'inventory/list', element: lazyPage(<InventoryListPage />)},
      {path: 'warehouse', element: lazyPage(<WarehousePage />)},
      {path: 'warehouse/location', element: lazyPage(<WarehouseLocationPage />)},

      {path: 'purchase', element: lazyPage(<PurchasePage />)},
      {path: 'outsource', element: lazyPage(<OutsourcePage />)},

      {path: 'quality', element: lazyPage(<QualityPage />)},
      {path: 'quality/inspection', element: lazyPage(<QualityInspectionPage />)},
      {path: 'quality/inspection/print/:id', element: lazyPage(<QualityInspectionPrintPage />)},
      {path: 'quality/defect', element: lazyPage(<DefectPage />)},
      {path: 'quality/qc-defect', element: lazyPage(<QcDefectPage />)},

      {path: 'piecewage', element: lazyPage(<PiecewagePage />)},
      {path: 'piecewage/detail', element: lazyPage(<PieceWageDetailPage />)},
      {path: 'finance/invoice', element: lazyPage(<InvoicePage />)},
      {path: 'finance/finInvoice', element: lazyPage(<InvoicePage />)},
      {path: 'finance/cost-summary', element: lazyPage(<CostSummaryPage />)},
      {path: 'finance/corp-invoice', element: lazyPage(<CorpInvoicePage />)},
      {path: 'employee', element: lazyPage(<EmployeePage />)},

      {path: 'system/user', element: lazyPage(<SystemUserPage />)},
      {path: 'system/role', element: lazyPage(<SystemRolePage />)},
      {path: 'system/dict', element: lazyPage(<SystemDictPage />)},
      {path: 'system/dict-data/:dictId', element: lazyPage(<SystemDictDataPage />)},
      {path: 'system/org', element: lazyPage(<SystemOrgPage />)},
      {path: 'system/company-context', element: lazyPage(<CompanyContextMappingPage />)},

      {path: 'biz/abnormal', element: lazyPage(<BizAbnormalPage />)},

      {path: 'style', element: lazyPage(<StylePage />)},
      {path: 'quality/inspection-booking', element: lazyPage(<InspectionBookingPage />)},
      {path: 'quality/japan-release', element: lazyPage(<JapanReleasePage />)},
      {path: 'system/approvallog', element: lazyPage(<ApprovalLogPage />)},
      {path: 'system/overview', element: lazyPage(<OverviewPage />)},
      {path: 'inventory/shipment', element: lazyPage(<ShipmentPage />)},
      {path: 'masterdata/material-sku', element: lazyPage(<MaterialSkuPage />)},
      {path: 'masterdata/process-loss-matrix', element: lazyPage(<ProcessLossMatrixPage />)},
      {path: 'masterdata/process-price', element: lazyPage(<ProcessPricePage />)},
      {path: 'masterdata/standard-color', element: lazyPage(<StandardColorPage />)},
      {path: 'masterdata/unit-conversion', element: lazyPage(<UnitConversionPage />)},
      {path: 'warehouse/warehouse-area', element: lazyPage(<WarehouseAreaPage />)},
      {path: 'customer/customer-template', element: lazyPage(<CustomerTemplatePage />)},
      {path: 'production/plan-clothes', element: lazyPage(<PlanClothesPage />)},
      {path: 'production/plan-material', element: lazyPage(<PlanMaterialPage />)},
      {path: 'production/process-route-item', element: lazyPage(<ProcessRouteItemPage />)},
      {path: 'sales/sales-item', element: lazyPage(<SalesItemPage />)},
      {path: 'quality/check', element: lazyPage(<CheckPage />)},
      {path: 'system/data-import', element: lazyPage(<DataImportPage />)},
      {path: 'report', element: lazyPage(<ReportPage />)},
    ],
  },
]);
