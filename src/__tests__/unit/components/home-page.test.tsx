import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import Home from '@/app/page'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
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

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })
  })

  it('renders all main buttons for unauthenticated user', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Home />)

    expect(screen.getByRole('button', { name: /get started free/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /try demo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up free/i })).toBeInTheDocument()
  })

  it('renders different buttons for authenticated user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const dashboardLinks = screen.getAllByRole('link', { name: /go to dashboard/i })
    expect(dashboardLinks).toHaveLength(2) // Should have 2 dashboard links
    expect(screen.getByRole('link', { name: /view analytics/i })).toBeInTheDocument()
  })

  it('navigates to login when Get Started Free button is clicked for unauthenticated user', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const getStartedButton = screen.getByRole('button', { name: /get started free/i })
    
    // Ensure button has proper click handler
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).not.toHaveAttribute('disabled')

    await user.click(getStartedButton)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('Try Demo button navigates to dashboard for unauthenticated user', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const tryDemoLink = screen.getByRole('link', { name: /try demo/i })
    
    expect(tryDemoLink).toHaveAttribute('href', '/dashboard')
  })

  it('navigates to login when Sign Up Free button is clicked', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const signUpButton = screen.getByRole('button', { name: /sign up free/i })
    
    await user.click(signUpButton)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('Go to Dashboard button has proper navigation for authenticated user', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const dashboardLinks = screen.getAllByRole('link', { name: /go to dashboard/i })
    
    // Check that all dashboard links have proper href
    dashboardLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/dashboard')
    })
  })

  it('all buttons have proper interactive functionality', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Home />)

    const buttons = screen.getAllByRole('button')
    
    for (const button of buttons) {
      // Skip hidden or disabled buttons
      if (button.hasAttribute('disabled') || button.closest('[aria-hidden="true"]')) {
        continue
      }

      // Check that button has either onClick handler or is wrapped in a link
      const hasOnClick = button.onclick !== null || button.getAttribute('onclick') !== null
      const isInLink = button.closest('a[href]') !== null
      const hasAsChild = button.closest('[data-slot="button"]') !== null

      if (!(hasOnClick || isInLink || hasAsChild)) {
        fail(`${button.textContent?.trim()} button should have click functionality`)
      }

      // Try clicking the button to ensure it doesn't throw
      try {
        await user.click(button)
      } catch (error) {
        // This would catch any click-related errors
        fail(`${button.textContent?.trim()} button should be clickable: ${error}`)
      }
    }
  })
})
