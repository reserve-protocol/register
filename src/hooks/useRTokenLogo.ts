import rtokens from '@lc-labs/rtokens'
import { ChainId } from 'utils/chains'
import RSV from 'utils/rsv'

const useRTokenLogo = (
  address: string | undefined,
  chain = ChainId.Mainnet
): string => {
  if (address && rtokens[chain][address]?.logo) {
    return `/svgs/${rtokens[chain][address].logo}`
  }

  if (address?.toLowerCase() === RSV.address.toLowerCase()) {
    return '/svgs/rsv.svg'
  }

  return '/svgs/defaultLogo.svg'
}

export default useRTokenLogo
