import type { Campaign, CampaignStatus } from '@/types/campaign'
import { campaigns as seed } from '@/mock/campaigns'
import { currentUser } from '@/mock/ops'

let data: Campaign[] = []

function nowIso() { return new Date().toISOString() }

function blank(name = ''): Campaign {
  return {
    id: `cmp_${Math.random().toString(36).slice(2, 7)}`,
    name,
    tags: [],
    status: 'draft',
    masterAudience: { broadcast: false, conditions: [], logic: 'AND' },
    estimatedRecipients: 0,
    channelPanels: {},
    schedule: { type: 'immediate' },
    ignoreQuietHours: false,
    createdBy: currentUser.username,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export const campaignStore = {
  reset() { data = seed.map((c) => ({ ...c })) },
  list(): Campaign[] { return data },
  get(id: string): Campaign | undefined { return data.find((c) => c.id === id) },
  create(partial: Partial<Campaign> = {}): Campaign {
    const c: Campaign = { ...blank(partial.name ?? 'Untitled'), ...partial }
    data = [c, ...data]
    return c
  },
  update(id: string, patch: Partial<Campaign>) {
    data = data.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c))
  },
  setStatus(id: string, status: CampaignStatus) {
    this.update(id, { status })
  },
  remove(id: string) {
    data = data.filter((c) => c.id !== id)
  },
}

campaignStore.reset()
