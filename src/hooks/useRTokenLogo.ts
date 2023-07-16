import { useMemo } from 'react'
import rtokens from 'utils/rtokens'

export const getRTokenLogo = (address: string | undefined) => {
  if (address && rtokens[address]?.logo) {
    return `/node_modules/@lc-labs/rtokens/images/${rtokens[address].logo}`
  }

  return '/svgs/default.svg'
}

const useRTokenLogo = (address: string | undefined) =>
  useMemo(() => getRTokenLogo(address), [address])

export default useRTokenLogo
