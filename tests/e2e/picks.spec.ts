import { test, expect } from '@playwright/test'

test.describe('Picks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (should show demo mode for unauthenticated users)
    await page.goto('/dashboard')
  })

  test('should display demo dashboard for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should show demo mode
    await expect(page.getByText('Demo Dashboard')).toBeVisible()
    await expect(page.getByText('Sign up to track your own bets!')).toBeVisible()
    await expect(page.getByText('Total Picks')).toBeVisible()
    await expect(page.getByText('Win Rate')).toBeVisible()
    await expect(page.getByText('Total Profit')).toBeVisible()
  })

  test('should navigate to add pick page in demo mode', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should be able to navigate to add pick page in demo mode
    await page.getByRole('link', { name: 'Add Pick' }).click()
    await expect(page).toHaveURL('/picks/add')
    await expect(page.getByText('Try the form below')).toBeVisible()
  })

  test('should display add pick form with all fields in demo mode', async ({
    page,
  }) => {
    await page.goto('/picks/add')

    // Check form fields are visible in demo mode
    await expect(page.getByLabel('Sport')).toBeVisible()
    await expect(page.getByLabel('Bet Type')).toBeVisible()
    await expect(page.getByLabel('Pick Description')).toBeVisible()
    await expect(page.getByLabel('Odds')).toBeVisible()
    await expect(page.getByLabel('Stake')).toBeVisible()
    await expect(page.getByLabel('Game Date')).toBeVisible()
  })

  test('should calculate potential winnings in demo mode', async ({
    page,
  }) => {
    await page.goto('/picks/add')

    // Fill in odds and stake
    await page.getByLabel('Odds').fill('-110')
    await page.getByLabel('Stake').fill('100')

    // Check that potential winnings are calculated
    await expect(page.getByText('$90.91')).toBeVisible()
  })

  test('should navigate to all picks page in demo mode', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should be able to navigate to all picks page in demo mode
    await page.getByRole('link', { name: 'All Picks' }).click()
    await expect(page).toHaveURL('/picks')
    await expect(page.getByText('Demo Picks')).toBeVisible()
  })

  test('should display filters on picks page in demo mode', async ({
    page,
  }) => {
    await page.goto('/picks')

    // Check filter elements are visible in demo mode
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByLabel('Sport')).toBeVisible()
    await expect(page.getByLabel('Bet Type')).toBeVisible()
    await expect(page.getByLabel('Status')).toBeVisible()
  })
})

test.describe('Analytics Page', () => {
  test('should display analytics page in demo mode', async ({
    page,
  }) => {
    await page.goto('/analytics')

    // Should show demo analytics
    await expect(page.getByText('Demo Analytics')).toBeVisible()
    await expect(page.getByText('Sign up to track your own performance!')).toBeVisible()
    await expect(page.getByText('Win/Loss Distribution')).toBeVisible()
    await expect(page.getByText('Performance by Sport')).toBeVisible()
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
