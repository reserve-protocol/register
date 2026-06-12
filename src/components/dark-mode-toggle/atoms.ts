import { atom } from 'jotai'

export type ThemeMode = 'light' | 'dark'

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme-ui-color-mode')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const themeModeAtom = atom<ThemeMode>(getInitialMode())

// Apply the persisted theme on first subscription (app boot)
themeModeAtom.onMount = () => {
  const mode = getInitialMode()
  document.documentElement.setAttribute('data-color-mode', mode)
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const toggleThemeAtom = atom(null, (get, set) => {
  const newMode: ThemeMode =
    get(themeModeAtom) === 'light' ? 'dark' : 'light'
  set(themeModeAtom, newMode)
  localStorage.setItem('theme-ui-color-mode', newMode)
  // Theme-ui + Tailwind both read from the document element
  document.documentElement.setAttribute('data-color-mode', newMode)
  document.documentElement.classList.toggle('dark', newMode === 'dark')
})
