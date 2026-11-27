import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {DonationAmountControls} from './DonationAmountControls'

describe('DonationAmountControls', () => {
  it('reports the chosen amount', () => {
    const onAmountChange = vi.fn()
    render(<DonationAmountControls selectedAmount={2} onAmountChange={onAmountChange} />)
    fireEvent.click(screen.getByText('10 PAS'))
    expect(onAmountChange).toHaveBeenCalledWith(10)
    expect(screen.getByText('2 PAS').closest('label')).toBeInTheDocument()
  })
})
