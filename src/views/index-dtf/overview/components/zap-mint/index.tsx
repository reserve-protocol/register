import { chainIdAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { RESERVE_API, ROUTES } from '@/utils/constants'
import ZapperWrapper from '@/views/index-dtf/components/zapper/zapper-wrapper'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!indexDTF) return null

  return (
    <div className="relative">
      <ZapperWrapper
        wagmiConfig={wagmiConfig}
        chain={chainId}
        dtfAddress={indexDTF.id}
        apiUrl={RESERVE_API}
      />

      <div>{children}</div>

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
