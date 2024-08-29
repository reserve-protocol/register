import { Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import { SmallButton } from 'components/button'
import GoTo from 'components/button/GoTo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import {
  chainIdAtom,
  rTokenGovernanceAtom,
  stRsrBalanceAtom,
  walletAtom,
} from 'state/atoms'
import { Box, Image, Text } from 'theme-ui'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, useContractRead } from 'wagmi'
import DelegateModal from './DelegateModal'
import { zeroAddress } from 'viem'

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

  const { data: delegate } = useContractRead({
    address: account ? (rToken?.stToken?.address as Address) : undefined,
    abi: StRSRVotes,
    functionName: 'delegates',
    args: account ? [account as Address] : undefined,
    watch: true,
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
    <Box variant="layout.borderBox" mb={3}>
      {hasNoDelegates ? (
        <Box>
          <Text variant="title" mb={2}>
            <Trans>Configure your vote</Trans>
          </Text>
          <Text variant="legend" as="p">
            <Trans>
              Voting on the RToken you are staked on requires you to delegate
              your vote to yourself or another Eth address.
            </Trans>
          </Text>
          <SmallButton
            mt={3}
            variant="primary"
            onClick={handleDelegate}
            disabled={disabled}
          >
            <Trans>Delegate</Trans>
          </SmallButton>
          <Text ml={3} variant="legend" as="span">
            <Trans>Balance: </Trans>
          </Text>{' '}
          <Text variant="legend">{formatCurrency(+stRsrBalance.balance)}</Text>
        </Box>
      ) : (
        <Box variant="layout.verticalAlign">
          <Image mr={2} src="/svgs/asterisk.svg" />
          <Box>
            <Text sx={{ fontSize: 1 }} variant="legend">
              <Trans>Voting power</Trans>
            </Text>
            <Text variant="strong">
              {selfDelegate ? (
                <Trans>Delegated to self</Trans>
              ) : (
                <>
                  <Trans>Delegated to: </Trans> {shortenAddress(delegate || '')}{' '}
                  <GoTo
                    ml={2}
                    href={getExplorerLink(
                      delegate,
                      chainId,
                      ExplorerDataType.ADDRESS
                    )}
                  />
                </>
              )}
            </Text>
          </Box>
          <SmallButton ml="auto" variant="muted" onClick={handleDelegate}>
            <Trans>Change</Trans>
          </SmallButton>
        </Box>
      )}
      {isVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setVisible(false)}
        />
      )}
    </Box>
  )
}

export default AccountVotes
