import { chainIdAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import ZapperWrapper from '@/views/index-dtf/components/zapper/zapper-wrapper'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

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
    </div>
  )
}

export default ZapMint
