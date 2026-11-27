import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {BalanceLabel} from './balance-label'

describe('BalanceLabel', () => {
  it('formats PAS and shows the symbol', () => {
    render(<BalanceLabel balance={1_500_000_000_000_000_000n} />)
    expect(screen.getByText('1.50')).toBeInTheDocument()
    expect(screen.getByText('PAS')).toBeInTheDocument()
  })

  it('shows a skeleton while loading', () => {
    const {container} = render(<BalanceLabel balance={0n} isLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})
