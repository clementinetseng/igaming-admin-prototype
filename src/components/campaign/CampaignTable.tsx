import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Campaign, ChannelKey } from '@/types/campaign'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ChannelIcons } from '@/components/common/ChannelIcons'
import { formatDateTimePHT, type AppLocale } from '@/lib/date'
import { formatPlayerCount } from '@/lib/number'

function enabledChannels(c: Campaign): ChannelKey[] {
  return (['inApp','email','sms','push'] as ChannelKey[])
    .filter((k) => c.channelPanels[k]?.enabled)
}

export function CampaignTable({ rows }: { rows: Campaign[] }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('campaign.table.name')}</TableHead>
          <TableHead>{t('campaign.table.tags')}</TableHead>
          <TableHead>{t('campaign.table.channels')}</TableHead>
          <TableHead className="text-right">{t('campaign.table.audience')}</TableHead>
          <TableHead>{t('campaign.table.schedule')}</TableHead>
          <TableHead>{t('campaign.table.status')}</TableHead>
          <TableHead>{t('campaign.table.createdBy')}</TableHead>
          <TableHead>{t('campaign.table.updated')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((c) => (
          <TableRow
            key={c.id}
            className="cursor-pointer h-10"
            onClick={() => navigate(`/campaigns/${c.id}`)}
          >
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {c.tags.map((tg) => (
                  <span key={tg} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{tg}</span>
                ))}
              </div>
            </TableCell>
            <TableCell><ChannelIcons enabled={enabledChannels(c)} /></TableCell>
            <TableCell className="text-right tabular-nums">{formatPlayerCount(c.estimatedRecipients)}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {c.schedule.at ? formatDateTimePHT(c.schedule.at, locale) : '—'}
            </TableCell>
            <TableCell><StatusBadge status={c.status} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">{c.createdBy}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDateTimePHT(c.updatedAt, locale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
