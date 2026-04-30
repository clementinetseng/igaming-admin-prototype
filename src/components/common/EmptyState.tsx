import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
