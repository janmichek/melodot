import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {Stepper} from './stepper'

describe('Stepper', () => {
  it('renders chapters and their content', () => {
    render(
      <Stepper
        steps={[
          {number: 1, title: 'Identify', description: 'Paste your URL', status: 'completed'},
          {number: 2, title: 'Claim', description: 'Verify the bio', status: 'active', content: <p>Claim form</p>},
        ]}
      />,
    )
    expect(screen.getByRole('heading', {name: 'Identify'})).toBeInTheDocument()
    expect(screen.getByText('Claim form')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })
})
