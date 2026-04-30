import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import type { CampaignStatus } from '@/types/campaign'
import { cn } from '@/lib/utils'

const styles: Record<CampaignStatus, string> = {
  draft:     'bg-slate-100 text-slate-700 hover:bg-slate-100',
  scheduled: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  active:    'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  disabled:  'bg-rose-100 text-rose-700 hover:bg-rose-100',
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant="secondary" className={cn('rounded-full px-2.5 py-0.5 font-medium', styles[status])}>
      {t(`campaign.status.${status}`, status)}
    </Badge>
  )
}
