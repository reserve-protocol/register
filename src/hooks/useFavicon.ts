import { useEffect } from 'react'

const DEFAULT_FAVICON = '/favicon.ico'

export const useFavicon = (iconUrl: string | undefined) => {
  useEffect(() => {
    const link = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement | null

    if (!link) return

    const originalHref = link.href

    if (iconUrl) {
      link.href = iconUrl
    }

    return () => {
      link.href = originalHref || DEFAULT_FAVICON
    }
  }, [iconUrl])
}

export default useFavicon
