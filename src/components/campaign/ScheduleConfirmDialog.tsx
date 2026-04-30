import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPlayerCount } from '@/lib/number'
import type { ChannelKey, Exclusions } from '@/types/campaign'

export function ScheduleConfirmDialog({
  open, recipients, exclusions, channels, scheduleLabel, isBroadcast, onConfirm, onClose,
}: {
  open: boolean
  recipients: number
  exclusions: Exclusions
  channels: ChannelKey[]
  scheduleLabel: string
  isBroadcast: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('campaign.scheduleConfirm.title', 'Confirm Schedule')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{t('campaign.scheduleConfirm.recipients', 'Estimated recipients')}</span>
            <span className="text-2xl font-semibold tabular-nums">{formatPlayerCount(recipients)}</span>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{t('campaign.scheduleConfirm.excluded', 'Excluded')}</p>
            <ul className="text-sm space-y-1">
              <ExclusionRow label={t('campaign.scheduleConfirm.optOut', 'Marketing opt-out')} value={exclusions.optOut} />
              <ExclusionRow label={t('campaign.scheduleConfirm.frequencyCap', 'Frequency cap')} value={exclusions.frequencyCap} />
              <ExclusionRow label={t('campaign.scheduleConfirm.suppression', 'Suppression list')} value={exclusions.suppression} />
              <ExclusionRow label={t('campaign.scheduleConfirm.unverifiedContact', 'Unverified contact')} value={exclusions.unverifiedContact} />
            </ul>
          </div>
          <div className="text-sm">
            <p><span className="text-muted-foreground">{t('campaign.scheduleConfirm.channels', 'Channels')}: </span>
              {channels.map((c) => t(`campaign.channels.${c}`, c)).join(', ')}
            </p>
            <p><span className="text-muted-foreground">{t('campaign.scheduleConfirm.schedule', 'Schedule')}: </span>{scheduleLabel}</p>
          </div>
          {isBroadcast && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('campaign.scheduleConfirm.broadcastWarning', 'This is a BROADCAST to all players. Double-check before confirming.')}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={onConfirm}>{t('campaign.scheduleConfirm.confirm', 'Confirm Schedule')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ExclusionRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between">
      <span>• {label}</span>
      <span className="tabular-nums">{formatPlayerCount(value)}</span>
    </li>
  )
}
