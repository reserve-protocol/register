import { atom } from 'jotai'

// Which panel the issuance page shows: the standard zapper "swap" experience,
// or the automated (auto-mint) wizard. Toggled on the issuance page; the
// /automated route deep-links by setting this to 'auto' on mount.
export type IssuancePanelMode = 'swap' | 'auto'

export const panelModeAtom = atom<IssuancePanelMode>('swap')
