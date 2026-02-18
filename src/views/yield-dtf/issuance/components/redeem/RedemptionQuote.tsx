import OverviewIcon from 'components/icons/OverviewIcon'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ChevronRight } from 'lucide-react'
import { chainIdAtom, isModuleLegacyAtom, rTokenStateAtom } from 'state/atoms'
import { BigNumberMap } from 'types'
import CollateralDistribution from '../issue/CollateralDistribution'
import {
  customRedeemModalAtom,
  redeemNonceAtom,
  redeemQuotesAtom,
} from './atoms'
import { useChainlinkPrices } from 'hooks/useChainlinkPrices'

const quoteQuantitiesAtom = atom((get) => {
  const quote = get(redeemQuotesAtom)
  const nonce = get(rTokenStateAtom).basketNonce

  if (!quote || !quote[nonce]) {
    return {}
  }

  return Object.keys(quote[nonce]).reduce((prev, curr) => {
    prev[curr] = quote[nonce][curr].amount
    return prev
  }, {} as BigNumberMap)
})

const CurrentRedemptionQuote = () => {
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useRToken()
  const quote = useAtomValue(quoteQuantitiesAtom)
  const prices = useChainlinkPrices(
    chainId,
    (rToken?.collaterals ?? []).map((c) => c.address)
  )

  return (
    <CollateralDistribution
      className="mt-4"
      collaterals={rToken?.collaterals ?? []}
      quantities={quote}
      prices={prices}
    />
  )
}

const RedemptionQuoteSelector = () => {
  const { basketNonce } = useAtomValue(rTokenStateAtom)
  const selectedNonce = useAtomValue(redeemNonceAtom)
  const setNonceSelection = useSetAtom(customRedeemModalAtom)

  return (
    <div
      className="mt-4 flex items-center border border-input rounded-md cursor-pointer px-2 py-4"
      onClick={() => setNonceSelection(true)}
    >
      <OverviewIcon />
      <span className="ml-2 mr-auto">
        {basketNonce === selectedNonce
          ? 'Redeem with current basket'
          : 'Redeem with previous basket'}
      </span>
      <ChevronRight size={14} />
    </div>
  )
}

const RedemptionQuote = () => {
  const { isCollaterized } = useAtomValue(rTokenStateAtom)
  const { issuance: isLegacy } = useAtomValue(isModuleLegacyAtom)

  if (isCollaterized || isLegacy) {
    return <CurrentRedemptionQuote />
  }

  return <RedemptionQuoteSelector />
}

export default RedemptionQuote
