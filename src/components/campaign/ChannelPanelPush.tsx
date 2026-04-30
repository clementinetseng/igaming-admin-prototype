import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Smartphone, Send } from 'lucide-react'
import type { PushPanel } from '@/types/campaign'

export function ChannelPanelPush({
  value, onChange, onTestSend,
}: { value: PushPanel; onChange: (v: PushPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Smartphone className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.push', 'Push')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.push.title', 'Title')}</Label>
            <Input value={value.title} maxLength={50} onChange={(e) => onChange({ ...value, title: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{value.title.length} / 50</p>
          </div>
          <div>
            <Label>{t('campaign.push.body', 'Body')}</Label>
            <Textarea rows={3} maxLength={100} value={value.body} onChange={(e) => onChange({ ...value, body: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{value.body.length} / 100</p>
          </div>
          <div>
            <Label>{t('campaign.push.url', 'Click URL')}</Label>
            <Input value={value.ctaUrl} placeholder="/lobby" onChange={(e) => onChange({ ...value, ctaUrl: e.target.value })} />
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
