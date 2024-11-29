import { FC, ReactNode } from 'react'
import { ZapProvider } from './ZapContext'
import { Token } from 'types'
import { balancesAtom } from 'state/atoms'
import { useAtomValue } from 'jotai'

interface ZapYieldPositionProviderProps {
  children: ReactNode
  yieldToken: Token
  rToken: Token
}

export const ZapYieldPositionProvider: FC<ZapYieldPositionProviderProps> = ({
  children,
  yieldToken,
  rToken,
}) => {
  const balances = useAtomValue(balancesAtom)
  const yieldTokenWithBalance = {
    ...yieldToken,
    balance: balances[yieldToken.address]?.balance || '0',
  }

  return (
    <ZapProvider targetToken={yieldTokenWithBalance} rToken={rToken}>
      {children}
    </ZapProvider>
  )
}
