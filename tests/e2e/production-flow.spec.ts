import {expect, test} from '@playwright/test';
import {installErpMocks} from './fixtures/erpMock';

test.beforeEach(async ({page}) => {
  await installErpMocks(page);
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
});

test('login page shows clean Chinese copy and can sign in', async ({page}) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', {name: 'ERP 系统'})).toBeVisible();
  await expect(page.getByPlaceholder('用户名')).toBeVisible();
  await expect(page.getByPlaceholder('密码')).toBeVisible();

  await page.getByPlaceholder('用户名').fill('tester');
  await page.getByPlaceholder('密码').fill('123456');
  await page.getByRole('button', {name: '登录'}).click();

  await expect(page).toHaveURL(/dashboard/);
});

test('job page can initialize processes for a configured work order', async ({page}) => {
  await page.goto('/production/job');

  await expect(page.getByRole('heading', {name: '生产工单'})).toBeVisible();
  await page.getByRole('row').filter({hasText: 'JOB-001'}).getByRole('button', {name: '初始化工序'}).click();

  await expect(page.getByText('工序初始化成功')).toBeVisible();
});

test('sales order page supports create and delete as CRUD smoke test', async ({page}) => {
  await page.goto('/sales/order');

  await expect(page.getByRole('heading', {name: '销售订单'})).toBeVisible();
  await page.getByRole('button', {name: '新增'}).click();
  const dialog = page.getByRole('dialog', {name: '新增销售订单'});
  await dialog.getByLabel('订单编号').fill('SO-NEW-001');
  await dialog.getByLabel('客户名称').fill('新客户');
  await dialog.getByLabel('款号').fill('KN-NEW-001');
  await dialog.getByLabel('订单日期').fill('2026-04-24');
  await dialog.getByLabel('交付日期').fill('2026-05-02');
  await dialog.getByLabel('数量').fill('88');
  await dialog.getByLabel('金额').fill('3200');
  await page.getByRole('button', {name: '确定'}).click();

  await expect(page.getByText('新增成功')).toBeVisible();
  await expect(page.getByText('SO-NEW-001')).toBeVisible();

  await page.getByRole('row').filter({hasText: 'SO-NEW-001'}).getByRole('button', {name: '删除'}).click();
  await expect(page.getByText('删除成功')).toBeVisible();
});

test('purchase page supports create edit delete and filter', async ({page}) => {
  await page.goto('/purchase');

  await expect(page.getByRole('heading', {name: '采购管理'})).toBeVisible();
  await page.getByRole('button', {name: '新增'}).click();
  let dialog = page.getByRole('dialog', {name: '新增采购管理'});
  await dialog.getByLabel('采购单号').fill('PO-NEW-001');
  await dialog.getByLabel('供应商').selectOption('301');
  await dialog.getByLabel('采购类型').selectOption('原材料');
  await dialog.getByLabel('大货订单号').fill('BULK-NEW');
  await dialog.getByLabel('预计交期').fill('2026-05-07');
  await dialog.getByLabel('金额').fill('1800');
  await page.getByRole('button', {name: '确定'}).click();

  await expect(page.getByText('新增成功')).toBeVisible();
  const row = page.getByRole('row').filter({hasText: 'PO-NEW-001'});
  await expect(row).toBeVisible();

  await row.getByRole('button', {name: '编辑'}).click();
  dialog = page.getByRole('dialog', {name: '编辑采购管理'});
  await dialog.getByLabel('金额').fill('2200');
  await dialog.getByLabel('状态').selectOption('已确认');
  await page.getByRole('button', {name: '确定'}).click();
  await expect(page.getByText('修改成功')).toBeVisible();
  await expect(page.getByText('¥2200.00')).toBeVisible();

  await page.getByPlaceholder('请输入采购单号').fill('PO-NEW-001');
  await page.getByRole('button', {name: '搜索'}).click();
  await expect(page.getByRole('row').filter({hasText: 'PO-NEW-001'})).toBeVisible();

  await row.getByRole('button', {name: '删除'}).click();
  await expect(page.getByText('删除成功')).toBeVisible();
});

test('outsource page supports create edit delete and filter', async ({page}) => {
  await page.goto('/outsource');

  await expect(page.getByRole('heading', {name: '外协加工'})).toBeVisible();
  await page.getByRole('button', {name: '新增'}).click();
  let dialog = page.getByRole('dialog', {name: '新增外协加工'});
  await dialog.getByLabel('外协单号').fill('OUT-NEW-001');
  await dialog.getByLabel('供应商').selectOption('302');
  await dialog.getByLabel('工单编号').fill('JOB-OUT');
  await dialog.getByLabel('工序').fill('外协缝合');
  await dialog.getByLabel('款号').fill('KN-24-SP-003');
  await dialog.getByLabel('数量').fill('66');
  await dialog.getByLabel('单价').fill('14');
  await page.getByRole('button', {name: '确定'}).click();

  await expect(page.getByText('新增成功')).toBeVisible();
  const row = page.getByRole('row').filter({hasText: 'OUT-NEW-001'});
  await expect(row).toBeVisible();

  await row.getByRole('button', {name: '编辑'}).click();
  dialog = page.getByRole('dialog', {name: '编辑外协加工'});
  await dialog.getByLabel('状态').selectOption('3');
  await dialog.getByLabel('单价').fill('16');
  await page.getByRole('button', {name: '确定'}).click();
  await expect(page.getByText('修改成功')).toBeVisible();
  await expect(page.getByText('¥16.00')).toBeVisible();

  await page.getByPlaceholder('请输入外协单号').fill('OUT-NEW-001');
  await page.getByRole('button', {name: '搜索'}).click();
  await expect(page.getByRole('row').filter({hasText: 'OUT-NEW-001'})).toBeVisible();

  await row.getByRole('button', {name: '删除'}).click();
  await expect(page.getByText('删除成功')).toBeVisible();
});

test('stock in page supports create edit delete and filter', async ({page}) => {
  await page.goto('/inventory/stock-in');

  await expect(page.getByRole('heading', {name: '入库管理'})).toBeVisible();
  await page.getByRole('button', {name: '新增'}).click();
  let dialog = page.getByRole('dialog', {name: '新增入库管理'});
  await dialog.getByLabel('入库单号').fill('IN-NEW-001');
  await dialog.getByLabel('仓库').selectOption('1');
  await dialog.getByLabel('物料名称').fill('羊毛纱');
  await dialog.getByLabel('数量').fill('88');
  await dialog.getByLabel('入库日期').fill('2026-04-24');
  await page.getByRole('button', {name: '确定'}).click();

  await expect(page.getByText('新增成功')).toBeVisible();
  const row = page.getByRole('row').filter({hasText: 'IN-NEW-001'});
  await expect(row).toBeVisible();

  await row.getByRole('button', {name: '编辑'}).click();
  dialog = page.getByRole('dialog', {name: '编辑入库管理'});
  await dialog.getByLabel('数量').fill('99');
  await page.getByRole('button', {name: '确定'}).click();
  await expect(page.getByText('修改成功')).toBeVisible();

  await page.getByPlaceholder('请输入入库单号').fill('IN-NEW-001');
  await page.getByRole('button', {name: '搜索'}).click();
  await expect(page.getByRole('row').filter({hasText: 'IN-NEW-001'})).toBeVisible();

  await row.getByRole('button', {name: '删除'}).click();
  await expect(page.getByText('删除成功')).toBeVisible();
});

test('stock out page supports create edit delete and filter', async ({page}) => {
  await page.goto('/inventory/stock-out');

  await expect(page.getByRole('heading', {name: '出库管理'})).toBeVisible();
  await page.getByRole('button', {name: '新增'}).click();
  let dialog = page.getByRole('dialog', {name: '新增出库管理'});
  await dialog.getByLabel('出库单号').fill('OUT-NEW-STORE-001');
  await dialog.getByLabel('仓库').selectOption('1');
  await dialog.getByLabel('物料名称').fill('羊毛纱');
  await dialog.getByLabel('数量').fill('30');
  await dialog.getByLabel('出库日期').fill('2026-04-24');
  await page.getByRole('button', {name: '确定'}).click();

  await expect(page.getByText('新增成功')).toBeVisible();
  const row = page.getByRole('row').filter({hasText: 'OUT-NEW-STORE-001'});
  await expect(row).toBeVisible();

  await row.getByRole('button', {name: '编辑'}).click();
  dialog = page.getByRole('dialog', {name: '编辑出库管理'});
  await dialog.getByLabel('数量').fill('45');
  await page.getByRole('button', {name: '确定'}).click();
  await expect(page.getByText('修改成功')).toBeVisible();

  await page.getByPlaceholder('请输入出库单号').fill('OUT-NEW-STORE-001');
  await page.getByRole('button', {name: '搜索'}).click();
  await expect(page.getByRole('row').filter({hasText: 'OUT-NEW-STORE-001'})).toBeVisible();

  await row.getByRole('button', {name: '删除'}).click();
  await expect(page.getByText('删除成功')).toBeVisible();
});

test('process report requires defect details when defect qty exists', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await expect(page.getByRole('heading', {name: '工序报工'})).toBeVisible();
  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('96');
  await page.getByLabel('损耗数量').fill('1');
  await page.getByRole('button', {name: '确认报工'}).click();

  await expect(page.getByText('存在次品时必须补充缺陷明细')).toBeVisible();
  await expect(page.getByRole('heading', {name: '次品缺陷记录'})).toBeVisible();
});

test('process report rejects invalid quantity combinations', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('99');
  await page.getByLabel('损耗数量').fill('2');
  await page.getByRole('button', {name: '确认报工'}).click();

  await expect(page.getByText('合格数量与损耗数量之和不能超过接收数量')).toBeVisible();
});

test('process report rejects defect detail sum mismatch', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('96');
  await page.getByLabel('损耗数量').fill('1');
  await page.getByRole('button', {name: /缺陷明细/}).click();
  await page.getByLabel('缺陷类型 *').selectOption('WEAVE');
  await page.getByLabel('缺陷等级 *').selectOption('MAJOR');
  await page.getByLabel('数量 *').fill('2');
  await page.getByLabel('处理方式 *').selectOption('REPAIR');
  await page.getByRole('button', {name: '取消'}).click();

  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('存在次品时必须补充缺陷明细')).toBeVisible();
});

test('process report shows high loss warning when loss rate exceeds threshold', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('90');
  await page.getByLabel('损耗数量').fill('6');

  await expect(page.getByText('当前损耗率为 6.0%，已超过 5% 预警阈值，请确认后再提交。')).toBeVisible();
});

test('outsource process report shows outsource tag and allows broken needle defect', async ({page}) => {
  await page.goto('/production/job-process/report/103');

  await expect(page.getByText('外协', {exact: true}).first()).toBeVisible();
  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('60');
  await page.getByLabel('合格数量').fill('58');
  await page.getByRole('button', {name: /缺陷明细/}).click();
  await page.getByLabel('缺陷类型 *').selectOption('NEEDLE');
  await page.getByLabel('缺陷等级 *').selectOption('CRITICAL');
  await page.getByLabel('数量 *').fill('2');
  await page.getByLabel('处理方式 *').selectOption('SCRAP');
  await page.getByText('残断针异常（零容忍）').click();
  await page.getByRole('button', {name: '确认 (2/2)'}).click();
  await page.getByRole('button', {name: '确认报工'}).click();

  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await page.getByRole('row').filter({hasText: '103'}).getByRole('button', {name: '审核'}).click();
  await expect(page.getByText('残断针').first()).toBeVisible();
});

test('process report submits defects and next process receives transferred qty', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('96');
  await page.getByLabel('损耗数量').fill('1');

  await page.getByRole('button', {name: /缺陷明细/}).click();
  await page.getByLabel('缺陷类型 *').selectOption('WEAVE');
  await page.getByLabel('缺陷等级 *').selectOption('MAJOR');
  await page.getByLabel('数量 *').fill('3');
  await page.getByLabel('处理方式 *').selectOption('REPAIR');
  await page.getByLabel('责任归属 *').selectOption('SELF');
  await page.getByRole('button', {name: '确认 (3/3)'}).click();

  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();
  await expect(page.getByLabel('接收数量')).toHaveValue('96');
});

test('quality inspection requires reject reason before fail', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('100');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await page.getByRole('button', {name: '审核'}).click();
  await page.getByRole('button', {name: '驳回'}).click();

  await expect(page.getByText('驳回时必须填写原因')).toBeVisible();
});

test('quality inspection can reject and process can be reported again', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('100');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await page.getByRole('button', {name: '审核'}).click();
  await page.getByLabel('驳回原因').fill('针距异常，需要返工');
  await page.getByRole('button', {name: '驳回'}).click();
  await expect(page.getByText('质检驳回成功')).toBeVisible();

  await page.goto('/production/job-process/report/101');
  await expect(page.getByRole('heading', {name: '横机织片'})).toBeVisible();
  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('100');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();
});

test('quality inspection can pass waiting process', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('100');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await expect(page.getByRole('heading', {name: '质检放行'})).toBeVisible();
  await page.getByRole('button', {name: '审核'}).click();
  await page.getByRole('button', {name: '放行'}).click();

  await expect(page.getByText('质检放行成功')).toBeVisible();
});

test('three-step process can progress from first report to third process input', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('接收数量').fill('100');
  await page.getByLabel('合格数量').fill('100');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await page.getByRole('button', {name: '审核'}).click();
  await page.getByRole('button', {name: '放行'}).click();
  await expect(page.getByText('质检放行成功')).toBeVisible();

  await page.goto('/production/job-process/report/101');
  await expect(page.getByRole('heading', {name: '缝合'})).toBeVisible();
  await expect(page.getByLabel('接收数量')).toHaveValue('100');
  await page.getByLabel('操作工').selectOption('11');
  await page.getByLabel('合格数量').fill('98');
  await page.getByLabel('损耗数量').fill('2');
  await page.getByRole('button', {name: '确认报工'}).click();
  await expect(page.getByText('报工提交成功，已进入待检')).toBeVisible();

  await page.goto('/quality/inspection');
  await page.getByRole('button', {name: '审核'}).click();
  await page.getByRole('button', {name: '放行'}).click();
  await expect(page.getByText('质检放行成功')).toBeVisible();

  await page.goto('/production/job-process/report/101');
  await expect(page.getByRole('heading', {name: '整烫包装'})).toBeVisible();
  await expect(page.getByLabel('接收数量')).toHaveValue('98');
});
test('process report can apply recommended values for current step', async ({page}) => {
  await page.goto('/production/job-process/report/101');

  await page.getByRole('button', {name: '一键带入建议值'}).click();
  await expect(page.getByLabel('接收数量')).toHaveValue('100');
  await expect(page.getByLabel('合格数量')).toHaveValue('100');
  await expect(page.getByLabel('损耗数量')).toHaveValue('0');
});

test('production kanban can filter risk jobs and search by job number', async ({page}) => {
  await page.goto('/production/kanban');

  await expect(page.getByRole('heading', {name: '生产看板'})).toBeVisible();
  await page.getByRole('button', {name: /需关注/}).click();
  await expect(page.getByTestId('kanban-job-JOB-001')).toBeVisible();

  await page.getByPlaceholder('搜索工单号 / 款号 / 当前工序').fill('JOB-OUT');
  await expect(page.getByTestId('kanban-job-JOB-001')).not.toBeVisible();

  await page.getByRole('button', {name: /全部工单/}).click();
  await expect(page.getByTestId('kanban-job-JOB-OUT')).toBeVisible();
});

test('style progress page can search and reset', async ({page}) => {
  await page.goto('/production/style-progress');

  await expect(page.getByRole('heading', {name: '款号进度视图'})).toBeVisible();
  await page.getByPlaceholder('输入款号').fill('KN-24-SP-003');
  await page.getByRole('button', {name: '搜索'}).click();
  await expect(page.getByText('联名客户')).toBeVisible();
  await expect(page.getByText('海岸品牌')).not.toBeVisible();

  await page.getByRole('button', {name: '重置'}).click();
  await expect(page.getByText('海岸品牌')).toBeVisible();
});

test('product trace page can filter by serial status', async ({page}) => {
  await page.goto('/production/product-trace');

  await expect(page.getByRole('heading', {name: '产品全链路追溯'})).toBeVisible();
  await page.getByLabel('状态').selectOption('3');
  await page.getByRole('button', {name: '搜索'}).click();

  await expect(page.getByText('SER-OUT-001')).toBeVisible();
  await expect(page.getByText('SER-001')).not.toBeVisible();
});
