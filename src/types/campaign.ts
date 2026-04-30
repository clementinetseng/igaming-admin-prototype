import type { AudienceCondition, MasterAudience } from './audience'

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'disabled'
export type ChannelKey = 'inApp' | 'email' | 'sms' | 'push'
export type InAppCategory = 'personal' | 'promo' | 'announcement'
export type EmailSender = 'noreply' | 'promo' | 'vip'

export type InAppPanel = {
  enabled: boolean
  title: string
  category: InAppCategory
  bodyRich: string
  cta?: { label: string; url: string }
  triggerToast: boolean
  audienceFilter?: AudienceCondition[]
}
export type EmailPanel = {
  enabled: boolean
  subject: string
  preheader: string
  htmlBody: string
  senderFrom: EmailSender
  audienceFilter?: AudienceCondition[]
}
export type SmsPanel = {
  enabled: boolean
  body: string
  senderId: string
  audienceFilter?: AudienceCondition[]
}
export type PushPanel = {
  enabled: boolean
  title: string
  body: string
  ctaUrl: string
  audienceFilter?: AudienceCondition[]
}

export type ChannelPanels = {
  inApp?: InAppPanel
  email?: EmailPanel
  sms?: SmsPanel
  push?: PushPanel
}

export type Schedule = {
  type: 'immediate' | 'datetime'
  at?: string                                              // ISO
  perPanelOverrides?: Partial<Record<ChannelKey, string>>
}

export type SendingProgress = {
  perChannel: Partial<Record<ChannelKey, { sent: number; total: number; lastUpdate: string }>>
}

export type Exclusions = {
  optOut: number
  frequencyCap: number
  suppression: number
  unverifiedContact: number
}

export type Campaign = {
  id: string
  name: string
  tags: string[]
  status: CampaignStatus
  masterAudience: MasterAudience
  estimatedRecipients: number
  channelPanels: ChannelPanels
  schedule: Schedule
  ignoreQuietHours: boolean
  sendingProgress?: SendingProgress
  exclusions?: Exclusions
  createdBy: string                                        // ops username
  createdAt: string
  updatedAt: string
}
