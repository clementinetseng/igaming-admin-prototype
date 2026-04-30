import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function App() {
  const { t, i18n } = useTranslation()
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold mb-4">{t('topbar.brand')}</h1>
      <Button onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === 'zh-TW' ? 'en-US' : 'zh-TW')}>
        Toggle ({i18n.resolvedLanguage})
      </Button>
    </main>
  )
}
