import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import { DecodedCalldata } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'
import BasketProposalPreview from '../../views/propose/basket/components/proposal-basket-preview'
import ContractProposalChanges from './contract-proposal-changes'

const BasketChanges = ({ calldatas }: { calldatas: DecodedCalldata[] }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  if (!dtf || !basket || !prices) return <Skeleton className="h-80" />

  return (
    <BasketProposalPreview
      calldatas={calldatas.map((calldata) => calldata.callData)}
      basket={basket}
      shares={shares}
      prices={prices}
      address={dtf.id.toLowerCase() as Address}
    />
  )
}

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
        if (call.signature === 'approveAuction') {
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
        <BasketChanges calldatas={basketChangeCalls} />
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
