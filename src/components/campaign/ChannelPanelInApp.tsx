import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell } from 'lucide-react'
import type { InAppPanel } from '@/types/campaign'

export function ChannelPanelInApp({
  value, onChange,
}: { value: InAppPanel; onChange: (v: InAppPanel) => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Bell className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.inApp', 'In-App')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v: boolean) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('campaign.form.title', 'Title')}</Label>
              <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
            </div>
            <div>
              <Label>{t('campaign.form.category', 'Category')}</Label>
              <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v as InAppPanel['category'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t('campaign.inApp.personal', 'Personal')}</SelectItem>
                  <SelectItem value="promo">{t('campaign.inApp.promo', 'Promotion')}</SelectItem>
                  <SelectItem value="announcement">{t('campaign.inApp.announcement', 'Announcement')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t('campaign.form.body', 'Body')}</Label>
            <Textarea rows={5} value={value.bodyRich} onChange={(e) => onChange({ ...value, bodyRich: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{t('campaign.inApp.richHint', 'Rich text editor placeholder — supports bold, links, inline images in production')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="trigger-toast"
              checked={value.triggerToast}
              onCheckedChange={(v) => onChange({ ...value, triggerToast: !!v })}
            />
            <Label htmlFor="trigger-toast">{t('campaign.inApp.triggerToast', 'Trigger toast notification')}</Label>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
