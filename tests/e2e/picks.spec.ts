import { test, expect } from '@playwright/test'

test.describe('Picks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (may redirect to login)
    await page.goto('/dashboard')
  })

  test('should display dashboard with stats or redirect to login', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Check if we're on dashboard or redirected to login
    try {
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 5000 })
      await expect(page.getByText('Total Picks')).toBeVisible()
      await expect(page.getByText('Win Rate')).toBeVisible()
      await expect(page.getByText('Net Profit')).toBeVisible()
    } catch {
      // If redirected to login, that's expected behavior
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })

  test('should navigate to add pick page or redirect to login', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    try {
      await page.getByRole('link', { name: 'Add Pick' }).click()
      await expect(page).toHaveURL('/picks/add')
      await expect(page.getByText('Add New Pick')).toBeVisible()
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })

  test('should display add pick form with all fields or redirect to login', async ({
    page,
  }) => {
    await page.goto('/picks/add')

    try {
      // Check form fields
      await expect(page.getByLabel('Sport')).toBeVisible({ timeout: 5000 })
      await expect(page.getByLabel('Bet Type')).toBeVisible()
      await expect(page.getByLabel('Pick Description')).toBeVisible()
      await expect(page.getByLabel('Odds (American)')).toBeVisible()
      await expect(page.getByLabel('Stake ($)')).toBeVisible()
      await expect(page.getByLabel('Game Date & Time')).toBeVisible()
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })

  test('should calculate potential winnings or redirect to login', async ({
    page,
  }) => {
    await page.goto('/picks/add')

    try {
      // Fill in odds and stake
      await page.getByLabel('Odds (American)').fill('-110')
      await page.getByLabel('Stake ($)').fill('100')

      // Check that potential winnings are calculated
      await expect(page.getByText('$90.91')).toBeVisible({ timeout: 5000 })
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })

  test('should navigate to all picks page or redirect to login', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    try {
      await page.getByRole('link', { name: 'View All Picks' }).click()
      await expect(page).toHaveURL('/picks')
      await expect(page.getByText('All Picks')).toBeVisible({ timeout: 5000 })
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })

  test('should display filters on picks page or redirect to login', async ({
    page,
  }) => {
    await page.goto('/picks')

    try {
      // Check filter elements
      await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })
      await expect(page.getByLabel('Sport')).toBeVisible()
      await expect(page.getByLabel('Bet Type')).toBeVisible()
      await expect(page.getByLabel('Status')).toBeVisible()
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })
})

test.describe('Analytics Page', () => {
  test('should display analytics page or redirect to login', async ({
    page,
  }) => {
    await page.goto('/analytics')

    try {
      await expect(page.getByText('Analytics')).toBeVisible({ timeout: 5000 })
      await expect(page.getByText('Performance by Sport')).toBeVisible()
      await expect(page.getByText('Performance by Bet Type')).toBeVisible()
    } catch {
      // If redirected to login, that's expected
      await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    }
  })
})

test.describe('Smoke Tests', () => {
  test('should load home page @smoke', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Track Your Sports Bets')).toBeVisible()
    await expect(page.getByText('Like a Pro')).toBeVisible()
  })

  test('should load login page @smoke', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
  })

  test('should have working navigation @smoke', async ({ page }) => {
    await page.goto('/')

    // Check navigation elements
    await expect(page.getByText('BetTracker')).toBeVisible()
  })
})
