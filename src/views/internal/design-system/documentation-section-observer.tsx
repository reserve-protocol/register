import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  DOCUMENTATION_NAVIGATION,
  type DocumentationNavigationGroup,
  type DocumentationNavigationItem,
  type DocumentationText,
} from './documentation-presentation'

const SECTION_CONTEXT_GAP = 16

export interface DocumentationPageSection {
  id: string
  label: DocumentationText
  path: readonly string[]
}

interface DocumentationSectionContextValue {
  activeSectionId?: string
  activeSectionPath: readonly string[]
  navigateToSection: (id: string) => void
  sections: readonly DocumentationPageSection[]
}

const DocumentationSectionContext =
  createContext<DocumentationSectionContextValue>({
    activeSectionPath: [],
    navigateToSection: () => undefined,
    sections: [],
  })

const getRouteParts = (route: string) => {
  const [pathAndSearch, hash = ''] = route.split('#')
  return {
    hash,
    pathname: pathAndSearch.split('?')[0],
  }
}

const flattenSections = (
  items: readonly DocumentationNavigationItem[],
  pathname: string,
  parentPath: readonly string[] = []
): DocumentationPageSection[] =>
  items.flatMap((item) => {
    const route = getRouteParts(item.route)
    const path = [...parentPath, item.id]
    const section =
      route.pathname === pathname && route.hash
        ? [{ id: route.hash, label: item.label, path }]
        : []

    return [...section, ...flattenSections(item.items ?? [], pathname, path)]
  })

export const getDocumentationSections = (pathname: string) => {
  const navigation: readonly DocumentationNavigationGroup[] =
    DOCUMENTATION_NAVIGATION
  const destination = navigation.find(
    (item) => getRouteParts(item.route).pathname === pathname
  )
  return destination ? flattenSections(destination.items ?? [], pathname) : []
}

export const getDocumentationSectionOffset = () => {
  const mobileHeader = document.querySelector<HTMLElement>(
    '[data-documentation-mobile-header]'
  )
  return (
    (mobileHeader?.getBoundingClientRect().height ?? 0) + SECTION_CONTEXT_GAP
  )
}

const scrollToSection = (id: string) => {
  const target = document.getElementById(id)
  const scroller = document.getElementById('app-container')
  if (!target || !scroller) return

  const top =
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop -
    getDocumentationSectionOffset()
  scroller.scrollTo({ top })
}

export const DocumentationSectionProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const navigate = useNavigate()
  const { hash, pathname, search } = useLocation()
  const sections = useMemo(() => getDocumentationSections(pathname), [pathname])
  const initialHash = hash.slice(1)
  const initialSection = sections.find(({ id }) => id === initialHash)
  const [activeSectionId, setActiveSectionId] = useState(
    initialSection?.id ?? sections[0]?.id
  )
  const observedLocation = useRef<string>()
  const pendingRestoreId = useRef<string>()
  const anchoredSectionId = useRef<string>()

  useEffect(() => {
    const hashId = hash.slice(1)
    const section = sections.find(({ id }) => id === hashId)
    if (section) setActiveSectionId(section.id)
    else if (!sections.some(({ id }) => id === activeSectionId))
      setActiveSectionId(sections[0]?.id)
  }, [activeSectionId, hash, sections])

  useLayoutEffect(() => {
    const locationIdentity = `${pathname}${hash}`
    if (observedLocation.current === locationIdentity) {
      observedLocation.current = undefined
      return
    }

    const requestedId = hash.slice(1)
    const hashId = document.getElementById(requestedId)
      ? requestedId
      : undefined
    pendingRestoreId.current = hashId
    anchoredSectionId.current = hashId
    const frame = window.requestAnimationFrame(() => {
      const scroller = document.getElementById('app-container')
      if (hashId) scrollToSection(hashId)
      else if (sections.length) scroller?.scrollTo({ top: 0 })

      pendingRestoreId.current = undefined
      scroller?.dispatchEvent(new Event('scroll'))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname, sections.length])

  useEffect(() => {
    const scroller = document.getElementById('app-container')
    if (!scroller || !sections.length) return

    let frame: number | undefined
    const measure = () => {
      frame = undefined
      if (window.location.pathname !== pathname) return
      if (pendingRestoreId.current) return
      if (anchoredSectionId.current) {
        setActiveSectionId(anchoredSectionId.current)
        return
      }
      const scrollerTop = scroller.getBoundingClientRect().top
      const threshold = scrollerTop + getDocumentationSectionOffset()
      const renderedSections = sections.flatMap((section) => {
        const element = document.getElementById(section.id)
        return element ? [{ element, section }] : []
      })
      if (!renderedSections.length) return

      let current = renderedSections[0].section
      for (const candidate of renderedSections) {
        if (candidate.element.getBoundingClientRect().top > threshold) break
        current = candidate.section
      }
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight)
        current = renderedSections[renderedSections.length - 1].section

      setActiveSectionId(current.id)
      const nextHash = `#${current.id}`
      if (window.location.hash === nextHash) return

      observedLocation.current = `${pathname}${nextHash}`
      navigate({ pathname, search, hash: nextHash }, { replace: true })
    }
    const scheduleMeasure = () => {
      if (frame !== undefined) return
      frame = window.requestAnimationFrame(measure)
    }

    const releaseAnchoredSection = () => {
      anchoredSectionId.current = undefined
    }
    const releaseAnchoredSectionFromPointer = (event: PointerEvent) => {
      if (event.target === scroller) releaseAnchoredSection()
    }
    const releaseAnchoredSectionFromKey = (event: KeyboardEvent) => {
      if (
        ![
          'ArrowDown',
          'ArrowUp',
          'End',
          'Home',
          'PageDown',
          'PageUp',
          ' ',
        ].includes(event.key) ||
        (event.target instanceof HTMLElement &&
          event.target.matches('input, textarea, select, [contenteditable]'))
      )
        return
      releaseAnchoredSection()
    }

    scheduleMeasure()
    scroller.addEventListener('wheel', releaseAnchoredSection, {
      passive: true,
    })
    scroller.addEventListener('touchmove', releaseAnchoredSection, {
      passive: true,
    })
    scroller.addEventListener('pointerdown', releaseAnchoredSectionFromPointer)
    document.addEventListener('keydown', releaseAnchoredSectionFromKey)
    scroller.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(scroller)

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      scroller.removeEventListener('wheel', releaseAnchoredSection)
      scroller.removeEventListener('touchmove', releaseAnchoredSection)
      scroller.removeEventListener(
        'pointerdown',
        releaseAnchoredSectionFromPointer
      )
      document.removeEventListener('keydown', releaseAnchoredSectionFromKey)
      scroller.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      resizeObserver.disconnect()
    }
  }, [navigate, pathname, search, sections])

  useEffect(() => {
    const handleAnchorIntent = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank') return

      const destination = new URL(anchor.href, window.location.href)
      const id = destination.hash.slice(1)
      if (
        destination.pathname !== pathname ||
        !sections.some((section) => section.id === id)
      )
        return

      pendingRestoreId.current = id
      anchoredSectionId.current = id
      if (
        destination.hash === window.location.hash &&
        destination.search === search
      ) {
        window.requestAnimationFrame(() => {
          scrollToSection(id)
          pendingRestoreId.current = undefined
        })
        return
      }
    }

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || anchor.target === '_blank') return

      const id = anchor.hash.slice(1)
      if (!sections.some((section) => section.id === id)) return

      event.preventDefault()
      setActiveSectionId(id)
      navigate({ pathname, search, hash: anchor.hash })
    }

    document.addEventListener('click', handleAnchorIntent, true)
    document.addEventListener('click', handleAnchorClick)
    return () => {
      document.removeEventListener('click', handleAnchorIntent, true)
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [navigate, pathname, search, sections])

  const navigateToSection = useCallback(
    (id: string) => {
      if (!sections.some((section) => section.id === id)) return
      setActiveSectionId(id)
      pendingRestoreId.current = id
      anchoredSectionId.current = id
      navigate({ pathname, search, hash: `#${id}` })
      window.requestAnimationFrame(() => {
        const scroller = document.getElementById('app-container')
        scrollToSection(id)
        pendingRestoreId.current = undefined
        scroller?.dispatchEvent(new Event('scroll'))
      })
    },
    [navigate, pathname, search, sections]
  )

  const activeSectionPath =
    sections.find(({ id }) => id === activeSectionId)?.path ?? []

  return (
    <DocumentationSectionContext.Provider
      value={{
        activeSectionId,
        activeSectionPath,
        navigateToSection,
        sections,
      }}
    >
      {children}
    </DocumentationSectionContext.Provider>
  )
}

export const useDocumentationSection = () =>
  useContext(DocumentationSectionContext)
