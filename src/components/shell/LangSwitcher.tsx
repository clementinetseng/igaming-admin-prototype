import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const LABELS: Record<string, string> = { 'en-US': 'EN', 'zh-TW': '中文' }

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? 'en-US'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          {LABELS[current] ?? current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(v) => i18n.changeLanguage(v)}
        >
          <DropdownMenuRadioItem value="en-US">EN</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="zh-TW">中文</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
