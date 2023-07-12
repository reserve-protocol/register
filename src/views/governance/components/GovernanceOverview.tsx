import { t, Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { SmallButton } from 'components/button'
import IconInfo from 'components/info-icon'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { blockAtom, rTokenGovernanceAtom, walletAtom } from 'state/atoms'
import { Box, Grid, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ROUTES } from 'utils/constants'
import { formatEther, formatEther as formatEtherViem } from 'viem'
import RolesView from 'views/settings/components/RolesView'
import SettingItem from 'views/settings/components/SettingItem'
import { Address, useContractRead } from 'wagmi'
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

// TODO: Validate if account is above proposal threshold
const GovernanceOverview = () => {
  const stats = useStats()
  const account = useAtomValue(walletAtom)
  const navigate = useNavigate()
  const rToken = useRToken()
  const blockNumber = useAtomValue(blockAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)

  const { data: votes } = useContractRead({
    address: account ? (governance.governor as Address) : undefined,
    functionName: 'getVotes',
    abi: Governance,
    args:
      account && blockNumber
        ? [account as Address, BigInt(blockNumber - 1)]
        : undefined,
  })

  return (
    <Box>
      <AccountVotes />
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
              text={formatCurrency(stats.proposals)}
            />
          </Box>
          <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
            <Text variant="subtitle" mb={3}>
              <Trans>Vote Supply</Trans>
            </Text>
            <IconInfo
              icon={<Image src="/svgs/vote-supply.svg" />}
              title={t`Current`}
              text={formatCurrency(stats.totalTokenSupply)}
            />
          </Box>
          <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
            <Text variant="subtitle" mb={3}>
              <Trans>Voting Addresses</Trans>
            </Text>
            <IconInfo
              icon={<Image src="/svgs/voting-addresses.svg" />}
              title={t`Current`}
              text={formatCurrency(stats.totalDelegates)}
            />
          </Box>
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
        </Grid>
      </Box>
      <Box mt={3} mb={3} variant="layout.borderBox">
        <Text variant="subtitle">
          <Trans>Governance format</Trans>
        </Text>
        <Text variant="title">{governance ? governance.name : 'Custom'}</Text>
        {governance && (
          <SettingItem
            my={3}
            title={t`Guardian`}
            subtitle={t`Role held by:`}
            value={<RolesView roles={governance?.guardians ?? []} />}
          />
        )}
        <SmallButton
          mt={3}
          variant="muted"
          onClick={() =>
            navigate(`${ROUTES.SETTINGS}?token=${rToken?.address}`)
          }
        >
          <Trans>Settings</Trans>
        </SmallButton>
        <SmallButton
          mt={3}
          ml={3}
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
    </Box>
  )
}

export default GovernanceOverview
