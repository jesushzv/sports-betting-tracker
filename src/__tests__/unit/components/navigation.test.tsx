import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
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
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in button when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()
  })

  it('sign in button has proper click handler', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Ensure button is clickable and has proper functionality
    expect(signInButton).toBeInTheDocument()
    expect(signInButton).not.toHaveAttribute('disabled')

    await user.click(signInButton)

    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })

  it('renders user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com', image: '/avatar.jpg' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    // Should show user avatar button instead of sign in
    const avatarButton = screen.getByRole('button')
    expect(avatarButton).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('all navigation links are properly rendered', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    // Check that all main navigation links are present
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /all picks/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /parlays/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bankroll/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument()
  })

  it('all navigation links have proper href attributes', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const picksLink = screen.getByRole('link', { name: /all picks/i })
    const parlaysLink = screen.getByRole('link', { name: /parlays/i })
    const bankrollLink = screen.getByRole('link', { name: /bankroll/i })
    const analyticsLink = screen.getByRole('link', { name: /analytics/i })

    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(picksLink).toHaveAttribute('href', '/picks')
    expect(parlaysLink).toHaveAttribute('href', '/parlays')
    expect(bankrollLink).toHaveAttribute('href', '/bankroll')
    expect(analyticsLink).toHaveAttribute('href', '/analytics')
  })

  it('user dropdown menu items are functional', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<Navigation />)

    // Open the dropdown menu
    const avatarButton = screen.getByRole('button')
    await user.click(avatarButton)

    // Check that menu items are present and functional
    await user.click(screen.getByText('Log out'))
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
