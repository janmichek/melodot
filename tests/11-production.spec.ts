import {expect, test} from './fixtures/pages'

test.describe('Production surface', () => {
  test('serves crawl and agent discovery files', async ({request}) => {
    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Sitemap:')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('https://donalyze.vercel.app/claim')

    const llms = await request.get('/llms.txt')
    expect(llms.ok()).toBeTruthy()
    expect(await llms.text()).toContain('EIP-712')

    const agent = await request.get('/.well-known/agent.json')
    expect(agent.ok()).toBeTruthy()
    expect(await agent.text()).toContain('music-discovery')

    const security = await request.get('/.well-known/security.txt')
    expect(security.ok()).toBeTruthy()
    expect(await security.text()).toContain('Contact:')
  })

  test('home exposes core metadata and structured data', async ({page}) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Donalyze/)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toContain('tip the artist')

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe('https://donalyze.vercel.app/')

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toContain('/og.png')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    expect(jsonLd).toContain('WebApplication')
    expect(jsonLd).toContain('FAQPage')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute('content', /maximum-scale/)
  })

  test('hero has one h1, a record control and the brand promise', async ({page}) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Hear it.')
    await expect(page.locator('h1')).toContainText('On-chain.')
    await expect(page.getByTestId('record-hint')).toBeVisible()
    await expect(page.getByRole('button', {name: /start recording/i})).toBeVisible()
  })

  test('each route has a unique title and one h1', async ({page}) => {
    const routes = [
      ['/claim', /Claim/],
      ['/donations', /Donation/],
      ['/statistics', /statistics/i],
      ['/about', /About/],
    ] as const

    for (const [path, title] of routes) {
      await page.goto(path)
      await expect(page).toHaveTitle(title)
      await expect(page.locator('h1')).toHaveCount(1)
    }
  })

  test('navigation links reach every public page', async ({page}) => {
    await page.goto('/')
    for (const path of ['/donations', '/claim', '/statistics', '/about']) {
      await page.locator(`a[href="${path}"]`).first().click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    }
  })

  test('mobile layout opens the navigation index', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844})
    await page.goto('/')
    await page.getByRole('button', {name: /toggle sidebar/i}).click()
    await expect(page.getByRole('navigation', {name: /primary/i})).toBeVisible()
    await page.getByRole('link', {name: /statistics/i}).click()
    await expect(page).toHaveURL(/\/statistics$/)
  })

  test('statistics renders the ledger without a contract read failure', async ({page}) => {
    await page.goto('/statistics')
    await expect(page.getByTestId('statistics-dashboard')).toBeVisible()
    const dashboard = page.getByTestId('statistics-dashboard')
    await expect(dashboard.getByText('Donated / window')).toBeVisible()
    await expect(dashboard.getByText('Network', {exact: true})).toBeVisible()
  })

  test('skip link is the first keyboard stop', async ({page}) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', {name: /skip to content/i})).toBeFocused()
  })
})
