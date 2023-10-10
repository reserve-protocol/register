import { useAtomValue } from 'jotai'
import { rTokenListAtom } from 'state/atoms'
import RSV from 'utils/rsv'

const useRTokenLogo = (address: string | undefined): string => {
  const rTokenList = useAtomValue(rTokenListAtom)

  if (address && rTokenList[address]?.logo) {
    return `/svgs/${rTokenList[address].logo}`
  }

  if (address?.toLowerCase() === RSV.address.toLowerCase()) {
    return '/svgs/rsv.svg'
  }

  return '/svgs/defaultLogo.svg'
}

export default useRTokenLogo
