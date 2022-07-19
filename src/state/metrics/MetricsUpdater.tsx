import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { selectedRTokenAtom } from '../atoms'
import { defaultRTokenMetrics, rTokenMetricsAtom } from './atoms'

const tokenOverviewQuery = gql``
const accountMetricsQuery = gql`
  query MyQuery {
    account(id: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
      id
      rTokens {
        id
        stake
        rToken {
          rewardToken {
            token {
              name
              lastPriceUSD
            }
          }
        }
        balance {
          amount
          token {
            name
            symbol
            lastPriceUSD
          }
        }
      }
    }
  }
`

const protocolMetricsUpdater = () => {
  const { account } = useWeb3React()
  // const updateMetrics = useUpdateAtom(accountMetr)
  const rTokenMetrics = useQuery(account ? accountMetricsQuery : null)

  return null
}

// TODO: Polling, every block?
const RTokenMetricsUpdater = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const updateMetrics = useUpdateAtom(rTokenMetricsAtom)
  const rTokenMetrics = useQuery(rToken ? accountMetricsQuery : null)

  useEffect(() => {
    if (rTokenMetrics.data) {
      console.log('metrics', rTokenMetrics)
      // updateMetrics(defaultRTokenMetrics)
    }
  }, [rTokenMetrics.data])

  return null
}

const MetricsUpdater = () => {
  return (
    <>
      <RTokenMetricsUpdater />
    </>
  )
}

export default MetricsUpdater
