import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SuccessHeader = ({
  showTxs,
  onToggleTxs,
  onClose,
  txHash,
}: {
  showTxs: boolean
  onToggleTxs: () => void
  onClose: () => void
  txHash?: string
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [showConfetti, setShowConfetti] = useState(true)

  // WHY: wallet_sendCalls returns a bundle ID, not always a tx hash
  const isValidTxHash = txHash && /^0x[a-fA-F0-9]{64}$/.test(txHash)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const txBadge = (
    <div className="flex items-center bg-background rounded-[12px] p-0.5">
      <div className="bg-primary rounded-[10px] flex items-center justify-center size-7 text-primary-foreground">
        <Check size={14} />
      </div>
      {isValidTxHash && (
        <div className="flex items-center gap-0.5 px-2">
          <span className="text-sm font-light">
            {shortenAddress(txHash)}
          </span>
          <ArrowUpRight size={16} className="text-muted-foreground" />
        </div>
      )}
    </div>
  )

  return (
    <>
      {showConfetti && (
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            backgroundImage: 'url("https://storage.reserve.org/success.gif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
            width: '170%',
            height: '170%',
            top: '-40%',
            left: '-35%',
            position: 'absolute',
          }}
        />
      )}
      <div className="bg-[url('https://storage.reserve.org/tree.png')] bg-cover bg-center bg-no-repeat min-h-[140px] rounded-t-3xl p-6">
        <div className="flex items-center justify-between">
          {isValidTxHash ? (
            <Link
              to={getExplorerLink(
                txHash,
                chainId,
                ExplorerDataType.TRANSACTION
              )}
              target="_blank"
            >
              {txBadge}
            </Link>
          ) : (
            txBadge
          )}
          <div className="flex items-center gap-1.5">
            <button
              className="flex items-center gap-1 bg-background rounded-[12px] h-8 px-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={onToggleTxs}
            >
              <StackTokenLogo
                tokens={(basket || []).slice(0, 5).map((token) => ({
                  ...token,
                  chain: indexDTF?.chainId,
                }))}
                size={16}
                overlap={4}
                reverseStack
                outsource
              />
              <span className="text-sm font-light">All Txs</span>
              <ChevronRight size={14} />
            </button>
            <button
              className="bg-background rounded-[12px] h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SuccessHeader
