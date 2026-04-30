import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import type { ChannelKey } from '@/types/campaign'
import { cn } from '@/lib/utils'

const ICONS: Record<ChannelKey, typeof Bell> = {
  inApp: Bell, email: Mail, sms: MessageSquare, push: Smartphone,
}
const TITLES: Record<ChannelKey, string> = {
  inApp: 'In-App', email: 'Email', sms: 'SMS', push: 'Push',
}

export function ChannelIcons({ enabled, className }: { enabled: ChannelKey[]; className?: string }) {
  return (
    <div className={cn('flex gap-1.5 text-muted-foreground', className)}>
      {(['inApp','email','sms','push'] as ChannelKey[]).map((k) => {
        const Icon = ICONS[k]
        const on = enabled.includes(k)
        return (
          <Icon
            key={k}
            className={cn('h-4 w-4', on ? 'text-foreground' : 'opacity-25')}
            aria-label={TITLES[k]}
          />
        )
      })}
    </div>
  )
}
