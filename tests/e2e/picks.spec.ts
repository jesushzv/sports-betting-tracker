import { test, expect } from '@playwright/test'

test.describe('Picks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.goto('/dashboard')
  })

  test('should display dashboard with stats', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for dashboard elements
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Total Picks')).toBeVisible()
    await expect(page.getByText('Win Rate')).toBeVisible()
    await expect(page.getByText('Net Profit')).toBeVisible()
  })

  test('should navigate to add pick page', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('link', { name: 'Add Pick' }).click()
    
    await expect(page).toHaveURL('/picks/add')
    await expect(page.getByText('Add New Pick')).toBeVisible()
  })

  test('should display add pick form with all fields', async ({ page }) => {
    await page.goto('/picks/add')
    
    // Check form fields
    await expect(page.getByLabelText('Sport')).toBeVisible()
    await expect(page.getByLabelText('Bet Type')).toBeVisible()
    await expect(page.getByLabelText('Pick Description')).toBeVisible()
    await expect(page.getByLabelText('Odds (American)')).toBeVisible()
    await expect(page.getByLabelText('Stake ($)')).toBeVisible()
    await expect(page.getByLabelText('Game Date & Time')).toBeVisible()
  })

  test('should calculate potential winnings', async ({ page }) => {
    await page.goto('/picks/add')
    
    // Fill in odds and stake
    await page.getByLabelText('Odds (American)').fill('-110')
    await page.getByLabelText('Stake ($)').fill('100')
    
    // Check that potential winnings are calculated
    await expect(page.getByText('$90.91')).toBeVisible()
  })

  test('should navigate to all picks page', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('link', { name: 'View All Picks' }).click()
    
    await expect(page).toHaveURL('/picks')
    await expect(page.getByText('All Picks')).toBeVisible()
  })

  test('should display filters on picks page', async ({ page }) => {
    await page.goto('/picks')
    
    // Check filter elements
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByLabelText('Sport')).toBeVisible()
    await expect(page.getByLabelText('Bet Type')).toBeVisible()
    await expect(page.getByLabelText('Status')).toBeVisible()
  })
})

test.describe('Analytics Page', () => {
  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics')
    
    await expect(page.getByText('Analytics')).toBeVisible()
    await expect(page.getByText('Performance by Sport')).toBeVisible()
    await expect(page.getByText('Performance by Bet Type')).toBeVisible()
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
