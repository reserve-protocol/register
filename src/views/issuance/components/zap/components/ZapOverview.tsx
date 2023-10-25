import { useAtomValue } from 'jotai'
import ZapToggle from './ZapToggle'
import { ui, zapAvailableAtom, zapEnabledAtom } from '../state/ui-atoms'
import ZapTokenSelector from './ZapTokenSelector'
import { clientAtom } from 'state/atoms'

export const ZapOverview = () => {
  const client = useAtomValue(clientAtom)
  const zapToggledOn = useAtomValue(zapEnabledAtom)
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const isZapAvailable = useAtomValue(zapAvailableAtom)
  return (
    <>
      {isZapAvailable && <ZapToggle />}
      {zapToggledOn && client && isZapEnabled && <ZapTokenSelector />}
    </>
  )
}
