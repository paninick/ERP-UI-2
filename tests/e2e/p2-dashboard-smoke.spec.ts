import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('用户名').fill('admin')
  await page.getByLabel('密码').fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('P2 dashboard smoke', () => {
  test('dashboard insight page renders key sections', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/insight')
    await expect(page.getByRole('heading', { name: '经营驾驶舱' })).toBeVisible()
    await expect(page.getByText('指标总览')).toBeVisible()
    await expect(page.getByText('阈值预警')).toBeVisible()
  })

  test('supplier rating page renders key sections', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/supplier-rating')
    await expect(page.getByRole('heading', { name: '供应商评级' })).toBeVisible()
    await expect(page.getByText('质量分')).toBeVisible()
    await expect(page.getByText('综合分')).toBeVisible()
    await expect(page.getByText('权重明细')).toBeVisible()
    await expect(page.getByText('当前默认权重：质量 50% / 交期 30% / 价格 20%。')).toBeVisible()
  })

  test('threshold page renders key sections', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/threshold')
    await expect(page.getByText('阈值规则').first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '指标编码' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '阈值' })).toBeVisible()
  })
})
