import { atom } from 'jotai'

export const searchFilterAtom = atom('')
export const chainsFilterAtom = atom<number[]>([])

// TODO: NO IDEA HOW TO DO THIS ONE
export const categoryFilterAtom = atom<string[]>([])
