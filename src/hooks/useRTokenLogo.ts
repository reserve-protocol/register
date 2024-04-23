import rtokens from '@lc-labs/rtokens'
import { ChainId } from 'utils/chains'

const useRTokenLogo = (
  address: string | undefined,
  chain = ChainId.Mainnet
): string => {
  if (address && rtokens[chain]?.[address]?.logo?.toLowerCase()) {
    return `/svgs/${rtokens[chain][address].logo?.toLowerCase()}`
  }

  return '/svgs/defaultLogo.svg'
}

export default useRTokenLogo
