import GovernanceAnastasius from 'abis/GovernanceAnastasius'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  rTokenGovernanceAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { isAddress } from 'utils'
import { Address } from 'viem'
import { isTimeunitGovernance } from '@/views/yield-dtf/governance/utils'
import { useReadContracts } from 'wagmi'

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

  const activeFramework = useMemo(() => {
    const frameworks = data?.governance?.governanceFrameworks
    const owners = data?.rtoken?.owners

    if (!frameworks?.length) return null

    return (
      frameworks.find((gf: { timelockAddress: string }) =>
        owners?.some(
          (owner: string) =>
            owner.toLowerCase() === gf.timelockAddress.toLowerCase()
        )
      ) || frameworks[0]
    )
  }, [data?.governance?.governanceFrameworks, data?.rtoken?.owners])

  const contracts = useMemo(() => {
    return activeFramework?.id &&
      rToken?.chainId &&
      isTimeunitGovernance(activeFramework?.name)
      ? [
          {
            abi: GovernanceAnastasius,
            chainId: rToken.chainId,
            address: activeFramework.id as Address,
            functionName: 'quorum',
            args: [BigInt(Math.floor(Date.now() / 1000 - 100))],
          },
          {
            abi: GovernanceAnastasius,
            chainId: rToken.chainId,
            address: activeFramework.id as Address,
            functionName: 'quorumNumerator',
            args: [BigInt(Math.floor(Date.now() / 1000 - 100))],
          },
          {
            abi: GovernanceAnastasius,
            chainId: rToken.chainId,
            address: activeFramework.id as Address,
            functionName: 'proposalThreshold',
          },
        ]
      : undefined
  }, [activeFramework, rToken])

  const { data: onChainData }: { data: [bigint, bigint, bigint] | undefined } =
    useReadContracts({
      contracts,
      allowFailure: false,
      query: {
        enabled: !!activeFramework?.id,
      },
    })

  useEffect(() => {
    if (data?.rtoken) {
      setTokenManagers(data.rtoken)

      if (activeFramework) {
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
        } = activeFramework

        const onChainProposalThreshold =
          onChainData?.[2] && stTokenSupply > 0
            ? Number(
                ((onChainData[2] as bigint) * 100n - 99n) /
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
          guardians: data.governance?.guardians ?? [],
        })
      }
    }
  }, [data, activeFramework, onChainData, stTokenSupply])

  return null
}

export default RTokenGovernanceUpdater
