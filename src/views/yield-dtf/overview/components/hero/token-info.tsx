import { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import TokenAddresses from './token-addresses'

const TokenName = () => {
  const rToken = useAtomValue(rTokenMetaAtom)

  return (
    <div className="flex items-center text-lg basis-full sm:basis-auto mb-2 sm:mb-0 mr-3">
      <CurrentRTokenLogo width={32} />
      <span className="ml-2 text-2xl font-bold">{rToken?.name ?? ''}</span>
      <span className="text-legend ml-1 text-2xl">
        ({rToken?.symbol ?? ''})
      </span>
    </div>
  )
}

const TokenInfo = () => {
  return (
    <div className="flex items-center flex-wrap-reverse">
      <TokenName />
      <TokenAddresses />
    </div>
  )
}

export default TokenInfo
