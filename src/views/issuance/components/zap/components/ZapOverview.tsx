import { useAtomValue } from 'jotai'
import ZapToggle from './ZapToggle'
import { ui, zapAvailableAtom, zapEnabledAtom } from '../state/ui-atoms'
import ZapTokenSelector from './ZapTokenSelector'

export const ZapOverview = () => {
  const zapToggledOn = useAtomValue(zapEnabledAtom)
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const isZapAvailable = useAtomValue(zapAvailableAtom)
  return (
    <>
      {isZapAvailable && <ZapToggle />}
      {zapToggledOn && isZapEnabled && <ZapTokenSelector />}
    </>
  )
}
