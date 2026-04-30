import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import zhTW from './zh-TW.json'

export type AppLocale = 'en-US' | 'zh-TW'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { 'en-US': { translation: en }, 'zh-TW': { translation: zhTW } },
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'zh-TW'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ui-lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  })

export default i18n

export function setLanguage(lng: AppLocale) {
  i18n.changeLanguage(lng)
}
export function currentLocale(): AppLocale {
  return (i18n.resolvedLanguage as AppLocale) || 'en-US'
}
