import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Send, Eye, Code } from 'lucide-react'
import type { EmailPanel } from '@/types/campaign'

export function ChannelPanelEmail({
  value, onChange, onTestSend,
}: { value: EmailPanel; onChange: (v: EmailPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  const [view, setView] = useState<'code' | 'preview'>('code')
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Mail className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.email', 'Email')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v: boolean) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.email.subject', 'Subject')}</Label>
            <Input value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} />
          </div>
          <div>
            <Label>{t('campaign.email.preheader', 'Preheader')}</Label>
            <Input value={value.preheader} onChange={(e) => onChange({ ...value, preheader: e.target.value })} />
          </div>
          <div>
            <Label>{t('campaign.email.sender', 'Sender From')}</Label>
            <Select value={value.senderFrom} onValueChange={(v) => onChange({ ...value, senderFrom: v as EmailPanel['senderFrom'] })}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="noreply">noreply@brand.ph</SelectItem>
                <SelectItem value="promo">promo@brand.ph</SelectItem>
                <SelectItem value="vip">vip@brand.ph</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('campaign.email.body', 'HTML Body')}</Label>
              <div className="flex gap-1">
                <Button type="button" variant={view === 'code' ? 'default' : 'outline'} size="sm" onClick={() => setView('code')}>
                  <Code className="h-3.5 w-3.5 mr-1" /> HTML
                </Button>
                <Button type="button" variant={view === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setView('preview')}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> {t('campaign.email.preview', 'Preview')}
                </Button>
              </div>
            </div>
            {view === 'code' ? (
              <Textarea rows={10} value={value.htmlBody} onChange={(e) => onChange({ ...value, htmlBody: e.target.value })} className="font-mono text-xs" />
            ) : (
              <iframe srcDoc={value.htmlBody} title="Email preview" className="w-full border rounded-md h-72 bg-white" />
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
