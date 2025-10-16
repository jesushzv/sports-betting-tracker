import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testButtonInteractions } from '../helpers/button-test-utils'
import { useSession } from 'next-auth/react'
import Home from '@/app/page'
import { Navigation } from '@/components/navigation'
import { AddPickForm } from '@/components/add-pick-form'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    prefetch: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock NextAuth
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Button Functionality Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })
  })

  describe('Home Page Button Tests', () => {
    it('should have all buttons with proper click handlers', async () => {
      const { issues, hasIssues } = await testButtonInteractions(<Home />)
      
      if (hasIssues) {
        console.error('Home page button issues:', issues)
      }
      
      expect(hasIssues).toBe(false)
    })

    it('should handle all button clicks without errors', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole('button')
      
      for (const button of buttons) {
        if (!button.hasAttribute('disabled')) {
          // Try clicking each button - should not throw
          try {
            await user.click(button)
          } catch (error) {
            fail(`Button ${button.textContent?.trim()} should be clickable: ${error}`)
          }
        }
      }
    })
  })

  describe('Navigation Component Button Tests', () => {
    it('should have all navigation buttons with proper functionality', async () => {
      const { issues, hasIssues } = await testButtonInteractions(<Navigation />)
      
      if (hasIssues) {
        console.error('Navigation button issues:', issues)
      }
      
      expect(hasIssues).toBe(false)
    })
  })

  describe('Form Component Button Tests', () => {
    it('should have all form buttons with proper functionality', async () => {
      // Mock successful API response for form
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1' }),
      })

      const { issues, hasIssues } = await testButtonInteractions(<AddPickForm />)
      
      if (hasIssues) {
        console.error('Form button issues:', issues)
      }
      
      expect(hasIssues).toBe(false)
    })
  })

  describe('Button Component Regression Tests', () => {
    it('should catch the specific issue we fixed in home page', async () => {
      // This test specifically ensures that the home page buttons
      // have proper click handlers and don't end up as non-functional
      
      const user = userEvent.setup()
      render(<Home />)

      // These are the specific buttons that had issues before
      const getStartedButton = screen.getByRole('button', { name: /get started free/i })
      const learnMoreLink = screen.getByRole('link', { name: /learn more/i }) // This is a link, not button
      const signUpButton = screen.getByRole('button', { name: /sign up free/i })

      // All buttons should be clickable
      expect(getStartedButton).toBeInTheDocument()
      expect(learnMoreLink).toBeInTheDocument()
      expect(signUpButton).toBeInTheDocument()

      // Clicking should not throw errors
      await expect(user.click(getStartedButton)).resolves.not.toThrow()
      await expect(user.click(learnMoreLink)).resolves.not.toThrow()
      await expect(user.click(signUpButton)).resolves.not.toThrow()

      // Navigation should be triggered for appropriate buttons
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
