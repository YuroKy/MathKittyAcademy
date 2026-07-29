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

async function gotoRoute(page: Page, path: string): Promise<void> {
  const target =
    process.env.VITE_ROUTER_MODE === 'hash'
      ? `${process.env.VITE_BASE_PATH ?? '/'}#${path}`
      : path

  await page.goto(target, { waitUntil: 'networkidle' })
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

  await gotoRoute(page, '/progress')
  await expect(page).toHaveURL(/#?\/progress$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: /Мій\s*прогрес/i })).toBeVisible({
    timeout: 15_000,
  })

  const savedXp = page.getByRole('progressbar', {
    name: /40 XP\s*·\s*ще 60 до наступного рівня/i,
  })
  await expect(savedXp).toBeVisible({ timeout: 15_000 })

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/#?\/progress$/, { timeout: 15_000 })
  await expect(savedXp).toBeVisible({ timeout: 15_000 })
})

test('completes matching and step-by-step exercises in the first grade 6 wave', async ({
  page,
}) => {
  await createProfile(page, 'Ірина')
  await page.getByRole('link', { name: 'Карта навчання' }).click()
  await page.getByRole('searchbox', { name: 'Знайти тему на карті' }).fill('Розклад на прості')
  await page.getByRole('button', { name: /Розклад на прості множники/ }).click()
  await page.getByRole('button', { name: 'Почати урок' }).click()

  await expect(page).toHaveURL(/\/learn\/prime-factorization$/)
  await page.getByRole('button', { name: /Продовжити/ }).click()
  await page.getByRole('button', { name: 'B 2 × 3 × 3' }).click()
  await page.getByRole('button', { name: /Продовжити/ }).click()

  for (const label of ['Просте', 'Складене', 'Перевірка']) {
    await page.getByRole('button', { name: new RegExp(label) }).click()
  }
  await page.getByRole('button', { name: /Продовжити/ }).click()
  for (const step of [/60 = 6 × 10/, /6 = 2 × 3/, /60 = 2 × 2 × 3 × 5/]) {
    await page.getByRole('button', { name: step }).click()
  }
  await page.getByRole('button', { name: /Продовжити/ }).click()

  await page.getByLabel('Пара для 12').selectOption({ label: '2 × 2 × 3' })
  await page.getByLabel('Пара для 20').selectOption({ label: '2 × 2 × 5' })
  await page.getByLabel('Пара для 45').selectOption({ label: '3 × 3 × 5' })
  await page.getByRole('button', { name: 'Перевірити' }).click()
  await page.getByRole('button', { name: 'Наступна вправа' }).click()

  await page.getByLabel('Відповідь для кроку 1').fill('42')
  await page.getByLabel('Відповідь для кроку 2').fill('21')
  await page.getByLabel('Відповідь для кроку 3').fill('7')
  await page.getByRole('button', { name: 'Перевірити' }).click()
  await page.getByRole('button', { name: 'Наступна вправа' }).click()

  await page.getByLabel('Твоя відповідь').fill('84')
  await page.getByRole('button', { name: 'Перевірити' }).click()
  await page.getByRole('button', { name: 'Завершити заняття' }).click()
  await expect(page.getByRole('heading', { name: 'Ще один надійний крок' })).toBeVisible()
})

test('exports and previews a full local backup', async ({ page }) => {
  await createProfile(page, 'Дарина')
  await page.getByRole('link', { name: 'Налаштування' }).first().click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Експортувати JSON' }).click()
  const download = await downloadPromise
  const backupPath = await download.path()
  expect(backupPath).toBeTruthy()

  await page.getByLabel('Вибрати backup для відновлення').setInputFiles(backupPath!)
  await expect(page.getByText('1 профілів')).toBeVisible()
  await expect(page.getByText(/Імпорт повністю замінить локальні дані/)).toBeVisible()
})
