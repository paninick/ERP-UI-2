const APP_TITLE = 'ERP 系统';
const APP_SUBTITLE = '针织服装数字化管理平台';

const routeTitles: Array<[string, string]> = [
  ['/dashboard/insight', '经营驾驶舱'],
  ['/dashboard/supplier-rating', '供应商评级'],
  ['/dashboard/threshold', '阈值规则'],
  ['/production/style-progress', '款号进度视图'],
  ['/production/product-trace', '产品全链路追溯'],
  ['/quality/product-trace', '产品全链路追溯'],
  ['/production/process-def', '工序定义'],
  ['/production/process/', '工艺指示书'],
  ['/production/process', '工艺路线'],
  ['/production/process-route-item', '工艺路线明细'],
  ['/production/plan/print/', '生产计划打印'],
  ['/production/plan/', '生产计划详情'],
  ['/production/job/print/', '生产工单打印'],
  ['/production/job-process/report/', '工序报工'],
  ['/production/job-process', '工序报工'],
  ['/production/work-center', '工作中心'],
  ['/production/notice/', '打样通知'],
  ['/production/notice', '打样通知'],
  ['/production/kanban', '生产看板'],
  ['/production/gantt', '生产甘特图'],
  ['/production/plan', '生产计划'],
  ['/production/job', '生产工单'],
  ['/sales/order/print/', '销售订单打印'],
  ['/sales/order/', '销售订单'],
  ['/sales/order', '销售订单'],
  ['/sales/sales-item', '销售明细'],
  ['/sales/proofing-notice/', '打样总览'],
  ['/sales/proofing-notice', '打样通知'],
  ['/sales/tech/', '大货核版'],
  ['/sales/tech', '技术单'],
  ['/material/main', '主料'],
  ['/material/auxiliary', '辅料'],
  ['/material/bom/', 'BOM'],
  ['/material/bom', 'BOM'],
  ['/masterdata/material-sku', '材料SKU'],
  ['/masterdata/standard-color', '标准色'],
  ['/masterdata/unit-conversion', '单位换算'],
  ['/masterdata/process-loss-matrix', '工序损耗矩阵'],
  ['/masterdata/process-price', '工序价格'],
  ['/inventory/stock-in', '入库'],
  ['/inventory/stock-out', '出库'],
  ['/inventory/list', '库存查询'],
  ['/inventory/shipment', '出货单'],
  ['/warehouse/location', '仓位管理'],
  ['/warehouse', '仓库管理'],
  ['/purchase', '采购管理'],
  ['/outsource', '外协加工'],
  ['/quality/inspection/print/', '品质检验打印'],
  ['/quality/inspection-booking', '检品预约'],
  ['/quality/japan-release', '日单放行'],
  ['/quality/inspection', '品质检验'],
  ['/quality', '品质管理'],
  ['/piecewage', '计件工资'],
  ['/finance/invoice', '发票管理'],
  ['/finance/finInvoice', '财务发票'],
  ['/finance/cost-variance', '工单成本偏差'],
  ['/finance/cost-summary', '成本汇总'],
  ['/employee', '员工管理'],
  ['/system/dict-data/', '字典数据'],
  ['/system/dict', '字典管理'],
  ['/system/company-context', '公司映射维护'],
  ['/system/user', '用户管理'],
  ['/system/role', '角色管理'],
  ['/system/org', '组织架构'],
  ['/system/approvallog', '审批日志'],
  ['/biz/abnormal', '业务异常池'],
  ['/style', '款号档案'],
  ['/customer/customer-template', '客户偏好库'],
  ['/customer', '客户管理'],
  ['/supplier', '供应商管理'],
  ['/dashboard', '工作台'],
  ['/login', '登录'],
];

export function resolveDocumentTitle(pathname: string) {
  const pageTitle = routeTitles.find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (!pageTitle) {
    return APP_TITLE;
  }
  if (pathname === '/login') {
    return `${pageTitle} - ${APP_TITLE}`;
  }
  return `${pageTitle} - ${APP_TITLE}`;
}

export function setDocumentTitle(pathname: string) {
  document.title = pathname === '/' ? `${APP_TITLE} - ${APP_SUBTITLE}` : resolveDocumentTitle(pathname);
}
