import { atom } from 'jotai'

// Populated by the updater in src/views/earn/index.tsx.
// Shared across /earn sub-views so filter atoms can drop deprecated DTFs.
export const deprecatedDTFAddressesAtom = atom<Set<string>>(new Set<string>())
