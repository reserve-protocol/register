import GovernanceAnastasius from 'abis/GovernanceAnastasius'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rTokenGovernanceAtom, rTokenManagersAtom } from 'state/atoms'
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
  const setGovernance = useSetAtom(rTokenGovernanceAtom)
  const setTokenManagers = useSetAtom(rTokenManagersAtom)

  const { data } = useQuery(rToken?.main ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  const { data: onChainData } = useContractReads({
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
          id,
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

        setGovernance({
          name,
          proposalThreshold: (+proposalThreshold / 1e6).toString(),
          timelock: isAddress(timelockAddress) ?? undefined,
          governor: isAddress(contractAddress) as Address,
          votingDelay,
          votingPeriod,
          quorumDenominator,
          // TODO: Figure out why eUSD governance config is incorrectly recorded in graphql
          executionDelay:
            id === '0x7e880d8bd9c9612d6a9759f96acd23df4a4650e6' &&
            executionDelay === '0'
              ? '259200'
              : executionDelay,
          quorumNumerator: onChainData?.[1]?.toString() || quorumNumerator,
          quorumVotes: onChainData?.[0]?.toString() || quorumVotes,
          guardians: data.governance.guardians ?? [],
        })
      }
    }
  }, [data, onChainData])

  return null
}

export default RTokenGovernanceUpdater
