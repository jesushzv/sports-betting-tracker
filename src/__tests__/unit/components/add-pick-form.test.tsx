import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPickForm } from '@/components/add-pick-form'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('AddPickForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<AddPickForm />)

    expect(screen.getByRole('combobox', { name: /sport/i })).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: /bet type/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/pick description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/odds/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stake/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/game date/i)).toBeInTheDocument()
  })

  it('calculates potential winnings correctly for positive odds', async () => {
    const user = userEvent.setup()
    render(<AddPickForm />)

    const oddsInput = screen.getByLabelText(/odds/i)
    const stakeInput = screen.getByLabelText(/stake/i)

    await user.type(oddsInput, '150')
    await user.type(stakeInput, '100')

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument()
    })
  })

  it('calculates potential winnings correctly for negative odds', async () => {
    const user = userEvent.setup()
    render(<AddPickForm />)

    const oddsInput = screen.getByLabelText(/odds/i)
    const stakeInput = screen.getByLabelText(/stake/i)

    await user.type(oddsInput, '-110')
    await user.type(stakeInput, '100')

    await waitFor(() => {
      expect(screen.getByText('$90.91')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    } as Response)

    render(<AddPickForm />)

    // Fill out the form with text inputs only
    await user.type(screen.getByLabelText(/pick description/i), 'Lakers -5.5')
    await user.type(screen.getByLabelText(/odds/i), '-110')
    await user.type(screen.getByLabelText(/stake/i), '100')
    await user.type(screen.getByLabelText(/game date/i), '2024-01-01T20:00')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create pick/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: '',
          betType: '',
          description: 'Lakers -5.5',
          odds: -110,
          stake: 100,
          gameDate: '2024-01-01T20:00',
        }),
      })
    })
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Validation failed' }),
    } as Response)

    // Mock alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AddPickForm />)

    // Fill out the form with text inputs only
    await user.type(screen.getByLabelText(/pick description/i), 'Lakers -5.5')
    await user.type(screen.getByLabelText(/odds/i), '-110')
    await user.type(screen.getByLabelText(/stake/i), '100')
    await user.type(screen.getByLabelText(/game date/i), '2024-01-01T20:00')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create pick/i }))

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to create pick. Please try again.'
      )
    })

    mockAlert.mockRestore()
  })
})
