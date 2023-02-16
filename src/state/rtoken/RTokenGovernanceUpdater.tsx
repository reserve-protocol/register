import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rTokenGovernanceAtom, rTokenManagersAtom } from 'state/atoms'

const query = gql`
  query getRTokenOwner($id: String!) {
    rtoken(id: $id) {
      owners
      pausers
      freezers
      longFreezers
    }
    governanceFrameworks(id: $id) {
      id
      name
      proposalThreshold
      contractAddress
      quorumDenominator
      quorumNumerator
      quorumVotes
      timelockAddress
      votingDelay
      votingPeriod
    }
  }
`

const RTokenGovernanceUpdater = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const setGovernance = useSetAtom(rTokenGovernanceAtom)
  const setTokenManagers = useSetAtom(rTokenManagersAtom)

  const { data } = useQuery(rToken?.address && !rToken.isRSV ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  console.log('data?', data)

  useEffect(() => {
    if (data?.rtoken && provider) {
      setTokenManagers(data.rtoken)

      // Governance is set up
      if (data.governanceFrameworks?.length) {
        // TODO: Multiple governances, currently use 1
        const {
          name,
          proposalThreshold,
          quorumDenominator,
          quorumNumerator,
          quorumVotes,
          contractAddress,
          timelockAddress,
          votingDelay,
          votingPeriod,
        } = data.governanceFrameworks[0]
        setGovernance({
          name,
          proposalThreshold: (+proposalThreshold / 1e6).toString(),
          timelock: timelockAddress,
          governor: contractAddress,
          votingDelay,
          votingPeriod,
          quorumDenominator,
          quorumNumerator,
          quorumVotes,
        })
      }
    }
  }, [data, provider])

  return null
}

export default RTokenGovernanceUpdater
