import { useMemo } from 'react'
import rtokens from 'rtokens'

export const getRTokenLogo = (address: string) => {
  if (rtokens[address]?.logo) {
    return require(`rtokens/images/${rtokens[address].logo}`)
  }

  return '/svgs/default.svg'
}

const useRTokenLogo = (address: string) =>
  useMemo(() => getRTokenLogo(address), [address])

export default useRTokenLogo
