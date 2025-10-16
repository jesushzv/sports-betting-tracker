import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import '@testing-library/jest-dom'

describe('Button Component', () => {
  it('renders a button element by default', () => {
    render(<Button>Test Button</Button>)
    
    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })

  it('renders as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/test')
  })

  it('handles click events properly', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button', { name: /clickable button/i })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct CSS classes', () => {
    render(<Button variant="destructive" size="lg">Styled Button</Button>)
    
    const button = screen.getByRole('button', { name: /styled button/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('forwards all props correctly', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(
      <Button 
        onClick={handleClick}
        data-testid="test-button"
        type="submit"
        className="custom-class"
      >
        Props Button
      </Button>
    )
    
    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveClass('custom-class')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalled()
  })

  it('works correctly with form submission', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit Button</Button>
      </form>
    )
    
    const button = screen.getByRole('button', { name: /submit button/i })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeInTheDocument()
  })
})
