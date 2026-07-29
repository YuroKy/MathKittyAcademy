import { expect, test, type Page } from '@playwright/test'

async function createProfile(page: Page): Promise<void> {
  await page.goto('/')
  await page.getByRole('link', { name: /створити профіль/i }).click()
  await page.getByLabel('Твоє ім’я').fill('Офлайн Марта')
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Поки не знаю' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await page.getByRole('button', { name: 'Увійти до академії' }).click()
}

test('opens a bundled lesson and saves an answer after going offline', async ({ context, page }) => {
  await createProfile(page)
  await page.getByRole('link', { name: 'Карта навчання' }).click()
  await page.getByRole('searchbox', { name: 'Знайти тему на карті' }).fill('Ділення з остачею')
  await page.getByRole('button', { name: /Ділення з остачею/ }).click()
  await page.getByRole('button', { name: 'Почати урок' }).click()
  await expect(page).toHaveURL(/\/learn\/division-with-remainder$/)
  await expect(
    page.getByRole('heading', { name: 'Остача — це точна відповідь на нерівний розподіл' }),
  ).toBeVisible()
  await page.waitForFunction(async () => {
    await navigator.serviceWorker.ready
    return true
  })
  await page.reload()
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await expect(
    page.getByRole('heading', { name: 'Остача — це точна відповідь на нерівний розподіл' }),
  ).toBeVisible()

  await context.setOffline(true)
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Остача — це точна відповідь на нерівний розподіл' }),
  ).toBeVisible()

  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: /^A 5$/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: /Неповна частка/ }).click()
  await page.getByRole('button', { name: /^Остача/ }).click()
  await page.getByRole('button', { name: /Перевірка/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: /Шукаємо найбільше кратне/ }).click()
  await page.getByRole('button', { name: /Знаходимо остачу/ }).click()
  await page.getByRole('button', { name: /Перевіряємо/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByLabel('Твоя відповідь').fill('5')
  await page.getByRole('button', { name: 'Перевірити' }).click()
  await expect(page.getByText('Так, це працює!')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Знайди остачу' })).toBeVisible()
})
