import { useAtomValue } from 'jotai'
import { FC, PropsWithChildren, useMemo } from 'react'
import {
  rTokenAtom,
  rTokenBalanceAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { isRTokenMintEnabled } from 'state/geolocation/atoms'
import { Address } from 'viem'
import { ZapProvider, ZapToken } from './ZapContext'

export const ZapRTokenProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const rTokenData = useAtomValue(rTokenAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rTokenBalance = useAtomValue(rTokenBalanceAtom)
  const { issuanceAvailable, redemptionAvailable } =
    useAtomValue(rTokenStateAtom)
  const rTokenMintEnabled = useAtomValue(isRTokenMintEnabled)

  const rToken: ZapToken = useMemo(
    () => ({
      address: rTokenData?.address as Address,
      symbol: rTokenData?.symbol as string,
      name: rTokenData?.name as string,
      decimals: rTokenData?.decimals as number,
      targetUnit: rTokenData?.targetUnits as string,
      price: rTokenPrice,
      balance: rTokenBalance?.balance,
    }),
    [rTokenData, rTokenPrice, rTokenBalance]
  )

  const noSupply = rTokenData?.supply === 0

  return (
    <ZapProvider
      targetToken={rToken}
      issuanceAvailable={issuanceAvailable}
      redemptionAvailable={redemptionAvailable}
      rTokenMintEnabled={rTokenMintEnabled}
      noSupply={noSupply}
    >
      {children}
    </ZapProvider>
  )
}
