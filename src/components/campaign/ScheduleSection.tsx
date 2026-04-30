import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Schedule } from '@/types/campaign'

function isInQuietHours(iso?: string): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const phHour = (d.getUTCHours() + 8) % 24
  return phHour >= 23 || phHour < 8
}

export function ScheduleSection({
  schedule, ignoreQuietHours, onScheduleChange, onIgnoreQuietHoursChange,
}: {
  schedule: Schedule
  ignoreQuietHours: boolean
  onScheduleChange: (s: Schedule) => void
  onIgnoreQuietHoursChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  const qh = isInQuietHours(schedule.at)
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('campaign.schedule.title', 'Schedule')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={schedule.type}
          onValueChange={(v) => onScheduleChange({ ...schedule, type: v as Schedule['type'], at: v === 'immediate' ? undefined : schedule.at })}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="immediate" id="sch-immediate" />
            <Label htmlFor="sch-immediate">{t('campaign.schedule.immediate', 'Send immediately')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="datetime" id="sch-later" />
            <Label htmlFor="sch-later">{t('campaign.schedule.later', 'Schedule for later')}</Label>
          </div>
        </RadioGroup>

        {schedule.type === 'datetime' && (
          <div>
            <Label>{t('campaign.schedule.datetime', 'Date & time (PH timezone)')}</Label>
            <Input
              type="datetime-local"
              value={schedule.at ? schedule.at.slice(0, 16) : ''}
              onChange={(e) => onScheduleChange({ ...schedule, at: new Date(e.target.value).toISOString() })}
            />
          </div>
        )}

        {qh && !ignoreQuietHours && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('campaign.schedule.quietWarning', 'Selected time falls in Quiet Hours (23:00–08:00). SMS / Push will auto-defer to 08:00 next morning unless override is checked.')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="ignore-qh"
            checked={ignoreQuietHours}
            onCheckedChange={(v) => onIgnoreQuietHoursChange(!!v)}
          />
          <Label htmlFor="ignore-qh" className="text-sm">
            {t('campaign.schedule.ignoreQH', 'Override Quiet Hours (time-sensitive only)')}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
