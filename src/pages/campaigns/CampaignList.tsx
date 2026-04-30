import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { campaignStore } from '@/store/campaigns'
import { CampaignFilters, emptyFilters, type CampaignFiltersValue } from '@/components/campaign/CampaignFilters'
import { CampaignTable } from '@/components/campaign/CampaignTable'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import type { Campaign, ChannelKey } from '@/types/campaign'

const PAGE_SIZE = 10

function applyFilters(rows: Campaign[], f: CampaignFiltersValue): Campaign[] {
  return rows.filter((c) => {
    if (f.search && !c.name.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.statuses.length > 0 && !f.statuses.includes(c.status)) return false
    if (f.channels.length > 0) {
      const enabled = (['inApp','email','sms','push'] as ChannelKey[]).filter(
        (k) => c.channelPanels[k]?.enabled
      )
      if (!f.channels.some((ch) => enabled.includes(ch))) return false
    }
    if (f.createdBy.length > 0 && !f.createdBy.includes(c.createdBy)) return false
    return true
  })
}

export default function CampaignList() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const triggerError = params.get('error') === '1'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState<CampaignFiltersValue>({ ...emptyFilters })
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (triggerError) setError(true)
      setLoading(false)
    }, 350)
    return () => clearTimeout(t1)
  }, [triggerError])

  const all = campaignStore.list()
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('campaign.list.title', 'Campaigns')}</h1>
        <Button asChild>
          <Link to="/campaigns/new"><Plus className="h-4 w-4 mr-1" /> {t('campaign.list.newButton', 'New Campaign')}</Link>
        </Button>
      </div>

      <CampaignFilters value={filters} onChange={(v) => { setFilters(v); setPage(1) }} />

      {loading && <TableSkeleton rows={5} />}

      {!loading && error && (
        <div className="border rounded-md p-12 flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-medium mb-1">{t('campaign.list.errorTitle', 'Something went wrong')}</h3>
          <p className="text-muted-foreground mb-4">{t('campaign.list.errorBody', 'We could not load campaigns. Please try again.')}</p>
          <Button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 300) }}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('campaign.list.retry', 'Retry')}
          </Button>
        </div>
      )}

      {!loading && !error && all.length === 0 && (
        <EmptyState
          title={t('campaign.list.empty.title', 'No campaigns yet')}
          description={t('campaign.list.empty.body', 'Create your first campaign to start reaching players.')}
          action={<Button asChild><Link to="/campaigns/new">{t('campaign.list.newButton', 'New Campaign')}</Link></Button>}
        />
      )}

      {!loading && !error && all.length > 0 && filtered.length === 0 && (
        <EmptyState
          title={t('campaign.list.filterEmpty.title', 'No campaigns match your filters')}
          description={t('campaign.list.filterEmpty.body', 'Try adjusting your filters or clearing them.')}
          action={<Button variant="outline" onClick={() => setFilters({ ...emptyFilters })}>{t('common.clearFilters')}</Button>}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="rounded-md border">
            <CampaignTable rows={pageRows} />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">
                {t('campaign.list.pageOf', 'Page {{page}} of {{total}}', { page, total: totalPages })}
              </span>
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                {t('common.previous', 'Previous')}
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                {t('common.next', 'Next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
