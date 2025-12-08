import { Trans } from '@lingui/macro'
import MandateIcon from 'components/icons/MandateIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rTokenListAtom } from 'state/atoms'

const OffChainNote = () => {
  const rToken = useRToken()
  const rTokenList = useAtomValue(rTokenListAtom)
  const [expanded, setExpanded] = useState(false)

  if (!rToken?.listed || !rTokenList[rToken.address]?.about) {
    return null
  }

  return (
    <div className="mt-4">
      <span
        className="mb-2 font-semibold cursor-pointer"
        role="button"
        onClick={() => setExpanded(!expanded)}
      >
        <Trans>{expanded ? '-' : '+'} Description</Trans>
      </span>
      {expanded && (
        <p className="text-legend">{rTokenList[rToken.address]?.about}</p>
      )}
    </div>
  )
}

const TokenMandate = () => {
  const rToken = useRToken()

  return (
    <div className="max-w-[500px] mt-auto border-l border-transparent 2xl:border-border pl-0 2xl:pl-7">
      <MandateIcon />
      <span className="block text-base font-semibold mb-2 mt-3">
        <Trans>Governor mandate</Trans>
      </span>
      <p className="text-legend">
        {rToken?.mandate ? rToken.mandate : <Skeleton count={6} />}
      </p>
      <OffChainNote />
    </div>
  )
}

export default TokenMandate
