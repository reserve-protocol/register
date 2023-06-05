import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import { useTimelockContract } from 'hooks/useContract'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  rTokenGovernanceAtom,
  rTokenGuardiansAtom,
  rTokenManagersAtom,
} from 'state/atoms'
import { isAddress } from 'utils'

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
      governanceFrameworks {
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
  }
`

const RTokenGovernanceUpdater = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const [governance, setGovernance] = useAtom(rTokenGovernanceAtom)
  const setTokenManagers = useSetAtom(rTokenManagersAtom)
  const timelockContract = useTimelockContract(
    governance?.timelock || undefined,
    false
  )

  const { data, error } = useQuery(
    rToken?.address && !rToken.isRSV ? query : null,
    {
      id: rToken?.address.toLowerCase(),
    }
  )

  const fetchTimelockData = async () => {
    if (timelockContract) {
      try {
        const minDelay = await timelockContract.getMinDelay()
        setGovernance({ ...governance, executionDelay: minDelay.toString() })
      } catch (e) {
        console.error('Error getting timelock info', e)
      }
    }
  }

  useEffect(() => {
    fetchTimelockData()
  }, [timelockContract])

  useEffect(() => {
    if (data?.rtoken && provider) {
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
          votingDelay,
          votingPeriod,
        } = data.governance.governanceFrameworks[0]
        setGovernance({
          name,
          proposalThreshold: (+proposalThreshold / 1e6).toString(),
          timelock: isAddress(timelockAddress) || '',
          governor: isAddress(contractAddress) || '',
          votingDelay,
          votingPeriod,
          quorumDenominator,
          quorumNumerator,
          quorumVotes,
          guardians: data.governance.guardians ?? [],
        })
      }
    }
  }, [data, provider])

  return null
}

export default RTokenGovernanceUpdater
