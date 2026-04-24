import {Page, Route} from '@playwright/test';

interface ProcessRecord {
  id: number;
  jobId: number;
  processId: number;
  processName: string;
  processSeq: number;
  employeeName: string;
  inQty: number;
  outQty: number;
  defectQty: number;
  lossQty: number;
  processStatus: string;
  isOutsource: string;
  lossExceed?: string;
  rejectReason?: string;
  releaseBy?: string;
}

function jsonResponse(route: Route, body: any) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function installErpMocks(page: Page) {
  const state = {
    token: 'mock-token',
    user: {
      userId: 1,
      userName: 'tester',
      nickName: '测试员',
    },
    roles: ['admin'],
    permissions: ['*:*:*'],
    processRoutes: [
      {id: 9001, routeName: '基础针织路线'},
    ],
    suppliers: [
      {id: 301, supplierName: '华东纺织'},
      {id: 302, supplierName: '联成外协'},
    ],
    jobs: [
      {
        id: 101,
        jobNo: 'JOB-001',
        planNo: 'PLAN-001',
        styleCode: 'KN-24-SP-001',
        colorCode: '黑色',
        sizeCode: 'M',
        planQty: 100,
        actualQty: 40,
        defectQty: 2,
        currentProcessName: '横机织片',
        status: '1',
        processRouteId: 9001,
      },
      {
        id: 102,
        jobNo: 'JOB-INIT',
        planNo: 'PLAN-002',
        styleCode: 'KN-24-SP-002',
        colorCode: '灰色',
        sizeCode: 'L',
        planQty: 80,
        actualQty: 0,
        defectQty: 0,
        currentProcessName: '',
        status: '0',
        processRouteId: 9001,
      },
      {
        id: 103,
        jobNo: 'JOB-OUT',
        planNo: 'PLAN-003',
        styleCode: 'KN-24-SP-003',
        colorCode: '藏青',
        sizeCode: 'S',
        planQty: 60,
        actualQty: 0,
        defectQty: 0,
        currentProcessName: '外协缝合',
        status: '1',
        processRouteId: 9001,
      },
    ],
    employees: [
      {id: 11, employeeName: '张三', department: '织造车间'},
      {id: 12, employeeName: '李四', department: '质检组'},
    ],
    salesOrders: [
      {
        id: 201,
        salesNo: 'SO-001',
        customerName: '海岸品牌',
        styleCode: 'KN-24-SP-001',
        orderDate: '2026-04-20',
        deliveryDate: '2026-05-01',
        quantity: 120,
        amount: 5600,
        orderStatus: '1',
        remark: '首单',
      },
    ],
    purchases: [
      {
        id: 401,
        sn: 'PO-001',
        type: '原材料',
        supplierId: 301,
        supplierName: '华东纺织',
        bulkOrderNo: 'BULK-001',
        description: '纱线采购',
        expectedDeliveryDate: '2026-05-03',
        purchaseName: '王采购',
        status: '待确认',
        amount: 2600,
      },
    ],
    outsources: [
      {
        id: 501,
        outsourceNo: 'OUT-001',
        supplierId: 302,
        supplierName: '联成外协',
        jobNo: 'JOB-OUT',
        processName: '外协缝合',
        styleCode: 'KN-24-SP-003',
        quantity: 60,
        unitPrice: 12.5,
        expectedDate: '2026-05-05',
        status: '2',
      },
    ],
    stockIns: [
      {
        id: 601,
        stockInNo: 'IN-001',
        warehouseId: 1,
        warehouseName: '主仓',
        materialName: '棉纱',
        quantity: 200,
        stockInDate: '2026-04-22',
        status: '1',
      },
    ],
    stockOuts: [
      {
        id: 701,
        stockOutNo: 'OUT-STORE-001',
        warehouseId: 1,
        warehouseName: '主仓',
        materialName: '棉纱',
        quantity: 60,
        stockOutDate: '2026-04-23',
        status: '0',
      },
    ],
    styleProgress: [
      {
        styleCode: 'KN-24-SP-001',
        bulkOrderNo: 'BULK-001',
        customerName: '海岸品牌',
        salesNo: 'SO-001',
        totalJobs: 2,
        totalPlanQty: 180,
        totalActualQty: 96,
        completeRatePct: 53.3,
        shippedQty: 20,
        dueDate: '2026-04-20',
      },
      {
        styleCode: 'KN-24-SP-003',
        bulkOrderNo: 'BULK-003',
        customerName: '联名客户',
        salesNo: 'SO-003',
        totalJobs: 1,
        totalPlanQty: 60,
        totalActualQty: 60,
        completeRatePct: 100,
        shippedQty: 60,
        dueDate: '2026-04-28',
      },
    ],
    productTrace: [
      {
        salesOrderId: 201,
        salesNo: 'SO-001',
        styleCode: 'KN-24-SP-001',
        bulkOrderNo: 'BULK-001',
        customerName: '海岸品牌',
        producePlanId: 801,
        planNo: 'PLAN-001',
        produceJobId: 101,
        jobNo: 'JOB-001',
        colorCode: '黑色',
        sizeCode: 'M',
        planQty: 100,
        actualQty: 60,
        serialId: 90001,
        serialNo: 'SER-001',
        serialStatus: '0',
        serialStatusName: '在制',
        currentProcessName: '横机织片',
        serialCreateTime: '2026-04-20 08:00:00',
        finishTime: '',
        warehouseTime: '',
        shipTime: '',
      },
      {
        salesOrderId: 203,
        salesNo: 'SO-003',
        styleCode: 'KN-24-SP-003',
        bulkOrderNo: 'BULK-003',
        customerName: '联名客户',
        producePlanId: 803,
        planNo: 'PLAN-003',
        produceJobId: 103,
        jobNo: 'JOB-OUT',
        colorCode: '藏青',
        sizeCode: 'S',
        planQty: 60,
        actualQty: 60,
        serialId: 90002,
        serialNo: 'SER-OUT-001',
        serialStatus: '3',
        serialStatusName: '已出货',
        currentProcessName: '',
        serialCreateTime: '2026-04-18 08:00:00',
        finishTime: '2026-04-21 10:00:00',
        warehouseTime: '2026-04-22 10:00:00',
        shipTime: '2026-04-23 09:00:00',
      },
    ],
    defects: [] as any[],
    processesByJob: {
      101: [
        {
          id: 1001,
          jobId: 101,
          processId: 501,
          processName: '横机织片',
          processSeq: 1,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'RUNNING',
          isOutsource: '0',
          lossExceed: '0',
        },
        {
          id: 1002,
          jobId: 101,
          processId: 502,
          processName: '缝合',
          processSeq: 2,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'PENDING',
          isOutsource: '0',
          lossExceed: '0',
        },
        {
          id: 1003,
          jobId: 101,
          processId: 503,
          processName: '整烫包装',
          processSeq: 3,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'PENDING',
          isOutsource: '0',
          lossExceed: '0',
        },
      ] as ProcessRecord[],
      102: [] as ProcessRecord[],
      103: [
        {
          id: 3001,
          jobId: 103,
          processId: 701,
          processName: '外协缝合',
          processSeq: 1,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'RUNNING',
          isOutsource: '1',
          lossExceed: '0',
        },
        {
          id: 3002,
          jobId: 103,
          processId: 702,
          processName: '整烫包装',
          processSeq: 2,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'PENDING',
          isOutsource: '0',
          lossExceed: '0',
        },
      ] as ProcessRecord[],
    } as Record<number, ProcessRecord[]>,
  };

  await page.addInitScript((token) => {
    window.localStorage.setItem('token', token);
  }, state.token);

  await page.route('**/api/login', async (route) => {
    await jsonResponse(route, {code: 200, token: state.token});
  });

  await page.route('**/api/getInfo', async (route) => {
    await jsonResponse(route, {
      code: 200,
      user: state.user,
      roles: state.roles,
      permissions: state.permissions,
    });
  });

  await page.route('**/api/erp/processRoute/list**', async (route) => {
    await jsonResponse(route, {code: 200, rows: state.processRoutes, total: state.processRoutes.length});
  });

  await page.route('**/api/erp/supplier/list**', async (route) => {
    await jsonResponse(route, {code: 200, rows: state.suppliers, total: state.suppliers.length});
  });

  await page.route('**/api/erp/produceJob/list**', async (route) => {
    const url = new URL(route.request().url());
    const jobNo = url.searchParams.get('jobNo') || '';
    const styleCode = url.searchParams.get('styleCode') || '';
    const status = url.searchParams.get('status') || '';
    const rows = state.jobs.filter((job) => (
      (!jobNo || job.jobNo.includes(jobNo))
      && (!styleCode || job.styleCode.includes(styleCode))
      && (!status || job.status === status)
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/produceJob\/\d+$/, async (route) => {
    const jobId = Number(route.request().url().split('/').pop());
    const job = state.jobs.find((item) => item.id === jobId);
    await jsonResponse(route, {code: 200, data: job || null});
  });

  await page.route('**/api/erp/produceJob/initProcesses/**', async (route) => {
    const parts = route.request().url().split('/');
    const jobId = Number(parts[parts.length - 2]);
    const routeId = Number(parts[parts.length - 1]);
    const job = state.jobs.find((item) => item.id === jobId);
    if (job && routeId) {
      state.processesByJob[jobId] = [
        {
          id: 2001,
          jobId,
          processId: 601,
          processName: '横机织片',
          processSeq: 1,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'RUNNING',
          isOutsource: '0',
          lossExceed: '0',
        },
        {
          id: 2002,
          jobId,
          processId: 602,
          processName: '缝合',
          processSeq: 2,
          employeeName: '',
          inQty: 0,
          outQty: 0,
          defectQty: 0,
          lossQty: 0,
          processStatus: 'PENDING',
          isOutsource: '0',
          lossExceed: '0',
        },
      ];
      job.currentProcessName = '横机织片';
      job.status = '1';
    }
    await jsonResponse(route, {code: 200, msg: 'success'});
  });

  await page.route(/.*\/api\/erp\/produceJobProcess\/listByJob\/\d+$/, async (route) => {
    const jobId = Number(route.request().url().split('/').pop());
    await jsonResponse(route, {code: 200, rows: state.processesByJob[jobId] || []});
  });

  await page.route(/.*\/api\/erp\/produceJobProcess\/currentProcess\/\d+$/, async (route) => {
    const jobId = Number(route.request().url().split('/').pop());
    const current = (state.processesByJob[jobId] || []).find((item) => item.processStatus === 'RUNNING' || item.processStatus === 'PENDING');
    await jsonResponse(route, {code: 200, data: current || null});
  });

  await page.route(/.*\/api\/erp\/produceJobProcess\/list(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const processStatus = url.searchParams.get('processStatus') || '';
    const jobNo = url.searchParams.get('jobNo') || '';
    const rows = Object.values(state.processesByJob)
      .flat()
      .filter((item) => {
        const job = state.jobs.find((jobItem) => jobItem.id === item.jobId);
        return (!processStatus || item.processStatus === processStatus)
          && (!jobNo || job?.jobNo.includes(jobNo));
      });
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route('**/api/erp/produceJobProcess', async (route) => {
    if (route.request().method() !== 'PUT') {
      await jsonResponse(route, {code: 200});
      return;
    }

    const payload = route.request().postDataJSON();
    const target = Object.values(state.processesByJob).flat().find((item) => item.id === payload.id);

    if (target) {
      const jobProcesses = state.processesByJob[target.jobId] || [];

      if (payload.processStatus === 'FAIL') {
        Object.assign(target, payload, {
          processStatus: 'RUNNING',
          rejectReason: payload.rejectReason,
          releaseBy: payload.releaseBy,
        });
      } else if (payload.processStatus === 'PASS') {
        Object.assign(target, payload, {
          processStatus: 'PASS',
          releaseBy: payload.releaseBy,
        });
        const next = jobProcesses.find((item) => item.processSeq === target.processSeq + 1);
        if (next && next.processStatus === 'PENDING') {
          next.processStatus = 'RUNNING';
          next.inQty = target.outQty || next.inQty;
        }
      } else {
        Object.assign(target, payload, {
          employeeName: payload.employeeName || target.employeeName,
          lossExceed: payload.inQty && payload.lossQty && payload.lossQty / payload.inQty > 0.05 ? '1' : '0',
        });

        if (payload.processStatus === 'WAIT_CHECK') {
          const next = jobProcesses.find((item) => item.processSeq === target.processSeq + 1);
          if (next && next.processStatus === 'PENDING') {
            next.inQty = payload.outQty || 0;
          }
        }
      }

      const job = state.jobs.find((item) => item.id === target.jobId);
      if (job) {
        const current = jobProcesses.find((item) => item.processStatus === 'RUNNING');
        job.defectQty = target.defectQty || job.defectQty || 0;
        job.actualQty = target.outQty || job.actualQty || 0;
        job.currentProcessName = current?.processName || '';
      }
    }

    await jsonResponse(route, {code: 200, msg: 'success'});
  });

  await page.route('**/api/erp/defect/list**', async (route) => {
    const url = new URL(route.request().url());
    const jobId = Number(url.searchParams.get('jobId') || 0);
    const processId = Number(url.searchParams.get('processId') || 0);
    const rows = state.defects.filter((item) => item.jobId === jobId && item.processId === processId);
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route('**/api/erp/defect', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      state.defects.push(payload);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/employee/list**', async (route) => {
    await jsonResponse(route, {code: 200, rows: state.employees, total: state.employees.length});
  });

  await page.route('**/api/erp/styleProgress/list**', async (route) => {
    const url = new URL(route.request().url());
    const styleCode = url.searchParams.get('styleCode') || '';
    const customerName = url.searchParams.get('customerName') || '';
    const salesNo = url.searchParams.get('salesNo') || '';
    const rows = state.styleProgress.filter((item) => (
      (!styleCode || item.styleCode.includes(styleCode))
      && (!customerName || item.customerName.includes(customerName))
      && (!salesNo || item.salesNo.includes(salesNo))
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route('**/api/erp/productTrace/list**', async (route) => {
    const url = new URL(route.request().url());
    const salesNo = url.searchParams.get('salesNo') || '';
    const styleCode = url.searchParams.get('styleCode') || '';
    const jobNo = url.searchParams.get('jobNo') || '';
    const serialNo = url.searchParams.get('serialNo') || '';
    const serialStatus = url.searchParams.get('serialStatus') || '';
    const rows = state.productTrace.filter((item) => (
      (!salesNo || item.salesNo.includes(salesNo))
      && (!styleCode || item.styleCode.includes(styleCode))
      && (!jobNo || item.jobNo.includes(jobNo))
      && (!serialNo || item.serialNo.includes(serialNo))
      && (!serialStatus || item.serialStatus === serialStatus)
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route('**/api/erp/sales/order/list**', async (route) => {
    const url = new URL(route.request().url());
    const salesNo = url.searchParams.get('salesNo') || '';
    const customerName = url.searchParams.get('customerName') || '';
    const orderStatus = url.searchParams.get('orderStatus') || '';
    const rows = state.salesOrders.filter((item) => (
      (!salesNo || item.salesNo.includes(salesNo))
      && (!customerName || item.customerName.includes(customerName))
      && (!orderStatus || item.orderStatus === orderStatus)
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/sales\/order\/\d+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const id = Number(route.request().url().split('/').pop());
      state.salesOrders = state.salesOrders.filter((item) => item.id !== id);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    const id = Number(route.request().url().split('/').pop());
    const order = state.salesOrders.find((item) => item.id === id);
    await jsonResponse(route, {code: 200, data: order || null});
  });

  await page.route('**/api/erp/sales/order', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      state.salesOrders.push({
        id: Date.now(),
        orderStatus: '0',
        ...payload,
      });
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    if (method === 'PUT') {
      const payload = route.request().postDataJSON();
      const target = state.salesOrders.find((item) => item.id === payload.id);
      if (target) {
        Object.assign(target, payload);
      }
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/purchase/list**', async (route) => {
    const url = new URL(route.request().url());
    const sn = url.searchParams.get('sn') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';
    const rows = state.purchases.filter((item) => (
      (!sn || item.sn.includes(sn))
      && (!type || item.type === type)
      && (!status || item.status === status)
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/purchase\/\d+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const id = Number(route.request().url().split('/').pop());
      state.purchases = state.purchases.filter((item) => item.id !== id);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    const id = Number(route.request().url().split('/').pop());
    const item = state.purchases.find((purchase) => purchase.id === id);
    await jsonResponse(route, {code: 200, data: item || null});
  });

  await page.route('**/api/erp/purchase', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const supplier = state.suppliers.find((item) => item.id === payload.supplierId);
      state.purchases.push({
        id: Date.now(),
        purchaseName: '测试员',
        supplierName: supplier?.supplierName || '',
        ...payload,
      });
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    if (method === 'PUT') {
      const payload = route.request().postDataJSON();
      const target = state.purchases.find((item) => item.id === payload.id);
      const supplier = state.suppliers.find((item) => item.id === payload.supplierId);
      if (target) {
        Object.assign(target, payload, {supplierName: supplier?.supplierName || target.supplierName});
      }
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/outsource/list**', async (route) => {
    const url = new URL(route.request().url());
    const outsourceNo = url.searchParams.get('outsourceNo') || '';
    const styleCode = url.searchParams.get('styleCode') || '';
    const status = url.searchParams.get('status') || '';
    const rows = state.outsources.filter((item) => (
      (!outsourceNo || item.outsourceNo.includes(outsourceNo))
      && (!styleCode || item.styleCode.includes(styleCode))
      && (!status || item.status === status)
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/outsource\/\d+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const id = Number(route.request().url().split('/').pop());
      state.outsources = state.outsources.filter((item) => item.id !== id);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    const id = Number(route.request().url().split('/').pop());
    const item = state.outsources.find((outsource) => outsource.id === id);
    await jsonResponse(route, {code: 200, data: item || null});
  });

  await page.route('**/api/erp/outsource', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const supplier = state.suppliers.find((item) => item.id === payload.supplierId);
      state.outsources.push({
        id: Date.now(),
        supplierName: supplier?.supplierName || '',
        ...payload,
      });
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    if (method === 'PUT') {
      const payload = route.request().postDataJSON();
      const target = state.outsources.find((item) => item.id === payload.id);
      const supplier = state.suppliers.find((item) => item.id === payload.supplierId);
      if (target) {
        Object.assign(target, payload, {supplierName: supplier?.supplierName || target.supplierName});
      }
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/stockIn/list**', async (route) => {
    const url = new URL(route.request().url());
    const stockInNo = url.searchParams.get('stockInNo') || '';
    const materialName = url.searchParams.get('materialName') || '';
    const rows = state.stockIns.filter((item) => (
      (!stockInNo || item.stockInNo.includes(stockInNo))
      && (!materialName || item.materialName.includes(materialName))
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/stockIn\/\d+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const id = Number(route.request().url().split('/').pop());
      state.stockIns = state.stockIns.filter((item) => item.id !== id);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    const id = Number(route.request().url().split('/').pop());
    const item = state.stockIns.find((stockIn) => stockIn.id === id);
    await jsonResponse(route, {code: 200, data: item || null});
  });

  await page.route('**/api/erp/stockIn', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      state.stockIns.push({
        id: Date.now(),
        warehouseName: '主仓',
        status: '0',
        ...payload,
      });
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    if (method === 'PUT') {
      const payload = route.request().postDataJSON();
      const target = state.stockIns.find((item) => item.id === payload.id);
      if (target) {
        Object.assign(target, payload);
      }
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/stockOut/list**', async (route) => {
    const url = new URL(route.request().url());
    const stockOutNo = url.searchParams.get('stockOutNo') || '';
    const materialName = url.searchParams.get('materialName') || '';
    const rows = state.stockOuts.filter((item) => (
      (!stockOutNo || item.stockOutNo.includes(stockOutNo))
      && (!materialName || item.materialName.includes(materialName))
    ));
    await jsonResponse(route, {code: 200, rows, total: rows.length});
  });

  await page.route(/.*\/api\/erp\/stockOut\/\d+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const id = Number(route.request().url().split('/').pop());
      state.stockOuts = state.stockOuts.filter((item) => item.id !== id);
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    const id = Number(route.request().url().split('/').pop());
    const item = state.stockOuts.find((stockOut) => stockOut.id === id);
    await jsonResponse(route, {code: 200, data: item || null});
  });

  await page.route('**/api/erp/stockOut', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      state.stockOuts.push({
        id: Date.now(),
        warehouseName: '主仓',
        status: '0',
        ...payload,
      });
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    if (method === 'PUT') {
      const payload = route.request().postDataJSON();
      const target = state.stockOuts.find((item) => item.id === payload.id);
      if (target) {
        Object.assign(target, payload);
      }
      await jsonResponse(route, {code: 200, msg: 'success'});
      return;
    }
    await jsonResponse(route, {code: 200});
  });

  await page.route('**/api/erp/inventory/list**', async (route) => {
    await jsonResponse(route, {
      code: 200,
      rows: [
        {id: 1, warehouseName: '主仓', materialName: '棉纱', materialNo: 'MAT-001', quantity: 340, unit: 'kg', locationName: 'A-01'},
      ],
      total: 1,
    });
  });
}
