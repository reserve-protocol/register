import { useMemo } from 'react'
import rtokens from '@lc-labs/rtokens'

export const getRTokenLogo = (address: string) => {
  if (rtokens[address]?.logo) {
    return require(`@lc-labs/rtokens/images/${rtokens[address].logo}`)
  }

  return '/svgs/default.svg'
}

const useRTokenLogo = (address: string) =>
  useMemo(() => getRTokenLogo(address), [address])

export default useRTokenLogo
