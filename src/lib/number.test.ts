// src/lib/number.test.ts
import { describe, it, expect } from 'vitest'
import { formatPHP, formatPlayerCount } from './number'

describe('formatPHP', () => {
  it('formats with peso sign and grouping', () => {
    expect(formatPHP(1234.5)).toBe('₱1,234.50')
    expect(formatPHP(0)).toBe('₱0.00')
  })
})
describe('formatPlayerCount', () => {
  it('adds thousand separator', () => {
    expect(formatPlayerCount(1234567)).toBe('1,234,567')
  })
  it('handles zero', () => {
    expect(formatPlayerCount(0)).toBe('0')
  })
})
