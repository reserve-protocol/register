import { Button } from '@/components/button'
import {
  manualIsBusy,
  type ManualEvent,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'

export const ManualLabSimulator = ({
  session: s,
  dispatch,
}: {
  session: ManualSession
  dispatch: (event: ManualEvent) => void
}) => {
  const signing =
    s.transaction === 'signing' ||
    Object.values(s.approvals).some((a) => a.status === 'signing')
  const busy = manualIsBusy(s)
  if (!busy && s.gate !== 'loading') return null
  return (
    <aside
      className="flex flex-wrap items-center gap-2 px-6 py-4"
      aria-label="Lab wallet and chain simulation"
      data-testid="manual-lab-simulator"
    >
      <span className="w-full text-sm text-supporting-foreground">
        Lab simulation · no wallet or on-chain writes
      </span>
      {s.gate === 'loading' ? (
        <Button
          data-testid="manual-simulate-reads"
          size="micro"
          tone="secondary"
          onClick={() => dispatch({ type: 'resolve-gate' })}
        >
          Resolve wallet reads
        </Button>
      ) : (
        <>
          <Button
            data-testid="manual-simulate-advance"
            size="micro"
            tone="secondary"
            onClick={() =>
              dispatch({ type: signing ? 'wallet-accept' : 'confirm' })
            }
          >
            {signing ? 'Simulate wallet acceptance' : 'Simulate confirmations'}
          </Button>
          <Button
            data-testid="manual-simulate-failure"
            size="micro"
            tone="secondary"
            onClick={() => dispatch({ type: 'fail' })}
          >
            {signing ? 'Simulate rejection' : 'Simulate transaction failure'}
          </Button>
        </>
      )}
      {Object.values(s.approvals).some(
        (a) => a.status === 'signing' || a.status === 'confirming'
      ) && (
        <details className="w-full text-sm">
          <summary className="cursor-pointer py-2">
            Inspect individual wallet responses
          </summary>
          <div className="flex flex-col gap-2">
            {Object.entries(s.approvals)
              .filter(
                ([, a]) => a.status === 'signing' || a.status === 'confirming'
              )
              .map(([symbol, approval]) => (
                <div key={symbol} className="flex flex-wrap items-center gap-2">
                  <span className="w-12">{symbol}</span>
                  <Button
                    size="micro"
                    tone="secondary"
                    onClick={() =>
                      dispatch({
                        type:
                          approval.status === 'signing'
                            ? 'wallet-accept'
                            : 'confirm',
                        symbol,
                      })
                    }
                  >
                    {approval.status === 'signing'
                      ? `Accept ${symbol}`
                      : `Confirm ${symbol}`}
                  </Button>
                  <Button
                    size="micro"
                    tone="secondary"
                    onClick={() => dispatch({ type: 'fail', symbol })}
                  >{`Fail ${symbol}`}</Button>
                </div>
              ))}
          </div>
        </details>
      )}
    </aside>
  )
}
