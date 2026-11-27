import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {PageHeader} from './page-header'

describe('PageHeader', () => {
  it('renders the title, description and actions', () => {
    render(
      <PageHeader title="Donations" description="On-chain history">
        <button>Filter</button>
      </PageHeader>,
    )
    expect(screen.getByRole('heading', {name: 'Donations'})).toBeInTheDocument()
    expect(screen.getByText('On-chain history')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Filter'})).toBeInTheDocument()
  })
})
