import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {Button} from './button'

describe('Button', () => {
  it('renders a button and fires onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Tip artist</Button>)
    const button = screen.getByRole('button', {name: /tip artist/i})
    expect(button).toHaveClass('bg-primary')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('supports outline and disabled states', () => {
    render(<Button variant="outline" disabled>Later</Button>)
    const button = screen.getByRole('button', {name: /later/i})
    expect(button).toBeDisabled()
    expect(button).toHaveClass('border-border')
  })
})
