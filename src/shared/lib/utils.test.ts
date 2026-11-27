import {describe, expect, it} from 'vitest'
import {cn, getErrorMessage} from './utils'

describe('cn', () => {
  it('merges conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('getErrorMessage', () => {
  it('prefers message and falls back to shortMessage', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage({shortMessage: 'short'})).toBe('short')
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
