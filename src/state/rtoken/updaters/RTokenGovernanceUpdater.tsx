import GovernanceAnastasius from 'abis/GovernanceAnastasius'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  rTokenGovernanceAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { isAddress } from 'utils'
import { Address } from 'viem'
import { isTimeunitGovernance } from 'views/governance/utils'
import { useContractReads } from 'wagmi'

// Added name order to governanceFrameworks so that "Governor Anastasius"
// is first element (until we add a timestamp field).
const query = gql`
  query getRTokenOwner($id: String!) {
    rtoken(id: $id) {
      owners
      pausers
      freezers
      longFreezers
    }
    governance(id: $id) {
      guardians
      governanceFrameworks(orderBy: name, orderDirection: desc) {
        id
        name
        proposalThreshold
        contractAddress
        quorumDenominator
        quorumNumerator
        quorumVotes
        executionDelay
        timelockAddress
        votingDelay
        votingPeriod
      }
    }
  }
`

const RTokenGovernanceUpdater = () => {
  const rToken = useRToken()
  const { stTokenSupply } = useAtomValue(rTokenStateAtom)
  const setGovernance = useSetAtom(rTokenGovernanceAtom)
  const setTokenManagers = useSetAtom(rTokenManagersAtom)

  const { data } = useQuery(rToken?.main ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  const { data: onChainData } = useContractReads({
    keepPreviousData: true,
    contracts:
      data?.governance?.governanceFrameworks?.[0]?.id &&
      rToken?.chainId &&
      isTimeunitGovernance(data?.governance?.governanceFrameworks?.[0]?.name)
        ? [
            {
              abi: GovernanceAnastasius,
              chainId: rToken.chainId,
              address: data.governance.governanceFrameworks[0].id as Address,
              functionName: 'quorum',
              args: [BigInt(Math.floor(Date.now() / 1000 - 100))],
            },
            {
              abi: GovernanceAnastasius,
              chainId: rToken.chainId,
              address: data.governance.governanceFrameworks[0].id as Address,
              functionName: 'quorumNumerator',
              args: [BigInt(Math.floor(Date.now() / 1000 - 100))],
            },
            {
              abi: GovernanceAnastasius,
              chainId: rToken.chainId,
              address: data.governance.governanceFrameworks[0].id as Address,
              functionName: 'proposalThreshold',
            },
          ]
        : undefined,
    allowFailure: false,
    enabled: !!data?.governance?.governanceFrameworks?.[0]?.id,
  })

  useEffect(() => {
    if (data?.rtoken) {
      setTokenManagers(data.rtoken)

      // Governance is set up
      if (data.governance?.governanceFrameworks?.length) {
        // TODO: Multiple governances, currently use 1
        const {
          name,
          proposalThreshold,
          quorumDenominator,
          quorumNumerator,
          quorumVotes,
          contractAddress,
          timelockAddress,
          executionDelay,
          votingDelay,
          votingPeriod,
        } = data.governance.governanceFrameworks[0]

        // for Anastasius governance set by the 3.4.0 spell,
        // we need to calculate the on-chain proposal threshold
        // because the ProposalThresholdSet event is not listened by the subgraph
        const onChainProposalThreshold =
          onChainData?.[2] && stTokenSupply > 0
            ? Number(
                (onChainData[2] * 100n - 99n) /
                  BigInt(Math.floor(stTokenSupply * 1e6)) /
                  BigInt(1e6)
              )
            : undefined

        setGovernance({
          name,
          proposalThreshold: (
            (onChainProposalThreshold || +proposalThreshold) / 1e6
          ).toString(),
          timelock: isAddress(timelockAddress) ?? undefined,
          governor: isAddress(contractAddress) as Address,
          votingDelay,
          votingPeriod,
          quorumDenominator,
          executionDelay,
          quorumNumerator: onChainData?.[1]?.toString() || quorumNumerator,
          quorumVotes: onChainData?.[0]?.toString() || quorumVotes,
          guardians: data.governance.guardians ?? [],
        })
      }
    }
  }, [data, onChainData, stTokenSupply])

  return null
}

export default RTokenGovernanceUpdater
