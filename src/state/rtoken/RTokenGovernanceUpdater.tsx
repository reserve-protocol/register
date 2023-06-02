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
  const setGuardians = useSetAtom(rTokenGuardiansAtom)
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
        const guardian = await timelockContract.CANCELLER_ROLE()
        const minDelay = await timelockContract.getMinDelay()
        const roleGranted = await timelockContract.queryFilter(
          timelockContract.filters.RoleGranted(guardian)
        )
        const roleRevoked = await timelockContract.queryFilter(
          timelockContract.filters.RoleRevoked(guardian)
        )

        const guardians: { [x: string]: number } = {}

        // Grab all events and sort them by block number
        const events = [...roleGranted, ...roleRevoked]

        for (const event of events) {
          if (event.event === 'RoleGranted') {
            guardians[event.args.account] =
              (guardians[event.args.account] || 0) + 1
          } else {
            guardians[event.args.account] =
              (guardians[event.args.account] || 0) - 1
          }
        }

        // TODO: get from theGraph
        setGuardians(Object.keys(guardians).filter((key) => !!guardians[key]))
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
        })
      }
    }
  }, [data, provider])

  return null
}

export default RTokenGovernanceUpdater
