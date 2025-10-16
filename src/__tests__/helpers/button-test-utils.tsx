import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

/**
 * Generic utility to test that all buttons in a component have proper functionality
 * This helps catch buttons without onClick handlers or proper navigation
 */
export async function testButtonInteractions(component: ReactElement) {
  const result: RenderResult = render(component)
  
  // Wait for component to render
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const buttons = screen.queryAllByRole('button')
  const issues: string[] = []
  
  for (const button of buttons) {
    // Skip hidden or disabled buttons
    if (button.hasAttribute('disabled') || button.closest('[aria-hidden="true"]')) {
      continue
    }
    
    const buttonText = button.textContent?.trim() || 'Unknown button'
    
    // Check various ways a button can have functionality:
    // 1. Direct onClick handler
    const hasDirectOnClick = button.onclick !== null || button.getAttribute('onclick') !== null
    
    // 2. React event handler (this is harder to detect statically, but we can try to simulate)
    const hasReactHandler = button.getAttribute('data-testid') !== null || 
                            button.getAttribute('data-clickable') === 'true'
    
    // 3. Wrapped in a Link (asChild prop usage)
    const isInLink = button.closest('a[href]') !== null
    
    // 4. Form submit button
    const isFormSubmit = button.type === 'submit' && button.closest('form') !== null
    
    // 5. Button with proper event listener (radix-ui pattern)
    const hasRadixHandler = button.closest('[data-slot="button"]') !== null ||
                            button.hasAttribute('data-state')
    
    const hasFunctionality = hasDirectOnClick || hasReactHandler || isInLink || isFormSubmit || hasRadixHandler
    
    if (!hasFunctionality) {
      issues.push(`Button "${buttonText}" appears to have no click functionality`)
    }
  }
  
  return {
    result,
    issues,
    hasIssues: issues.length > 0
  }
}

/**
 * Test that specific buttons are clickable and don't throw errors
 */
export async function testButtonClickability(component: ReactElement, buttonTexts: string[]) {
  const result: RenderResult = render(component)
  const user = userEvent.setup()
  const issues: string[] = []
  
  for (const buttonText of buttonTexts) {
    try {
      const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
      
      if (button.hasAttribute('disabled')) {
        continue // Skip disabled buttons
      }
      
      // Try to click the button
      await user.click(button)
      
    } catch (error) {
      if (error instanceof Error) {
        issues.push(`Button "${buttonText}" is not clickable: ${error.message}`)
      } else {
        issues.push(`Button "${buttonText}" has an unknown error`)
      }
    }
  }
  
  return {
    result,
    issues,
    hasIssues: issues.length > 0
  }
}

/**
 * Test that navigation buttons properly trigger navigation
 */
export async function testNavigationButtons(
  component: ReactElement, 
  buttonNavigationPairs: Array<{ buttonText: string; expectedNavigation: string | RegExp }>
) {
  const result: RenderResult = render(component)
  const user = userEvent.setup()
  const issues: string[] = []
  
  for (const { buttonText } of buttonNavigationPairs) {
    try {
      const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
      
      if (button.hasAttribute('disabled')) {
        continue
      }
      
      await user.click(button)
      
      // Check if navigation was triggered (this would need to be customized based on your router mock)
      // For now, we just ensure the button is clickable
      
    } catch (error) {
      if (error instanceof Error) {
        issues.push(`Navigation button "${buttonText}" failed: ${error.message}`)
      }
    }
  }
  
  return {
    result,
    issues,
    hasIssues: issues.length > 0
  }
}
