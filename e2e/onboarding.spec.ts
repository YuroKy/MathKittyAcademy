import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ context, page }) => {
  const client = await context.newCDPSession(page)
  await client.send('Storage.clearDataForOrigin', {
    origin: 'http://127.0.0.1:4173',
    storageTypes: 'all',
  })
  await client.detach()
  await page.goto('/')
})

async function createProfile(page: Page, name: string): Promise<void> {
  await page.getByRole('link', { name: /створити профіль/i }).click()

  await page.getByLabel('Твоє ім’я').fill(name)
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Поки не знаю' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Увійти до академії' }).click()
}

test('creates a local profile and opens the first learning recommendation', async ({ page }) => {
  await createProfile(page, 'Марта')

  await expect(page.getByRole('heading', { name: 'Привіт, Марта!' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Натуральні числа й арифметика' })).toBeVisible()
  await expect(page.getByRole('button', { name: /почати заняття/i })).toBeVisible()
})

test('lets a learner preview an advanced topic in any order', async ({ page }) => {
  await createProfile(page, 'Леся')
  await page.getByRole('link', { name: 'Карта навчання' }).click()

  await page.getByRole('button', { name: /Відсотки/ }).click()
  await expect(page.getByRole('heading', { name: 'Можна спробувати просто зараз' })).toBeVisible()
  await page.getByRole('button', { name: 'Спробувати 3-хв прев’ю' }).click()

  await expect(page).toHaveURL(/\/learn\/percentages\?mode=preview/)
  await expect(page.getByText('Відсотки · коротке прев’ю')).toBeVisible()
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: /Половина/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()

  await page.getByRole('button', { name: /Головна ідея/ }).click()
  await page.getByRole('button', { name: /Як перевірити/ }).click()
  await page.getByRole('button', { name: /Твій виклик/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()

  await expect(page.getByRole('heading', { name: 'Ідею спробовано' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Обрати іншу тему' })).toBeVisible()
})
