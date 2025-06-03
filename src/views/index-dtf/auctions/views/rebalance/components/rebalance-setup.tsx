import { Slider } from '@/components/ui/slider'
import { useAtom, useAtomValue } from 'jotai'
import { currentRebalanceAtom } from '../../../atoms'
import { rebalancePercentAtom } from '../atoms'

const RebalanceSetup = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)
  const [rebalancePercent, setRebalancePercent] = useAtom(rebalancePercentAtom)

  return (
    <div className="p-4">
      <div className="mb-4 flex">
        <div>
          <h4 className="text-sm text-legend">Percent rebalanced</h4>
          <h1 className="text-2xl">0%</h1>
        </div>
        <div className="ml-auto text-right">
          <h4 className="text-legend text-sm">Expires on</h4>
          <span className="text-sm">
            {rebalance?.rebalance.availableUntil
              ? new Date(+rebalance.rebalance.availableUntil * 1000)
                  .toLocaleString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                  .replace(',', '')
              : ''}
          </span>
        </div>
      </div>
      <Slider
        className="mb-2"
        value={[rebalancePercent]}
        onValueChange={(value) => setRebalancePercent(value[0])}
      />
    </div>
  )
}

export default RebalanceSetup
