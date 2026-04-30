import { describe, it, expect } from 'vitest'
import { campaigns } from './campaigns'

describe('mock campaigns', () => {
  it('has exactly 16 campaigns', () => {
    expect(campaigns.length).toBe(16)
  })
  it('covers all status types', () => {
    const statuses = new Set(campaigns.map((c) => c.status))
    expect(statuses.has('draft')).toBe(true)
    expect(statuses.has('scheduled')).toBe(true)
    expect(statuses.has('active')).toBe(true)
    expect(statuses.has('disabled')).toBe(true)
  })
  it('every channel appears in at least one campaign', () => {
    const seen = { inApp: false, email: false, sms: false, push: false }
    for (const c of campaigns) {
      if (c.channelPanels.inApp?.enabled) seen.inApp = true
      if (c.channelPanels.email?.enabled) seen.email = true
      if (c.channelPanels.sms?.enabled) seen.sms = true
      if (c.channelPanels.push?.enabled) seen.push = true
    }
    expect(seen).toEqual({ inApp: true, email: true, sms: true, push: true })
  })
  it('has unique ids', () => {
    const ids = new Set(campaigns.map((c) => c.id))
    expect(ids.size).toBe(campaigns.length)
  })
})
