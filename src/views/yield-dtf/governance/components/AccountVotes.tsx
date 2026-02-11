import { Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import { Button } from '@/components/ui/button'
import GoTo from '@/components/ui/go-to'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import {
  chainIdAtom,
  rTokenGovernanceAtom,
  stRsrBalanceAtom,
  walletAtom,
} from 'state/atoms'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import DelegateModal from './DelegateModal'
import { Address, zeroAddress } from 'viem'
import { useWatchReadContract } from 'hooks/useWatchReadContract'

const AccountVotes = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useRToken()
  const stRsrBalance = useAtomValue(stRsrBalanceAtom)
  const [isVisible, setVisible] = useState(false)
  const governance = useAtomValue(rTokenGovernanceAtom)

  const disabled = useMemo(
    () => governance.name === 'Custom',
    [governance.name]
  )

  const { data: delegate } = useWatchReadContract({
    address: account ? (rToken?.stToken?.address as Address) : undefined,
    abi: StRSRVotes,
    functionName: 'delegates',
    args: account ? [account as Address] : undefined,
    chainId,
  })

  const hasNoDelegates = !delegate || delegate === zeroAddress
  const selfDelegate = !hasNoDelegates && delegate === account

  if (!account) {
    return null
  }

  const handleDelegate = () => {
    setVisible(true)
  }

  return (
    <div className="border border-border rounded-3xl p-4 mb-4">
      {hasNoDelegates ? (
        <div>
          <span className="text-xl font-medium block mb-2">
            <Trans>Configure your vote</Trans>
          </span>
          <p className="text-legend">
            <Trans>
              Voting on the RToken you are staked on requires you to delegate
              your vote to yourself or another Eth address.
            </Trans>
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={handleDelegate}
            disabled={disabled}
          >
            <Trans>Delegate</Trans>
          </Button>
          <span className="ml-3 text-legend">
            <Trans>Balance: </Trans>
          </span>{' '}
          <span className="text-legend">{formatCurrency(+stRsrBalance.balance)}</span>
        </div>
      ) : (
        <div className="flex items-center">
          <img className="mr-2" src="/svgs/asterisk.svg" />
          <div>
            <span className="text-xs text-legend">
              <Trans>Voting power</Trans>
            </span>
            <span className="block font-semibold">
              {selfDelegate ? (
                <Trans>Delegated to self</Trans>
              ) : (
                <>
                  <Trans>Delegated to: </Trans> {shortenAddress(delegate || '')}{' '}
                  <GoTo
                    className="ml-2"
                    href={getExplorerLink(
                      delegate,
                      chainId,
                      ExplorerDataType.ADDRESS
                    )}
                  />
                </>
              )}
            </span>
          </div>
          <Button size="sm" className="ml-auto" variant="muted" onClick={handleDelegate}>
            <Trans>Change</Trans>
          </Button>
        </div>
      )}
      {isVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setVisible(false)}
        />
      )}
    </div>
  )
}

export default AccountVotes
