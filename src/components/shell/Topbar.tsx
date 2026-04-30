import { useTranslation } from 'react-i18next'
import { LangSwitcher } from './LangSwitcher'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { currentUser } from '@/mock/ops'

export function Topbar() {
  const { t } = useTranslation()
  return (
    <header className="h-14 border-b bg-background flex items-center px-6 sticky top-0 z-30">
      <div className="font-semibold text-lg">{t('topbar.brand')}</div>
      <div className="ml-auto flex items-center gap-2">
        <LangSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              {currentUser.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="h-4 w-4 mr-2" /> {t('topbar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
