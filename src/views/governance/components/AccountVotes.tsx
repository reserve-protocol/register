import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { stRSRVotesInterface } from 'abis'
import { SmallButton } from 'components/button'
import GoTo from 'components/button/GoTo'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { stRsrBalanceAtom } from 'state/atoms'
import { Box, Text, Image } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import DelegateModal from './DelegateModal'

const AccountVotes = () => {
  const { account } = useWeb3React()
  const rToken = useRToken()
  const stRsrBalance = useAtomValue(stRsrBalanceAtom)
  const [isVisible, setVisible] = useState(false)
  const { value = [] } =
    useContractCall(
      account &&
        rToken?.stToken?.address && {
          abi: stRSRVotesInterface,
          address: rToken.stToken.address,
          method: 'delegates',
          args: [account],
        }
    ) ?? {}
  const hasNoDelegates = !value[0] || value[0] === ZERO_ADDRESS
  const selfDelegate = !hasNoDelegates && value[0] === account

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
          <SmallButton mt={3} variant="primary" onClick={handleDelegate}>
            <Trans>Delegate</Trans>
          </SmallButton>
          <Text ml={3} variant="legend" as="span">
            <Trans>Balance: </Trans>
          </Text>{' '}
          <Text variant="legend">{stRsrBalance.balance}</Text>
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
                  <Trans>Delegated to: </Trans> {shortenAddress(value[0] || '')}{' '}
                  <GoTo
                    ml={2}
                    href={getExplorerLink(value[0], ExplorerDataType.ADDRESS)}
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
