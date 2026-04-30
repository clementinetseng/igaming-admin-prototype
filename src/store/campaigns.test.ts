import { describe, it, expect, beforeEach } from 'vitest'
import { campaignStore } from './campaigns'

beforeEach(() => campaignStore.reset())

describe('campaignStore', () => {
  it('lists seed campaigns', () => {
    expect(campaignStore.list().length).toBe(16)
  })
  it('gets by id', () => {
    expect(campaignStore.get('cmp_001')?.name).toMatch(/Lunar/)
  })
  it('updates an existing campaign', () => {
    campaignStore.update('cmp_006', { name: 'Renamed Draft' })
    expect(campaignStore.get('cmp_006')?.name).toBe('Renamed Draft')
  })
  it('toggles status', () => {
    campaignStore.setStatus('cmp_001', 'disabled')
    expect(campaignStore.get('cmp_001')?.status).toBe('disabled')
    campaignStore.setStatus('cmp_001', 'active')
    expect(campaignStore.get('cmp_001')?.status).toBe('active')
  })
  it('creates new campaign with generated id', () => {
    const before = campaignStore.list().length
    const c = campaignStore.create({ name: 'New Test' })
    expect(c.id).toMatch(/^cmp_/)
    expect(campaignStore.list().length).toBe(before + 1)
  })
})
