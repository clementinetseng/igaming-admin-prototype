// src/components/shell/Sidebar.tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Megaphone, FileSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuditLogStubDialog } from '@/components/common/AuditLogStubDialog'

export function Sidebar() {
  const { t } = useTranslation()
  const [auditOpen, setAuditOpen] = useState(false)
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
      isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
    )
  return (
    <>
      <aside className="w-60 border-r bg-background flex flex-col py-4 px-3 gap-1">
        <NavLink to="/campaigns" className={itemClass}>
          <Megaphone className="h-4 w-4" />
          {t('nav.campaigns')}
        </NavLink>
        <button onClick={() => setAuditOpen(true)} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 text-left">
          <FileSearch className="h-4 w-4" />
          {t('nav.auditLog')}
        </button>
      </aside>
      <AuditLogStubDialog open={auditOpen} onClose={() => setAuditOpen(false)} />
    </>
  )
}
