import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context, page }) => {
  const client = await context.newCDPSession(page)
  await client.send('Storage.clearDataForOrigin', {
    origin: 'http://127.0.0.1:4173',
    storageTypes: 'all',
  })
  await client.detach()
  await page.goto('/')
})

test('creates a local profile and opens the first learning recommendation', async ({ page }) => {
  await page.getByRole('link', { name: /створити профіль/i }).click()

  await page.getByLabel('Твоє ім’я').fill('Марта')
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Поки не знаю' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Увійти до академії' }).click()

  await expect(page.getByRole('heading', { name: 'Привіт, Марта!' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Натуральні числа й арифметика' })).toBeVisible()
  await expect(page.getByRole('button', { name: /почати заняття/i })).toBeVisible()
})
