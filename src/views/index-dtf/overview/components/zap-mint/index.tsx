import { Zapper, ZapperConfig } from '@reserve-protocol/react-zapper'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { chainIdAtom } from '@/state/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { wagmiConfig } from '@/state/chain'
import { Config } from 'wagmi'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!indexDTF) return null

  const zapperConfig: ZapperConfig = {
    wagmiConfig: wagmiConfig as Config,
    chainId,
    dtf: {
      address: indexDTF.id as `0x${string}`,
      symbol: indexDTF.token.symbol,
      name: indexDTF.token.name,
      decimals: indexDTF.token.decimals,
      logoUri: brand?.dtf?.icon,
    },
  }

  return (
    <div className="relative">
      <Zapper config={zapperConfig} mode="modal">
        {children}
      </Zapper>

      {/* Manual fallback link - shown within the modal */}
      <div className="sm:hidden p-3 rounded-3xl mt-2 text-center text-sm">
        <span className="font-semibold block">
          Having issues minting? (Zaps are in beta)
        </span>
        <span className="text-legend">Wait and try again or</span>{' '}
        <Link
          to={getFolioRoute(
            indexDTF.id,
            indexDTF.chainId,
            ROUTES.ISSUANCE + '/manual'
          )}
          className="text-primary underline"
        >
          switch to manual minting/redeeming
        </Link>
      </div>
    </div>
  )
}

export default ZapMint
