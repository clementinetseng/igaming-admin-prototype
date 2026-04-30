import { format, formatDistance } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { enUS, zhTW } from 'date-fns/locale'

export type AppLocale = 'en-US' | 'zh-TW'
const PH_TZ = 'Asia/Manila'
const localeOf = (l: AppLocale) => (l === 'zh-TW' ? zhTW : enUS)

export function formatDateTimePHT(iso: string, locale: AppLocale): string {
  const zoned = new TZDate(new Date(iso), PH_TZ)
  return locale === 'zh-TW'
    ? format(zoned, 'M月d日 HH:mm', { locale: zhTW })
    : format(zoned, 'MMM d, HH:mm', { locale: enUS })
}

export function formatDatePHT(iso: string, locale: AppLocale): string {
  const zoned = new TZDate(new Date(iso), PH_TZ)
  return locale === 'zh-TW'
    ? format(zoned, 'yyyy年M月d日', { locale: zhTW })
    : format(zoned, 'MMM d, yyyy', { locale: enUS })
}

export function formatRelativePHT(iso: string, locale: AppLocale): string {
  const zoned = new TZDate(new Date(iso), PH_TZ)
  const now = new TZDate(new Date(), PH_TZ)
  return formatDistance(zoned, now, { locale: localeOf(locale), addSuffix: true })
}
