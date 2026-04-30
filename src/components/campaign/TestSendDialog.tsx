import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ChannelKey } from '@/types/campaign'

const PLACEHOLDERS: Record<ChannelKey, string> = {
  inApp: 'usr_0001\nusr_0002',
  email: 'test1@brand.ph\ntest2@brand.ph',
  sms: '+63 917 123 4567\n+63 918 234 5678',
  push: 'usr_0001',
}

export function TestSendDialog({
  open, channel, onClose,
}: { open: boolean; channel?: ChannelKey; onClose: () => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  if (!channel) return null
  const recipients = value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  const valid = recipients.length >= 1 && recipients.length <= 5
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('campaign.testSend.title', 'Send test')}</DialogTitle>
          <DialogDescription>
            {t('campaign.testSend.description', 'Send to 1–5 recipients via {{channel}}', { channel })}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>{t('campaign.testSend.recipients', 'Recipients')}</Label>
          <Textarea
            rows={4} value={value} onChange={(e) => setValue(e.target.value)}
            placeholder={PLACEHOLDERS[channel]}
          />
          <p className="text-xs text-muted-foreground mt-1">{recipients.length} / 5</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              toast.success(t('campaign.testSend.sent', 'Test send dispatched to {{n}} recipients', { n: recipients.length }))
              setValue('')
              onClose()
            }}
          >
            {t('campaign.testSend.send', 'Send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
