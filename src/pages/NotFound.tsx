// src/pages/NotFound.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-semibold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">{t('notFound.body', 'The page you are looking for does not exist.')}</p>
      <Button asChild><Link to="/campaigns">{t('common.back')}</Link></Button>
    </div>
  )
}
