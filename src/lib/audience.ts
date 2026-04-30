import type { AudienceCondition, MasterAudience } from '@/types/audience'
import type { Player } from '@/types/player'

export function matchesCondition(player: Player, c: AudienceCondition): boolean {
  switch (c.field) {
    case 'vipTier': {
      if (c.op === '>=') return player.vipTier >= c.value
      if (c.op === '<=') return player.vipTier <= c.value
      return player.vipTier === c.value
    }
    case 'playerStatus':
      return player.status === c.value
    case 'firstDeposit':
      return (c.value === 'yes') === player.firstDeposit
    case 'registrationDays': {
      const daysSince = Math.floor(
        (Date.now() - new Date(player.registrationDate).getTime()) / 86400000
      )
      return c.op === '<=' ? daysSince <= c.value : daysSince >= c.value
    }
    case 'cumulativeDeposit':
      return player.cumulativeDeposit === c.value
    case 'verifiedContact':
      if (c.value === 'email') return player.emailVerified
      if (c.value === 'phone') return player.phoneVerified
      return player.emailVerified && player.phoneVerified
  }
}

export function estimateRecipients(ma: MasterAudience, pool: Player[]): number {
  if (ma.broadcast) return pool.length
  if (ma.conditions.length === 0) return 0
  return pool.filter((p) => {
    if (ma.logic === 'AND') return ma.conditions.every((c) => matchesCondition(p, c))
    return ma.conditions.some((c) => matchesCondition(p, c))
  }).length
}
