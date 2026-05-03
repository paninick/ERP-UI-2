import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('用户名').fill('admin');
  await page.getByPlaceholder('密码').fill('admin123');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

async function switchToShuyangFactory(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    window.localStorage.setItem(
      'erp-ui-company-context',
      JSON.stringify({
        code: 'SHUYANG',
        factoryId: 103,
        mode: 'factory',
        userId: 1,
        deptId: 103,
      }),
    );
  });
}

test('PUR_002 shows approved substitute on BOM detail and purchase hint on purchase list', async ({ page }) => {
  await loginAsAdmin(page);
  await switchToShuyangFactory(page);

  await page.goto('/material/bom/4');
  await expect(page.getByText('已批准替代料')).toBeVisible();
  await expect(page.getByText('面料F0001B')).toBeVisible();
  await expect(page.getByText('PUR_002_SMOKE_MAIN_SHORTAGE_20260502')).toBeVisible();

  await page.goto('/purchase?sn=PO-PUR002-SMOKE-20260502');
  await expect(page.getByRole('heading', { name: '采购管理' })).toBeVisible();
  await expect(page.getByText('PO-PUR002-SMOKE-20260502')).toBeVisible();
  await expect(page.getByText('已命中 1 条批准替代')).toBeVisible();
  await expect(page.getByText('面料F0001 -> 面料F0001B')).toBeVisible();
});
