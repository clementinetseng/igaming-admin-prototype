import { describe, it, expect } from 'vitest'
import { players } from './players'

describe('mock players', () => {
  it('has roughly 120 players', () => {
    expect(players.length).toBeGreaterThanOrEqual(110)
    expect(players.length).toBeLessThanOrEqual(130)
  })
  it('all have +63 9XX phone format', () => {
    for (const p of players) expect(p.phone).toMatch(/^\+63 9\d{2} \d{3} \d{4}$/)
  })
  it('has each VIP tier 1-7 represented', () => {
    const tiers = new Set(players.map((p) => p.vipTier))
    for (let t = 1; t <= 7; t++) expect(tiers.has(t as 1)).toBe(true)
  })
  it('has each player status represented', () => {
    const statuses = new Set(players.map((p) => p.status))
    expect(statuses.has('active')).toBe(true)
    expect(statuses.has('dormant')).toBe(true)
    expect(statuses.has('churned')).toBe(true)
  })
})
