import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { pauseIssuanceAtom } from '../atoms'

const PauseIssuanceProposal = () => {
  const { issuancePaused } = useAtomValue(rTokenStateAtom)
  const [pauseAction, setPauseAction] = useAtom(pauseIssuanceAtom)

  return (
    <Card className="p-6 bg-secondary">
      <span className="text-lg font-semibold">Pause issuance</span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      <div className="flex items-center justify-between">
        <div>
          <span className="text-legend text-xs block">Current status</span>
          <span className="font-semibold inline-flex items-center gap-1.5">
            <span
              className={`inline-block size-2.5 rounded-full ${issuancePaused ? 'bg-destructive' : 'bg-green-500'}`}
            />
            {issuancePaused ? 'Issuance paused' : 'Issuance active'}
          </span>
        </div>
        <div className="flex gap-2">
          {pauseAction !== 'none' && (
            <Button variant="ghost" size="sm" onClick={() => setPauseAction('none')}>
              Discard
            </Button>
          )}
          {!issuancePaused && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setPauseAction(pauseAction === 'pause' ? 'none' : 'pause')
              }
            >
              Pause issuance
            </Button>
          )}
          {issuancePaused && (
            <Button
              variant="muted"
              size="sm"
              onClick={() =>
                setPauseAction(pauseAction === 'unpause' ? 'none' : 'unpause')
              }
            >
              Unpause issuance
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default PauseIssuanceProposal
