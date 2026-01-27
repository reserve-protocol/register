import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { rTokenConfigurationAtom } from 'state/atoms'
import { parseDuration } from 'utils'
import { UnstakeFlow } from '../unstake-delay'

const delayAtom = atom((get) => {
  const params = get(rTokenConfigurationAtom)

  return parseDuration(+params?.unstakingDelay || 0)
})

const UnstakeDelayOverview = () => {
  const delay = useAtomValue(delayAtom)
  const [isOpen, setOpen] = useState(false)

  return (
    <div className="mt-4 rounded-3xl border border-border p-6">
      <div
        className="flex items-center text-lg font-semibold cursor-pointer"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="mr-auto">Unstake delay</span>
        <span className="font-semibold mr-3">{delay}</span>
        {isOpen ? <Minus /> : <Plus />}
      </div>
      {isOpen && (
        <>
          <UnstakeFlow />
          <p className="mt-3 text-xs text-legend block">
            Funds will be used in the case of a collateral default during the
            unstaking delay and up until the point of the manually triggered
            withdraw transaction.
          </p>
        </>
      )}
    </div>
  )
}

export default UnstakeDelayOverview
