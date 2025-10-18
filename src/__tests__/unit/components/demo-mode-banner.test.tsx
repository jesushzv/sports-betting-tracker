import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}))

// Mock NextAuth
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

describe('DemoModeBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default to unauthenticated user
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
  })

  it('renders for unauthenticated users', () => {
    render(<DemoModeBanner />)

    expect(screen.getByText('You\'re viewing demo data - Sign up to track your own bets!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('does not render for authenticated users', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', name: 'Test User' } },
      status: 'authenticated'
    })

    render(<DemoModeBanner />)

    expect(screen.queryByText('You\'re viewing demo data')).not.toBeInTheDocument()
  })

  it('navigates to login when sign up button is clicked', async () => {
    const user = userEvent.setup()
    render(<DemoModeBanner />)

    const signUpButton = screen.getByRole('button', { name: /sign up free/i })
    await user.click(signUpButton)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('navigates to login when sign in button is clicked', async () => {
    const user = userEvent.setup()
    render(<DemoModeBanner />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('can be dismissed', async () => {
    const user = userEvent.setup()
    render(<DemoModeBanner />)

    // Find the dismiss button (X button)
    const dismissButton = screen.getByRole('button', { name: '' }) // The X button has no accessible name
    await user.click(dismissButton)

    await waitFor(() => {
      expect(screen.queryByText('You\'re viewing demo data')).not.toBeInTheDocument()
    })
  })

  it('shows demo mode indicator', () => {
    render(<DemoModeBanner />)

    // The demo mode indicator is the emoji in the icon
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('has proper styling and accessibility', () => {
    render(<DemoModeBanner />)

    // The banner should have the gradient background - find the outermost div
    const banner = screen.getByText('You\'re viewing demo data - Sign up to track your own bets!').closest('div.bg-gradient-to-r')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600')
  })

  it('handles loading state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(<DemoModeBanner />)

    // Should not render during loading
    expect(screen.queryByText('You\'re viewing demo data')).not.toBeInTheDocument()
  })
})
