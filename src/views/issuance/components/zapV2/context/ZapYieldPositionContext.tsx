import { FC, ReactNode } from 'react'
import { ZapProvider } from './ZapContext'
import { Token } from 'types'

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
  // TODO: add price to yieldToken
  return (
    <ZapProvider targetToken={yieldToken} rToken={rToken}>
      {children}
    </ZapProvider>
  )
}
