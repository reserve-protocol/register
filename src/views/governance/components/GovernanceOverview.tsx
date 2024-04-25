import { t, Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { SmallButton } from 'components/button'
import IconInfo from 'components/info-icon'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  chainIdAtom,
  debouncedBlockAtom,
  rTokenGovernanceAtom,
  walletAtom,
} from 'state/atoms'
import { Box, Grid, Image, Text } from 'theme-ui'
import { formatCurrency, getCurrentTime } from 'utils'
import { formatEther, formatEther as formatEtherViem } from 'viem'
import RolesView from 'views/settings/components/RolesView'
import SettingItem from 'views/settings/components/SettingItem'
import { Address, useContractRead } from 'wagmi'
import { isTimeunitGovernance } from '../utils'
import AccountVotes from './AccountVotes'

const query = gql`
  query getGovernanceStats($id: String!) {
    governance(id: $id) {
      id
      totalTokenSupply
      totalTokenHolders
      totalDelegates
      proposals
    }
  }
`

// TODO: Governance data casting?
const useStats = () => {
  const rToken = useRToken()
  const response = useQuery(rToken?.main ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  return useMemo(() => {
    const { data } = response

    return {
      governanceFrameworks: data?.governance?.governanceFrameworks ?? [],
      proposals: +data?.governance?.proposals || 0,
      totalTokenSupply: +formatEther(data?.governance?.totalTokenSupply ?? '0'),
      totalTokenHolders: +formatEther(
        data?.governance?.totalTokenHolders ?? '0'
      ),
      totalDelegates: data?.governance?.totalDelegates ?? '0',
    }
  }, [JSON.stringify(response)])
}

const VotingPower = () => {
  const account = useAtomValue(walletAtom)
  const blockNumber = useAtomValue(debouncedBlockAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const isTimeunit = isTimeunitGovernance(governance?.name ?? '')
  const chainId = useAtomValue(chainIdAtom)

  const snapshot = useMemo(() => {
    if (!account || !blockNumber || !governance.governor) return undefined

    return {
      address: governance.governor as Address,
      functionName: 'getVotes' as 'getVotes',
      abi: Governance,
      chainId,
      args: [
        account as Address,
        BigInt(isTimeunit ? getCurrentTime() - 12 : blockNumber - 2),
      ] as [Address, bigint],
    }
  }, [!!blockNumber, !!account, governance?.governor, chainId])

  const { data: votes } = useContractRead(snapshot)

  return (
    <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
      <Text variant="subtitle" mb={3}>
        <Trans>Voting power</Trans>
      </Text>
      <IconInfo
        icon={<Image src="/svgs/vote-supply.svg" />}
        title={t`Current`}
        text={formatCurrency(votes ? +formatEtherViem(votes) : 0)}
      />
    </Box>
  )
}

const GovernanceStats = () => {
  const stats = useStats()

  return (
    <Box variant="layout.borderBox" p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={4}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'border',
          }}
        >
          <Text variant="subtitle" mb={3}>
            <Trans>Proposals</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/proposals.svg" />}
            title={t`All time`}
            text={formatCurrency(stats.proposals, 0)}
          />
        </Box>
        <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Vote Supply</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/vote-supply.svg" />}
            title={t`Current`}
            text={formatCurrency(stats.totalTokenSupply, 0)}
          />
        </Box>
        <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Voting Addresses</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/voting-addresses.svg" />}
            title={t`Current`}
            text={formatCurrency(stats.totalDelegates, 0)}
          />
        </Box>
        <VotingPower />
      </Grid>
    </Box>
  )
}

const GovernanceFormat = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)

  return (
    <Box mt={3} mb={3} variant="layout.borderBox">
      <Text variant="subtitle">
        <Trans>Governance format</Trans>
      </Text>
      <Box variant="layout.verticalAlign">
        <Text variant="title">
          {governance ? governance.name : 'Loading...'}
        </Text>
      </Box>

      {governance && governance.governor && (
        <>
          <SettingItem
            my={3}
            title={t`Owner`}
            subtitle={t`Role held by:`}
            value={<RolesView roles={[governance.governor]} />}
          />
          <SettingItem
            my={3}
            title={t`Guardian`}
            subtitle={t`Role held by:`}
            value={<RolesView roles={governance?.guardians ?? []} />}
          />
        </>
      )}
      <SmallButton
        mt={3}
        variant="muted"
        onClick={() => window.open('https://forum.reserve.org/', '_blank')}
      >
        <Trans>Governance forum</Trans>
      </SmallButton>
      <SmallButton
        mt={3}
        ml={2}
        variant="transparent"
        onClick={() =>
          window.open(
            'https://reserve.org/protocol/reserve_rights_rsr/#reserve-governor-alexios',
            '_blank'
          )
        }
      >
        <Trans>Documentation</Trans>
      </SmallButton>
    </Box>
  )
}

// TODO: Validate if account is above proposal threshold
const GovernanceOverview = () => (
  <Box>
    <AccountVotes />
    <GovernanceStats />
    <GovernanceFormat />
  </Box>
)

export default GovernanceOverview
