import { t, Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { Button } from '@/components/ui/button'
import { gql } from 'graphql-request'
import useQuery from 'hooks/use-query'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  chainIdAtom,
  debouncedBlockAtom,
  rTokenGovernanceAtom,
  walletAtom,
} from 'state/atoms'
import { formatCurrency, getCurrentTime } from 'utils'
import { Address, formatEther, formatEther as formatEtherViem } from 'viem'
import RolesView from '@/views/yield-dtf/settings/components/roles-view'
import SettingItem from '@/views/yield-dtf/settings/components/setting-item'
import { isTimeunitGovernance } from '../utils'
import AccountVotes from './AccountVotes'
import { useReadContract } from 'wagmi'
import { PROTOCOL_DOCS } from '@/utils/constants'

const IconInfo = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) => (
  <div className="flex items-center">
    {icon}
    <div className="ml-2">
      <span className="text-sm text-legend">{title}</span>
      <span className="block">{text}</span>
    </div>
  </div>
)

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
        BigInt(isTimeunit ? getCurrentTime() - 12 : blockNumber - 5),
      ] as [Address, bigint],
    }
  }, [!!blockNumber, !!account, governance?.governor, chainId])

  const { data: votes } = useReadContract(snapshot)

  return (
    <div className="p-4 border-b border-border">
      <span className="font-semibold block mb-4">
        <Trans>Voting power</Trans>
      </span>
      <IconInfo
        icon={<img src="/svgs/vote-supply.svg" />}
        title={t`Current`}
        text={formatCurrency(votes ? +formatEtherViem(votes) : 0)}
      />
    </div>
  )
}

const GovernanceStats = () => {
  const stats = useStats()

  return (
    <div className="border border-border rounded-3xl">
      <div className="grid grid-cols-2">
        <div className="p-4 border-r border-b border-border">
          <span className="font-semibold block mb-4">
            <Trans>Proposals</Trans>
          </span>
          <IconInfo
            icon={<img src="/svgs/proposals.svg" />}
            title={t`All time`}
            text={formatCurrency(stats.proposals, 0)}
          />
        </div>
        <div className="p-4 border-b border-border">
          <span className="font-semibold block mb-4">
            <Trans>Vote Supply</Trans>
          </span>
          <IconInfo
            icon={<img src="/svgs/vote-supply.svg" />}
            title={t`Current`}
            text={formatCurrency(stats.totalTokenSupply, 0)}
          />
        </div>
        <div className="p-4 border-r border-border">
          <span className="font-semibold block mb-4">
            <Trans>Voting Addresses</Trans>
          </span>
          <IconInfo
            icon={<img src="/svgs/voting-addresses.svg" />}
            title={t`Current`}
            text={formatCurrency(stats.totalDelegates, 0)}
          />
        </div>
        <VotingPower />
      </div>
    </div>
  )
}

const GovernanceFormat = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)

  return (
    <div className="mt-4 mb-4 border border-border rounded-3xl p-4">
      <span className="font-semibold">
        <Trans>Governance format</Trans>
      </span>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          {governance ? governance.name : 'Loading...'}
        </span>
      </div>

      {governance && governance.governor && (
        <>
          <SettingItem
            className="my-3"
            title={t`Owner`}
            subtitle={t`Role held by:`}
            value={<RolesView roles={[governance.governor]} />}
          />
          <SettingItem
            className="my-3"
            title={t`Guardian`}
            subtitle={t`Role held by:`}
            value={<RolesView roles={governance?.guardians ?? []} />}
          />
        </>
      )}
      <Button
        className="mt-4"
        size="sm"
        variant="muted"
        onClick={() => window.open('https://forum.reserve.org/', '_blank')}
      >
        <Trans>Governance forum</Trans>
      </Button>
      <Button
        className="mt-4 ml-2"
        size="sm"
        variant="ghost"
        onClick={() =>
          window.open(
            `${PROTOCOL_DOCS}reserve_rights_rsr/#reserve-governor-alexios`,
            '_blank'
          )
        }
      >
        <Trans>Documentation</Trans>
      </Button>
    </div>
  )
}

// TODO: Validate if account is above proposal threshold
const GovernanceOverview = () => (
  <div>
    <AccountVotes />
    <GovernanceStats />
    <GovernanceFormat />
  </div>
)

export default GovernanceOverview
