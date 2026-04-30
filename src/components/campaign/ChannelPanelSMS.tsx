import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send } from 'lucide-react'
import type { SmsPanel } from '@/types/campaign'

export function ChannelPanelSMS({
  value, onChange, onTestSend,
}: { value: SmsPanel; onChange: (v: SmsPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  const len = value.body.length
  const segments = Math.ceil(len / 160) || 1
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <MessageSquare className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.sms', 'SMS')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v: boolean) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.sms.body', 'Message')}</Label>
            <Textarea rows={4} value={value.body} onChange={(e) => onChange({ ...value, body: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">
              {len} / 160 {t('campaign.sms.chars', 'chars')}
              {segments > 1 && ` · ${t('campaign.sms.segments', 'splits into {{n}} segments', { n: segments })}`}
              {' · '}{t('campaign.sms.stopHint', 'STOP unsubscribe text auto-appended')}
            </p>
          </div>
          <div>
            <Label>{t('campaign.sms.senderId', 'Sender ID')}</Label>
            <Input value={value.senderId} disabled />
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
