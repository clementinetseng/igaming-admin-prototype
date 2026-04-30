export type VipTier = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type PlayerStatus = 'active' | 'dormant' | 'churned'
export type FirstDeposit = 'yes' | 'no'
export type CumulativeDepositBand = '0-100' | '100-1000' | '1000-5000' | '5000+'
export type VerifiedContact = 'email' | 'phone' | 'both'

export type AudienceCondition =
  | { field: 'vipTier'; op: '>=' | '<=' | '='; value: VipTier }
  | { field: 'playerStatus'; value: PlayerStatus }
  | { field: 'firstDeposit'; value: FirstDeposit }
  | { field: 'registrationDays'; op: '<=' | '>='; value: number }
  | { field: 'cumulativeDeposit'; value: CumulativeDepositBand }
  | { field: 'verifiedContact'; value: VerifiedContact }

export type AudienceConditionField = AudienceCondition['field']

export type MasterAudience = {
  broadcast: boolean
  conditions: AudienceCondition[]
  logic: 'AND' | 'OR'
}
