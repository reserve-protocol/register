import {
  openZapMintModalAtom,
  zapperCurrentTabAtom,
} from '../components/zap-mint/atom'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { UseZapperModalReturn } from '../types'

export function useZapperModal(): UseZapperModalReturn {
  const [isOpen, setOpen] = useAtom(openZapMintModalAtom)
  const [currentTab, setZapperTab] = useAtom(zapperCurrentTabAtom)

  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  const setTab = useCallback(
    (tab: 'buy' | 'sell') => {
      setZapperTab(tab)
    },
    [setZapperTab]
  )

  return {
    isOpen,
    open,
    close,
    toggle,
    setTab,
    currentTab,
  }
}
