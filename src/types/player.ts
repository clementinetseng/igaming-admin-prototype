import type { VipTier, PlayerStatus, CumulativeDepositBand } from './audience'

export type Carrier = 'globe' | 'smart'

export type Player = {
  id: string
  username: string
  email: string
  emailVerified: boolean
  phone: string                 // +63 9XX XXX XXXX
  phoneVerified: boolean
  carrier: Carrier
  vipTier: VipTier
  status: PlayerStatus
  firstDeposit: boolean
  cumulativeDeposit: CumulativeDepositBand
  registrationDate: string      // ISO
  kycStatus: 'pending' | 'approved' | 'rejected'
  twoFactorEnabled: boolean
  pushSubscribed: boolean
}
