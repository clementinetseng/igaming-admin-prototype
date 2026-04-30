import { describe, it, expect } from 'vitest'
import { estimateRecipients, matchesCondition } from './audience'
import { players } from '@/mock/players'
import type { MasterAudience } from '@/types/audience'
import type { Player } from '@/types/player'

const sample: Player = {
  ...players[0],
  vipTier: 5,
  status: 'active',
  firstDeposit: true,
  emailVerified: true,
  phoneVerified: true,
  cumulativeDeposit: '1000-5000',
}

describe('matchesCondition', () => {
  it('vipTier >=', () => {
    expect(matchesCondition(sample, { field: 'vipTier', op: '>=', value: 3 })).toBe(true)
    expect(matchesCondition(sample, { field: 'vipTier', op: '>=', value: 6 })).toBe(false)
  })
  it('playerStatus equality', () => {
    expect(matchesCondition(sample, { field: 'playerStatus', value: 'active' })).toBe(true)
    expect(matchesCondition(sample, { field: 'playerStatus', value: 'churned' })).toBe(false)
  })
  it('verifiedContact email', () => {
    expect(matchesCondition(sample, { field: 'verifiedContact', value: 'email' })).toBe(true)
  })
})

describe('estimateRecipients', () => {
  it('broadcast returns full pool', () => {
    const ma: MasterAudience = { broadcast: true, conditions: [], logic: 'AND' }
    expect(estimateRecipients(ma, players)).toBe(players.length)
  })
  it('AND filters intersect', () => {
    const ma: MasterAudience = {
      broadcast: false, logic: 'AND',
      conditions: [
        { field: 'vipTier', op: '>=', value: 3 },
        { field: 'playerStatus', value: 'active' },
      ],
    }
    const n = estimateRecipients(ma, players)
    const expected = players.filter(p => p.vipTier >= 3 && p.status === 'active').length
    expect(n).toBe(expected)
  })
  it('OR filters union', () => {
    const ma: MasterAudience = {
      broadcast: false, logic: 'OR',
      conditions: [
        { field: 'playerStatus', value: 'dormant' },
        { field: 'playerStatus', value: 'churned' },
      ],
    }
    const n = estimateRecipients(ma, players)
    const expected = players.filter(p => p.status === 'dormant' || p.status === 'churned').length
    expect(n).toBe(expected)
  })
  it('empty conditions + not broadcast = 0', () => {
    const ma: MasterAudience = { broadcast: false, conditions: [], logic: 'AND' }
    expect(estimateRecipients(ma, players)).toBe(0)
  })
})
