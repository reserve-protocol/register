import { atom } from 'jotai'

interface IFilters {
  tokens: string[] // empty => all
  status: string[]
}

export const filtersAtom = atom<IFilters>({
  tokens: [],
  status: [],
})
