import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  GovernanceInterface,
  Timelock as TimelockAbi,
  TimelockInterface,
} from 'abis'
import { Timelock } from 'abis/types'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { rTokenGovernanceAtom } from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { getContract } from 'utils'

const query = gql`
  query getRTokenOwner($id: String!) {
    rtoken(id: $id) {
      owners
    }
  }
`

const RTokenGovernanceUpdater = () => {
  const rToken = useRToken()
  const { provider } = useWeb3React()
  const setGovernance = useSetAtom(rTokenGovernanceAtom)

  const { data } = useQuery(rToken?.address && !rToken.isRSV ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  const getGovParams = useCallback(
    async (timelockAddress: string, provider: Web3Provider) => {
      try {
        const timelockContract = getContract(
          timelockAddress,
          TimelockAbi,
          provider
        ) as Timelock

        const filter = await timelockContract.filters[
          'RoleGranted(bytes32,address,address)'
        ]()
        const roleEvents = await timelockContract.queryFilter(filter)
        const proposalEvent = roleEvents.find(
          (event) =>
            event.args.role ===
            '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'
        )

        if (!proposalEvent) {
          return
        }

        const govCall = {
          address: proposalEvent.args.account,
          args: [],
          abi: GovernanceInterface,
        }

        const [
          name,
          votingDelay,
          votingPeriod,
          proposalThreshold,
          quorum,
          minDelay,
        ] = await promiseMulticall(
          [
            { ...govCall, method: 'name' },
            { ...govCall, method: 'votingDelay' },
            { ...govCall, method: 'votingPeriod' },
            { ...govCall, method: 'proposalThreshold' },
            { ...govCall, method: 'quorumNumerator()' },
            {
              address: timelockAddress,
              args: [],
              abi: TimelockInterface,
              method: 'getMinDelay',
            },
          ],
          provider
        )

        setGovernance({
          name,
          governor: proposalEvent.args.account,
          timelock: timelockAddress,
          votingDelay: votingDelay.toString(),
          votingPeriod: votingPeriod.toString(),
          proposalThreshold: proposalThreshold.toString(),
          quorum: quorum.toString(),
          minDelay: minDelay.toString(),
        })
      } catch (e) {
        console.error('error getting gov params', e)
        setGovernance({ name: 'Custom', governor: '' })
      }
    },
    []
  )

  // TODO: Multiple owners
  useEffect(() => {
    if (data?.rtoken && provider) {
      // If governance is setup, there should be only one owner
      // Try to get the governor address from the event, if not, don't support proposals
      if (data.rtoken.owners.length === 1) {
        getGovParams(data.rtoken.owners[0], provider)
      } else {
        // pending gov setup?
      }
    }
  }, [data, provider])

  return null
}

export default RTokenGovernanceUpdater
