import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ToggleConfirmDialog({
  open, action, recipients, onConfirm, onClose,
}: {
  open: boolean
  action: 'enable' | 'disable'
  recipients: number
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'disable'
              ? t('campaign.toggle.disableTitle', 'Disable this campaign?')
              : t('campaign.toggle.enableTitle', 'Enable this campaign?')}
          </DialogTitle>
          <DialogDescription>
            {action === 'disable'
              ? t('campaign.toggle.disableBody', 'It will be hidden from all {{n}} recipients. Read history is preserved.', { n: recipients })
              : t('campaign.toggle.enableBody', 'It will be visible again to all {{n}} recipients. No new toast notifications will be triggered.', { n: recipients })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant={action === 'disable' ? 'destructive' : 'default'} onClick={onConfirm}>
            {action === 'disable' ? t('campaign.toggle.disable', 'Disable') : t('campaign.toggle.enable', 'Enable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
