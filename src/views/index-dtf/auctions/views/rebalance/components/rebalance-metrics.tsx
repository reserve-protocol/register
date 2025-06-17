import { useAtomValue } from 'jotai'
import { rebalanceMetricsAtom } from '../atoms'

const RebalanceMetrics = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex">
        <div>
          <h1 className="text-2xl">Metrics</h1>

          <pre className="mt-2 p-3 bg-background rounded-lg text-xs overflow-auto text-foreground">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default RebalanceMetrics
