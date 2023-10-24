import { useAtomValue } from 'jotai';
import ZapToggle from './ZapToggle';
import { ui, zapAvailableAtom } from '../state/ui-atoms';
import ZapTokenSelector from './ZapTokenSelector';

export const ZapOverview = () => {
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled);
  const isZapAvailable = useAtomValue(zapAvailableAtom);
  return (
    <>
      {isZapAvailable && <ZapToggle />}
      {isZapEnabled && <ZapTokenSelector />}
    </>
  );
};
