import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SuccessHeader = ({
  showTxs,
  onToggleTxs,
  onClose,
}: {
  showTxs: boolean
  onToggleTxs: () => void
  onClose: () => void
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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
          <Link
            to={getExplorerLink(
              indexDTF?.id || '',
              chainId,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
          >
            <Button
              variant="ghost"
              size="xs"
              className="flex items-center gap-1 rounded-full bg-background h-9 pl-0.5"
            >
              <div className="p-2 bg-primary rounded-full text-white">
                <Check size={16} />
              </div>
              <span className="font-light">
                {shortenAddress(indexDTF?.id || '')}
              </span>
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              className="flex items-center gap-1 rounded-full bg-background h-9"
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
              <span className="font-light">All Txs</span>
              {showTxs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background h-8 w-8"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SuccessHeader
