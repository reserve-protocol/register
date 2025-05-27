import { DecodedCalldata } from '@/types'
import { useMemo } from 'react'
import { Address } from 'viem'
import ContractProposalChanges from './contract-proposal-changes'
import RebalancePreview from './rebalance-preview'

const FolioChangePreview = ({
  decodedCalldata,
  address,
}: {
  decodedCalldata: DecodedCalldata[]
  address: Address
}) => {
  const { basketChangeCalls, restCalls } = useMemo(() => {
    return decodedCalldata.reduce(
      (
        acc: {
          basketChangeCalls: DecodedCalldata[]
          restCalls: DecodedCalldata[]
        },
        call
      ) => {
        // approveAuction => 1.0 / 2.0 rebalance flows, maintenance support
        // startRebalance => 4.0 rebalance flows
        if (
          call.signature === 'approveAuction' ||
          call.signature === 'startRebalance'
        ) {
          acc.basketChangeCalls.push(call)
        } else {
          acc.restCalls.push(call)
        }
        return acc
      },
      {
        basketChangeCalls: [] as DecodedCalldata[],
        restCalls: [] as DecodedCalldata[],
      }
    )
  }, [decodedCalldata])

  return (
    <div>
      {!!basketChangeCalls.length && (
        <RebalancePreview calldatas={basketChangeCalls} />
      )}
      {!!restCalls.length && (
        <ContractProposalChanges
          decodedCalldatas={restCalls}
          address={address}
        />
      )}
    </div>
  )
}

export default FolioChangePreview
