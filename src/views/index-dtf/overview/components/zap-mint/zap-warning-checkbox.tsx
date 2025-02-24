import { Checkbox } from '@/components/ui/checkbox'
import { useAtom, useSetAtom } from 'jotai'
import { OctagonAlert } from 'lucide-react'
import { useEffect } from 'react'
import {
  zapHighPriceImpactAtom,
  zapPriceImpactWarningCheckboxAtom,
} from './atom'
import { formatPercentage } from '@/utils'

const PRICE_IMPACT_THRESHOLD = 15

const ZapPriceImpactWarningCheckbox = ({
  priceImpact,
}: {
  priceImpact: number
}) => {
  const [checkbox, setCheckbox] = useAtom(zapPriceImpactWarningCheckboxAtom)
  const setHighPriceImpact = useSetAtom(zapHighPriceImpactAtom)

  useEffect(() => {
    setHighPriceImpact(priceImpact >= PRICE_IMPACT_THRESHOLD)
  }, [priceImpact, setHighPriceImpact])

  if (priceImpact < PRICE_IMPACT_THRESHOLD) return null

  return (
    <label className="flex flex-col gap-2 p-4 pt-4 cursor-pointer border-t border-border">
      <OctagonAlert size={16} className="text-warning" />
      <div className="flex items-end gap-2 justify-between">
        <div className="max-w-sm">
          <div className="font-bold">
            High price impact: {formatPercentage(Math.abs(priceImpact))}
          </div>
          <div className="text-sm text-legend">
            The price impact for this trade is very high. You will get
            significantly less value than expected.
          </div>
        </div>
        <div className="flex items-center p-[6px] border border-border rounded-lg">
          <Checkbox
            checked={checkbox}
            onCheckedChange={(checked: boolean) => setCheckbox(checked)}
          />
        </div>
      </div>
    </label>
  )
}

export default ZapPriceImpactWarningCheckbox
