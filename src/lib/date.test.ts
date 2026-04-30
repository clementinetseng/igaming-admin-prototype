// src/lib/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatDateTimePHT, formatDatePHT, formatRelativePHT } from './date'

describe('formatDateTimePHT', () => {
  it('formats ISO into PH-locale datetime', () => {
    // 2026-04-30T02:00:00Z = 2026-04-30 10:00 PHT
    const out = formatDateTimePHT('2026-04-30T02:00:00Z', 'en-US')
    expect(out).toMatch(/Apr 30/)
    expect(out).toMatch(/10:00/)
  })
  it('formats in zh-TW locale', () => {
    const out = formatDateTimePHT('2026-04-30T02:00:00Z', 'zh-TW')
    expect(out).toMatch(/4月30日/)
  })
})

describe('formatDatePHT', () => {
  it('strips time component', () => {
    const out = formatDatePHT('2026-04-30T02:00:00Z', 'en-US')
    expect(out).toMatch(/Apr 30, 2026/)
  })
})

describe('formatRelativePHT', () => {
  it('returns "in X minutes" relative', () => {
    const future = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    expect(formatRelativePHT(future, 'en-US')).toMatch(/minute/)
  })
})
