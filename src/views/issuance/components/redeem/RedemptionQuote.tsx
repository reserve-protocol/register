import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import {
  basketNonceAtom,
  isModuleLegacyAtom,
  rTokenAssetsAtom,
  rTokenCollaterizedAtom,
} from 'state/atoms'
import { Box, Text } from 'theme-ui'
import CollateralDistribution from '../issue/CollateralDistribution'
import useRToken from 'hooks/useRToken'
import { redeemQuotesAtom } from './atoms'
import { BigNumberMap } from 'types'
import { ChevronRight } from 'react-feather'

const quoteQuantitiesAtom = atom((get) => {
  const quote = get(redeemQuotesAtom)
  const nonce = get(basketNonceAtom)

  if (!quote || !quote[nonce]) {
    return {}
  }

  return Object.keys(quote[nonce]).reduce((prev, curr) => {
    prev[curr] = quote[nonce][curr].amount
    return prev
  }, {} as BigNumberMap)
})

const CurrentRedemptionQuote = () => {
  const rToken = useRToken()
  const quote = useAtomValue(quoteQuantitiesAtom)

  return (
    <CollateralDistribution
      mt={3}
      collaterals={rToken?.collaterals ?? []}
      quantities={quote}
    />
  )
}

const RedemptionQuoteSelector = () => {
  const basketNonce = useAtomValue(basketNonceAtom)
  const assets = useAtomValue(rTokenAssetsAtom)
  const [selectedNonce, setNonce] = useState()

  return (
    <Box
      mt={3}
      variant="layout.verticalAlign"
      sx={{
        border: '1px solid',
        borderColor: 'inputBorder',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
      px={2}
      py={3}
    >
      <Text ml="2" mr="auto">
        {basketNonce === selectedNonce
          ? 'Redeem with current basket'
          : 'Redeem with previous basket'}
      </Text>
      <ChevronRight size={14} />
    </Box>
  )
}

const RedemptionQuote = () => {
  const isCollaterized = useAtomValue(rTokenCollaterizedAtom)
  const { issuance: isLegacy } = useAtomValue(isModuleLegacyAtom)

  // if (isCollaterized || isLegacy) {
  //   return <CurrentRedemptionQuote />
  // }

  return <RedemptionQuoteSelector />
}

export default RedemptionQuote
