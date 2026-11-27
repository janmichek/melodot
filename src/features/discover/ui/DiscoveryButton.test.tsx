import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import DiscoveryButton from './DiscoveryButton'

describe('DiscoveryButton', () => {
  it('starts recording when idle', () => {
    const onStart = vi.fn()
    render(
      <DiscoveryButton
        hasPermission
        isRecording={false}
        isDiscovering={false}
        onStart={onStart}
        onStop={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('stops an active recording', () => {
    const onStop = vi.fn()
    render(
      <DiscoveryButton
        hasPermission
        isRecording
        isDiscovering={false}
        onStart={vi.fn()}
        onStop={onStop}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
