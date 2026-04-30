import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { CampaignStatus, ChannelKey } from '@/types/campaign'
import { opsAccounts } from '@/mock/ops'

export type CampaignFiltersValue = {
  search: string
  statuses: CampaignStatus[]
  channels: ChannelKey[]
  createdBy: string[]
}

export const emptyFilters: CampaignFiltersValue = {
  search: '', statuses: [], channels: [], createdBy: [],
}

const ALL_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'active', 'disabled']
const ALL_CHANNELS: ChannelKey[] = ['inApp', 'email', 'sms', 'push']

export function CampaignFilters({
  value, onChange,
}: { value: CampaignFiltersValue; onChange: (v: CampaignFiltersValue) => void }) {
  const { t } = useTranslation()
  const hasFilters =
    value.search.length > 0 || value.statuses.length > 0 ||
    value.channels.length > 0 || value.createdBy.length > 0

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.status')}{value.statuses.length > 0 && ` (${value.statuses.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.status')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={value.statuses.includes(s)}
              onCheckedChange={() => onChange({ ...value, statuses: toggle(value.statuses, s) })}
            >
              {t(`campaign.status.${s}`, s)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.channels')}{value.channels.length > 0 && ` (${value.channels.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.channels')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_CHANNELS.map((c) => (
            <DropdownMenuCheckboxItem
              key={c}
              checked={value.channels.includes(c)}
              onCheckedChange={() => onChange({ ...value, channels: toggle(value.channels, c) })}
            >
              {t(`campaign.channels.${c}`, c)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.createdBy')}{value.createdBy.length > 0 && ` (${value.createdBy.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.createdBy')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {opsAccounts.map((u) => (
            <DropdownMenuCheckboxItem
              key={u.id}
              checked={value.createdBy.includes(u.username)}
              onCheckedChange={() => onChange({ ...value, createdBy: toggle(value.createdBy, u.username) })}
            >
              {u.username}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyFilters })}>
          <X className="h-3 w-3 mr-1" /> {t('common.clearFilters')}
        </Button>
      )}
    </div>
  )
}
