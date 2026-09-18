import { setupI18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useEffect, type ReactNode } from 'react'

import { messages } from '@/locales/en.po'

const documentationI18n = setupI18n({
  locale: 'en',
  messages: { en: messages },
})

const DocumentationLanguageProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  useEffect(() => {
    const previousLanguage = document.documentElement.lang
    document.documentElement.lang = 'en'
    return () => {
      document.documentElement.lang = previousLanguage
    }
  }, [])

  return <I18nProvider i18n={documentationI18n}>{children}</I18nProvider>
}

export default DocumentationLanguageProvider
