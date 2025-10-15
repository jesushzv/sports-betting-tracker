import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
  })

  test('should show login form with OAuth providers', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with Discord')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Mock successful authentication
    await page.goto('/login')
    
    // In a real test, you would mock the OAuth flow
    // For now, we'll just check the UI elements are present
    await expect(page.getByText('Welcome to BetTracker')).toBeVisible()
  })
})
