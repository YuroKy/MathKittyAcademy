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
  await expect(page.getByRole('heading', { name: 'Однакове й різне' })).toBeVisible()
  await expect(page.getByRole('button', { name: /пройти діагностику/i })).toBeVisible()
})

test('starts and resumes the diagnostic after reload', async ({ page }) => {
  await createProfile(page, 'Софія')
  await page.getByRole('button', { name: /пройти діагностику/i }).click()
  await page.getByRole('button', { name: 'Почати діагностику' }).click()
  await expect(page.getByRole('heading', { name: 'Арифметика' })).toBeVisible()
  await page.getByLabel('Відповідь').fill('75')
  await page.getByRole('button', { name: 'Відповісти' }).click()
  await page.getByRole('button', { name: 'Продовжити' }).click()
  await expect(page.getByRole('heading', { name: 'Порядок дій' })).toBeVisible()

  await page.reload()

  await expect(page.getByRole('heading', { name: 'Порядок дій' })).toBeVisible()
})

test('lets a learner preview an advanced topic in any order', async ({ page }) => {
  await createProfile(page, 'Леся')
  await page.getByRole('link', { name: 'Карта навчання' }).click()

  await page.getByRole('searchbox', { name: 'Знайти тему на карті' }).fill('Відсотки')
  await page.getByRole('button', { name: /Поняття відсотка/ }).click()
  await expect(page.getByRole('heading', { name: 'Можна спробувати просто зараз' })).toBeVisible()
  await page.getByRole('button', { name: 'Спробувати 3-хв прев’ю' }).click()

  await expect(page).toHaveURL(/\/learn\/percentages\?mode=preview/)
  await expect(page.getByText('Відсотки · коротке прев’ю')).toBeVisible()
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: /Половина/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()

  await page.getByRole('button', { name: /^1%/ }).click()
  await page.getByRole('button', { name: /Відсоток від числа/ }).click()
  await page.getByRole('button', { name: /Ціле за відсотком/ }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()

  await expect(page.getByRole('heading', { name: 'Ідею спробовано' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Обрати іншу тему' })).toBeVisible()
})

test('opens a complete flow for a newly authored grade 5 lesson', async ({ page }) => {
  await createProfile(page, 'Оленка')
  await page.getByRole('link', { name: 'Карта навчання' }).click()

  await page.getByRole('searchbox', { name: 'Знайти тему на карті' }).fill('Ділення з остачею')
  await page.getByRole('button', { name: /Ділення з остачею/ }).click()
  await page.getByRole('button', { name: 'Почати урок' }).click()

  await expect(page).toHaveURL(/\/learn\/division-with-remainder$/)
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

  await expect(page.getByRole('heading', { name: 'Знайди остачу' })).toBeVisible()
  await expect(page.getByText('Яка остача від ділення 47 на 6?')).toBeVisible()

  for (const [answer, nextLabel] of [
    ['5', 'Наступна вправа'],
    ['11', 'Наступна вправа'],
    ['130', 'Завершити заняття'],
  ] as const) {
    await page.getByLabel('Твоя відповідь').fill(answer)
    await page.getByRole('button', { name: 'Перевірити' }).click()
    await page.getByRole('button', { name: nextLabel }).click()
  }
  await expect(page.getByRole('heading', { name: 'Ще один надійний крок' })).toBeVisible()
  await page.goto('/progress')
  await expect(page.getByRole('heading', { name: 'Мій прогрес' })).toBeVisible()
  await expect(
    page.getByRole('progressbar', { name: /40 XP · ще 60 до наступного рівня/ }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('progressbar', { name: /40 XP · ще 60 до наступного рівня/ }),
  ).toBeVisible()
})

test('exports and previews a full local backup', async ({ page }) => {
  await createProfile(page, 'Дарина')
  await page.getByRole('link', { name: 'Налаштування' }).first().click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Експортувати JSON' }).click()
  const download = await downloadPromise
  const backupPath = await download.path()
  expect(backupPath).toBeTruthy()

  await page
    .getByLabel('Вибрати backup для відновлення')
    .setInputFiles(backupPath!)
  await expect(page.getByText('1 профілів')).toBeVisible()
  await expect(page.getByText(/Імпорт повністю замінить локальні дані/)).toBeVisible()
})
