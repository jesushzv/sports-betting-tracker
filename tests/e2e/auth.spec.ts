import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show demo mode for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show demo mode instead of redirecting
    await expect(page.getByText('Demo Dashboard')).toBeVisible()
    await expect(page.getByText('Sign up to track your own bets!')).toBeVisible()
  })

  test('should show demo mode banner for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show demo mode banner
    await expect(page.getByText('You\'re viewing demo data')).toBeVisible()
    await expect(page.getByText('Demo Mode')).toBeVisible()
  })

  test('should show login form with OAuth providers and email/password', async ({ page }) => {
    await page.goto('/login')

    // OAuth providers
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with Discord')).toBeVisible()
    
    // Email/password form
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/login')

    // Should start in sign in mode
    await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    // Click to switch to sign up
    await page.getByText("Don't have an account? Sign up").click()
    
    // Should show sign up form
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should validate email/password sign up form', async ({ page }) => {
    await page.goto('/login')

    // Switch to sign up mode
    await page.getByText("Don't have an account? Sign up").click()

    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Invalid email address')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible()
  })

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/login')

    // Switch to sign up mode
    await page.getByText("Don't have an account? Sign up").click()

    // Fill form with mismatched passwords
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('different123')

    await page.getByRole('button', { name: /create account/i }).click()

    // Should show password mismatch error
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should show demo data on all pages for unauthenticated users', async ({ page }) => {
    const pages = ['/dashboard', '/picks', '/parlays', '/bankroll', '/analytics']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      
      // Should show demo mode indicator
      await expect(page.getByText('Demo Mode')).toBeVisible()
      
      // Should show demo data
      await expect(page.getByText('Sign up to track your own')).toBeVisible()
    }
  })

  test('should allow navigation between pages in demo mode', async ({ page }) => {
    await page.goto('/dashboard')

    // Navigate to different pages
    await page.getByRole('link', { name: /all picks/i }).click()
    await expect(page.getByText('Demo Picks')).toBeVisible()

    await page.getByRole('link', { name: /parlays/i }).click()
    await expect(page.getByText('Demo Parlays')).toBeVisible()

    await page.getByRole('link', { name: /analytics/i }).click()
    await expect(page.getByText('Demo Analytics')).toBeVisible()
  })

  test('should show sign-up prompts on interactive features', async ({ page }) => {
    await page.goto('/picks/add')

    // Fill out the form
    await page.getByLabel('Pick Description').fill('Lakers -5.5')
    await page.getByLabel('Odds').fill('-110')
    await page.getByLabel('Stake').fill('100')
    await page.getByLabel('Game Date').fill('2024-01-01T20:00')

    // Submit form
    await page.getByRole('button', { name: /create pick/i }).click()

    // Should show sign-up modal instead of submitting
    await expect(page.getByText('Sign Up to Save Your Picks!')).toBeVisible()
    await expect(page.getByText('You\'ve filled out a great pick!')).toBeVisible()
  })
})
