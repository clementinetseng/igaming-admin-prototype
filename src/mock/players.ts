import type { Player, Carrier } from '@/types/player'
import type { VipTier, PlayerStatus, CumulativeDepositBand } from '@/types/audience'

// Globe prefixes (PH carrier mapping); rest go to Smart for mock purposes
const GLOBE_PREFIXES = ['905','906','915','916','917','926','927','935','936','937','945','955','956','965','966','967','975','976','977','995','996','997']

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rng = seededRand(42)

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((a, b) => a + b.weight, 0)
  let r = rng() * total
  for (const it of items) {
    r -= it.weight
    if (r <= 0) return it.value
  }
  return items[0].value
}

function makePlayer(i: number): Player {
  const vipTier = pickWeighted<VipTier>([
    { value: 1, weight: 30 }, { value: 2, weight: 25 }, { value: 3, weight: 18 },
    { value: 4, weight: 12 }, { value: 5, weight: 8 },  { value: 6, weight: 5 },
    { value: 7, weight: 2 },
  ])
  const status = pickWeighted<PlayerStatus>([
    { value: 'active', weight: 60 }, { value: 'dormant', weight: 30 }, { value: 'churned', weight: 10 },
  ])
  const cumulativeDeposit = pickWeighted<CumulativeDepositBand>([
    { value: '0-100', weight: 30 }, { value: '100-1000', weight: 35 },
    { value: '1000-5000', weight: 25 }, { value: '5000+', weight: 10 },
  ])
  const emailVerified = rng() < 0.7
  const phoneVerified = rng() < 0.8
  const prefix = rng() < 0.6 ? GLOBE_PREFIXES[Math.floor(rng() * GLOBE_PREFIXES.length)] : '907'
  const carrier: Carrier = GLOBE_PREFIXES.includes(prefix) ? 'globe' : 'smart'
  const phone = `+63 9${prefix.slice(1)} ${String(Math.floor(rng() * 1000)).padStart(3,'0')} ${String(Math.floor(rng() * 10000)).padStart(4,'0')}`
  const daysAgo = Math.floor(rng() * 540) + 1
  const regDate = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const id = `usr_${String(i).padStart(4, '0')}`
  return {
    id,
    username: `player${i}`,
    email: `player${i}@${rng() < 0.5 ? 'gmail.com' : 'yahoo.com'}`,
    emailVerified,
    phone,
    phoneVerified,
    carrier,
    vipTier,
    status,
    firstDeposit: rng() < 0.65,
    cumulativeDeposit,
    registrationDate: regDate,
    kycStatus: pickWeighted<'pending'|'approved'|'rejected'>([
      { value: 'approved', weight: 75 },
      { value: 'pending', weight: 15 },
      { value: 'rejected', weight: 10 },
    ]),
    twoFactorEnabled: rng() < 0.4,
    pushSubscribed: rng() < 0.5,
  }
}

export const players: Player[] = Array.from({ length: 120 }, (_, i) => makePlayer(i + 1))
