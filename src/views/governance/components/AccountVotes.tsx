import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { stRSRVotesInterface } from 'abis'
import { SmallButton } from 'components/button'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { Box, Text, Image } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'

const AccountVotes = () => {
  const { account } = useWeb3React()
  const rToken = useRToken()
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

  const handleDelegate = () => {}

  return (
    <Box variant="layout.borderBox" mb={4}>
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
          <SmallButton mt={3} variant="muted" onClick={handleDelegate}>
            <Trans>Delegate</Trans>
          </SmallButton>
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
                  <Trans>Delegated to: </Trans> {shortenAddress(value[0] || '')}
                </>
              )}
            </Text>
          </Box>
          <SmallButton ml="auto" variant="muted" onClick={handleDelegate}>
            <Trans>Change</Trans>
          </SmallButton>
        </Box>
      )}
    </Box>
  )
}

export default AccountVotes
